"use strict";

// ── Platform specs ─────────────────────────────────────────────────────────
const PLATFORMS = {
  kakao:      { name: "카카오톡",       width: 360, height: 360 },
  "kakao-big": { name: "카카오 큰이모티콘", width: 544, height: 544 },
  line:       { name: "LINE 스티커",    width: 370, height: 320 },
  ogq:        { name: "OGQ 이모티콘",   width: 740, height: 640 },
};

// ── CSS filter strings per effect ─────────────────────────────────────────
const EFFECT_FILTERS = {
  original: "",
  cartoon:  "contrast(1.5) saturate(2.2)",
  vivid:    "contrast(1.15) saturate(2.8) brightness(1.05)",
  sketch:   "grayscale(1) contrast(3.5) brightness(1.1)",
  popart:   "saturate(5) contrast(1.4) hue-rotate(10deg)",
  warm:     "sepia(0.45) saturate(1.6) brightness(1.06)",
};

// ── App state ──────────────────────────────────────────────────────────────
const state = {
  image:       null,
  platform:    "kakao",
  emotion:     "happy",
  effect:      "original",
  text:        "",
  fontSize:    40,
  textPos:     "bottom",
  textColor:   "#FFFFFF",
  strokeColor: "#000000",
  brightness:  100,
  saturation:  100,
  contrast:    100,
};

// ── DOM references ─────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const uploadZone       = $("uploadZone");
const photoInput       = $("photoInput");
const uploadContent    = $("uploadContent");
const uploadPreview    = $("uploadPreview");
const platformGrid     = $("platformGrid");
const emotionGrid      = $("emotionGrid");
const effectGrid       = $("effectGrid");
const previewCanvas    = $("previewCanvas");
const canvasPlaceholder= $("canvasPlaceholder");
const previewInfo      = $("previewInfo");
const downloadBtn      = $("downloadBtn");
const textInput        = $("textInput");
const fontSizeSlider   = $("fontSizeSlider");
const fontSizeVal      = $("fontSizeVal");
const textPosition     = $("textPosition");
const textColorInput   = $("textColor");
const strokeColorInput = $("strokeColor");
const brightnessSlider = $("brightnessSlider");
const saturationSlider = $("saturationSlider");
const contrastSlider   = $("contrastSlider");
const brightnessVal    = $("brightnessVal");
const saturationVal    = $("saturationVal");
const contrastVal      = $("contrastVal");

// ── Upload ─────────────────────────────────────────────────────────────────
photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) loadImageFile(file);
});

uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("dragover");
});

["dragleave", "dragend"].forEach((ev) =>
  uploadZone.addEventListener(ev, () => uploadZone.classList.remove("dragover"))
);

uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("dragover");
  const file = [...e.dataTransfer.files].find((f) => f.type.startsWith("image/"));
  if (file) loadImageFile(file);
});

function loadImageFile(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    state.image = img;
    uploadContent.style.display = "none";
    uploadPreview.src = url;
    uploadPreview.style.display = "block";
    canvasPlaceholder.style.display = "none";
    previewCanvas.style.display = "block";
    downloadBtn.disabled = false;
    render();
  };
  img.src = url;
}

// ── Platform ───────────────────────────────────────────────────────────────
platformGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-platform]");
  if (!btn) return;
  setActive(platformGrid, btn, "platform-btn");
  state.platform = btn.dataset.platform;
  updateInfo();
  render();
});

// ── Emotion ────────────────────────────────────────────────────────────────
emotionGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-emotion]");
  if (!btn) return;
  setActive(emotionGrid, btn, "emotion-btn");
  state.emotion = btn.dataset.emotion;
  render();
});

// ── Effect ─────────────────────────────────────────────────────────────────
effectGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-effect]");
  if (!btn) return;
  setActive(effectGrid, btn, "effect-btn");
  state.effect = btn.dataset.effect;
  render();
});

// ── Sliders ────────────────────────────────────────────────────────────────
function bindSlider(el, valEl, key) {
  el.addEventListener("input", () => {
    state[key] = Number(el.value);
    valEl.textContent = el.value;
    render();
  });
}

bindSlider(brightnessSlider, brightnessVal, "brightness");
bindSlider(saturationSlider, saturationVal, "saturation");
bindSlider(contrastSlider,   contrastVal,   "contrast");
bindSlider(fontSizeSlider,   fontSizeVal,   "fontSize");

