// script.js

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded 이벤트 발생');
  
  /* ── 상수 ───────────────────────────────────────── */
  const TOTAL_LIMIT = 90 * 60;   // 전체 제한 시간 90분
  const A_Q_SEC     = 10;        // Type A: 10초/문항
  const B_Q_SEC     = 60;        // Type B: 60초/문항
  const C_Q_SEC     = 240;       // Type C: 240초(4분)/문항

  /* ── 상태 변수 ───────────────────────────────────── */
  let startTime, totalInt, segmentInt;
  let qLeft, qInt, qTO;
  let stage = 'A', idxA = 0, idxB = 0, idxC = 0;
  let questionsA = [], questionsB = [], questionsC = [];
  let respA = [], respB = [], respC = [];


  /* ── DOM 참조 ─────────────────────────────────────── */
  const userForm        = document.getElementById('user-form');
  const surveyDiv       = document.getElementById('survey');
  const resultDiv       = document.getElementById('result');

  const startBtn        = document.getElementById('start');
  //const testModeCheckbox = document.getElementById('test-mode');
  //console.log('testModeCheckbox 요소:', testModeCheckbox);
  //const devB            = document.getElementById('dev-b');
  //const devC            = document.getElementById('dev-c');

  const nameIn          = document.getElementById('name');
  const schoolIn        = document.getElementById('school');
  const genderIn        = document.getElementById('gender');
  const regionIn        = document.getElementById('region');
  const subRgGrp        = document.getElementById('subregion-group');
  const subPills        = Array.from(document.querySelectorAll('#subregion-group .pill'));
  const msGrp           = document.getElementById('middleschool-group');
  const msSelect        = document.getElementById('middleschool');

  const bPills          = Array.from(document.querySelectorAll('#bcount-group .pill'));
  const tPills          = Array.from(document.querySelectorAll('#schooltype-group .pill'));

  const personalInfoDiv = document.getElementById('personal-info');
  const surveyTitle     = document.querySelector('#survey h2');
  const questionText    = document.getElementById('question-text');
  const totalTimerDiv   = document.getElementById('total-timer');
  const segmentTimerDiv = document.getElementById('segment-timer');
  const timerDiv        = document.getElementById('timer');
  const progressDiv     = document.getElementById('progress');
  const answersDiv      = document.getElementById('answers');
  const hintDiv         = document.getElementById('hint');
  const prevBtn         = document.getElementById('prev');
  const nextBtn         = document.getElementById('next');
  const downloadLink    = document.getElementById('download-link');

  // ⇨ ➊ 요소 참조 및 상태 변수 선언
  const codeForm    = document.getElementById('code-form');       // 코드 입력 폼
  const codeInput   = document.getElementById('stu-code');        // 코드 입력 필드
  const codeSubmit  = document.getElementById('code-submit');     // 확인 버튼
  const codeMessage = document.getElementById('code-message');    // 메시지 영역
  const usedDL      = document.getElementById('used-download-link'); // 사용 코드 다운로드 링크
  
  // DOMContentLoaded 직후 또는 전역 스코프에서
  // const clearBtn = document.getElementById('clear-codes-btn');

  let validCodes = [];   // stu_codes.xlsx로부터 로드된 유효 코드 목록
  let usedCodes  = [];   // used_stu_codes.xlsx로부터 로드된 이미 사용된 코드 목록
  let currentCode = '';  // 현재 입력된 코드

  // ⇨ ➊′ 코드 목록 로드 (버튼 참조 이후)
  loadCodeLists();

  // ⇨ ➋ 코드 목록 로드 함수 정의
  function loadCodeLists() {
  codeSubmit.disabled = true;
  codeMessage.textContent = '코드 목록 불러오는 중…';

  // (A) surveyDB에서 실제 사용된 코드 목록 추출
  const surveyDB = JSON.parse(localStorage.getItem('surveyDB') || '[]');
  const localUsed = surveyDB.map(r => r['사용한코드'] || '');
  console.log('▶ surveyDB 기반 usedCodes:', localUsed);

  // ── (B) 유효 코드만 서버에서 로드
  fetch('MRT_stu_codes_0515.xlsx')
    .then(r => {
      if (!r.ok) throw new Error(`stu codes not found (${r.status})`);
      return r.arrayBuffer();
    })
    .then(stuBuf => {
     // 1) 바이너리 → 워크북
     const wb = XLSX.read(new Uint8Array(stuBuf), { type: 'array' });
     // 2) 첫 번째 시트 선택
     const sheet = wb.Sheets[wb.SheetNames[0]];
     // 3) 시트를 2차원 배열로 변환 (header 포함)
     const rows  = XLSX.utils.sheet_to_json(sheet, { header: 1 });
     // 4) 헤더 제외 후, 첫 열(code)만 뽑아서 대문자·trim
     validCodes = rows
       .slice(1)
       .map(r => String(r[0]).trim())
       .filter(c => c.length === 7);
     console.log('🔍 validCodes 로드됨:', validCodes);
      // … 기존 validCodes 로딩 코드 그대로 …
      // ── (C) usedCodes 는 로컬스토리지 기준으로만 세팅
      usedCodes = localUsed;
      console.log('🔄 usedCodes set from surveyDB:', usedCodes);

      codeMessage.textContent = '';
      codeSubmit.disabled = false;
    })
    .catch(e => {
      console.error('❌ loadCodeLists error:', e);
      codeMessage.textContent = '코드 목록 로딩 실패: ' + e.message;
      codeSubmit.disabled = true;
    });
}

