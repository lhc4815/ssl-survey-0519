// server.js

const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// 환경 변수 로드
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 이메일 전송을 위한 트랜스포터 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'lhc4815@gmail.com',
    pass: process.env.EMAIL_PASS || 'khgp xsjv roxd cxqp'
  }
});

// JSON 바디 파싱: Base64 전송용으로 최대 50MB 허용
app.use(express.json({
  limit: '50mb'
}));

// 데이터 저장 디렉터리 설정
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 정적 파일 제공 (frontend)
app.use(express.static(path.join(__dirname, 'docs')));

// ─── 이메일 전송 API ─────────────────────────────
app.post('/api/send-email', (req, res) => {
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
    
    // 파일 저장 (선택적)
    if (fs.existsSync(DATA_DIR)) {
      const filePath = path.join(DATA_DIR, actualFilename);
      fs.writeFileSync(filePath, fileBuffer);
      console.log(`파일 저장 완료: ${filePath}`);
    }
    
    // 이메일 전송
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('이메일 전송 실패:', error);
        return res.status(500).json({
          success: false,
          error: `이메일 전송 실패: ${error.message}`
        });
      }
      
      console.log('이메일 전송 성공:', info.response);
      res.json({ 
        success: true, 
        message: '설문 결과가 이메일로 전송되었습니다.'
      });
    });
  } catch (err) {
    console.error('[/api/send-email] 오류:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// 서버 상태 확인 엔드포인트
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`▶ Server running at http://localhost:${PORT}`);
});
