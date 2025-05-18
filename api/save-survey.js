// Dummy API endpoint to handle save-survey requests
module.exports = async (req, res) => {
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
    // In a real implementation, this would save the data to a database
    // For now, just acknowledge receipt
    console.log('Received survey data');
    
    return res.status(200).json({ 
      success: true, 
      message: 'Survey data received successfully'
    });
  } catch (err) {
    console.error('[/api/save-survey] error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Unknown server error'
    });
  }
};