//clearBtn.addEventListener('click', () => {
  // 1) 로컬스토리지에서 surveyDB, usedCodes 제거
//  localStorage.removeItem('surveyDB');
//  localStorage.removeItem('usedCodes');

  // 2) 메모리 변수도 초기화
//  usedCodes = [];
//  surveyDB = [];

  // 3) UI 리셋
//  codeInput.value = '';
//  codeMessage.textContent = '⚙️ 사용된 코드가 삭제되었습니다. 새로고침 후 테스트하세요.';
  
//  console.log('🗑️ 사용된 코드 및 설문 DB 초기화 완료');
//});

  // ⇨ ➌ 코드 입력 검증 처리
  codeSubmit.addEventListener('click', e => {
    e.preventDefault();                   // ← 폼 제출(새로고침) 막기
    const code = codeInput.value.trim();
    
    // -- 길이 검사
    if (code.length !== 7) {
      codeMessage.textContent = '7자리 코드를 입력하세요.';
      return;
    }
    // -- 유효 코드인지 확인
    if (!validCodes.includes(code)) {
      codeMessage.textContent = '유효하지 않은 코드입니다.';
      return;
    }
    // -- 중복 입력인지 확인
    if (usedCodes.includes(code)) {
      codeMessage.textContent = '유효하지만 이미 사용된 코드입니다. 설문을 진행할 수 없습니다.';
      return;
    }
// ✔ 검증 통과
currentCode = code;

 // 코드 사용 등록은 설문 완료 시점으로 연기!
 // 그냥 화면 전환만 수행
 codeForm.classList.add('hidden');
 userForm.classList.remove('hidden');
 codeMessage.textContent = '';
  });

  // ── 디버그 버튼 핸들러 (설문 시작 후에만 눌러주세요) ─────────────────────
//devB.addEventListener('click', () => {
//   // Type A 응답을 모두 "3 (보통)"으로
//   respA = respA.map(() => 3);
//   // Type A 소요시간(240문항×10초)을 모두 소모했다고 설정
//   startTime = Date.now() - questionsA.length * A_Q_SEC * 1000;
//   switchToTypeB();
// });

