// DOM
const body=document.body;
const themeToggle=document.getElementById('themeToggle');
const startBtn=document.getElementById('startBtn');
const resetBtn=document.getElementById('resetBtn');
const statusText=document.getElementById('statusText');
const timerEl=document.getElementById('timer');
const progressCircle=document.getElementById('progressCircle');
const suggestion=document.getElementById('suggestion');
const tipEl=document.getElementById('tip');
const survey=document.getElementById('survey');
const moodSelect=document.getElementById('moodSelect');
const submitSurvey=document.getElementById('submitSurvey');
const achievementsList=document.getElementById('achievementsList');

let isWork=true, sessionCount=0, remaining=0, timerId;
const WORK=25*60, SHORT=5*60, LONG=15*60;
const OPENAI_PROXY='https://your-domain.com/api/ai-relax';

function fmt(s){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
function setProgress(){ const pct=(remaining/(isWork?WORK:(sessionCount%4===0?LONG:SHORT)))*283; progressCircle.style.strokeDashoffset=283-pct; }
function updateUI(){
  statusText.textContent = isWork?`Phiên làm việc số ${sessionCount+1}`:(sessionCount%4===0?'Nghỉ dài':'Nghỉ ngắn');
  timerEl.textContent=fmt(remaining);
  setProgress();
}

async function fetchTip(){ try{
    const res=await fetch(OPENAI_PROXY,{method:'POST'});
    const { tip }=await res.json(); return tip;
  }catch{ return 'Hít thở sâu và thư giãn nhẹ nhàng.'; }}

async function startPhase(){ clearInterval(timerId);
  if(isWork){ sessionCount++; remaining=WORK; suggestion.classList.add('hidden'); survey.classList.add('hidden'); }
  else{
    remaining=(sessionCount%4===0?LONG:SHORT);
    suggestion.classList.remove('hidden'); tipEl.textContent='Đang tải gợi ý...';
    tipEl.textContent=await fetchTip();
    if(sessionCount%4===0) survey.classList.remove('hidden');
  }
  updateUI();
  timerId=setInterval(()=>{
    remaining--; updateUI();
    if(remaining<=0){ clearInterval(timerId); isWork=!isWork; startPhase(); }
  },1000);
}

startBtn.onclick=()=>{ isWork=true; startPhase(); };
resetBtn.onclick=()=>{ clearInterval(timerId); isWork=true; sessionCount=0; remaining=0; suggestion.classList.add('hidden'); survey.classList.add('hidden'); achievementsList.innerHTML=''; updateUI(); };

themeToggle.onclick=()=>{ body.classList.toggle('dark'); body.classList.toggle('light'); themeToggle.textContent=body.classList.contains('dark')?'☀️':'🌙'; };

submitSurvey.onclick=()=>{
  const mood=moodSelect.value;
  const badge=document.createElement('span'); badge.className='badge'; badge.textContent=`Bạn chọn: ${mood}`;
  achievementsList.appendChild(badge);
  survey.classList.add('hidden');
};

// Initialize
document.addEventListener('DOMContentLoaded',()=>{
  progressCircle.style.strokeDasharray=283; progressCircle.style.strokeDashoffset=283;
  isWork=true; sessionCount=0; remaining=0; updateUI();
});
