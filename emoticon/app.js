"use strict";

// ── Platform specs ─────────────────────────────────────────────────────────
const PLATFORMS = {
  kakao:       { name: "카카오톡",        width: 360, height: 360 },
  "kakao-big": { name: "카카오 큰이모티콘", width: 544, height: 544 },
  line:        { name: "LINE 스티커",     width: 370, height: 320 },
  ogq:         { name: "OGQ 이모티콘",    width: 740, height: 640 },
};

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  sourceBase64:   null,
  generatedImage: null,
  platform:       "kakao",
  style:          "Emoji",
  stylePrompt:    "",
  emotion:        "happy",
  text:           "",
  textPos:        "bottom",
  textColor:      "#FFFFFF",
  strokeColor:    "#222222",
  generating:     false,
};

// ── DOM refs ───────────────────────────────────────────────────────────────
const $  = (id) => document.getElementById(id);

const uploadScreen  = $("uploadScreen");
const workspace     = $("workspace");
const photoInput    = $("photoInput");
const sourcePhoto   = $("sourcePhoto");

const btnApiKey     = $("btnApiKey");
const apiPanel      = $("apiPanel");
const btnCloseApi   = $("btnCloseApi");
const apiKeyInput   = $("apiKeyInput");
const btnSaveKey    = $("btnSaveKey");
const apiStatus     = $("apiStatus");

const styleGrid     = $("styleGrid");
const emotionGrid   = $("emotionGrid");
const platformGrid  = $("platformGrid");
const textInput     = $("textInput");
const textPos       = $("textPos");
const textColor     = $("textColor");
const strokeColor   = $("strokeColor");

const btnGenerate   = $("btnGenerate");
const loadingBox    = $("loadingBox");
const loadingMsg    = $("loadingMsg");
const loadingFill   = $("loadingFill");
const variationsBox = $("variationsBox");
const variationGrid = $("variationGrid");

const previewCanvas = $("previewCanvas");
const canvasEmpty   = $("canvasEmpty");
const platformBadge = $("platformBadge");
const dlRow         = $("dlRow");
const btnDownload   = $("btnDownload");

// ── Init ───────────────────────────────────────────────────────────────────
refreshApiKeyBtn();
updateBadge();

// ── Upload ─────────────────────────────────────────────────────────────────
photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) loadPhoto(file);
  e.target.value = "";
});

uploadScreen.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadScreen.classList.add("drag");
});
uploadScreen.addEventListener("dragleave", () => uploadScreen.classList.remove("drag"));
uploadScreen.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadScreen.classList.remove("drag");
  const file = [...e.dataTransfer.files].find((f) => f.type.startsWith("image/"));
  if (file) loadPhoto(file);
});

async function loadPhoto(file) {
  state.sourceBase64 = await resizeToBase64(file, 1024);
  sourcePhoto.src    = state.sourceBase64;
  uploadScreen.hidden = true;
  workspace.hidden    = false;
}

// ── API key ────────────────────────────────────────────────────────────────
btnApiKey.addEventListener("click", () => {
  apiPanel.hidden = !apiPanel.hidden;
  if (!apiPanel.hidden) {
    const saved = localStorage.getItem("replicate-api-key");
    if (saved) apiKeyInput.value = saved;
    apiKeyInput.focus();
  }
});
btnCloseApi.addEventListener("click", () => { apiPanel.hidden = true; });
btnSaveKey.addEventListener("click", saveApiKey);
apiKeyInput.addEventListener("keydown", (e) => { if (e.key === "Enter") saveApiKey(); });

function saveApiKey() {
  const key = apiKeyInput.value.trim();
  if (!key) { setApiStatus("warn", "키를 입력해 주세요."); return; }
  if (!key.startsWith("r8_")) {
    setApiStatus("warn", "Replicate 키는 r8_로 시작합니다. 확인해 주세요.");
    return;
  }
  localStorage.setItem("replicate-api-key", key);
  setApiStatus("ok", "✅ 저장되었습니다.");
  refreshApiKeyBtn();
  setTimeout(() => { apiPanel.hidden = true; }, 1000);
}

function setApiStatus(type, msg) {
  apiStatus.textContent = msg;
  apiStatus.className   = "api-status api-status--" + type;
}

function refreshApiKeyBtn() {
  const has = !!localStorage.getItem("replicate-api-key");
  btnApiKey.textContent = has ? "🔑 API 키 ✓" : "🔑 API 키";
  btnApiKey.classList.toggle("has-key", has);
}

