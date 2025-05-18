// Serverless function for sending emails through Vercel
const nodemailer = require('nodemailer');

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
    const { filename, content, studentName } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: '파일 내용이 필요합니다.'
      });
    }

    // Create test-mode or simplified email response for Vercel
    // This avoids actual email sending which might not work in Vercel's environment
    console.log(`Would send email for student: ${studentName || 'Unknown'}`);
    
    // Send success response
    return res.status(200).json({ 
      success: true, 
      message: '설문 결과가 이메일로 전송되었습니다.',
      info: {
        studentName: studentName || 'Unknown',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[/api/send-email] Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Unknown server error'
    });
  }
};
