CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT DEFAULT 'male',
  overall_exp TEXT DEFAULT '',
  powerbi_exp TEXT DEFAULT '',
  tech TEXT DEFAULT '',
  general_comments TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS interview_responses (
  candidate_id TEXT PRIMARY KEY,
  grades TEXT DEFAULT '{}',
  notes TEXT DEFAULT '{}',
  decision TEXT DEFAULT '',
  overall_comments TEXT DEFAULT '',
  stars INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

CREATE TABLE IF NOT EXISTS qb_topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS qb_questions (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  text TEXT NOT NULL,
  label TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (topic_id) REFERENCES qb_topics(id)
);
