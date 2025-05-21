/* app.js with improved reset handling */
// element refs
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const startBtn = document.getElementById('startBtn');
const challengeCard = document.getElementById('challengeCard');
const challengeText = document.getElementById('challengeText');
const timerEl = document.getElementById('timer');
const resultBtns = document.getElementById('resultBtns');
const doneBtn = document.getElementById('doneBtn');
const skipBtn = document.getElementById('skipBtn');
const resetBtn = document.getElementById('resetBtn');
const xpEl = document.getElementById('xp');
const streakEl = document.getElementById('streak');
const progressBar = document.getElementById('progressBar');

// state
let xp = +localStorage.getItem('xp') || 0;
let streak = +localStorage.getItem('streak') || 0;
let completed = +localStorage.getItem('completed') || 0;
let timerId = null;
const pool = [
  'Write down 3 key points from your last lecture',
  'Stand up and stretch your shoulders for 30 seconds',
  'Throw away any trash on your desk',
  'Breathe in for 4 seconds, hold 7 seconds, exhale 8 seconds',
  'Write a two-sentence summary of what you just studied',
  'Do 10 jumping jacks to boost blood flow',
  'List 2 things you are grateful for today',
  'Organize 5 items on your desk',
  'Read aloud one paragraph from your current textbook',
  'Take 5 deep breaths with eyes closed',
  'Write down your top 1 priority for the next hour',
  'Stand and walk around your room for 1 minute',
  'Jot down 3 questions you still have about your topic',
  'Do a quick desk yoga pose (e.g., seated twist)',
  'Drink a glass of water fully',
  'Write a positive affirmation and say it out loud',
  'Sketch a simple mind map of your current project',
  'List 3 To-Do items you can finish in under 5 minutes',
  'Clean your computer screen with a microfiber cloth',
  'Write the next three steps to complete your assignment',
  'Close your eyes and visualize finishing your study session',
  'Wipe down your keyboard and mouse quickly',
  'Write down one SMART goal for today',
  'Do 15 air squats to re-energize',
  'Clear your browser tabs, keep only one tab open',
  'Write a one-sentence goal for your next study block',
  'Practice box breathing (4–4–4–4) for 4 cycles',
  'List 2 resources you can use for this topic',
  'Take a 30-second break: stand, stretch, look away from screen',
  'Write down one obstacle holding you back and one solution',
];

// initialize UI
function updateStatus() {
  xpEl.textContent = `XP: ${xp}`;
  streakEl.textContent = `🔥 Streak: ${streak}`;
  const pct = Math.min((completed / 10) * 100, 100);
  progressBar.style.width = pct + '%';
  progressBar.style.background = streak >= 5 ? '#00b894' : '';
}
updateStatus();

// theme toggle
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  body.classList.toggle('light');
  themeToggle.textContent = body.classList.contains('dark') ? '☀️' : '🌙';
});

// start challenge
startBtn.addEventListener('click', () => {
  const challenge = pool[Math.floor(Math.random() * pool.length)];
  challengeText.textContent = challenge;
  startBtn.classList.add('hidden');
  challengeCard.classList.remove('hidden');
  runTimer(120);
});

function runTimer(seconds) {
  clearInterval(timerId);
  let remaining = seconds;
  timerEl.textContent = formatTime(remaining);
  resultBtns.classList.add('hidden');

  timerId = setInterval(() => {
    remaining--;
    timerEl.textContent = formatTime(remaining);
    if (remaining <= 0) {
      clearInterval(timerId);
      resultBtns.classList.remove('hidden');
    }
  }, 1000);
}

function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}

// result handlers
function handleDone() {
  xp += 10;
  streak += 1;
  completed += 1;
  saveState();
  confetti({ spread: 60, origin: { y: 0.6 } });
  resetUI('Great job! +10 XP 🎉');
}

doneBtn.addEventListener('click', handleDone);
skipBtn.addEventListener('click', () => {
  streak = 0;
  saveState();
  resetUI('Maybe next time! 😅');
});

// reset functionality
resetBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset your progress?')) {
    clearInterval(timerId); // Stop any running timer
    xp = 0;
    streak = 0;
    completed = 0;
    saveState();
    updateStatus();
    // Reset UI
    challengeCard.classList.add('hidden');
    resultBtns.classList.add('hidden');
    startBtn.classList.remove('hidden');
    timerEl.textContent = '02:00';
    alert('Progress has been reset. Ready to start again!');
  }
});

// common helpers
function resetUI(message) {
  alert(message);
  challengeCard.classList.add('hidden');
  resultBtns.classList.add('hidden');
  startBtn.classList.remove('hidden');
  clearInterval(timerId);
  timerEl.textContent = '02:00';
  updateStatus();
}

function saveState() {
  localStorage.setItem('xp', xp);
  localStorage.setItem('streak', streak);
  localStorage.setItem('completed', completed);
}
