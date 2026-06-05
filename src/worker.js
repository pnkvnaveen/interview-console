const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: CORS_HEADERS });
}

async function computeToken(password) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('interview-console-v1'));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleAPI(request, env, url);
      } catch (e) {
        return err(e.message, 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleAPI(request, env, url) {
  const method = request.method;
  const path = url.pathname;
  const db = env.DB;
  const sitePassword = env.SITE_PASSWORD;

  // Auth status endpoint — always public
  if (path === '/api/auth/status' && method === 'GET') {
    return json({ required: !!sitePassword });
  }

  // Auth endpoint — always public
  if (path === '/api/auth' && method === 'POST') {
    if (!sitePassword) {
      return json({ token: 'no-auth' });
    }
    const body = await request.json();
    if (!body.password) return err('Missing password', 400);
    const [expected, provided] = await Promise.all([
      computeToken(sitePassword),
      computeToken(body.password),
    ]);
    if (!safeEqual(provided, expected)) return err('Incorrect password', 401);
    return json({ token: expected });
  }

  // Auth check for all other API routes (only when password is configured)
  if (sitePassword) {
    const expected = await computeToken(sitePassword);
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!safeEqual(token, expected)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS });
    }
  }

  // --- Question bank ---
  if (path === '/api/question-bank' && method === 'GET') {
    const topics = await db.prepare(
      'SELECT * FROM qb_topics ORDER BY sort_order'
    ).all();
    if (!topics.results.length) return json([]);

    const questions = await db.prepare(
      'SELECT * FROM qb_questions ORDER BY topic_id, sort_order'
    ).all();

    const qByTopic = {};
    for (const q of questions.results) {
      if (!qByTopic[q.topic_id]) qByTopic[q.topic_id] = [];
      qByTopic[q.topic_id].push({ id: q.id, text: q.text, label: q.label });
    }

    const result = topics.results.map(t => ({
      id: t.id, name: t.name, questions: qByTopic[t.id] || [],
    }));
    return json(result);
  }

  if (path === '/api/question-bank' && method === 'PUT') {
    const topics = await request.json();
    if (!Array.isArray(topics)) return err('Expected array');

    const stmts = [
      db.prepare('DELETE FROM qb_questions'),
      db.prepare('DELETE FROM qb_topics'),
    ];
    for (let ti = 0; ti < topics.length; ti++) {
      const t = topics[ti];
      if (!(t.name || '').trim()) continue;
      stmts.push(db.prepare(
        'INSERT INTO qb_topics (id, name, sort_order) VALUES (?, ?, ?)'
      ).bind(t.id, t.name.trim(), ti));
      for (let qi = 0; qi < (t.questions || []).length; qi++) {
        const q = t.questions[qi];
        if (!(q.text || '').trim()) continue;
        stmts.push(db.prepare(
          'INSERT INTO qb_questions (id, topic_id, text, label, sort_order) VALUES (?, ?, ?, ?, ?)'
        ).bind(q.id, t.id, q.text.trim(), (q.label || '').trim(), qi));
      }
    }
    await db.batch(stmts);
    return json({ ok: true });
  }

  // --- Candidates list + create ---
  if (path === '/api/candidates' && method === 'GET') {
    const rows = await db.prepare(
      `SELECT c.*, r.decision, r.stars, r.overall_comments, r.updated_at as response_updated
       FROM candidates c
       LEFT JOIN interview_responses r ON r.candidate_id = c.id
       ORDER BY c.created_at DESC`
    ).all();
    return json(rows.results);
  }

  if (path === '/api/candidates' && method === 'POST') {
    const body = await request.json();
    const now = new Date().toISOString();
    const id = body.id || ('c-' + Math.random().toString(36).slice(2, 10));
    await db.prepare(
      'INSERT INTO candidates (id, name, gender, overall_exp, powerbi_exp, tech, general_comments, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, body.name || '', body.gender || 'male', body.overall || '', body.powerbi || '', body.tech || '', body.generalComments || '', now).run();
    return json({ id, created_at: now });
  }

  // --- Single candidate ---
  const candidateMatch = path.match(/^\/api\/candidates\/([^/]+)$/);

  if (candidateMatch && method === 'GET') {
    const row = await db.prepare(
      `SELECT c.*, r.decision, r.stars, r.overall_comments, r.updated_at as response_updated
       FROM candidates c
       LEFT JOIN interview_responses r ON r.candidate_id = c.id
       WHERE c.id=?`
    ).bind(candidateMatch[1]).first();
    if (!row) return err('Not found', 404);
    return json(row);
  }

  if (candidateMatch && method === 'PUT') {
    const id = candidateMatch[1];
    const body = await request.json();
    await db.prepare(
      'UPDATE candidates SET name=?, gender=?, overall_exp=?, powerbi_exp=?, tech=?, general_comments=? WHERE id=?'
    ).bind(body.name || '', body.gender || 'male', body.overall || '', body.powerbi || '', body.tech || '', body.generalComments || '', id).run();
    return json({ ok: true });
  }

  if (candidateMatch && method === 'DELETE') {
    const id = candidateMatch[1];
    await db.batch([
      db.prepare('DELETE FROM interview_responses WHERE candidate_id=?').bind(id),
      db.prepare('DELETE FROM candidates WHERE id=?').bind(id),
    ]);
    return json({ ok: true });
  }

  // --- Interview responses ---
  const responseMatch = path.match(/^\/api\/candidates\/([^/]+)\/response$/);

  if (responseMatch && method === 'GET') {
    const row = await db.prepare(
      'SELECT * FROM interview_responses WHERE candidate_id=?'
    ).bind(responseMatch[1]).first();
    if (!row) return json(null);
    return json({
      ...row,
      grades: JSON.parse(row.grades || '{}'),
      notes: JSON.parse(row.notes || '{}'),
    });
  }

  if (responseMatch && method === 'PUT') {
    const id = responseMatch[1];
    const body = await request.json();
    const now = new Date().toISOString();
    await db.prepare(`
      INSERT INTO interview_responses (candidate_id, grades, notes, decision, overall_comments, stars, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(candidate_id) DO UPDATE SET
        grades=excluded.grades, notes=excluded.notes, decision=excluded.decision,
        overall_comments=excluded.overall_comments, stars=excluded.stars, updated_at=excluded.updated_at
    `).bind(
      id,
      JSON.stringify(body.grades || {}),
      JSON.stringify(body.notes || {}),
      body.decision || '',
      body.overall_comments || '',
      body.stars || 0,
      now, now
    ).run();
    return json({ ok: true, updated_at: now });
  }

  return err('Not found', 404);
}