// devC.addEventListener('click', () => {
//   // Type A 응답을 모두 "3 (보통)"
//   respA = respA.map(() => 3);
//   // Type B 설문을 스킵했으니 모두 "A" 로
//   respB = respB.map(() => 'A');
//   // Type A + Type B 소요시간(240×10초 + 10×60초)을 모두 소모했다고 설정
//   startTime = Date.now()
//     - (questionsA.length * A_Q_SEC + questionsB.length * B_Q_SEC) * 1000;
//   switchToTypeC();
// });

 // ── 추가: 설문완료 버튼 핸들러 ─────────────────────────────────────
 //const devFinish = document.getElementById('dev-finish');
 //devFinish.addEventListener('click', () => {
  // Type A 응답을 모두 "3 (보통)"으로 설정
 // respA = respA.map(() => 3);
  // Type B와 Type C 응답을 모두 "A" 로 설정
//  respB = respB.map(() => 'A');
//  respC = respC.map(() => 'A');
  // 바로 설문 종료 & 결과 화면으로 이동
//  finishSurvey();
//  });


   // 1~6번 입력 완료 시에만 시작 버튼 활성화
  function validatePersonalInfo() {
    const nameOK   = !!nameIn.value.trim();
    const genderOK = !!genderIn.value;
    const regionOK = !!regionIn.value;

    // schoolOK: 서울/기타 지역 구분 없이 schoolIn.value 검사 + 
    // 서울권 분기 시 해당 중학교(msSelect.value)도 체크
    let schoolOK = !!schoolIn.value.trim();
    if (regionIn.value === '서울 특별시') {
      const sel = subPills.find(p => p.classList.contains('selected'));
      if (sel && sel.dataset.value !== '기타 지역') {
        schoolOK = !!msSelect.value;
      }
    }

    // B등급, 고교분류 pill 체크
    const bOK = Array.from(document.querySelectorAll('#bcount-group .pill'))
                     .some(p => p.classList.contains('selected'));
    const tOK = Array.from(document.querySelectorAll('#schooltype-group .pill'))
                     .some(p => p.classList.contains('selected'));

    startBtn.disabled = !(nameOK && genderOK && regionOK && schoolOK && bOK && tOK);
  }

  // 입력 필드나 pill 클릭 시마다 재검증
  // 입력값 변화 & pill 클릭 시 모두 재검증
