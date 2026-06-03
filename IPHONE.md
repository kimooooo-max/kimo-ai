# iPhone 단독 사용 방식

이 앱을 Mac 없이 외부에서 쓰려면 정적 웹앱으로 배포해야 합니다.

## 핵심 구조

- 화면, 저장, CSV, 분류: iPhone Safari 안에서 동작
- OCR: iPhone Safari 안의 Tesseract.js가 처리
- 데이터 저장: iPhone 브라우저의 localStorage
- Mac 서버: 필요 없음

## 필요한 조건

- HTTPS 주소가 필요합니다.
- 첫 OCR 실행과 새 언어 데이터 로딩에는 인터넷 연결이 필요합니다.
- iPhone 브라우저 OCR은 Mac Vision OCR보다 느리고, 캡쳐 품질에 따라 정확도가 떨어질 수 있습니다.

## 배포 방법

이 폴더에서 아래 정적 파일을 GitHub Pages, Cloudflare Pages, Netlify, Vercel 중 하나에 올리면 됩니다.

- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `app-icon.svg`
- `sw.js`

`server.py`와 `ocr.swift`는 Mac 로컬 OCR용이므로 iPhone 단독 배포에는 필요하지 않습니다.

## iPhone 홈 화면 추가

1. iPhone Safari에서 배포된 HTTPS 주소로 접속합니다.
2. 공유 버튼을 누릅니다.
3. `홈 화면에 추가`를 선택합니다.
4. 홈 화면의 `카드기장` 아이콘으로 실행합니다.
