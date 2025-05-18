import nodemailer from 'nodemailer';

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

  const { filename, content, studentName } = req.body;
  
  if (!content) {
    return res.status(400).json({
      success: false,
      error: '파일 내용이 필요합니다.'
    });
  }

  try {
    // Base64 → Buffer
    const fileBuffer = Buffer.from(content, 'base64');
    const actualFilename = filename || `survey_result_${Date.now()}.xlsx`;
    
    // 이메일 옵션 설정
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'lhc4815@gmail.com',
        pass: process.env.EMAIL_PASS || 'khgp xsjv roxd cxqp'
      }
    });
    
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
    
    // 이메일 전송 (Promise로 변환)
    const info = await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('이메일 전송 실패:', error);
          reject(error);
        } else {
          console.log('이메일 전송 성공:', info.response);
          resolve(info);
        }
      });
    });
    
    return res.status(200).json({ 
      success: true, 
      message: '설문 결과가 이메일로 전송되었습니다.'
    });
    
  } catch (err) {
    console.error('[/api/send-email] 오류:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Unknown error'
    });
  }
}
