// API route for saving survey data
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed, please use POST' 
    });
  }

  try {
    // No actual database operations or file system writes
    // Just log and acknowledge
    console.log('Received survey data', JSON.stringify(req.body).substring(0, 100) + '...');
    
    return res.status(200).json({ 
      success: true, 
      message: 'Survey data received successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[/api/save-survey] Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Unknown server error'
    });
  }
}