// ── Settings ───────────────────────────────────────────────────────────────
styleGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-style]");
  if (!btn) return;
  setActive(styleGrid, btn, "style-btn");
  state.style       = btn.dataset.style;
  state.stylePrompt = btn.dataset.prompt;
});

emotionGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-emotion]");
  if (!btn) return;
  setActive(emotionGrid, btn, "emotion-btn");
  state.emotion = btn.dataset.emotion;
  if (state.generatedImage) render();
});

platformGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-platform]");
  if (!btn) return;
  setActive(platformGrid, btn, "platform-btn");
  state.platform = btn.dataset.platform;
  updateBadge();
  if (state.generatedImage) render();
});

textInput.addEventListener("input",   () => { state.text        = textInput.value; if (state.generatedImage) render(); });
textPos.addEventListener("change",    () => { state.textPos     = textPos.value;   if (state.generatedImage) render(); });
textColor.addEventListener("input",   () => { state.textColor   = textColor.value; if (state.generatedImage) render(); });
strokeColor.addEventListener("input", () => { state.strokeColor = strokeColor.value; if (state.generatedImage) render(); });

// ── Generate ───────────────────────────────────────────────────────────────
btnGenerate.addEventListener("click", async () => {
  if (state.generating) return;

  const apiKey = localStorage.getItem("replicate-api-key");
  if (!apiKey) {
    apiPanel.hidden = false;
    apiKeyInput.focus();
    setApiStatus("warn", "API 키를 먼저 입력해 주세요.");
    return;
  }
  if (!state.sourceBase64) return;

  state.generating  = true;
  btnGenerate.disabled = true;
  btnGenerate.innerHTML = "<span>⏳</span> 생성 중...";

  variationsBox.hidden = true;
  loadingBox.hidden    = false;
  canvasEmpty.style.display = "flex";
  previewCanvas.hidden = true;
  dlRow.hidden         = true;

  startLoadingBar();

  try {
    const outputs = await generateCharacter(state.sourceBase64, state.style, state.stylePrompt, apiKey);
    stopLoadingBar();
    loadingBox.hidden = true;
    showVariations(outputs);
  } catch (err) {
    stopLoadingBar();
    loadingBox.hidden = true;
    showError(err.message);
  } finally {
    state.generating     = false;
    btnGenerate.disabled = false;
    btnGenerate.innerHTML = "<span>✨</span> AI 이모티콘 생성";
  }
});

// ── Replicate API ──────────────────────────────────────────────────────────
async function generateCharacter(base64, style, prompt, apiKey) {
  setLoading("요청을 보내는 중...", 10);

  const body = {
    input: {
      image: base64,
      style: style,
      prompt: prompt,
      negative_prompt:
        "ugly, blurry, low quality, bad anatomy, deformed, disfigured, text, watermark, extra fingers, multiple people",
      num_outputs: 4,
      guidance_scale: 7.5,
      num_inference_steps: 30,
    },
  };

  const res = await fetch(
    "https://api.replicate.com/v1/models/fofr/face-to-many/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error("API 키가 올바르지 않습니다. 키를 다시 확인해 주세요.");
    if (res.status === 422) throw new Error("입력 이미지를 처리할 수 없습니다. 얼굴이 잘 보이는 사진을 사용해 주세요.");
    if (res.status === 429) throw new Error("요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.");
    throw new Error(err.detail || `서버 오류 (${res.status})`);
  }

  const prediction = await res.json();

  if (prediction.status === "succeeded") return prediction.output;
  if (prediction.status === "failed") throw new Error(prediction.error || "생성에 실패했습니다.");

  // Poll
  return pollPrediction(prediction.id, apiKey);
}

async function pollPrediction(id, apiKey) {
  const steps = [
    [20, "얼굴을 분석하는 중..."],
    [40, "캐릭터 윤곽을 잡는 중..."],
    [60, "색칠하는 중..."],
    [80, "디테일을 추가하는 중..."],
    [90, "마무리 중..."],
  ];
  let stepIdx = 0;
  let elapsed = 0;

  while (true) {
    if (stepIdx < steps.length) {
      const [pct, msg] = steps[stepIdx];
      setLoading(msg, pct);
      stepIdx++;
    }

    await sleep(2500);
    elapsed += 2500;

    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) throw new Error(`폴링 오류 (${res.status})`);

    const pred = await res.json();
    if (pred.status === "succeeded") return pred.output;
    if (pred.status === "failed") throw new Error(pred.error || "생성 실패");

    if (elapsed > 120000) throw new Error("시간이 너무 오래 걸립니다. 다시 시도해 주세요.");
  }
}

