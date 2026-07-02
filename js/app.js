// ============================================================
// 💕 Ading & Lili - 主应用逻辑
// ============================================================

// --- 状态变量 ---
let photoIndex = 0;
let isLoading = false;
let currentImageIndex = 0;
let loadedImages = [];
let currentAuthor = "him";
let allPhotosLoaded = false;
let currentSongIndex = 0; // 当前播放歌曲索引
let isPlaylistOpen = false;

// --- 初始化 ---
window.onload = function () {
  initSite();
  checkLogin();
};

function initSite() {
  // 设置标题
  document.title = CONFIG.siteTitle;
  document.getElementById("siteTitle").textContent = CONFIG.siteTitle;

  // 设置名字
  document.getElementById("coupleNames").textContent = CONFIG.names.display;

  // 初始化歌单
  initPlaylist();

  // 设置作者按钮文字
  const authorBtns = document.querySelectorAll(".author-btn");
  authorBtns[0].textContent = CONFIG.names.him;
  authorBtns[1].textContent = CONFIG.names.her;

  // 渲染日期卡片
  renderDateCards();

  // 渲染今日情话
  renderDailyQuote();

  // 渲染时间线
  renderTimeline();

  // 计算恋爱天数
  calculateLoveDays();
}

// --- 歌单播放器 ---
let playlist = CONFIG.playlist || [];

function initPlaylist() {
  if (!playlist || playlist.length === 0) return;

  const bgm = document.getElementById("bgm");
  bgm.volume = 0.3;

  // 渲染歌单列表
  const panel = document.getElementById("playlistPanel");
  panel.innerHTML = "";
  playlist.forEach((song, i) => {
    const item = document.createElement("div");
    item.className = "playlist-item";
    item.id = `song-${i}`;
    item.innerHTML = `
      <span class="song-name">${song.name}</span>
      <span class="song-artist">${song.artist}</span>
    `;
    item.addEventListener("click", () => playSong(i));
    panel.appendChild(item);
  });

  bgm.addEventListener("ended", nextSong);

  // 加载第一首歌
  loadSong(0);
}

function loadSong(index) {
  const song = playlist[index];
  const bgm = document.getElementById("bgm");
  bgm.src = song.file || song.url;
  bgm.load();
  updateNowPlaying(index);
  highlightActive(index);
}

function playSong(index) {
  if (index !== currentSongIndex) {
    currentSongIndex = index;
    loadSong(index);
  }
  const bgm = document.getElementById("bgm");
  bgm.play().catch(() => {});
  document.getElementById("playBtn").classList.add("playing");
}

function togglePlay() {
  const bgm = document.getElementById("bgm");
  const btn = document.getElementById("playBtn");
  if (bgm.paused) {
    if (!bgm.src || bgm.src === window.location.href) {
      loadSong(currentSongIndex);
    }
    bgm.play().catch(() => {});
    btn.classList.add("playing");
  } else {
    bgm.pause();
    btn.classList.remove("playing");
  }
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  loadSong(currentSongIndex);
  const bgm = document.getElementById("bgm");
  bgm.play().catch(() => {});
  document.getElementById("playBtn").classList.add("playing");
}

function updateNowPlaying(index) {
  const song = playlist[index];
  const text = document.getElementById("nowPlayingText");
  text.textContent = `${song.name} - ${song.artist}`;
  text.classList.remove("marquee");
  // 强制回流后重新启用跑马灯
  void text.offsetWidth;
  text.classList.add("marquee");
}

function highlightActive(index) {
  document.querySelectorAll(".playlist-item").forEach((el) => el.classList.remove("active"));
  const activeItem = document.getElementById(`song-${index}`);
  if (activeItem) activeItem.classList.add("active");
}

function togglePlaylist() {
  isPlaylistOpen = !isPlaylistOpen;
  document.getElementById("playlistPanel").classList.toggle("open", isPlaylistOpen);
}

// --- 登录系统 ---
function checkLogin() {
  const isLoggedIn = localStorage.getItem("ading_lili_login");
  if (isLoggedIn === "true") {
    showMainPage();
  }
}

function handleLogin() {
  const input = document.getElementById("passwordInput");
  const error = document.getElementById("loginError");

  if (input.value === CONFIG.accessPassword) {
    localStorage.setItem("ading_lili_login", "true");
    showMainPage();
  } else {
    error.classList.add("show");
    input.value = "";
    setTimeout(() => error.classList.remove("show"), 2000);
  }
}

// 回车登录
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("passwordInput");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLogin();
    });
  }
});

