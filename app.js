const storageKey = "card-ledger-entries-v1";

const elements = {
  fileInput: document.querySelector("#fileInput"),
  dropZone: document.querySelector("#dropZone"),
  previewImage: document.querySelector("#previewImage"),
  emptyPreview: document.querySelector("#emptyPreview"),
  statusTitle: document.querySelector("#statusTitle"),
  statusText: document.querySelector("#statusText"),
  progress: document.querySelector("#ocrProgress"),
  form: document.querySelector("#entryForm"),
  date: document.querySelector("#dateInput"),
  amount: document.querySelector("#amountInput"),
  merchant: document.querySelector("#merchantInput"),
  category: document.querySelector("#categoryInput"),
  rawText: document.querySelector("#rawTextInput"),
  ledgerBody: document.querySelector("#ledgerBody"),
  totalAmount: document.querySelector("#totalAmount"),
  exportCsv: document.querySelector("#exportCsv"),
  clearAll: document.querySelector("#clearAll"),
};

let entries = loadEntries();

const categoryRules = [
  { category: "카페/간식", words: ["스타벅스", "투썸", "이디야", "메가커피", "컴포즈", "커피", "카페", "베이커리", "파리바게뜨", "뚜레쥬르"] },
  { category: "식비", words: ["식당", "김밥", "치킨", "피자", "버거", "분식", "국밥", "한식", "중식", "일식", "배달", "요기요", "배민", "쿠팡이츠", "롯데리아", "맥도날드", "버거킹", "맘스터치"] },
  { category: "교통", words: ["택시", "카카오택시", "티머니", "지하철", "버스", "코레일", "철도", "공항철도"] },
  { category: "주유/차량", words: ["주유", "충전소", "GS칼텍스", "SK에너지", "S-OIL", "현대오일", "하이패스", "주차"] },
  { category: "쇼핑", words: ["쿠팡", "네이버페이", "11번가", "G마켓", "옥션", "무신사", "백화점", "올리브영"] },
  { category: "생활/마트", words: ["이마트", "홈플러스", "롯데마트", "마트", "편의점", "CU", "씨유", "GS25", "지에스25", "세븐일레븐", "다이소"] },
  { category: "통신/구독", words: ["SKT", "KT", "LG U", "유플러스", "넷플릭스", "유튜브", "구글", "애플", "멜론", "구독"] },
  { category: "의료", words: ["병원", "의원", "약국", "치과", "한의원"] },
  { category: "교육", words: ["학원", "강의", "인강", "교육", "교보문고", "알라딘", "예스24"] },
  { category: "여행/숙박", words: ["호텔", "리조트", "항공", "대한항공", "아시아나", "제주항공", "야놀자", "여기어때", "에어비앤비"] },
  { category: "접대/업무", words: ["회의", "접대", "문구", "오피스", "인쇄", "복사", "우체국", "택배"] },
];

renderLedger();

elements.fileInput.addEventListener("change", (event) => {
  processFiles([...event.target.files]);
});

["dragenter", "dragover"].forEach((eventName) => {
  elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.remove("dragging");
  });
});

elements.dropZone.addEventListener("drop", (event) => {
  const files = [...event.dataTransfer.files].filter((file) => file.type.startsWith("image/"));
  processFiles(files);
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const entry = {
    id: crypto.randomUUID(),
    date: elements.date.value,
    amount: Number(elements.amount.value || 0),
    merchant: elements.merchant.value.trim() || "미확인",
    category: elements.category.value,
    rawText: elements.rawText.value.trim(),
    createdAt: new Date().toISOString(),
  };

  entries = [entry, ...entries];
  saveEntries();
  renderLedger();
  elements.form.reset();
  setStatus("저장 완료", "내역이 저장되었습니다. 필요하면 다음 캡쳐를 첨부하세요.", 100);
});

elements.ledgerBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) return;
  entries = entries.filter((entry) => entry.id !== button.dataset.deleteId);
  saveEntries();
  renderLedger();
});

elements.exportCsv.addEventListener("click", exportCsv);