// ── Variation picker ───────────────────────────────────────────────────────
function showVariations(urls) {
  variationGrid.innerHTML = "";

  urls.forEach((url, i) => {
    const btn = document.createElement("button");
    btn.className = "variation-btn";
    btn.title     = `캐릭터 ${i + 1} 선택`;
    btn.setAttribute("aria-label", `캐릭터 ${i + 1}`);

    const img = document.createElement("img");
    img.alt     = `캐릭터 ${i + 1}`;
    img.loading = "lazy";
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (i === 0) pickVariation(img, btn);
    };
    img.onerror = () => {
      // retry without crossOrigin
      img.removeAttribute("crossorigin");
      img.src = url;
    };
    img.src = url;

    btn.appendChild(img);
    btn.addEventListener("click", () => pickVariation(img, btn));
    variationGrid.appendChild(btn);
  });

  variationsBox.hidden = false;
}

function pickVariation(img, btn) {
  variationGrid.querySelectorAll(".variation-btn").forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  state.generatedImage = img;
  canvasEmpty.style.display = "none";
  previewCanvas.hidden = false;
  dlRow.hidden = false;
  render();
}

// ── Canvas render ──────────────────────────────────────────────────────────
function render() {
  if (!state.generatedImage) return;

  const { width: w, height: h } = PLATFORMS[state.platform];
  previewCanvas.width  = w;
  previewCanvas.height = h;

  const ctx = previewCanvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);

  // Draw AI character (cover fit)
  const img   = state.generatedImage;
  const iw    = img.naturalWidth  || img.width;
  const ih    = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih);
  const sw    = iw * scale;
  const sh    = ih * scale;
  ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);

  // Emotion decorations
  if (state.emotion !== "none") {
    const fn = EMOTION_DECORS[state.emotion];
    if (fn) fn(ctx, w, h);
  }

  // Text overlay
  if (state.text.trim()) renderText(ctx, w, h);
}

// ── Text ───────────────────────────────────────────────────────────────────
function renderText(ctx, w, h) {
  const { text, textPos: pos, textColor: fill, strokeColor: stroke } = state;
  const fs  = Math.round(Math.min(w, h) * 0.1);
  const pad = fs * 0.5;
  const y   = pos === "top" ? fs / 2 + pad : pos === "center" ? h / 2 : h - fs / 2 - pad;

  ctx.save();
  ctx.font         = `900 ${fs}px "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin     = "round";
  ctx.lineWidth    = Math.ceil(fs * 0.14);
  ctx.strokeStyle  = stroke;
  ctx.strokeText(text, w / 2, y);
  ctx.fillStyle    = fill;
  ctx.fillText(text, w / 2, y);
  ctx.restore();
}

// ── Download ───────────────────────────────────────────────────────────────
btnDownload.addEventListener("click", () => {
  const p    = PLATFORMS[state.platform];
  const link = document.createElement("a");
  link.download = `emoticon-${state.platform}-${state.emotion}.png`;
  link.href     = previewCanvas.toDataURL("image/png");
  link.click();
});

// ── Loading helpers ────────────────────────────────────────────────────────
let fillInterval = null;
let fillPct = 0;

function startLoadingBar() {
  fillPct = 0;
  loadingFill.style.width = "0%";
  fillInterval = setInterval(() => {
    if (fillPct < 88) {
      fillPct += 0.4;
      loadingFill.style.width = fillPct + "%";
    }
  }, 200);
}

function stopLoadingBar() {
  clearInterval(fillInterval);
  loadingFill.style.width = "100%";
}

function setLoading(msg, pct) {
  loadingMsg.textContent  = msg;
  if (pct > fillPct) {
    fillPct = pct;
    loadingFill.style.width = pct + "%";
  }
}

function showError(msg) {
  canvasEmpty.style.display = "flex";
  canvasEmpty.innerHTML     = `<span>⚠️</span><p>${msg}</p><p class="retry-hint">설정을 확인하고 다시 시도해 주세요</p>`;
}

// ── Utils ──────────────────────────────────────────────────────────────────
function setActive(parent, el, cls) {
  parent.querySelectorAll("." + cls).forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
}

function updateBadge() {
  const p = PLATFORMS[state.platform];
  platformBadge.textContent = `${p.width} × ${p.height} · ${p.name}`;
}

function resizeToBase64(file, maxPx) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale  = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
};

function decorHappy(ctx, w, h) {
  [[w*0.08,h*0.08],[w*0.88,h*0.10],[w*0.14,h*0.84],[w*0.86,h*0.82],[w*0.50,h*0.06]]
    .forEach(([x,y]) => drawSparkle(ctx, x, y, w*0.055, "#FFD93D", "#FF9F00"));
  const g = ctx.createRadialGradient(w/2,h/2,h*0.32,w/2,h/2,h*0.72);
  g.addColorStop(0,"rgba(255,217,61,0)"); g.addColorStop(1,"rgba(255,160,0,0.18)");
  ctx.save(); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.restore();
}

function decorLaugh(ctx, w, h) {
  [[w*0.12,h*0.14,w*0.085,-0.25],[w*0.80,h*0.11,w*0.07,0.2],[w*0.90,h*0.40,w*0.065,0.35]]
    .forEach(([x,y,sz,rot]) => {
      ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
      ctx.font=`900 ${sz}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.lineWidth=sz*0.12; ctx.strokeStyle="white"; ctx.strokeText("ㅋ",0,0);
      ctx.fillStyle="#FF6B6B"; ctx.fillText("ㅋ",0,0); ctx.restore();
    });
}

