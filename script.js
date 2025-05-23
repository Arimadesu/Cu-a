"use strict";


/* --- Technique data ---------------------------------------------------*/
const techniques = [
  {name:"Brain Dump", desc:"Viết nhanh tất cả suy nghĩ trong 2-3 phút rồi phân nhóm."},
  {name:"SCAMPER", desc:"Thay thế, Kết hợp, Điều chỉnh… 7 góc nhìn kích ý tưởng."},
  {name:"6 Thinking Hats", desc:"Đổi 6 ‘mũ’ để xem vấn đề nhiều khía cạnh."},
  {name:"5 Whys",   desc:"Hỏi 'Tại sao?' 5 lần để tìm gốc rễ."},
  {name:"Mind Mapping", desc:"Sơ đồ cây trực quan nối ý chính – ý phụ."},
  {name:"Reverse Thinking", desc:"Hãy nghĩ cách ‘phá hoại’, rồi đảo ngược để tìm giải pháp."},
  {name:"Lotus Blossom", desc:"Mở rộng ý theo ma trận 8×8 như cánh hoa sen."},
  {name:"Dot Voting", desc:"Nhóm bầu chọn ý tưởng bằng cách dán điểm."},
  {name:"Fishbone", desc:"Xương cá phân loại nguyên nhân theo 6M."},
  {name:"PMI", desc:"Liệt kê Plus–Minus–Interesting trước khi quyết định."}
];

/* --- DOM của Coach & Library -----------------------------------------*/
const coachCard  = document.getElementById("coachCard");
const coachName  = document.getElementById("coachName");
const coachDesc  = document.getElementById("coachDesc");
document.getElementById("coachClose").onclick = ()=>coachCard.classList.add("hidden");

const libModal   = document.getElementById("libraryModal");
const libClose   = document.getElementById("libClose");
const libList    = document.getElementById("libList");
document.getElementById("openLibrary").onclick = ()=>{
  libModal.classList.remove("hidden");
};
libClose.onclick = ()=>libModal.classList.add("hidden");

/* --- Render Library once ---------------------------------------------*/
libList.innerHTML = techniques.map(t=>`<li><span>${t.name}</span> – ${t.desc}</li>`).join("");

/* --- Show Technique Coach popup --------------------------------------*/
function showTechniqueCoach(){
  const pick = techniques[Math.floor(Math.random()*techniques.length)];
  coachName.textContent = pick.name;
  coachDesc.textContent = pick.desc;
  coachCard.classList.remove("hidden");
}

/* --- Insert call ngay khi bắt đầu phiên WORK -------------------------*/
const origStartTimer = startTimer;          // giữ hàm cũ
startTimer = function(){
  if(mode==="work" && !timer) showTechniqueCoach();
  origStartTimer();
};

/* ----- phần còn lại giữ nguyên code Pomodoro đã có -------------------*/

/* ---------- CONFIG ---------- */
let   WORK_TIME      = 25 * 60;          // mặc định 25'
const SHORT_BREAK    = 5  * 60;
const LONG_BREAK     = 15 * 60;
const LONG_BREAK_CADENCE = 4;            // sau 4 work mới long break
const MAX_MIN   = 120;                   // dial tối đa
const CIRC      = 848;                   // 2πr vòng progress
const TIPS = [
  "📵 Đừng mở điện thoại nhé!",
  "💧 Uống một ngụm nước nào.",
  "🌬️ Hít sâu, thở đều.",
  "🧘‍♀️ Duỗi vai, thả lỏng cơ.",
  "🎯 Tập trung vào việc đang làm!"
];
const BREAK_TIPS = [
  "🚶‍♂️ Đi bộ vài phút và duỗi vai.",
  "👀 Nhìn xa 20 giây để thư giãn mắt.",
  "💧 Uống nước và hít thở sâu.",
  "🧘‍♀️ Nhắm mắt, thả lỏng trong 1 phút.",
  "🤸‍♂️ Xoay cổ tay – cổ chân nhẹ nhàng."
];

/* ---------- ELEMENTS ---------- */
const sidebarBtn   = document.getElementById("toggleSidebar");
const sidebar      = document.getElementById("sidebar");
const weeklyTimeEl = document.getElementById("weeklyTime");
const resetWeekBtn = document.getElementById("resetWeek");
const historyEl    = document.getElementById("history");

const statusEl  = document.getElementById("status");
const timeEl    = document.getElementById("time");
const cyclesEl  = document.getElementById("cycles");
const tipEl     = document.getElementById("tip");
const hintEl    = document.getElementById("breakHint");

const startBtn  = document.getElementById("start");
const pauseBtn  = document.getElementById("pause");
const resetBtn  = document.getElementById("reset");
const skipBtn   = document.getElementById("skip");
const themeToggle=document.getElementById("themeToggle");

const dial           = document.getElementById("dial");
const progressCircle = document.getElementById("progressCircle");
const treeEl         = document.getElementById("tree");

/* ---------- STATE ---------- */
let timeLeft   = WORK_TIME;
let sessionLen = WORK_TIME;
let mode       = "work";          // work | break
let cyclesDone = 0;
let timer      = null;
let tipIdx     = 0;

/* ---------- WEEKLY STORAGE ---------- */
function weekKey(d=new Date()){
  const firstThu=new Date(d.getFullYear(),0,4);
  const wk=1+Math.round(((d-firstThu)/864e5-(firstThu.getDay()+6)%7)/7);
  return `${d.getFullYear()}-W${wk}`;
}
let wkKey       = localStorage.getItem("wkKey") || weekKey();
let weeklyTotal = +localStorage.getItem("weeklyTotal") || 0;
if(wkKey!==weekKey()){ wkKey=weekKey(); weeklyTotal=0; saveWeekly(); }