elements.clearAll.addEventListener("click", () => {
  if (!entries.length) return;
  const shouldClear = confirm("저장된 카드 내역을 모두 삭제할까요?");
  if (!shouldClear) return;
  entries = [];
  saveEntries();
  renderLedger();
  setStatus("삭제 완료", "저장된 내역을 모두 삭제했습니다.", 0);
});

async function processFiles(files) {
  if (!files.length) return;

  for (const file of files) {
    showPreview(file);
    setStatus("OCR 실행 중", `${file.name} 이미지를 인식하고 있습니다.`, 8);

    try {
      const text = normalizeText(await recognizeText(file));
      const parsedEntries = parseCardEntries(text);

      if (parsedEntries.length > 1) {
        entries = [...parsedEntries, ...entries];
        saveEntries();
        renderLedger();
        fillForm(parsedEntries[0], text);
        setStatus("여러 건 분석 완료", `${parsedEntries.length}건을 분리해서 저장했습니다. 첫 번째 항목은 왼쪽에서 확인할 수 있습니다.`, 100);
      } else {
        const parsed = parsedEntries[0] || parseCardText(text);
        fillForm(parsed, text);
        setStatus("분석 완료", "추출값을 확인한 뒤 저장하세요. OCR 특성상 금액과 날짜는 검토가 필요합니다.", 100);
      }
    } catch (error) {
      console.error(error);
      setStatus("OCR 실패", error.message || "이미지를 분석하지 못했습니다. 원문을 직접 입력해도 저장할 수 있습니다.", 0);
    }
  }
}

async function recognizeText(file) {
  if (canUseLocalOcrServer()) {
    const serverText = await recognizeWithLocalServer(file);
    if (serverText) return serverText;
  }

  if (!window.Tesseract) {
    throw new Error("브라우저 OCR을 불러오지 못했습니다. 아이폰 단독 모드는 인터넷 연결이 필요합니다.");
  }

  setStatus("아이폰 OCR 실행 중", "기기 안에서 이미지를 읽고 있습니다. 첫 실행은 10초 이상 걸릴 수 있습니다.", 12);

  const result = await Tesseract.recognize(file, "kor+eng", {
    workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",
    corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd.wasm.js",
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
    logger(message) {
      if (message.status === "recognizing text") {
        setStatus("아이폰 OCR 실행 중", "이미지에서 글자를 읽는 중입니다.", Math.round(message.progress * 82) + 14);
      } else if (message.status) {
        setStatus("아이폰 OCR 준비 중", message.status, 12);
      }
    },
  });

  return result.data.text;
}

async function recognizeWithLocalServer(file) {
  const formData = new FormData();
  formData.append("image", file);

  let response;
  try {
    response = await fetch("/api/ocr", {
      method: "POST",
      body: formData,
    });
  } catch {
    return "";
  }

  if (!response.ok) {
    return "";
  }

  const payload = await response.json();
  return payload.text || "";
}

function canUseLocalOcrServer() {
  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function showPreview(file) {
  const url = URL.createObjectURL(file);
  elements.previewImage.src = url;
  elements.previewImage.style.display = "block";
  elements.emptyPreview.style.display = "none";
}

function parseCardText(text) {
  const [firstEntry] = parseCardEntries(text);
  if (firstEntry) {
    return firstEntry;
  }

  const date = extractDate(text);
  const amount = extractAmount(text);
  const merchant = extractMerchant(text);
  const category = inferCategory(`${merchant} ${text}`);

  return { date, amount, merchant, category };
}

function parseCardEntries(text) {
  const lines = getTextLines(text);
  const blocks = splitCardMessageBlocks(lines);

  return blocks
    .map((block) => parseCardBlock(block))
    .filter((entry) => entry && entry.date && entry.amount && entry.merchant)
    .map((entry) => ({
      id: crypto.randomUUID(),
      ...entry,
      category: inferCategory(`${entry.merchant} ${entry.rawText}`),
      createdAt: new Date().toISOString(),
    }));
}

function splitCardMessageBlocks(lines) {
  const blocks = [];
  let current = [];

  for (const line of lines) {
    if (isWebSenderLine(line) && current.length) {
      blocks.push(current);
      current = [];
    }
    current.push(line);
  }

  if (current.length) {
    blocks.push(current);
  }

  const cardBlocks = blocks.filter((block) => block.some(isPaymentAmountLine) && block.some(isDateTimeLine));
  if (cardBlocks.length) {
    return cardBlocks;
  }

  return lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => isPaymentAmountLine(line))
    .map(({ index }) => lines.slice(Math.max(0, index - 3), index + 5));
}

