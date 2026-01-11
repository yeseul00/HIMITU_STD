# 연습 프로젝트 #3: HIMITU_Wiki PWA 전환

> **예상 소요 시간**: 1-2시간  
> **난이도**: ⭐ (초급)  
> **Tavern Defense 연관도**: ⭐⭐ (보조)

---

## 📌 프로젝트 개요

### 목표

기존 HIMITU_Wiki 웹사이트를 **Progressive Web App(PWA)**으로 전환하여 모바일에서 앱처럼 사용 가능하게 만듭니다.

### PWA 전환 후 변화

| Before (웹사이트)   | After (PWA)           |
| ------------------- | --------------------- |
| 브라우저에서만 접근 | 홈 화면에 앱 아이콘   |
| 항상 온라인 필요    | 오프라인 기본 지원    |
| 브라우저 UI 표시    | 전체화면 앱 경험      |
| 주소창 직접 입력    | 앱 아이콘 터치로 실행 |

### PWA 동작 예시

```
┌─────────────────────────────────────────────────────────────────┐
│  📱 홈 화면                          📱 앱 실행 시              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐     ┌─────────────────────────┐    │
│  │ 📷   │ │ 💬   │ │ 📚   │     │  ⚔️ HIMITU WIKI        │    │
│  │Camera│ │Kakao │ │HIMITU│     │                        │    │
│  └──────┘ └──────┘ │ Wiki │     │  [검색창]               │    │
│                    └──────┘     │                        │    │
│    ↑ 앱 아이콘처럼 표시!          │  📖 지식의 마법서       │    │
│                                 │                        │    │
│                                 │  (브라우저 UI 없음!)    │    │
│                                 └─────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗓️ 작업 계획 (1-2시간)

### Step 1 (20분): 아이콘 생성

#### 작업 내용

```
□ 192x192 PNG 아이콘 생성
□ 512x512 PNG 아이콘 생성
□ icons 폴더에 저장
```

#### 아이콘 생성 방법

```
옵션 1: AI 이미지 생성 (권장)
  - 프롬프트: "sword and book icon, fantasy style,
              gold and brown colors, app icon format"

옵션 2: 기존 이미지 리사이즈
  - Figma, Canva, 또는 online resizer 사용

옵션 3: 텍스트 기반 간단 아이콘
  - Canvas로 "⚔️" 이모지 렌더링
```

---

### Step 2 (20분): manifest.json 생성

#### 파일 위치

`C:\Users\SOL\Documents\GitHub\HIMITU_Wiki\manifest.json`

#### 파일 내용

```json
{
  "name": "HIMITU Wiki - 지식의 마법서",
  "short_name": "HIMITU Wiki",
  "description": "판타지 세계관 기반 학습 포털",
  "start_url": "/index.html",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FFFBF0",
  "theme_color": "#3E2723",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["education", "entertainment"],
  "lang": "ko"
}
```

---

### Step 3 (30분): Service Worker 생성

#### 파일 위치

`C:\Users\SOL\Documents\GitHub\HIMITU_Wiki\service-worker.js`

#### 파일 내용

```javascript
const CACHE_NAME = "himitu-wiki-v1";

// 캐시할 파일 목록
const urlsToCache = [
  "/",
  "/index.html",
  "/home.html",
  "/guide.html",
  "/flashcard.html",
  "/quiz.html",
  "/match.html",
  "/network.html",
  "/data.js",
  "/relations.js",
  "/learningPaths.js",
  "/progress.js",
  "/auth.js",
  "/firebase-config.js",
];

