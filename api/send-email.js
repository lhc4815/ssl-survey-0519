// Serverless function for sending emails through Vercel
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, please use POST' });
  }

  const { filename, content, studentName } = req.body;
  
  if (!content) {
    return res.status(400).json({
      success: false,
      error: '파일 내용이 필요합니다.'
    });
  }

  try {
    // Set up transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'lhc4815@gmail.com',
        pass: process.env.EMAIL_PASS || 'khgp xsjv roxd cxqp'
      }
    });

    // Base64 → Buffer
    const fileBuffer = Buffer.from(content, 'base64');
    const actualFilename = filename || `survey_result_${Date.now()}.xlsx`;
    
    // 이메일 옵션 설정
    const mailOptions = {
      from: process.env.EMAIL_USER || 'lhc4815@gmail.com',
      to: process.env.EMAIL_USER || 'lhc4815@gmail.com',
      subject: `[SSL 설문] ${studentName || '학생'} 설문 결과`,
      text: `SSL 설문 시스템에서 새로운 설문 결과가 제출되었습니다.\n\n학생: ${studentName || '이름 없음'}\n제출시간: ${new Date().toLocaleString('ko-KR')}`,
      attachments: [
        {
          filename: actualFilename,
          content: fileBuffer
        }
      ]
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('이메일 전송 성공:', info.response);
    res.status(200).json({ 
      success: true, 
      message: '설문 결과가 이메일로 전송되었습니다.'
    });
  } catch (err) {
    console.error('[/api/send-email] 오류:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