function parseCardBlock(block) {
  const amountIndex = block.findIndex(isPaymentAmountLine);
  if (amountIndex < 0) return null;

  const amount = extractAmount(block[amountIndex]);
  const dateIndex = block.findIndex((line, index) => index > amountIndex && isDateTimeLine(line));
  const date = dateIndex >= 0 ? extractDate(block[dateIndex]) : extractDate(block.join("\n"));
  const merchant = extractMerchantFromBlock(block, dateIndex);

  return {
    date,
    amount,
    merchant,
    rawText: block.join("\n"),
  };
}

function extractDate(text) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const patterns = [
    /(\d{4})[.\-/년\s]+(\d{1,2})[.\-/월\s]+(\d{1,2})/m,
    /(\d{2})[.\-/년\s]+(\d{1,2})[.\-/월\s]+(\d{1,2})/m,
    /(\d{1,2})[.\-/월\s]+(\d{1,2})[일\s]*/m,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    let year = currentYear;
    let month;
    let day;

    if (match.length === 4) {
      year = Number(match[1]);
      if (year < 100) year += 2000;
      month = Number(match[2]);
      day = Number(match[3]);
    } else {
      month = Number(match[1]);
      day = Number(match[2]);
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return toDateInputValue(year, month, day);
    }
  }

  return toDateInputValue(currentYear, now.getMonth() + 1, now.getDate());
}

function extractAmount(text) {
  const lines = getTextLines(text);
  const blockedLine = /(누적|잔액|한도|포인트|마일리지|총\s*이용|누계)/;
  const paymentLine = /(일시불|할부|승인|이용|결제|매출|사용)/;

  const preferredAmounts = lines
    .filter((line) => !blockedLine.test(line))
    .filter((line) => paymentLine.test(line) && /원/.test(line))
    .flatMap((line) => [...line.matchAll(/(?:₩|KRW)?\s*([\d,]{3,})\s*원/g)])
    .map((match) => toNumber(match[1]))
    .filter((value) => value >= 100);

  if (preferredAmounts.length) {
    return preferredAmounts[0];
  }

  const allAmounts = lines
    .filter((line) => !blockedLine.test(line))
    .flatMap((line) => [...line.matchAll(/(?:₩|KRW)?\s*([\d,]{3,})\s*원/g)])
    .map((match) => toNumber(match[1]))
    .filter((value) => value >= 100);

  return allAmounts.length ? allAmounts[0] : "";
}

function extractMerchant(text) {
  const lines = getTextLines(text);
  const merchantFromBlock = extractMerchantFromBlock(lines, lines.findIndex(isDateTimeLine));
  if (merchantFromBlock) return merchantFromBlock;

  const companyLine = lines.find((line) => /(\(주\)|㈜)/.test(line) && !/(누적|잔액|한도|원)/.test(line));
  if (companyLine) {
    return cleanMerchant(companyLine);
  }

  const blocked = /(web발신|web\s*발신|카드|승인|이용|결제|금액|일시|누적|잔액|할부|체크|신용|취소|원|KRW|고객|알림|앱)/i;
  const candidates = lines
    .map(cleanMerchant)
    .filter((line) => line.length >= 2 && line.length <= 28)
    .filter((line) => !blocked.test(line))
    .filter((line) => !/\d{2,}/.test(line));

  return candidates[0] || "";
}