// 설치 시 캐시
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching files");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 활성화 시 이전 캐시 삭제
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 네트워크 요청 가로채기 (Cache First 전략)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시에 있으면 캐시 반환
      if (response) {
        return response;
      }
      // 없으면 네트워크 요청
      return fetch(event.request).then((response) => {
        // 유효한 응답인 경우 캐시에 추가
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
```

---

### Step 4 (20분): index.html 수정

#### 추가할 내용 (`<head>` 태그 내)

```html
<!-- PWA 관련 메타 태그 -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#3E2723" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
/>
<meta name="apple-mobile-web-app-title" content="HIMITU Wiki" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

#### 추가할 내용 (`<body>` 끝 또는 `<script>` 내)

```html
<script>
  // Service Worker 등록
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => console.log("✅ Service Worker 등록됨:", reg.scope))
        .catch((err) => console.error("❌ Service Worker 등록 실패:", err));
    });
  }
</script>
```

---

### Step 5 (10분): 테스트 및 배포

#### 로컬 테스트

```bash
# VS Code Live Server로 실행 후
# Chrome DevTools → Application 탭 → Manifest 확인
# Service Workers 탭에서 등록 확인
```

#### Lighthouse PWA 검사

```
1. Chrome DevTools 열기 (F12)
2. Lighthouse 탭 선택
3. Categories: Progressive Web App 체크
4. Analyze page load 클릭
5. PWA 점수 확인 (목표: 90점 이상)
```

#### GitHub Pages 배포

```bash
git add .
git commit -m "feat: Add PWA support"
git push origin main
```

---

## 📁 추가/수정 파일 목록

```
HIMITU_Wiki/
├── manifest.json           # [NEW] PWA 매니페스트
├── service-worker.js       # [NEW] 서비스 워커
├── icons/                  # [NEW] 아이콘 폴더
│   ├── icon-192.png        # [NEW] 192x192 아이콘
│   └── icon-512.png        # [NEW] 512x512 아이콘
└── index.html              # [MODIFY] PWA 메타태그 추가
```

---

## 🎯 테스트 체크리스트

### 기본 기능

- [ ] manifest.json 로드 성공 (DevTools → Application)
- [ ] Service Worker 등록 성공
- [ ] 아이콘이 정상 표시됨

### 설치

- [ ] 브라우저 주소창에 "설치" 아이콘 표시
- [ ] 앱 설치 후 홈 화면에 아이콘 생성
- [ ] 설치된 앱 실행 시 전체화면 모드

### 오프라인

- [ ] 비행기 모드에서 기본 페이지 로드
- [ ] 캐시된 페이지 정상 표시

### Lighthouse 점수

- [ ] PWA 점수 90점 이상
- [ ] Installable 체크 통과
- [ ] Optimized 체크 통과

---

## 💡 추가 개선 사항 (선택)

### 오프라인 알림 UI

```javascript
// 오프라인 상태 감지
window.addEventListener("offline", () => {
  showToast("🔌 오프라인 모드입니다");
});

window.addEventListener("online", () => {
  showToast("✅ 온라인으로 복구되었습니다");
});
```

### 캐시 버전 관리

```javascript
// 업데이트 시 캐시 갱신 알림
self.addEventListener("activate", (event) => {
  // 새 버전 알림
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: "UPDATE_AVAILABLE" });
    });
  });
});
```

---

## 🔗 참고 자료

| 자료               | URL                                                               |
| ------------------ | ----------------------------------------------------------------- |
| MDN PWA Guide      | https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps |
| web.dev PWA        | https://web.dev/progressive-web-apps/                             |
| Manifest Generator | https://app-manifest.firebaseapp.com/                             |
| PWA Builder        | https://www.pwabuilder.com/                                       |

---

## ✅ 완료 기준

1. `manifest.json` 생성 완료
2. `service-worker.js` 생성 및 등록
3. 앱 아이콘 192x192, 512x512 생성
4. index.html에 PWA 메타태그 추가
5. Chrome에서 "앱 설치" 프롬프트 표시
6. 홈 화면에 앱 아이콘 생성 가능
7. Lighthouse PWA 점수 90점 이상

---

_가장 빠르게 완료할 수 있는 프로젝트입니다! 1-2시간이면 충분합니다._
