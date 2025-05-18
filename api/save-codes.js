// Dummy API endpoint to handle save-codes requests
module.exports = async (req, res) => {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, please use POST' });
  }

  try {
    // In a real implementation, this would save the code data
    // For now, just acknowledge receipt
    console.log('Received used codes data');
    
    res.status(200).json({ 
      success: true, 
      message: 'Used codes data received successfully'
    });
  } catch (err) {
    console.error('[/api/save-codes] error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
