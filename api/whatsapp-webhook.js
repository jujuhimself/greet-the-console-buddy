// Vercel/Serverless HTTP endpoint for WhatsApp Webhook Verification and Inbound Handling
// This endpoint is PUBLIC and does not require any Authorization header, suitable for Meta callbacks.
// GET: echo hub.challenge when hub.verify_token matches
// POST: accept inbound messages (stub) and respond 200

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'bepawa_whatsapp_verify_9c4f2c5d';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token && challenge) {
        if (token === VERIFY_TOKEN) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.status(200).send(challenge);
        }
        return res.status(403).send('Forbidden: invalid verify token');
      }
      if (req.query.ping) {
        return res.status(200).send('ok');
      }
      return res.status(400).send('Bad Request');
    }

    if (req.method === 'POST') {
      // Meta sends JSON
      const body = req.body || {};
      console.log('WhatsApp inbound payload:', JSON.stringify(body));

      // Always return 200 quickly to satisfy webhook retry policy
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).send('Method Not Allowed');
  } catch (err) {
    console.error('whatsapp-webhook error:', err);
    return res.status(500).send('Internal Server Error');
  }
}