function decorLove(ctx, w, h) {
  [[w*0.12,h*0.11,w*0.075],[w*0.86,h*0.09,w*0.055],[w*0.92,h*0.44,w*0.065],
   [w*0.07,h*0.55,w*0.045],[w*0.78,h*0.87,w*0.048],[w*0.42,h*0.05,w*0.035]]
    .forEach(([x,y,r]) => drawHeart(ctx,x,y,r,"#FF6B81","white"));
  const g=ctx.createRadialGradient(w/2,h/2,h*0.3,w/2,h/2,h*0.72);
  g.addColorStop(0,"rgba(255,107,129,0)"); g.addColorStop(1,"rgba(255,107,129,0.15)");
  ctx.save(); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.restore();
}

function decorSad(ctx, w, h) {
  [[w*0.30,h*0.24,w*0.038],[w*0.65,h*0.21,w*0.032],[w*0.18,h*0.50,w*0.025],[w*0.78,h*0.45,w*0.028]]
    .forEach(([x,y,r]) => drawTeardrop(ctx,x,y,r,"#74B9FF"));
  const g=ctx.createLinearGradient(0,0,0,h*0.35);
  g.addColorStop(0,"rgba(116,185,255,0.28)"); g.addColorStop(1,"rgba(116,185,255,0)");
  ctx.save(); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.restore();
}

function decorAngry(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle="#FF4757"; ctx.lineWidth=w*0.013; ctx.lineCap="round"; ctx.lineJoin="round";
  const vein=(ox,oy,flip)=>{
    ctx.save(); ctx.translate(ox,oy); ctx.scale(flip,1);
    ctx.beginPath();
    ctx.moveTo(-w*0.042,-h*0.042); ctx.lineTo(w*0.005,h*0.005);
    ctx.lineTo(-w*0.018,h*0.018); ctx.lineTo(w*0.036,h*0.058);
    ctx.stroke(); ctx.restore();
  };
  vein(w*0.10,h*0.10, 1); vein(w*0.90,h*0.10,-1);
  const g=ctx.createRadialGradient(w/2,h/2,h*0.30,w/2,h/2,h*0.72);
  g.addColorStop(0,"rgba(255,71,87,0)"); g.addColorStop(1,"rgba(255,71,87,0.32)");
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.restore();
}

function decorSurprise(ctx, w, h) {
  ctx.save();
  const cx=w/2, cy=h/2, n=14, inner=Math.min(w,h)*0.28, outer=Math.max(w,h)*0.75;
  ctx.lineWidth=w*0.014; ctx.lineCap="round";
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2-Math.PI/n/2;
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(a); ctx.globalAlpha=0.45;
    ctx.strokeStyle=i%2===0?"#FFE000":"#FFFFFF";
    ctx.beginPath(); ctx.moveTo(0,inner); ctx.lineTo(0,outer); ctx.stroke(); ctx.restore();
  }
  [[w*0.10,h*0.12],[w*0.87,h*0.10]].forEach(([x,y])=>{
    ctx.save(); ctx.translate(x,y);
    ctx.font=`900 ${w*0.10}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.lineWidth=w*0.015; ctx.strokeStyle="white"; ctx.strokeText("!",0,0);
    ctx.fillStyle="#FF4757"; ctx.fillText("!",0,0); ctx.restore();
  });
  ctx.restore();
}

function decorSleepy(ctx, w, h) {
  [[w*0.74,h*0.20,w*0.082,0.92],[w*0.84,h*0.10,w*0.065,0.72],[w*0.92,h*0.03,w*0.048,0.50]]
    .forEach(([x,y,sz,alpha])=>{
      ctx.save(); ctx.globalAlpha=alpha;
      ctx.font=`900 ${sz}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.lineWidth=sz*0.14; ctx.strokeStyle="white"; ctx.strokeText("Z",x,y);
      ctx.fillStyle="#6C5CE7"; ctx.fillText("Z",x,y); ctx.restore();
    });
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,"rgba(108,92,231,0.14)"); g.addColorStop(1,"rgba(108,92,231,0.04)");
  ctx.save(); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.restore();
}

