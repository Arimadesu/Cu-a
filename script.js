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
  const idx = Math.floor(Math.random() * pool.leng*