[nameIn, schoolIn, genderIn, regionIn, msSelect].forEach(el =>
  el.addEventListener('input', validatePersonalInfo)
);
subPills.forEach(p => p.addEventListener('click', validatePersonalInfo));
bPills.forEach(p    => p.addEventListener('click', validatePersonalInfo));
tPills.forEach(p    => p.addEventListener('click', validatePersonalInfo));


  const schoolMap = {
      '강남': ['단대부중', '역삼중', '도곡중', '대명중', '대청중', '숙명여중', '휘문중'],
      '서초': ['원촌중','서초중','반포중', '세화여중'],
      '송파': ['잠실중','송례중','풍납중'],
      '목동': ['목동중','목일중','신목중', '월촌중', '양정중', '목운중'],
      '중계': ['중계중','상명중','불암중', '을지중']
  };

  /* ── 1) 서울→중학교 토글, Pill 설정 ───────────────── */
  // 1) 서울 ↔ 중학교 토글
  regionIn.addEventListener('change', () => {
  if (regionIn.value === '서울 특별시') {
    subRgGrp.classList.remove('hidden');
    msGrp.classList.add('hidden');
    schoolIn.classList.remove('hidden');
    msSelect.innerHTML = '<option value="" disabled selected>중학교 선택</option>';
  } else {
    subRgGrp.classList.add('hidden');
    msGrp.classList.add('hidden');
    msSelect.innerHTML = '<option value="" disabled selected>중학교 선택</option>';
    schoolIn.classList.remove('hidden');
  }
  validatePersonalInfo();
});


  subPills.forEach(p => p.addEventListener('click', () => {
    subPills.forEach(x => x.classList.remove('selected'));
    p.classList.add('selected');

    const v = p.dataset.value;
    msSelect.innerHTML = '<option value="" disabled selected>중학교 선택</option>';

   if (v === '기타 지역') {
   msGrp.classList.add('hidden');
  } else {
   msGrp.classList.remove('hidden');
   msSelect.innerHTML = '<option value="" disabled selected>중학교 선택</option>';
   schoolMap[v].forEach(sch => {
     const opt = document.createElement('option');
     opt.value = sch; opt.text = sch;
     msSelect.append(opt);
   });
 }
    validatePersonalInfo();
  }));

  function setupPills(pills){
    pills.forEach(p => p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('selected'));
      p.classList.add('selected');
    }));
  }
  setupPills(bPills);
  setupPills(tPills);

  /* ── 2) '설문 시작' 클릭 핸들러 ───────────────────── */
  startBtn.addEventListener('click', () => {

    // ── 수정된 유효성 검사 ──
    const nameOK   = !!nameIn.value.trim();
    const genderOK = !!genderIn.value;
    const regionOK = !!regionIn.value;

    let schoolOK = false;
    if (regionIn.value === '서울 특별시') {
      // 4-1 선택된 권역
      const sel = subPills.find(p => p.classList.contains('selected'));
      if (sel) {
        if (sel.dataset.value === '기타 지역') {
          schoolOK = !!schoolIn.value.trim();
        } else {
          schoolOK = !!msSelect.value;
        }
      }
    } else {
      schoolOK = !!schoolIn.value.trim();
    }

    const bOK = bPills.some(p => p.classList.contains('selected'));
    const tOK = tPills.some(p => p.classList.contains('selected'));

    if (!(nameOK && genderOK && regionOK && schoolOK && bOK && tOK)) {
      return alert('1~6번 정보를 모두 입력/선택해주세요.');
    }

    // 학생 정보 표시
    const sub = subPills.find(x=>x.classList.contains('selected'))?.dataset.value||'';
    const msVal = msSelect.value || '';

    // 1) 선택된 권역(구) 찾기
    const selPill = Array.from(subPills)
    .find(x => x.classList.contains('selected'));
    
    const district = selPill?.dataset.value;
    
    // 2) 중학교 필드 결정
    let middleSchoolValue = '';
    if (regionIn.value === '서울 특별시' && district && district !== '기타 지역') {
     // 여기서 msSelect.value 를 써야 합니다
     middleSchoolValue = msSelect.value || '';
   } else {
     middleSchoolValue = schoolIn.value.trim();
   }
    
    // 3) 요약문 갱신
    personalInfoDiv.textContent =
    `이름: ${nameIn.value.trim()} | 출신학교: ${schoolIn.value.trim()} | 성별: ${genderIn.value} | 거주: ${regionIn.value}${district?'/'+district:''} | 중학교: ${middleSchoolValue} | B등급: ${bPills.find(x=>x.classList.contains('selected')).dataset.value} | 희망고교: ${tPills.find(x=>x.classList.contains('selected')).dataset.value}`;

    // 엑셀 로드
    fetch('Questions.xlsx')
      .then(r=>r.arrayBuffer())
      .then(stuBuf=>{
        // stuBuf는 ArrayBuffer
        const wb = XLSX.read(new Uint8Array(stuBuf), { type: 'array' });
        // 첫 번째 시트 사용(혹은 시트 이름을 정확히 지정)
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        // 컬럼 A에 코드가 있다고 가정 (첫 행이 헤더라면 slice(1))
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // 예: [['code'], ['ABC1234'], ['DEF5678'], …]
        validCodes = rows
        .slice(1)                 // 헤더 제거
        .map(r => String(r[0]).trim())  // 첫 열만 추출
        .filter(c => c.length === 7);
        console.log('🔍 loaded validCodes:', validCodes);

        questionsA = XLSX.utils.sheet_to_json(wb.Sheets['Type A'], {defval:''})
        .map(r=>({
          no:       r['연번'],
          category: r['척도(대분류)'],   // ← 여기 추가
          q:        r['문항'],
          p:        r['지문'],
          A:        r['(A)'],
          B:        r['(B)'],
          C:        r['(C)'],
          D:        r['(D)'],
        }));
        questionsB = XLSX.utils.sheet_to_json(wb.Sheets['Type B'])
          .map(r=>({no:r['연번'],q:r['문항'],p:r['지문'],A:r['(A)'],B:r['(B)'],C:r['(C)'],D:r['(D)'], correct: r['답'],}));
        questionsC = XLSX.utils.sheet_to_json(wb.Sheets['Type C'])
          .map(r=>({no:r['연번'],q:r['문항'],p:r['지문'],A:r['(A)'],B:r['(B)'],C:r['(C)'],D:r['(D)'], correct: r['답'],}));
        respA = Array(questionsA.length).fill(null);
        respB = Array(questionsB.length).fill(null);
        respC = Array(questionsC.length).fill(null);
        idxA = idxB = idxC = 0;
        userForm.classList.add('hidden');
        surveyDiv.classList.remove('hidden');
        stage = 'A';
        startTime = Date.now();
        startTotalTimer();
        
        // 일반 모드: A부터 시작
        startSegmentATimer();
        renderQuestionA();
      })
      .catch(e=>{
        console.error(e);
        alert('문항 로딩 실패');
      });
  });

  /* ── 3) 전체 타이머 ─────────────────────────────── */
  function startTotalTimer(){
    clearInterval(totalInt);
    updateTotalTimer();
    totalInt = setInterval(updateTotalTimer, 1000);
  }
  function updateTotalTimer(){
    const elapsed = Math.floor((Date.now()-startTime)/1000);
    const remain  = TOTAL_LIMIT - elapsed;
    totalTimerDiv.textContent = `⏱ 전체 경과 시간: ${fmt(elapsed)} | ⏱ 남은 시간: ${fmt(remain)}`;
    if (remain <= 0) finishSurvey();
  }

  /* ── 4) A 세그먼트 타이머 ───────────────────────── */
  function startSegmentATimer(){
    clearInterval(segmentInt);
    updateSegmentATimer();
    segmentInt = setInterval(updateSegmentATimer,1000);
  }
  function updateSegmentATimer(){
    const usedA = idxA*A_Q_SEC + (A_Q_SEC - (qLeft||0));
    const remainA = questionsA.length*A_Q_SEC - usedA;
    segmentTimerDiv.textContent = `⏱ Type A 남은시간: ${fmt(remainA)}`;
    if (remainA <= 0) switchToTypeB();
  }

  /* ── 5) 질문별 타이머 헬퍼 ─────────────────────── */
  function startQuestionTimer(sec, onEnd){
    clearQuestionTimer();
    qLeft = sec; timerDiv.textContent = `⏱ 남은 문항 시간: ${qLeft}초`;
    qInt = setInterval(()=>{
      qLeft--; timerDiv.textContent = `⏱ 남은 문항 시간: ${qLeft}초`;
      if (qLeft<=0) clearInterval(qInt);
    },1000);
    qTO = setTimeout(onEnd, sec*1000);
  }
  function clearQuestionTimer(){
    clearInterval(qInt);
    clearTimeout(qTO);
  }

  /* ── 6) Type A 렌더 & 이동 ─────────────────────── */
  // 상단 어딘가에 매핑 객체 추가