// ── Text controls ──────────────────────────────────────────────────────────
textInput.addEventListener("input",     () => { state.text       = textInput.value; render(); });
textPosition.addEventListener("change", () => { state.textPos    = textPosition.value; render(); });
textColorInput.addEventListener("input",   () => { state.textColor   = textColorInput.value; render(); });
strokeColorInput.addEventListener("input", () => { state.strokeColor = strokeColorInput.value; render(); });

// ── Download ───────────────────────────────────────────────────────────────
downloadBtn.addEventListener("click", () => {
  if (!state.image) return;
  const p = PLATFORMS[state.platform];
  const link = document.createElement("a");
  link.download = `emoticon-${state.platform}-${state.emotion}.png`;
  link.href = previewCanvas.toDataURL("image/png");
  link.click();
});

// ── Helpers ────────────────────────────────────────────────────────────────
function setActive(parent, activeBtn, cls) {
  parent.querySelectorAll(`.${cls}`).forEach((b) => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

function updateInfo() {
  const p = PLATFORMS[state.platform];
  previewInfo.textContent = `${p.width} × ${p.height} px · ${p.name}`;
}

// ── Main render ────────────────────────────────────────────────────────────
function render() {
  if (!state.image) return;

  const { width: w, height: h } = PLATFORMS[state.platform];
  previewCanvas.width  = w;
  previewCanvas.height = h;

  const ctx = previewCanvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);

  drawPhoto(ctx, w, h);
  drawEmotionDecor(ctx, w, h, state.emotion);
  if (state.text.trim()) drawText(ctx, w, h);
}

// ── Draw photo with effects ────────────────────────────────────────────────
function drawPhoto(ctx, w, h) {
  const img = state.image;

  // Build filter: preset + manual sliders
  const preset = EFFECT_FILTERS[state.effect] || "";
  const manual = `brightness(${state.brightness}%) saturate(${state.saturation}%) contrast(${state.contrast}%)`;
  ctx.filter = [preset, manual].filter(Boolean).join(" ");

  // Cover-fit: scale so the image fills the canvas, then center-crop
  const scale = Math.max(w / img.width, h / img.height);
  const sw = img.width * scale;
  const sh = img.height * scale;
  const sx = (w - sw) / 2;
  const sy = (h - sh) / 2;

  ctx.drawImage(img, sx, sy, sw, sh);
  ctx.filter = "none";

  // Cartoon effect: posterize colors after drawing
  if (state.effect === "cartoon") {
    posterize(ctx, w, h, 5);
  }
}

function posterize(ctx, w, h, levels) {
  const step = 255 / (levels - 1);
  const id   = ctx.getImageData(0, 0, w, h);
  const d    = id.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i]   = Math.round(d[i]   / step) * step;
    d[i+1] = Math.round(d[i+1] / step) * step;
    d[i+2] = Math.round(d[i+2] / step) * step;
  }
  ctx.putImageData(id, 0, 0);
}

