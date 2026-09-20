import { askDevin } from '../devin-chat-server.js';

function json(response, status, payload) {
  response.status(status).setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    json(response, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : (request.body ?? {});
    const question = body.question?.trim();
    if (!question || question.length > 500) {
      json(response, 400, { error: 'Enter a question of 500 characters or fewer.' });
      return;
    }
    const answer = await askDevin(question);
    json(response, 200, { answer });
  } catch (error) {
    json(response, error.statusCode || 502, { error: error.message || 'Unable to contact Devin.' });
  }
}
