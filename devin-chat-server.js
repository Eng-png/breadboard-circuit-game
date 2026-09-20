const DEVIN_API_V1 = 'https://api.devin.ai/v1';
const DEVIN_API_V3 = 'https://api.devin.ai/v3';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let personalSessionId;

function config() {
  return {
    apiKey: process.env.DEVIN_API_KEY,
    orgId: process.env.DEVIN_ORG_ID,
    sessionId: process.env.DEVIN_SESSION_ID,
    apiVersion: process.env.DEVIN_API_VERSION || 'v3',
  };
}

async function devin(baseUrl, path, options = {}) {
  const { apiKey } = config();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || payload.message || `Devin returned ${response.status}`);
  return payload;
}

async function messages(orgId, sessionId) {
  const payload = await devin(DEVIN_API_V3, `/organizations/${orgId}/sessions/${sessionId}/messages?first=100`);
  return payload.items ?? [];
}

function messageText(item) {
  return item?.message ?? item?.text ?? item?.content ?? '';
}

function messageKey(item) {
  return item?.event_id ?? item?.id ?? JSON.stringify(item);
}

function isDevinMessage(item) {
  const source = String(item?.source ?? item?.role ?? item?.type ?? '').toLowerCase();
  return source.includes('devin') || source.includes('assistant');
}

async function personalMessages(sessionId) {
  const payload = await devin(DEVIN_API_V1, `/sessions/${sessionId}`);
  return payload.messages ?? [];
}

async function askPersonalDevin(tutorPrompt) {
  const configuredSessionId = config().sessionId;
  let sessionId = configuredSessionId || personalSessionId;
  let before = [];

  if (sessionId) {
    before = await personalMessages(sessionId);
    await devin(DEVIN_API_V1, `/sessions/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message: tutorPrompt }),
    });
  } else {
    const created = await devin(DEVIN_API_V1, '/sessions', {
      method: 'POST',
      body: JSON.stringify({ prompt: tutorPrompt }),
    });
    sessionId = created.session_id;
    if (!sessionId) throw new Error('Devin did not return a session ID.');
    personalSessionId = sessionId;
  }

  const seen = new Set(before.map(messageKey));
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await sleep(1500);
    const latest = await personalMessages(sessionId);
    const answer = latest.findLast((item) => isDevinMessage(item) && !seen.has(messageKey(item)));
    if (messageText(answer)) return messageText(answer);
  }

  throw new Error('Devin is still thinking. Please try the question again in a moment.');
}

export async function askDevin(question) {
  const { apiKey, orgId, sessionId, apiVersion } = config();
  if (!apiKey || (apiVersion !== 'v1' && (!orgId || !sessionId))) {
    const error = new Error(apiVersion === 'v1'
      ? 'Devin setup is incomplete. Add DEVIN_API_KEY to .env.local, then restart the game.'
      : 'Devin setup is incomplete. Add DEVIN_API_KEY, DEVIN_ORG_ID, and DEVIN_SESSION_ID to .env.local, then restart the game.');
    error.statusCode = 503;
    throw error;
  }

  const tutorPrompt = [
    'You are Watt, a friendly electronics tutor for absolute beginners playing Watt’s Wrong.',
    'Answer only the circuit/electronics question below in plain language.',
    'Keep the answer under 140 words. Be encouraging, accurate, and safety-conscious.',
    'If useful, relate the answer to batteries, switches, resistors, LEDs, or breadboards.',
    `Question: ${question}`,
  ].join('\n');

  if (apiVersion === 'v1') return askPersonalDevin(tutorPrompt);

  const before = await messages(orgId, sessionId);
  const seen = new Set(before.map((item) => item.event_id));
  await devin(DEVIN_API_V3, `/organizations/${orgId}/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message: tutorPrompt }),
  });

  for (let attempt = 0; attempt < 20; attempt += 1) {
    await sleep(1500);
    const latest = await messages(orgId, sessionId);
    const answer = latest.findLast((item) => item.source === 'devin' && !seen.has(item.event_id));
    if (answer?.message) return answer.message;
  }

  const error = new Error('Devin is still thinking. Please try the question again in a moment.');
  error.statusCode = 504;
  throw error;
}

export async function handleDevinChat(request, response) {
  if (request.method !== 'POST') {
    response.writeHead(405, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    let body = '';
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 10_000) throw new Error('Request is too large.');
    }
    const question = JSON.parse(body || '{}').question?.trim();
    if (!question || question.length > 500) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Enter a question of 500 characters or fewer.' }));
      return;
    }
    const answer = await askDevin(question);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ answer }));
  } catch (error) {
    response.writeHead(error.statusCode || 502, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: error.message || 'Unable to contact Devin.' }));
  }
}