// ── Text overlay ───────────────────────────────────────────────────────────
function drawText(ctx, w, h) {
  const { text, fontSize, textPos, textColor, strokeColor } = state;
  const pad = Math.round(fontSize * 0.5);

  ctx.save();
  ctx.font         = `900 ${fontSize}px "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  const y =
    textPos === "top"    ? fontSize / 2 + pad :
    textPos === "center" ? h / 2 :
                           h - fontSize / 2 - pad;

  ctx.lineWidth   = Math.ceil(fontSize * 0.14);
  ctx.lineJoin    = "round";
  ctx.strokeStyle = strokeColor;
  ctx.strokeText(text, w / 2, y);

  ctx.fillStyle = textColor;
  ctx.fillText(text, w / 2, y);
  ctx.restore();
}

// ── Emotion decorations ────────────────────────────────────────────────────
const EMOTION_DECORS = {
  happy:    decorHappy,
  laugh:    decorLaugh,
  love:     decorLove,
  sad:      decorSad,
  angry:    decorAngry,
  surprise: decorSurprise,
  sleepy:   decorSleepy,
  think:    decorThink,
  cool:     decorCool,
  none:     null,
};

function drawEmotionDecor(ctx, w, h, emotion) {
  const fn = EMOTION_DECORS[emotion];
  if (fn) fn(ctx, w, h);
}

// 😊 Happy – yellow sparkles + warm glow
function decorHappy(ctx, w, h) {
  const positions = [
    [w * 0.08, h * 0.08], [w * 0.88, h * 0.10],
    [w * 0.14, h * 0.84], [w * 0.86, h * 0.82],
    [w * 0.50, h * 0.06],
  ];
  positions.forEach(([x, y]) => drawSparkle(ctx, x, y, w * 0.055, "#FFD93D", "#FF9F00"));

  // warm vignette
  const g = ctx.createRadialGradient(w/2, h/2, h * 0.32, w/2, h/2, h * 0.72);
  g.addColorStop(0, "rgba(255,217,61,0)");
  g.addColorStop(1, "rgba(255,160,0,0.18)");
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
}

// 😂 Laugh – ㅋ text bursts
function decorLaugh(ctx, w, h) {
  const items = [
    { x: w*0.12, y: h*0.14, size: w*0.085, rot: -0.25 },
    { x: w*0.80, y: h*0.11, size: w*0.07,  rot:  0.2  },
    { x: w*0.90, y: h*0.40, size: w*0.065, rot:  0.35 },
  ];
  ctx.save();
  items.forEach(({ x, y, size, rot }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.font         = `900 ${size}px sans-serif`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth    = size * 0.12;
    ctx.strokeStyle  = "white";
    ctx.strokeText("ㅋ", 0, 0);
    ctx.fillStyle    = "#FF6B6B";
    ctx.fillText("ㅋ", 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

// 😍 Love – scattered hearts
function decorLove(ctx, w, h) {
  const hearts = [
    { x: w*0.12, y: h*0.11, r: w*0.075 },
    { x: w*0.86, y: h*0.09, r: w*0.055 },
    { x: w*0.92, y: h*0.44, r: w*0.065 },
    { x: w*0.07, y: h*0.55, r: w*0.045 },
    { x: w*0.78, y: h*0.87, r: w*0.048 },
    { x: w*0.42, y: h*0.05, r: w*0.035 },
  ];
  hearts.forEach(({ x, y, r }) => drawHeart(ctx, x, y, r, "#FF6B81", "white"));

  const g = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.72);
  g.addColorStop(0, "rgba(255,107,129,0)");
  g.addColorStop(1, "rgba(255,107,129,0.15)");
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
}

// 😢 Sad – teardrops + blue overlay
function decorSad(ctx, w, h) {
  const tears = [
    { x: w*0.30, y: h*0.24, r: w*0.038 },
    { x: w*0.65, y: h*0.21, r: w*0.032 },
    { x: w*0.18, y: h*0.50, r: w*0.025 },
    { x: w*0.78, y: h*0.45, r: w*0.028 },
  ];
  tears.forEach(({ x, y, r }) => drawTeardrop(ctx, x, y, r, "#74B9FF"));

  const g = ctx.createLinearGradient(0, 0, 0, h * 0.35);
  g.addColorStop(0, "rgba(116,185,255,0.28)");
  g.addColorStop(1, "rgba(116,185,255,0)");
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
}

// 😡 Angry – anger veins + red vignette
function decorAngry(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = "#FF4757";
  ctx.lineWidth   = w * 0.013;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";

  // top-left anger mark
  const drawVein = (ox, oy, flip) => {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(flip, 1);
    ctx.beginPath();
    ctx.moveTo(-w*0.042, -h*0.042);
    ctx.lineTo( w*0.005,  h*0.005);
    ctx.lineTo(-w*0.018,  h*0.018);
    ctx.lineTo( w*0.036,  h*0.058);
    ctx.stroke();
    ctx.restore();
  };
  drawVein(w*0.10, h*0.10,  1);
  drawVein(w*0.90, h*0.10, -1);

  // red vignette
  const g = ctx.createRadialGradient(w/2, h/2, h*0.30, w/2, h/2, h*0.72);
  g.addColorStop(0, "rgba(255,71,87,0)");
  g.addColorStop(1, "rgba(255,71,87,0.32)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// 😱 Surprise – radial shock lines + !! marks
function decorSurprise(ctx, w, h) {
  ctx.save();
  const cx = w / 2, cy = h / 2;
  const count = 14;
  const inner = Math.min(w, h) * 0.28;
  const outer = Math.max(w, h) * 0.75;

  ctx.lineWidth   = w * 0.014;
  ctx.lineCap     = "round";

  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 - Math.PI / count / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = i % 2 === 0 ? "#FFE000" : "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(0, inner);
    ctx.lineTo(0, outer);
    ctx.stroke();
    ctx.restore();
  }

  // !! exclamation
  [[w*0.10, h*0.12], [w*0.87, h*0.10]].forEach(([x, y]) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.font         = `900 ${w*0.10}px sans-serif`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth    = w * 0.015;
    ctx.strokeStyle  = "white";
    ctx.strokeText("!", 0, 0);
    ctx.fillStyle    = "#FF4757";
    ctx.fillText("!", 0, 0);
    ctx.restore();
  });

  ctx.restore();
}

// 😴 Sleepy – floating Z's + dark blue tint
function decorSleepy(ctx, w, h) {
  const zs = [
    { x: w*0.74, y: h*0.20, size: w*0.082, alpha: 0.92 },
    { x: w*0.84, y: h*0.10, size: w*0.065, alpha: 0.72 },
    { x: w*0.92, y: h*0.03, size: w*0.048, alpha: 0.50 },
  ];
  ctx.save();
  zs.forEach(({ x, y, size, alpha }) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font         = `900 ${size}px sans-serif`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth    = size * 0.14;
    ctx.strokeStyle  = "white";
    ctx.strokeText("Z", x, y);
    ctx.fillStyle    = "#6C5CE7";
    ctx.fillText("Z", x, y);
    ctx.restore();
  });
  ctx.restore();

  // dreamy blue tint
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(108,92,231,0.14)");
  g.addColorStop(1, "rgba(108,92,231,0.04)");
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
}

// 🤔 Think – thought bubble top-right
function decorThink(ctx, w, h) {
  ctx.save();
  const bx = w * 0.78, by = h * 0.13;
  const bw = w * 0.20, bh = h * 0.14;

  ctx.fillStyle   = "rgba(255,255,255,0.88)";
  ctx.strokeStyle = "#00B894";
  ctx.lineWidth   = w * 0.012;

  // main bubble
  ctx.beginPath();
  ctx.ellipse(bx, by, bw / 2, bh / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // bubble tail
  const dots = [
    { x: bx - bw*0.28, y: by + bh*0.52, r: w*0.022 },
    { x: bx - bw*0.42, y: by + bh*0.78, r: w*0.013 },
    { x: bx - bw*0.48, y: by + bh*0.98, r: w*0.007 },
  ];
  dots.forEach(({ x, y, r }) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });

  // "..." label
  ctx.fillStyle    = "#2D3436";
  ctx.font         = `900 ${bh * 0.52}px sans-serif`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("...", bx, by);
  ctx.restore();
}

// 😎 Cool – star bursts + cool blue tint
function decorCool(ctx, w, h) {
  const stars = [
    { x: w*0.08, y: h*0.08, r: w*0.055 },
    { x: w*0.88, y: h*0.07, r: w*0.045 },
    { x: w*0.05, y: h*0.42, r: w*0.030 },
  ];
  stars.forEach(({ x, y, r }) => drawStar(ctx, x, y, r, "#0984E3", "white"));

  const g = ctx.createLinearGradient(0, 0, 0, h * 0.3);
  g.addColorStop(0, "rgba(9,132,227,0.18)");
  g.addColorStop(1, "rgba(9,132,227,0)");
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
}

// ── Drawing primitives ─────────────────────────────────────────────────────

function drawSparkle(ctx, cx, cy, size, fill, stroke) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle   = fill;
  ctx.strokeStyle = stroke || fill;
  ctx.lineWidth   = size * 0.18;
  ctx.lineCap     = "round";
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((Math.PI / 4) * i);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(0,  size);
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHeart(ctx, cx, cy, size, fill, strokeCol) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle   = fill;
  ctx.strokeStyle = strokeCol;
  ctx.lineWidth   = size * 0.12;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.32);
  ctx.bezierCurveTo(0, 0,          -size*0.52, 0,          -size*0.52, -size*0.26);
  ctx.bezierCurveTo(-size*0.52, -size*0.62, 0, -size*0.72, 0, -size*0.42);
  ctx.bezierCurveTo(0, -size*0.72,  size*0.52, -size*0.62,  size*0.52, -size*0.26);
  ctx.bezierCurveTo(size*0.52, 0, 0, 0, 0, size*0.32);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function drawTeardrop(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle   = color;
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth   = r * 0.2;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // drop tail
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, r);
  ctx.quadraticCurveTo(r * 0.5, r * 1.6, 0, r * 2.4);
  ctx.quadraticCurveTo(-r * 0.5, r * 1.6, -r * 0.5, r);
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawStar(ctx, cx, cy, r, fill, strokeCol) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle   = fill;
  ctx.strokeStyle = strokeCol;
  ctx.lineWidth   = r * 0.12;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a  = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const ia = a + Math.PI / 5;
    i === 0
      ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
      : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(ia) * r * 0.4, Math.sin(ia) * r * 0.4);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

// ── Init ───────────────────────────────────────────────────────────────────
updateInfo();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