const A_LABELS = {
  5: '매우 그렇다',
  4: '약간 그렇다',
  3: '보통',
  2: '약간 아니다',
  1: '전혀 아니다'
};

function renderQuestionA() {
  clearQuestionTimer();
  const cur = questionsA[idxA];
  surveyTitle.textContent = `Type A (${idxA+1}/${questionsA.length})`;
  questionText.innerHTML = `
    <strong>${cur.no}. ${cur.q}</strong>
    <div style="margin-top:8px;">${cur.p||''}</div>
  `;

  // 버튼 생성 부분
  answersDiv.innerHTML = '';
  [5,4,3,2,1].forEach(score => {
    const btn = document.createElement('button');
    btn.textContent = `${score} (${A_LABELS[score]})`;
    // 선택된 값 유지
    if (respA[idxA] === score) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      respA[idxA] = score;
      answersDiv.querySelectorAll('button').forEach(x => x.classList.remove('selected'));
      btn.classList.add('selected');
      nextBtn.disabled = false;
    });
    answersDiv.appendChild(btn);
  });

  nextBtn.disabled = (respA[idxA] == null);
  nextBtn.onclick = () => moveA();

  startQuestionTimer(A_Q_SEC, () => {
    if (!respA[idxA]) respA[idxA] = 3;  // 기본값
    moveA();
  });
  progressDiv.textContent = `${idxA+1}/${questionsA.length}`;
}

  function moveA(){
    clearQuestionTimer();
    if(idxA<questionsA.length-1){idxA++; renderQuestionA();}
    else switchToTypeB();
  }

  /* ── 7) A→B 전환 ─────────────────────────────── */
  function switchToTypeB(){
    stage='B'; idxB=0;
    clearInterval(segmentInt);
    segmentTimerDiv.textContent = 'Type B 진행 중';
    renderQuestionB();
  }

  /* ── 8) Type B 렌더 & 이동 ───────────────────── */
  function renderQuestionB(){
    clearQuestionTimer();
    const cur = questionsB[idxB];
    surveyTitle.textContent = `Type B (${idxB+1}/${questionsB.length})`;
    questionText.innerHTML = `<strong>${cur.no}. ${cur.q}</strong><div style="margin-top:8px;">${cur.p}</div>`;
    answersDiv.innerHTML = '';

    let html = '';

  // 4~7번: 지문 → 문항
  if (cur.no >= 4 && cur.no <= 7) {
    const p4_7 = 'Q4~Q7. 다음 글을 읽고, 각 빈칸에 들어갈 표현을 고르세요.'
    html += `<div style="margin-top:8px;">${p4_7}</div>`;
    html += `<div style="margin-top:8px;">${cur.p}</div>`;
    html += `<div style="margin-top:8px;"><strong>${cur.no}. ${cur.q}</strong></div>`;
  }
  // 8·9번: 지문8 + Table_I.jpg + 지문9 → 문항
  else if (cur.no === 8 || cur.no === 9) {
    // 연번 8의 지문
    const p8 = questionsB.find(q => q.no === 8).p;
    const p8_1 = 'Martial Arts Club of Fort Dodge'
    // 연번 9의 지문
    const p9 = questionsB.find(q => q.no === 9).p;
    

    html += `<div style="margin-top:8px;">${p8}</div>`;
    html += `<div style="margin-top:8px; text-align: center;"><strong>${p8_1}</strong></div>`;
    html += `<img src="Table_I.jpg" style="max-width:100%; display:block; margin:8px 0;">`;
    html += `<div style="margin-top:8px;">${p9}</div>`;
    html += `<div style="margin-top:8px;"><strong>${cur.no}. ${cur.q}</strong></div>`;
  }
  // 그 외(1~3, 10번 등): 원래대로
  else {
    html += `<strong>${cur.no}. ${cur.q}</strong>`;
    html += `<div style="margin-top:8px;">${cur.p}</div>`;
  }

  questionText.innerHTML = html;
    
    ['A','B','C','D'].forEach(opt=>{
      const btn = document.createElement('button');
      btn.textContent = `(${opt}) ${cur[opt]}`;

      if (respB[idxB]===opt) btn.classList.add('selected');
      btn.addEventListener('click', ()=>{
        respB[idxB]=opt;
        answersDiv.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));
        btn.classList.add('selected');
        nextBtn.disabled=false;
      });
      answersDiv.appendChild(btn);
    });
    nextBtn.disabled = !respB[idxB];
    nextBtn.onclick  = ()=>moveB();
    startQuestionTimer(B_Q_SEC, ()=>{
      if(!respB[idxB]) respB[idxB]='X';
      moveB();
    });
    progressDiv.textContent = `${idxB+1}/${questionsB.length}`;
  }
  function moveB(){
    clearQuestionTimer();
    if(idxB<questionsB.length-1){ idxB++; renderQuestionB(); }
    else finishTypeBPhase();
  }
  function finishTypeBPhase(){
    clearQuestionTimer();
    switchToTypeC();
  }

  /* ── 9)