function decorThink(ctx, w, h) {
  ctx.save();
  const bx=w*0.78, by=h*0.13, bw=w*0.20, bh=h*0.14;
  ctx.fillStyle="rgba(255,255,255,0.88)"; ctx.strokeStyle="#00B894"; ctx.lineWidth=w*0.012;
  ctx.beginPath(); ctx.ellipse(bx,by,bw/2,bh/2,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  [[bx-bw*0.28,by+bh*0.52,w*0.022],[bx-bw*0.42,by+bh*0.78,w*0.013],[bx-bw*0.48,by+bh*0.98,w*0.007]]
    .forEach(([x,y,r])=>{ ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.stroke(); });
  ctx.fillStyle="#2D3436"; ctx.font=`900 ${bh*0.52}px sans-serif`;
  ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("...",bx,by);
  ctx.restore();
}

function decorCool(ctx, w, h) {
  [[w*0.08,h*0.08,w*0.055],[w*0.88,h*0.07,w*0.045],[w*0.05,h*0.42,w*0.030]]
    .forEach(([x,y,r]) => drawStar(ctx,x,y,r,"#0984E3","white"));
  const g=ctx.createLinearGradient(0,0,0,h*0.3);
  g.addColorStop(0,"rgba(9,132,227,0.18)"); g.addColorStop(1,"rgba(9,132,227,0)");
  ctx.save(); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.restore();
}

// ── Primitives ─────────────────────────────────────────────────────────────
function drawSparkle(ctx, cx, cy, size, fill, stroke) {
  ctx.save(); ctx.translate(cx,cy); ctx.fillStyle=fill;
  ctx.strokeStyle=stroke||fill; ctx.lineWidth=size*0.18; ctx.lineCap="round";
  for(let i=0;i<4;i++){
    ctx.save(); ctx.rotate((Math.PI/4)*i);
    ctx.beginPath(); ctx.moveTo(0,-size); ctx.lineTo(0,size); ctx.stroke(); ctx.restore();
  }
  ctx.beginPath(); ctx.arc(0,0,size*0.28,0,Math.PI*2); ctx.fill(); ctx.restore();
}

function drawHeart(ctx, cx, cy, size, fill, strokeCol) {
  ctx.save(); ctx.translate(cx,cy); ctx.fillStyle=fill;
  ctx.strokeStyle=strokeCol; ctx.lineWidth=size*0.12;
  ctx.beginPath();
  ctx.moveTo(0,size*0.32);
  ctx.bezierCurveTo(0,0,-size*0.52,0,-size*0.52,-size*0.26);
  ctx.bezierCurveTo(-size*0.52,-size*0.62,0,-size*0.72,0,-size*0.42);
  ctx.bezierCurveTo(0,-size*0.72,size*0.52,-size*0.62,size*0.52,-size*0.26);
  ctx.bezierCurveTo(size*0.52,0,0,0,0,size*0.32);
  ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
}

function drawTeardrop(ctx, cx, cy, r, color) {
  ctx.save(); ctx.translate(cx,cy); ctx.fillStyle=color;
  ctx.strokeStyle="rgba(255,255,255,0.7)"; ctx.lineWidth=r*0.2;
  ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r*0.5,r);
  ctx.quadraticCurveTo(r*0.5,r*1.6,0,r*2.4); ctx.quadraticCurveTo(-r*0.5,r*1.6,-r*0.5,r);
  ctx.fill(); ctx.stroke(); ctx.restore();
}

function drawStar(ctx, cx, cy, r, fill, strokeCol) {
  ctx.save(); ctx.translate(cx,cy); ctx.fillStyle=fill;
  ctx.strokeStyle=strokeCol; ctx.lineWidth=r*0.12;
  ctx.beginPath();
  for(let i=0;i<5;i++){
    const a=(i/5)*Math.PI*2-Math.PI/2, ia=a+Math.PI/5;
    i===0 ? ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r) : ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
    ctx.lineTo(Math.cos(ia)*r*0.4, Math.sin(ia)*r*0.4);
  }
  ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
}

// ── Service Worker ─────────────────────────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
