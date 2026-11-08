// Vercel adapter for the same official-source trade/GDP handler used by Netlify.
// Keep the two hosting platforms on one shared data implementation.
const { handler } = require('../netlify/functions/markets.js');

module.exports = async function financial(req,res) {
  const query = req.query || {};
  const event = {
    httpMethod: req.method,
    queryStringParameters: Object.fromEntries(Object.entries(query).map(([key,value]) => [key,Array.isArray(value)?value[0]:value]))
  };
  try {
    const reply = await handler(event);
    for (const [key,value] of Object.entries(reply.headers || {})) res.setHeader(key,value);
    res.status(reply.statusCode || 500).send(reply.body || '{}');
  } catch (error) {
    res.status(503).json({error:'Financial data temporarily unavailable'});
  }
};