function extractMerchantFromBlock(lines, dateIndex) {
  const companyLine = lines.find((line) => /(\(주\)|㈜)/.test(line) && !isBalanceLine(line) && !/원/.test(line));
  if (companyLine) return cleanMerchant(companyLine);

  if (dateIndex >= 0) {
    const merchantLine = lines.slice(dateIndex + 1).find((line) => isMerchantLine(line));
    if (merchantLine) return cleanMerchant(merchantLine);
  }

  return "";
}

function isWebSenderLine(line) {
  return /\[?\s*web\s*발신\s*\]?/i.test(line);
}

function isPaymentAmountLine(line) {
  return !isBalanceLine(line) && /(일시불|할부)/.test(line) && /[\d,]{3,}\s*원/.test(line);
}

function isDateTimeLine(line) {
  return /\d{1,2}[./-]\d{1,2}\s*\d{1,2}:\d{2}/.test(line) || /\d{4}[./-]\d{1,2}[./-]\d{1,2}/.test(line);
}

function isBalanceLine(line) {
  return /(누적|잔액|한도|포인트|마일리지|총\s*이용|누계)/.test(line);
}

function isMerchantLine(line) {
  const blocked = /(web발신|web\s*발신|카드|승인|이용|결제|금액|일시|누적|잔액|할부|체크|신용|취소|원|KRW|고객|알림|앱|님$)/i;
  const cleaned = cleanMerchant(line);
  return cleaned.length >= 2 && cleaned.length <= 32 && !blocked.test(cleaned) && !isDateTimeLine(cleaned) && !/^\d/.test(cleaned);
}

function getTextLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanMerchant(value) {
  return value
    .replace(/[|[\]{}<>]/g, " ")
    .replace(/^\s*(?:\(주\)|㈜)\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferCategory(text) {
  const haystack = text.toLowerCase();
  const rule = categoryRules.find((item) => item.words.some((word) => haystack.includes(word.toLowerCase())));
  return rule ? rule.category : "기타";
}

function fillForm(parsed, rawText) {
  elements.date.value = parsed.date;
  elements.amount.value = parsed.amount || "";
  elements.merchant.value = parsed.merchant;
  elements.category.value = parsed.category;
  elements.rawText.value = rawText;
}

function normalizeText(text) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toNumber(value) {
  return Number(String(value).replace(/[^\d]/g, ""));
}

function toDateInputValue(year, month, day) {
  return [year, String(month).padStart(2, "0"), String(day).padStart(2, "0")].join("-");
}

function setStatus(title, text, progress) {
  elements.statusTitle.textContent = title;
  elements.statusText.textContent = text;
  elements.progress.value = progress;
}

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveEntries() {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

function renderLedger() {
  if (!entries.length) {
    elements.ledgerBody.innerHTML = `<tr><td class="empty-row" colspan="5">저장된 내역이 없습니다.</td></tr>`;
    elements.totalAmount.textContent = "0원";
    return;
  }

  elements.ledgerBody.innerHTML = entries
    .map(
      (entry) => `
        <tr>
          <td>${escapeHtml(entry.date)}</td>
          <td>${escapeHtml(entry.merchant)}</td>
          <td>${escapeHtml(entry.category)}</td>
          <td class="amount-col">${formatWon(entry.amount)}</td>
          <td><button class="delete-row" type="button" data-delete-id="${entry.id}" aria-label="삭제">×</button></td>
        </tr>
      `,
    )
    .join("");

  const total = entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  elements.totalAmount.textContent = formatWon(total);
}

function formatWon(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function exportCsv() {
  if (!entries.length) {
    setStatus("내보낼 항목 없음", "저장된 내역이 있을 때 CSV를 만들 수 있습니다.", 0);
    return;
  }

  const header = ["날짜", "사용처", "카테고리", "금액", "OCR 원문"];
  const rows = entries.map((entry) => [entry.date, entry.merchant, entry.category, entry.amount, entry.rawText]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `card-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // iOS Safari only allows service workers in secure contexts.
    });
  });
}