function showMainPage() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("mainPage").style.display = "block";

  // 加载本地照片
  loadPhotos();
  window.addEventListener("scroll", handleScroll);

  // 加载留言
  loadMessages();
}

function loadPhotos() {
  loadImages(CONFIG.photos.initialBatches);
}

// --- 今日情话 ---
function renderDailyQuote() {
  const quotes = CONFIG.dailyQuotes || [];

  if (!quotes || quotes.length === 0) return;

  // 洗牌轮播：每次访问显示下一句，轮完一圈重新洗牌
  const ORDER_KEY = "ading_lili_quote_order";
  const INDEX_KEY = "ading_lili_quote_index";

  let order = JSON.parse(localStorage.getItem(ORDER_KEY) || "null");
  let index = parseInt(localStorage.getItem(INDEX_KEY) || "0", 10);

  // 无缓存 或 轮完一圈 → Fisher-Yates 洗牌
  if (!order || !Array.isArray(order) || order.length !== quotes.length || index >= order.length) {
    order = Array.from({ length: quotes.length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    index = 0;
  }

  const quote = quotes[order[index]];

  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  localStorage.setItem(INDEX_KEY, String(index + 1));

  document.getElementById("quoteSection").style.display = "block";
  document.getElementById("quoteText").textContent = quote.text;

  const srcEl = document.getElementById("quoteSource");
  if (quote.source) {
    srcEl.textContent = "—— " + quote.source;
    srcEl.style.display = "block";
  } else {
    srcEl.style.display = "none";
  }
}

// --- 时间线 ---
function renderTimeline() {
  const events = CONFIG.timeline || [];

  if (!events || events.length === 0) return;
  const container = document.getElementById("timeline");

  events.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "timeline-item";
    wrapper.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div class="timeline-date">${item.date}</div>
        <div class="timeline-title">${item.title}</div>
        <div class="timeline-desc">${item.desc}</div>
      </div>
    `;
    container.appendChild(wrapper);
  });
}

// --- 恋爱天数计算 ---
function calculateLoveDays() {
  const startDate = new Date(CONFIG.dates.loveDate);
  const today = new Date();
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const timeDiff = today - startDate;
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  document.getElementById("loveDays").textContent = days;
}

// --- 日期卡片 ---
function renderDateCards() {
  const container = document.getElementById("datesSection");
  const dateConfigs = [
    { date: CONFIG.dates.hisBirthday, label: CONFIG.dateLabels.hisBirthday },
    { date: CONFIG.dates.herBirthday, label: CONFIG.dateLabels.herBirthday },
    { date: CONFIG.dates.anniversary, label: CONFIG.dateLabels.anniversary },
  ];

  dateConfigs.forEach(({ date, label }) => {
    const formatted = date.replace(/-/g, ".");
    const card = document.createElement("div");
    card.className = "date-item";
    card.innerHTML = `<p>${formatted}</p><span>${label}</span>`;
    container.appendChild(card);
  });
}

// --- 照片墙 ---
async function loadImages(batchCount = 1) {
  if (isLoading || allPhotosLoaded) return;
  isLoading = true;

  const indicator = document.getElementById("loadingIndicator");
  indicator.classList.add("show");

  for (let b = 0; b < batchCount; b++) {
    const promises = [];
    for (let i = 0; i < CONFIG.photos.batchSize; i++) {
      promises.push(loadThumbnail(photoIndex));
      photoIndex++;
    }

    const results = await Promise.all(promises);
    const gallery = document.getElementById("gallery");

    results.forEach((img) => {
      if (img) gallery.appendChild(img);
    });

    const hasMore = results.some((img) => img !== null);
    if (!hasMore) {
      allPhotosLoaded = true;
      window.removeEventListener("scroll", handleScroll);
      indicator.innerHTML = "<span>已经到底啦 💕</span>";
      break;
    }
  }

  isLoading = false;
  if (!allPhotosLoaded) {
    indicator.classList.remove("show");
  }
}

function loadThumbnail(idx) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = `${CONFIG.photos.thumbFolder}/${idx}.jpg`;

    img.onload = () => createImageElement(img, idx, resolve);

    img.onerror = () => {
      // 尝试加载原图
      const fallback = new Image();
      fallback.crossOrigin = "Anonymous";
      fallback.src = `${CONFIG.photos.folder}/${idx}.jpg`;
      fallback.onload = () => createImageElement(fallback, idx, resolve);
      fallback.onerror = () => resolve(null);
    };
  });
}

function createImageElement(thumbImg, idx, resolve) {
  const el = document.createElement("img");
  el.dataset.large = `${CONFIG.photos.folder}/${idx}.jpg`;
  el.src = thumbImg.src;
  el.alt = `Photo ${idx}`;
  el.dataset.index = idx;
  el.setAttribute("data-date", "");

  // 读取 EXIF 拍摄时间
  if (typeof EXIF !== "undefined") {
    EXIF.getData(thumbImg, function () {
      let exifDate = EXIF.getTag(this, "DateTimeOriginal");
      if (exifDate) {
        exifDate = exifDate.replace(/^(\d{4}):(\d{2}):(\d{2}).*$/, "$1.$2.$3");
      } else {
        exifDate = "";
      }
      el.setAttribute("data-date", exifDate);
      loadedImages[idx] = { src: el.dataset.large, date: exifDate };
    });
  } else {
    loadedImages[idx] = { src: el.dataset.large, date: "" };
  }

  el.addEventListener("click", () => {
    showPopup(el.dataset.large, el.getAttribute("data-date"), idx);
  });

  resolve(el);
}

// --- 滚动加载 ---
function handleScroll() {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= docHeight - CONFIG.photos.scrollDistance) {
    loadImages();
  }
}

// --- 图片弹窗 ---
function showPopup(src, date, idx) {
  currentImageIndex = idx;
  const popup = document.getElementById("popup");
  const popupImg = document.getElementById("popupImg");
  const imgDate = document.getElementById("imgDate");

  popup.style.display = "block";
  popupImg.style.display = "none";
  imgDate.textContent = "";

  const fullImg = new Image();
  fullImg.crossOrigin = "Anonymous";
  fullImg.src = src;

  fullImg.onload = () => {
    popupImg.src = src;
    popupImg.style.display = "block";
    imgDate.textContent = date;
  };

  fullImg.onerror = () => {
    imgDate.textContent = "加载失败";
  };

  // 显示箭头
  const leftArrow = document.getElementById("leftArrow");
  const rightArrow = document.getElementById("rightArrow");
  leftArrow.style.display = "flex";
  rightArrow.style.display = "flex";

  leftArrow.classList.toggle("disabled", currentImageIndex <= 0);
  rightArrow.classList.toggle("disabled", !loadedImages[currentImageIndex + 1]);
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("popupImg").src = "";
  document.getElementById("imgDate").textContent = "";
  document.getElementById("leftArrow").style.display = "none";
  document.getElementById("rightArrow").style.display = "none";
}

function showPreviousImage() {
  const prev = currentImageIndex - 1;
  if (prev >= 0 && loadedImages[prev]) {
    showPopup(loadedImages[prev].src, loadedImages[prev].date, prev);
  }
}

function showNextImage() {
  const next = currentImageIndex + 1;
  if (loadedImages[next]) {
    showPopup(loadedImages[next].src, loadedImages[next].date, next);
  }
}

// 键盘导航
window.addEventListener("keydown", (e) => {
  const popup = document.getElementById("popup");
  if (popup.style.display === "block") {
    if (e.key === "ArrowLeft") showPreviousImage();
    else if (e.key === "ArrowRight") showNextImage();
    else if (e.key === "Escape") closePopup();
  }
});

// --- 留言系统 ---
function selectAuthor(author) {
  currentAuthor = author;
  document.querySelectorAll(".author-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.author === author);
  });
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text) return;

  const message = {
    author: currentAuthor,
    authorName: currentAuthor === "him" ? CONFIG.names.him : CONFIG.names.her,
    content: text,
    timestamp: Date.now(),
  };

  input.value = "";

  saveToLocal(message);
  renderMessages(getStoredMessages());
}

function saveToLocal(message) {
  const messages = getStoredMessages();
  messages.unshift(message);
  localStorage.setItem("ading_lili_messages", JSON.stringify(messages));
}

function getStoredMessages() {
  try {
    return JSON.parse(localStorage.getItem("ading_lili_messages") || "[]");
  } catch {
    return [];
  }
}

function loadMessages() {
  renderMessages(getStoredMessages());
}

function renderMessages(messages) {
  const list = document.getElementById("messageList");
  list.innerHTML = "";

  messages.forEach((msg) => {
    const card = document.createElement("div");
    card.className = `message-card ${msg.author}`;

    const time = new Date(msg.timestamp);
    const timeStr = `${time.getFullYear()}.${String(time.getMonth() + 1).padStart(2, "0")}.${String(time.getDate()).padStart(2, "0")} ${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;

    card.innerHTML = `
      <div class="msg-header">
        <span class="msg-author">${msg.authorName}</span>
        <span class="msg-time">${timeStr}</span>
      </div>
      <div class="msg-content">${escapeHtml(msg.content)}</div>
    `;
    list.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
