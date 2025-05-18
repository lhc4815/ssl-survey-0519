// server.js

import { uploadFile } from './githubApi.js';

const express = require('express');
const nodemailer = require('nodemailer');
const app     = express();

// 이메일 전송을 위한 트랜스포터 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lhc4815@gmail.com',
    pass: 'khgp xsjv roxd cxqp'
  }
});

app.post('/api/upload', async (req, res) => {
  const { path, content, commitMessage } = req.body;
  try {
    const result = await uploadFile(path, content, commitMessage);
    res.json({ rawUrl: result.content.download_url });
  } catch (err) {
    console.error('upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

const fs      = require('fs');
const path    = require('path');
const PORT    = process.env.PORT || 3000;

// JSON 바디 파싱: Base64 전송용으로 최대 50MB 허용
app.use(express.json({
  limit: '50mb'
}));


// 데이터 저장 디렉터리 설정
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.static(path.join(__dirname, 'docs')));  // 실제 경로로 조정


// ─── 설문 결과 저장 API ─────────────────────────────
// JSON 바디 최대 50MB 허용
app.use(express.json({ limit: '50mb' }));

// data 폴더가 없으면 생성
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ── 설문 엑셀 저장 및 이메일 전송 API ───────────────────────────────
app.post('/api/save-excel', (req, res) => {
  const { filename, content } = req.body;
  if (!filename || !content) {
    return res.status(400).json({ success: false, error: 'filename 및 content 필요' });
  }

  const filePath = path.join(DATA_DIR, filename);
  try {
    // 1) 파일 저장
    const buffer = Buffer.from(content, 'base64');
    fs.writeFileSync(filePath, buffer);
    
    // 2) 이메일 전송
    const mailOptions = {
      from: 'lhc4815@gmail.com',
      to: 'lhc4815@gmail.com',
      subject: `[SSL 설문] ${filename} 제출됨`,
      text: `SSL 설문 결과가 제출되었습니다.\n\n파일명: ${filename}\n제출시간: ${new Date().toLocaleString('ko-KR')}`,
      attachments: [
        {
          filename,
          content: buffer
        }
      ]
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('이메일 전송 실패:', error);
        // 이메일 전송 실패해도 파일은 저장되었으므로 성공 응답
        return res.json({ 
          success: true, 
          file: filePath,
          emailSent: false,
          emailError: error.message
        });
      }
      console.log('이메일 전송 성공:', info.response);
      return res.json({ 
        success: true, 
        file: filePath,
        emailSent: true
      });
    });
  } catch (err) {
    console.error('[/api/save-excel] 오류', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

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
      from: 'lhc4815@gmail.com',
      to: 'lhc4815@gmail.com',
      subject: `[SSL 설문] ${studentName || '학생'} 설문 결과`,
      text: `SSL 설문 시스템에서 새로운 설문 결과가 제출되었습니다.\n\n학생: ${studentName || '이름 없음'}\n제출시간: ${new Date().toLocaleString('ko-KR')}`,
      attachments: [
        {
          filename: actualFilename,
          content: fileBuffer
        }
      ]
    };
    
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

// ─── (선택) 정적 파일 제공 ─────────────────────────────
// 클라이언트(index.html, script.js, .xlsx 등)가 docs/ 폴더에 있을 경우:
app.use(express.static(path.join(__dirname, 'docs')));

app.listen(PORT, () => {
  console.log(`▶ Server running at http://localhost:${PORT}`);
});
