// ============================================================
// 💕 Ading & Lili - 主应用逻辑
// ============================================================

// --- 状态变量 ---
let photoIndex = 0;
let isLoading = false;
let currentImageIndex = 0;
let loadedImages = [];
let allPhotosLoaded = false;
let currentSongIndex = 0; // 当前播放歌曲索引
let isPlaylistOpen = false;

const COVER_PHOTO_COUNT = 3;
const COVER_REFRESH_INTERVAL = 5;
const COVER_INDICES_KEY = "ading_lili_cover_indices";
const COVER_REFRESH_COUNT_KEY = "ading_lili_cover_refresh_count";

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
  text.style.removeProperty("--marquee-distance");

  requestAnimationFrame(() => {
    const overflow = text.scrollWidth - text.clientWidth;
    if (overflow > 8) {
      text.style.setProperty("--marquee-distance", `-${overflow + 16}px`);
      text.classList.add("marquee");
    }
  });
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

  const popup = document.getElementById("popup");
  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) closePopup();
    });
  }
});

function showMainPage() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("mainPage").style.display = "block";

  updateCoverPhotos();

  // 加载本地照片
  loadPhotos();
  window.addEventListener("scroll", handleScroll);

}

async function updateCoverPhotos() {
  const coverImages = Array.from(document.querySelectorAll(".cover-photo"));
  if (coverImages.length === 0) return;

  const savedIndices = readStoredCoverIndices();
  const refreshCount = Number(localStorage.getItem(COVER_REFRESH_COUNT_KEY) || "0") + 1;
  let nextIndices = savedIndices;

  if (!nextIndices || refreshCount >= COVER_REFRESH_INTERVAL) {
    const photoCount = await findAvailablePhotoCount();
    nextIndices = pickRandomPhotoIndices(photoCount, COVER_PHOTO_COUNT, savedIndices);
    localStorage.setItem(COVER_REFRESH_COUNT_KEY, "0");
    localStorage.setItem(COVER_INDICES_KEY, JSON.stringify(nextIndices));
  } else {
    localStorage.setItem(COVER_REFRESH_COUNT_KEY, String(refreshCount));
  }

  applyCoverPhotoIndices(coverImages, nextIndices);
}

function readStoredCoverIndices() {
  try {
    const parsed = JSON.parse(localStorage.getItem(COVER_INDICES_KEY) || "null");
    if (
      Array.isArray(parsed) &&
      parsed.length === COVER_PHOTO_COUNT &&
      parsed.every((idx) => Number.isInteger(idx) && idx >= 0)
    ) {
      return parsed;
    }
  } catch (e) {
    // 忽略损坏的本地缓存，下面会重新随机生成。
  }
  return null;
}

async function findAvailablePhotoCount() {
  const batchSize = CONFIG.photos.batchSize || 10;
  const maxProbeCount = 300;

  for (let start = 0; start < maxProbeCount; start += batchSize) {
    const checks = await Promise.all(
      Array.from({ length: batchSize }, (_, offset) => imageExists(`${CONFIG.photos.thumbFolder}/${start + offset}.jpg`))
    );
    const firstMissing = checks.indexOf(false);
    if (firstMissing !== -1) return start + firstMissing;
  }

  return maxProbeCount;
}

