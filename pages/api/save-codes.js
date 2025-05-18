export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed, please use POST'
    });
  }

  try {
    // Get usedCodes from request body
    const { usedCodes } = req.body || {};
    console.log('Received used codes data', usedCodes ? `Count: ${usedCodes.length}` : 'No data');
    
    return res.status(200).json({ 
      success: true, 
      message: 'Used codes data received successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[/api/save-codes] error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Unknown server error'
    });
  }
}
