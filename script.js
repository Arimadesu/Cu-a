// Tham chiếu & trạng thái
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const startBtn = document.getElementById('startBtn');
const customInput = document.getElementById('customInput');
const customBtn = document.getElementById('customBtn');
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
const quoteBox = document.getElementById('quoteBox');
const badgesEl = document.getElementById('badges');
const historyList = document.getElementById('historyList');
const toastContainer = document.getElementById('toastContainer');

let xp        = +localStorage.getItem('xp') || 0;
let streak    = +localStorage.getItem('streak') || 0;
let completed = +localStorage.getItem('completed') || 0;
let history   = JSON.parse(localStorage.getItem('history')) || [];
let timerId;

// Danh sách thử thách
const pool = [
  "Ghi ra 3 điểm chính bạn vừa học",
  "Đứng lên và duỗi vai trong 30 giây",
  "Vứt rác trên bàn của bạn",
  "Hít vào 4 giây, giữ 7 giây, thở ra 8 giây",
  "Viết tóm tắt 2 câu về nội dung vừa học",
  "Nhảy tại chỗ 10 lần để tỉnh táo",
  "Liệt kê 2 điều bạn biết ơn hôm nay",
  "Sắp xếp 5 đồ vật trên bàn học",
  "Đọc lớn một đoạn văn bản bất kỳ",
  "Hít sâu 5 lần với mắt nhắm",
  "Viết ra ưu tiên số 1 cho giờ tiếp theo",
  "Đi vòng quanh phòng trong 1 phút",
  "Ghi 3 câu hỏi bạn còn thắc mắc về chủ đề",
  "Thực hiện 1 tư thế yoga bàn giản đơn",
  "Uống đầy đủ một ly nước",
  "Viết một câu khẳng định tích cực và đọc to",
  "Vẽ sơ đồ tư duy đơn giản cho dự án của bạn",
  "Liệt kê 3 việc nhỏ hoàn thành trong 5 phút",
  "Lau màn hình máy tính bằng vải mềm",
  "Viết 3 bước tiếp theo để hoàn thành bài tập",
  "Nhắm mắt và tưởng tượng bạn kết thúc buổi học",
  "Lau bàn phím và chuột nhanh chóng",
  "Ghi một mục tiêu SMART cho hôm nay",
  "Thực hiện 15 động tác squat tại chỗ",
  "Đóng các tab không cần thiết, chỉ mở 1 tab",
  "Viết một mục tiêu ngắn cho lần học tiếp theo",
  "Thực hành thở hộp (4–4–4–4) trong 4 chu kỳ",
  "Liệt kê 2 nguồn tham khảo cho chủ đề",
  "Nghỉ 30 giây: đứng dậy, vươn vai, nhìn xa màn hình",
  "Ghi ra 1 khó khăn và 1 giải pháp"
];

// Châm ngôn khích lệ
const quotes = [
  "Hành trình vạn dặm bắt đầu từ bước chân đầu tiên.",
  "Bạn không cần nhìn thấy toàn bộ cầu thang, chỉ cần bước một bước.",
  "Tập trung vào tiến bộ, không phải hoàn hảo.",
  "Bước nhỏ mỗi ngày, kết quả lớn theo thời gian."
];

// Khởi tạo giao diện
updateStatus();
renderHistory();

// Chuyển đổi giao diện
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  body.classList.toggle('light');
  themeToggle.textContent = body.classList.contains('dark') ? '☀️' : '🌙';
});

// Thêm nhiệm vụ tùy chỉnh
customBtn.addEventListener('click', () => {
  const task = customInput.value.trim();
  if (task) pool.push(task);
  customInput.value = '';
  showToast('Đã thêm nhiệm vụ mới!');
});

// Bắt đầu thử thách
startBtn.addEventListener('click', () => {
  const idx = Math.floor(Math.random() * pool.length);
  challengeText.textContent = pool[idx];
  startBtn.classList.add('hidden');
  challengeCard.classList.remove('hidden');
  runTimer(120);
});

function runTimer(sec) {
  clearInterval(timerId);
  let rem = sec;
  timerEl.textContent = formatTime(rem);
  resultBtns.classList.add('hidden');

  timerId = setInterval(() => {
    rem--;
    timerEl.textContent = formatTime(rem);
    if (rem <= 0) {
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

// Xử lý Hoàn thành/Bỏ qua
function finalize(success) {
  clearInterval(timerId);
  alert(success ? 'Tuyệt vời! +10 Điểm 🎉' : 'Thử lần sau nhé 😅');
  if (success) {
    xp += 10;
    streak += 1;
    completed += 1;
    history.unshift(challengeText.textContent + ' ✓');
    if (streak % 5 === 0) {
      addBadge(`🏅 Chuỗi ${streak}`);
      showToast(`Chúc mừng! Chuỗi ${streak}`);
    }
  } else {
    streak = 0;
  }
  saveState();
  updateStatus();
  renderHistory();
  resetUI();
}

doneBtn.addEventListener('click', () => finalize(true));
skipBtn.addEventListener('click', () => finalize(false));

// Đặt lại tiến trình
resetBtn.addEventListener('click', () => {
  if (!confirm('Bạn có chắc muốn đặt lại tiến trình?')) return;
  clearInterval(timerId);
  xp = streak = completed = 0;
  history = [];
  saveState();
  updateStatus();
  renderHistory();
  resetUI();
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  quoteBox.textContent = q;
  quoteBox.classList.remove('hidden');
  showToast('Đã đặt lại tiến trình');
});

function resetUI() {
  startBtn.classList.remove('hidden');
  challengeCard.classList.add('hidden');
  resultBtns.classList.add('hidden');
  timerEl.textContent = '02:00';
}

// Cập nhật UI
function updateStatus() {
  xpEl.textContent = `Điểm: ${xp}`;
  streakEl.textContent = `Chuỗi ngày: ${streak}`;
  const pct = Math.min((completed / 10) * 100, 100);
  progressBar.style.width = pct + '%';
}

function renderHistory() {
  historyList.innerHTML = history.map(i => `<li>${i}</li>`).join('');
}

function addBadge(text) {
  const b = document.createElement('span');
  b.className = 'badge';
  b.textContent = text;
  badgesEl.appendChild(b);
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  toastContainer.appendChild(t);
  setTimeout(() => toastContainer.removeChild(t), 3300);
}

function saveState() {
  localStorage.setItem('xp', xp);
  localStorage.setItem('streak', streak);
  localStorage.setItem('completed', completed);
  localStorage.setItem('history', JSON.stringify(history));
}
