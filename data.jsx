/* ===== Default question bank + shared helpers ===== */
/* eslint-disable */

// stable-ish id generator
window.uid = function (p) { return (p || 'id') + '-' + Math.random().toString(36).slice(2, 9); };

// Grade scale (radio per question). `sum` is what gets written to the copyable notes.
window.GRADES = [
  { key: 'Not OK', tone: 'notok', sum: 'no' },
  { key: 'Avg',    tone: 'avg',   sum: 'avg' },
  { key: 'OK',     tone: 'ok',    sum: 'ok' },
  { key: 'Good',   tone: 'good',  sum: 'good' },
];

// q(full question text, short label for the summary)
function q(text, label) { return { id: window.uid('q'), text: text, label: label }; }

window.DEFAULT_DATA = [
  {
    id: window.uid('t'), name: 'Power Query',
    questions: [
      q('What language is used in Power Query? Is that case-sensitive?', 'Power Query language / case-sensitivity'),
      q('Can you tell me some of the commonly used functionalities or transformations of Power Query?', 'Power Query transformations'),
      q('What is the difference between merge and append in Power Query?', 'merge vs append'),
      q('What is the purpose of query parameters in Power Query? Can you give me one real life example?', 'query parameters'),
      q('Can you explain Query Folding?', 'query folding'),
      q('What is the purpose of a Dataflow in Power BI Service?', 'dataflow'),
      q('What are some of the cloud data sources that you have connected to, from Power BI?', 'cloud data sources'),
    ],
  },
  {
    id: window.uid('t'), name: 'Data Modeling',
    questions: [
      q('What is the difference between direct query and live connection?', 'direct query vs live connection'),
      q('Can you give me a business scenario where a calculated table would be of use?', 'calculated table use case'),
      q('What is the fundamental difference between measures and calculated columns?', 'measure vs column'),
      q('What is meant by Cardinality?', 'cardinality'),
      q('What is the difference between Snowflake and Star Schema and which is better?', 'star vs snowflake schema'),
      q('What is meant by cross-filter direction?', 'cross-filter / bi-directional filtering'),
      q('What is incremental refresh and how do I set one up?', 'incremental refresh'),
      q('What is meant by drill-through?', 'drill-through'),
      q('Can you explain Calculation Groups?', 'calculation groups'),
      q('What is meant by a Field Parameter?', 'field parameter'),
      q('How is the dashboard different from a report?', 'dashboard vs report'),
      q('How do you solve the many-to-many relationship in Power BI?', 'many-to-many relationship'),
      q('What are some of the best practices of data modelling in Power BI?', 'data modelling best practices'),
    ],
  },
  {
    id: window.uid('t'), name: 'DAX',
    questions: [
      q('What is the difference between the functions CALCULATE and FILTER?', 'CALCULATE vs FILTER'),
      q('How are iterative functions like SUMX, COUNTX, etc. different from standard functions like SUM, AVERAGE, etc.?', 'iterators (SUMX/COUNTX) vs aggregations'),
      q('What is the use of the ALLSELECTED function?', 'ALLSELECTED'),
      q('What is the difference between DATESMTD and TOTALMTD functions?', 'DATESMTD vs TOTALMTD'),
      q('When do you use CROSSFILTER vs USERELATIONSHIP?', 'CROSSFILTER vs USERELATIONSHIP'),
      q('When should we use the RELATED and RELATEDTABLE function and when do we use the LOOKUPVALUE function?', 'RELATED/RELATEDTABLE vs LOOKUPVALUE'),
      q('What is the difference between REMOVEFILTERS and ALL?', 'REMOVEFILTERS vs ALL'),
      q('In a hypothetical scenario, if I write two calculated columns, SUM(Sales Amount) and CALCULATE(SUM(Sales Amount)), what is the difference in their result?', 'SUM vs CALCULATE(SUM) in a column'),
      q('How do you calculate a running total measure in DAX based on a non-date column like Product or Category?', 'running total on non-date column'),
      q('Can you talk about a scenario where you implemented complex DAX to solve a really unique problem?', 'complex DAX scenario'),
    ],
  },
  {
    id: window.uid('t'), name: 'Security',
    questions: [
      q('Can you explain the concept of static and dynamic RLS?', 'static vs dynamic RLS'),
      q('How can we implement Object Level Security (OLS) in Power BI?', 'CLS / Object Level Security (OLS)'),
    ],
  },
  {
    id: window.uid('t'), name: 'Service & Admin',
    questions: [
      q('What is the use of Apps in Power BI Service?', 'apps in Power BI Service'),
      q('In Workspace roles, what is the difference between a Member and a Contributor?', 'workspace role (member vs contributor)'),
      q('If I want to refresh the data in a Power BI dataset every 15 mins, what are my options?', 'refresh every 15 mins options'),
      q('Do we need gateways for Cloud Data Sources? Is there any exception to that?', 'gateways for cloud sources'),
      q('What is the difference between Power BI Pro license and Premium Per User (PPU) license?', 'pro license vs PPU / premium capacity'),
      q('In a dataset with incremental refresh on a particular table, what if I want to update the data for one particular year? How do I do that?', 'incremental refresh - reload one year'),
    ],
  },
  {
    id: window.uid('t'), name: 'Architecture & Advanced',
    questions: [
      q('How would you design a scalable Power BI solution for a large enterprise?', 'scalable enterprise solution'),
      q('How can we handle a multi-language report request in Power BI?', 'multi-language reports'),
      q('What are the limitations of integrating DevOps with Power BI Workspace for the CI/CD process?', 'DevOps / CI-CD limitations'),
      q('What are the Pros and Cons of Paginated Reports? When should we suggest a client go for a Paginated Report?', 'paginated reports pros/cons'),
      q('What are some of the use cases or scenarios where we integrate Power Apps and Power Automate within Power BI reports?', 'Power Apps / Automate integration'),
      q('Have you used any external tools for Power BI like DAX Studio, Tabular Editor, ALM Toolkit, SSMS, etc.?', 'external tools (DAX Studio, Tabular Editor)'),
    ],
  },
];

// Deep clone helper so editing settings never mutates the default bank.
window.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