function imageExists(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function pickRandomPhotoIndices(photoCount, neededCount, previousIndices) {
  const count = Math.max(0, photoCount);
  if (count === 0) return [0, 1, 2];

  const pool = Array.from({ length: count }, (_, idx) => idx);
  let picked = [];

  for (let attempt = 0; attempt < 50; attempt++) {
    const shuffled = shuffleArray(pool);
    picked = shuffled.slice(0, Math.min(neededCount, shuffled.length));
    if (!hasSameMembers(picked, previousIndices) && !isConsecutiveSet(picked)) break;
  }

  if (isConsecutiveSet(picked)) {
    picked = buildNonConsecutiveFallback(pool, neededCount);
  }

  while (picked.length < neededCount) {
    picked.push(picked[picked.length % Math.max(1, picked.length)] || 0);
  }

  return picked;
}

function shuffleArray(items) {
  const shuffled = items.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomInt(maxExclusive) {
  if (window.crypto && window.crypto.getRandomValues) {
    const randomValues = new Uint32Array(1);
    window.crypto.getRandomValues(randomValues);
    return randomValues[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

function hasSameMembers(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  const sortedA = a.slice().sort((x, y) => x - y);
  const sortedB = b.slice().sort((x, y) => x - y);
  return sortedA.every((value, idx) => value === sortedB[idx]);
}

function isConsecutiveSet(indices) {
  if (!indices || indices.length < 2) return false;
  const sorted = indices.slice().sort((a, b) => a - b);
  return sorted.every((value, idx) => idx === 0 || value === sorted[idx - 1] + 1);
}

function buildNonConsecutiveFallback(pool, neededCount) {
  if (pool.length <= neededCount) return pool.slice(0, neededCount);

  const shuffled = shuffleArray(pool);
  const picked = [];

  for (const value of shuffled) {
    const candidate = picked.concat(value);
    if (!isConsecutiveSet(candidate)) picked.push(value);
    if (picked.length === neededCount) return picked;
  }

  return [pool[0], pool[Math.floor(pool.length / 2)], pool[pool.length - 1]].slice(0, neededCount);
}

function applyCoverPhotoIndices(coverImages, indices) {
  coverImages.forEach((img, slot) => {
    const index = indices[slot] ?? indices[0] ?? 0;
    img.src = `${CONFIG.photos.thumbFolder}/${index}.jpg`;
    img.alt = `首页随机展示的第 ${index + 1} 张回忆照片`;
  });
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
  const card = document.createElement("figure");
  card.className = "gallery-card";
  card.dataset.index = idx;
  card.dataset.large = `${CONFIG.photos.folder}/${idx}.jpg`;
  card.setAttribute("data-date", "");
  card.setAttribute("role", "button");
  card.tabIndex = 0;

  const el = document.createElement("img");
  el.src = thumbImg.src;
  el.alt = `我们的第 ${idx + 1} 张照片`;
  el.loading = "lazy";
  el.decoding = "async";
  el.dataset.index = idx;
  el.dataset.large = card.dataset.large;
  el.setAttribute("data-date", "");

  const caption = document.createElement("figcaption");
  caption.className = "gallery-date";
  caption.setAttribute("aria-hidden", "true");

  card.appendChild(el);
  card.appendChild(caption);
  updatePhotoMetadata(card, el, caption, idx, "");

  // 读取 EXIF 拍摄时间
  if (typeof EXIF !== "undefined") {
    EXIF.getData(thumbImg, function () {
      let exifDate = EXIF.getTag(this, "DateTimeOriginal");
      if (exifDate) {
        exifDate = exifDate.replace(/^(\d{4}):(\d{2}):(\d{2}).*$/, "$1.$2.$3");
      } else {
        exifDate = "";
      }
      updatePhotoMetadata(card, el, caption, idx, exifDate);
    });
  }

  const openPhoto = () => {
    showPopup(card.dataset.large, card.getAttribute("data-date"), idx);
  };

  card.addEventListener("click", openPhoto);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPhoto();
    }
  });

  resolve(card);
}

function updatePhotoMetadata(card, img, caption, idx, date) {
  card.setAttribute("data-date", date);
  img.setAttribute("data-date", date);

  if (date) {
    card.classList.add("has-date");
    caption.textContent = date;
    img.alt = `我们的第 ${idx + 1} 张照片，拍摄于 ${date}`;
    card.setAttribute("aria-label", `查看第 ${idx + 1} 张照片，拍摄于 ${date}`);
  } else {
    card.classList.remove("has-date");
    caption.textContent = "";
    card.setAttribute("aria-label", `查看第 ${idx + 1} 张照片`);
  }

  loadedImages[idx] = { src: card.dataset.large, date };
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
  const photoCounter = document.getElementById("photoCounter");

  popup.classList.add("is-open");
  popup.setAttribute("aria-hidden", "false");
  document.body.classList.add("viewer-open");
  popupImg.style.display = "none";
  popupImg.removeAttribute("src");
  imgDate.textContent = "";
  photoCounter.textContent = getPhotoCounterText(idx);

  const fullImg = new Image();
  fullImg.crossOrigin = "Anonymous";
  fullImg.src = src;

  fullImg.onload = () => {
    popupImg.src = src;
    popupImg.alt = buildPhotoAlt(idx, date);
    popupImg.style.display = "block";
    imgDate.textContent = date || "";
  };

  fullImg.onerror = () => {
    popupImg.style.display = "none";
    imgDate.textContent = "这张照片暂时加载失败";
  };

  updateViewerControls();
}

function closePopup() {
  const popup = document.getElementById("popup");
  popup.classList.remove("is-open");
  popup.setAttribute("aria-hidden", "true");
  document.body.classList.remove("viewer-open");
  document.getElementById("popupImg").src = "";
  document.getElementById("imgDate").textContent = "";
  document.getElementById("photoCounter").textContent = "";
  updateViewerControls();
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

function updateViewerControls() {
  const leftArrow = document.getElementById("leftArrow");
  const rightArrow = document.getElementById("rightArrow");
  if (!leftArrow || !rightArrow) return;

  leftArrow.disabled = currentImageIndex <= 0 || !loadedImages[currentImageIndex - 1];
  rightArrow.disabled = !loadedImages[currentImageIndex + 1];
}

function getLoadedImageCount() {
  return loadedImages.filter(Boolean).length;
}

function getPhotoCounterText(idx) {
  const total = getLoadedImageCount();
  if (!total) return `${idx + 1}`;
  return `${idx + 1} / ${total}`;
}

function buildPhotoAlt(idx, date) {
  return date ? `我们的第 ${idx + 1} 张照片，拍摄于 ${date}` : `我们的第 ${idx + 1} 张照片`;
}

// 键盘导航
window.addEventListener("keydown", (e) => {
  const popup = document.getElementById("popup");
  if (popup.classList.contains("is-open")) {
    if (e.key === "ArrowLeft") showPreviousImage();
    else if (e.key === "ArrowRight") showNextImage();
    else if (e.key === "Escape") closePopup();
  }
});