let history = JSON.parse(localStorage.getItem("history")||"[]");

function saveWeekly(){ localStorage.setItem("wkKey",wkKey); localStorage.setItem("weeklyTotal",weeklyTotal); }
function saveHistory(){ localStorage.setItem("history",JSON.stringify(history)); }

/* ---------- HELPERS ---------- */
const fmt = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const fmtHM = s=>`${Math.floor(s/3600)} h ${Math.floor(s%3600/60)} m`;

/* ---------- UI UPDATE ---------- */
function setDialByMinute(min){
  const offset=CIRC*(1-min/MAX_MIN);
  progressCircle.style.strokeDashoffset=offset;
}
function updateDial(){                         // khi đang chạy
  const offset=CIRC*(1-timeLeft/sessionLen);
  progressCircle.style.strokeDashoffset=offset;
}
function updateTree(){
  const scale=1-timeLeft/sessionLen;
  treeEl.style.transform=`translateX(-50%) scaleY(${scale})`;
}
function updateDisplay(){
  timeEl.textContent=fmt(timeLeft);
  statusEl.textContent=mode.toUpperCase();
  cyclesEl.textContent=`Cycle ${cyclesDone} / ${LONG_BREAK_CADENCE}`;
  updateDial(); updateTree();
}
function renderWeekly(){ weeklyTimeEl.textContent=fmtHM(weeklyTotal); }
function renderHistory(){
  historyEl.innerHTML = history.slice().reverse().map(x=>`<li>${x.date} – ${x.min} min</li>`).join("");
}

/* ---------- TIMER ---------- */
function tick(){
  if(--timeLeft>0){
    if(timeLeft%60===0) nextTip();
    updateDisplay(); return;
  }
  clearInterval(timer); timer=null;
  sessionEnd();
}
function startTimer(){
  if(timer) return;
  startBtn.disabled=true; pauseBtn.disabled=false;
  timer=setInterval(tick,1000);
}
function pauseTimer(){ clearInterval(timer); timer=null; startBtn.disabled=false; pauseBtn.disabled=true; }
function resetTimer(){ pauseTimer(); mode="work"; timeLeft=sessionLen=WORK_TIME; hintEl.textContent=""; updateDisplay(); startBtn.textContent="Start"; }

/* ---------- SESSION FLOW ---------- */
function sessionEnd(){
  if(mode==="work"){
    weeklyTotal+=WORK_TIME; saveWeekly(); renderWeekly();
    cyclesDone++;
    history.push({date:new Date().toLocaleDateString(),min:25}); saveHistory(); renderHistory();

    mode="break";
    sessionLen = (cyclesDone%LONG_BREAK_CADENCE===0)?LONG_BREAK:SHORT_BREAK;
    timeLeft=sessionLen;
    updateDisplay();
    hintEl.textContent=BREAK_TIPS[Math.floor(Math.random()*BREAK_TIPS.length)];
    startBtn.textContent="Start Break"; startBtn.disabled=false; pauseBtn.disabled=true;
    notify("Pomodoro finished! Take a break.");
  }else{
    mode="work"; sessionLen=timeLeft=WORK_TIME;
    updateDisplay(); hintEl.textContent="";
    startBtn.textContent="Start Work"; startBtn.disabled=false; pauseBtn.disabled=true;
    notify("Break over! Ready to work?");
    nextTip();
  }
}
function skipSession(){ clearInterval(timer); timer=null; timeLeft=0; tick(); }

/* ---------- TIPS & NOTI ---------- */
function nextTip(){
  tipEl.style.opacity=0;
  setTimeout(()=>{ tipEl.textContent=TIPS[tipIdx]; tipEl.style.opacity=1; tipIdx=(tipIdx+1)%TIPS.length; },250);
}
function notify(text){
  if(Notification.permission==="granted") new Notification(text);
  else if(Notification.permission!=="denied") Notification.requestPermission().then(p=>p==="granted"&&new Notification(text));
}

/* ---------- DIAL DRAG ---------- */
let dragging=false;
dial.addEventListener("pointerdown",e=>{
  if(timer) return;
  dragging=true; dial.setPointerCapture(e.pointerId); handleDrag(e,true);
});
dial.addEventListener("pointermove",e=>dragging&&handleDrag(e,true));
dial.addEventListener("pointerup",()=>dragging=false);

function handleDrag(e,preview){
  const r=dial.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  const deg=(Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI+450)%360;
  const mins=Math.max(1,Math.round(deg/3));               // 1–120
  if(preview){
    setDialByMinute(mins);
    timeEl.textContent=`${String(mins).padStart(2,"0")}:00`;
    statusEl.textContent="SET";
    treeEl.style.transform="translateX(-50%) scaleY(0)";
  }
  WORK_TIME=timeLeft=sessionLen=mins*60; cyclesDone=0;
}

/* ---------- SIDEBAR ---------- */
sidebarBtn.onclick=()=>{ sidebar.classList.toggle("collapsed"); requestAnimationFrame(()=>dial.getBoundingClientRect()); };
resetWeekBtn.onclick=()=>{ weeklyTotal=0; saveWeekly(); renderWeekly(); };

/* ---------- THEME ---------- */
themeToggle.onchange=e=>document.documentElement.dataset.theme=e.target.checked?"dark":"";

/* ---------- BUTTONS ---------- */
startBtn.onclick=startTimer;
pauseBtn.onclick=pauseTimer;
resetBtn.onclick=resetTimer;
skipBtn.onclick =skipSession;

/* ---------- INIT ---------- */
updateDisplay(); renderWeekly(); renderHistory(); nextTip();
