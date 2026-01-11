# 📅 Week 1 실습 계획서 (텔레그램 통합)

> Canvas 렌더링 기초 + 타일 시스템 + 텔레그램 WebApp  
> 작성일: 2025-01-11  
> 담당: 슬뚜

---

## 🎯 Week 1 목표

```
✅ 텔레그램 WebApp으로 Canvas 초기화
✅ 타일 그리드 렌더링 (6x10)
✅ 마우스/터치 이벤트 처리
✅ 드래그 앤 드롭 시각적 피드백
✅ 텔레그램 봇에서 실시간 테스트
```

---

## 📆 Day 1-2: Canvas + 텔레그램 기본 설정

### 🎯 목표
- 텔레그램 WebApp SDK 통합
- Canvas 초기화 및 좌표계 이해
- 렌더링 루프 구현 (60 FPS)
- 텔레그램 환경 정보 표시

### 📝 작업 체크리스트

#### 1. 프로젝트 초기화
- [ ] GitHub 저장소 확인 (canvas-tavern-defense)
- [ ] 기본 폴더 구조 생성
- [ ] docs/ 폴더에 가이드 문서 복사

#### 2. 파일 생성
- [ ] `index.html` - 텔레그램 WebApp 페이지
- [ ] `src/utils/constants.js` - 게임 상수
- [ ] `src/telegram/TelegramAPI.js` - 텔레그램 연동
- [ ] `src/core/CanvasRenderer.js` - 렌더러
- [ ] `src/main.js` - 진입점

#### 3. 기능 구현
- [ ] 텔레그램 SDK 초기화
- [ ] Canvas 360x640 생성
- [ ] 배경색 적용
- [ ] 렌더링 루프 60 FPS
- [ ] 사용자 정보 표시

### 💻 구현 파일

#### `index.html`
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Canvas 실습 - Telegram WebApp</title>
  
  <!-- Telegram Web App SDK -->
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      background: #0a0a1a;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
      /* 텔레그램 배경색 사용 */
      background-color: var(--tg-theme-bg-color, #0a0a1a);
    }
    
    #gameCanvas {
      border: 2px solid var(--tg-theme-hint-color, #333);
      background: #1a1a2e;
      touch-action: none; /* 모바일 터치 최적화 */
      max-width: 100%;
      max-height: 100vh;
    }
    
    #info {
      position: fixed;
      top: 10px;
      left: 10px;
      color: var(--tg-theme-text-color, #fff);
      font-size: 12px;
      background: rgba(0, 0, 0, 0.5);
      padding: 10px;
      border-radius: 5px;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div id="info">Loading...</div>
  <canvas id="gameCanvas"></canvas>
  
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

#### `src/telegram/TelegramAPI.js`
```javascript
/**
 * 텔레그램 WebApp API 래퍼 클래스
 */
export class TelegramAPI {
  constructor() {
    this.tg = window.Telegram.WebApp;
    this.user = null;
    this.initData = null;
    
    this.init();
  }

  init() {
    // 텔레그램 WebApp 초기화
    this.tg.ready();
    
    // 전체 화면으로 확장
    this.tg.expand();
    
    // 사용자 정보 저장
    this.user = this.tg.initDataUnsafe?.user || null;
    this.initData = this.tg.initDataUnsafe;
    
    // 테마 색상 적용
    this.applyTheme();
    
    console.log('[Telegram] 초기화 완료');
    console.log('[Telegram] User:', this.user);
  }

  applyTheme() {
    // 텔레그램 테마 색상을 CSS 변수로 적용
    document.documentElement.style.setProperty(
      '--tg-theme-bg-color',
      this.tg.themeParams.bg_color || '#0a0a1a'
    );
    document.documentElement.style.setProperty(
      '--tg-theme-text-color',
      this.tg.themeParams.text_color || '#ffffff'
    );
    document.documentElement.style.setProperty(
      '--tg-theme-hint-color',
      this.tg.themeParams.hint_color || '#999999'
    );
  }

  getUserInfo() {
    if (!this.user) {
      return {
        id: 'guest',
        firstName: 'Guest',
        username: 'guest'
      };
    }
    
    return {
      id: this.user.id,
      firstName: this.user.first_name,
      lastName: this.user.last_name || '',
      username: this.user.username || '',
      languageCode: this.user.language_code || 'ko'
    };
  }

  showAlert(message) {
    this.tg.showAlert(message);
  }

  showConfirm(message, callback) {
    this.tg.showConfirm(message, callback);
  }

  // MainButton 제어
  showMainButton(text, callback) {
    this.tg.MainButton.setText(text);
    this.tg.MainButton.show();
    this.tg.MainButton.onClick(callback);
  }

  hideMainButton() {
    this.tg.MainButton.hide();
  }

  // HapticFeedback (진동)
  hapticFeedback(type = 'impact') {
    // type: 'impact', 'notification', 'selection'
    if (this.tg.HapticFeedback) {
      this.tg.HapticFeedback.impactOccurred(type);
    }
  }

  // 앱 닫기
  close() {
    this.tg.close();
  }
}
```

#### `src/utils/constants.js`
```javascript
// Canvas 크기
export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 640;

// 타일 설정
export const TILE_SIZE = 60;
export const GRID_COLS = 6;
export const GRID_ROWS = 10;
export const UI_HEIGHT = 80;  // 상단 UI 영역

// 색상
export const COLORS = {
  BACKGROUND: '#1a1a2e',
  GRID_LINE: '#333',
  TILE_EMPTY: '#2a2a3e',
  TILE_HOVER: '#3a3a4e',
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: '#999'
};

// 성능
export const TARGET_FPS = 60;

// 디버그
export const DEBUG = {
  ENABLED: true,
  SHOW_FPS: true,
  SHOW_USER_INFO: true
};
```

#### `src/core/CanvasRenderer.js`
```javascript
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../utils/constants.js';

export class CanvasRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
  }

  setupCanvas() {
    // 캔버스 크기 설정
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    
    // 모바일 디바이스 DPR 대응
    const dpr = window.devicePixelRatio || 1;
    if (dpr > 1) {
      this.canvas.style.width = CANVAS_WIDTH + 'px';
      this.canvas.style.height = CANVAS_HEIGHT + 'px';
      this.canvas.width = CANVAS_WIDTH * dpr;
      this.canvas.height = CANVAS_HEIGHT * dpr;
      this.ctx.scale(dpr, dpr);
    }
    
    // 이미지 스무딩 비활성화 (픽셀 아트용)
    this.ctx.imageSmoothingEnabled = false;
    
    console.log('[Renderer] Canvas 초기화 완료');
  }

  clear() {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  render() {
    this.clear();
    
    // 테스트: 테두리 그리기
    this.ctx.strokeStyle = '#4a90e2';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(10, 10, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 20);
    
    // 테스트: 텍스트 출력
    this.ctx.fillStyle = COLORS.TEXT_PRIMARY;
    this.ctx.font = '20px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Canvas 준비 완료!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    this.ctx.font = '14px sans-serif';
    this.ctx.fillStyle = COLORS.TEXT_SECONDARY;
    this.ctx.fillText('텔레그램 WebApp 연동 성공', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
  }
}
```

#### `src/main.js`
```javascript
import { TelegramAPI } from './telegram/TelegramAPI.js';
import { CanvasRenderer } from './core/CanvasRenderer.js';
import { TARGET_FPS, DEBUG } from './utils/constants.js';

class Game {
  constructor() {
    // 텔레그램 API 초기화
    this.telegram = new TelegramAPI();
    
    // 렌더러 초기화
    this.renderer = new CanvasRenderer('gameCanvas');
    
    // 게임 루프
    this.lastTime = 0;
    this.frameTime = 1000 / TARGET_FPS;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsUpdateTime = 0;
    
    // 사용자 정보 표시
    this.updateInfoPanel();
  }

  updateInfoPanel() {
    const info = document.getElementById('info');
    const user = this.telegram.getUserInfo();
    
    if (DEBUG.ENABLED) {
      info.innerHTML = `
        <strong>Telegram WebApp</strong><br>
        User: ${user.firstName} ${user.lastName}<br>
        ID: ${user.id}<br>
        ${DEBUG.SHOW_FPS ? 'FPS: <span id="fps">60</span>' : ''}
      `;
    } else {
      info.style.display = 'none';
    }
  }

  start() {
    console.log('[Game] 게임 시작!');
    console.log('[Game] 사용자:', this.telegram.getUserInfo());
    
    // 시작 햅틱 피드백
    this.telegram.hapticFeedback('impact');
    
    requestAnimationFrame(this.tick.bind(this));
  }

  tick(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= this.frameTime) {
      this.lastTime = currentTime - (deltaTime % this.frameTime);
      
      // 렌더링
      this.renderer.render();
      
      // FPS 계산
      if (DEBUG.SHOW_FPS) {
        this.updateFPS(currentTime);
      }
    }
    
    requestAnimationFrame(this.tick.bind(this));
  }

  updateFPS(currentTime) {
    this.frameCount++;
    
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
      
      const fpsElement = document.getElementById('fps');
      if (fpsElement) {
        fpsElement.textContent = this.fps;
      }
    }
  }
}

// 게임 시작 (DOM 로드 후)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.start();
  });
} else {
  const game = new Game();
  game.start();
}
```

### ✅ 완료 기준
- [ ] 텔레그램 봇에서 WebApp 실행
- [ ] Canvas 360x640 표시
- [ ] 사용자 정보 표시 (이름, ID)
- [ ] FPS 카운터 표시
- [ ] 콘솔에 로그 출력

### 🎓 학습 포인트
- 텔레그램 WebApp SDK 사용법
- Canvas + 텔레그램 통합
- 모바일 DPR 처리
- 햅틱 피드백 사용

---

## 📆 Day 3-4: 타일 그리드 + 터치 이벤트

### 🎯 목표
- 6x10 타일 그리드 구현
- 터치/마우스 이벤트 처리
- 텔레그램 햅틱 피드백 연동

### 📝 작업 체크리스트

#### 1. 파일 추가
- [ ] `src/components/TileGrid.js` - 타일 그리드
- [ ] `src/utils/helpers.js` - 좌표 변환
- [ ] `src/utils/InputHandler.js` - 통합 입력 처리

#### 2. 기능 구현
- [ ] 타일 그리드 렌더링
- [ ] 터치/마우스 통합 처리
- [ ] 타일 호버/탭 효과
- [ ] 햅틱 피드백

### 💻 구현 파일

#### `src/utils/InputHandler.js`
```javascript
/**
 * 마우스/터치 이벤트 통합 처리
 */
export class InputHandler {
  constructor(canvas, telegram) {
    this.canvas = canvas;
    this.telegram = telegram;
    this.handlers = {
      down: [],
      move: [],
      up: []
    };
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 마우스 이벤트
    this.canvas.addEventListener('mousedown', this.onPointerDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onPointerMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onPointerUp.bind(this));
    
    // 터치 이벤트
    this.canvas.addEventListener('touchstart', this.onPointerDown.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.onPointerMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.onPointerUp.bind(this), { passive: false });
  }

  getPointerPosition(e) {
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    let x, y;
    
    if (e.touches) {
      // 터치 이벤트
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // 마우스 이벤트
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    return { x, y };
  }

  onPointerDown(e) {
    const pos = this.getPointerPosition(e);
    this.handlers.down.forEach(handler => handler(pos));
    
    // 햅틱 피드백
    this.telegram.hapticFeedback('impact');
  }

  onPointerMove(e) {
    const pos = this.getPointerPosition(e);
    this.handlers.move.forEach(handler => handler(pos));
  }

  onPointerUp(e) {
    const pos = this.getPointerPosition(e);
    this.handlers.up.forEach(handler => handler(pos));
  }

  on(eventType, handler) {
    if (this.handlers[eventType]) {
      this.handlers[eventType].push(handler);
    }
  }

  off(eventType, handler) {
    if (this.handlers[eventType]) {
      const index = this.handlers[eventType].indexOf(handler);
      if (index > -1) {
        this.handlers[eventType].splice(index, 1);
      }
    }
  }
}
```

#### `src/main.js` (업데이트)
```javascript
import { TelegramAPI } from './telegram/TelegramAPI.js';
import { CanvasRenderer } from './core/CanvasRenderer.js';
import { TileGrid } from './components/TileGrid.js';
import { InputHandler } from './utils/InputHandler.js';
import { screenToGrid, isValidGridPosition } from './utils/helpers.js';
import { TARGET_FPS, DEBUG } from './utils/constants.js';

class Game {
  constructor() {
    // 텔레그램 API 초기화
    this.telegram = new TelegramAPI();
    
    // 렌더러 초기화
    this.renderer = new CanvasRenderer('gameCanvas');
    
    // 타일 그리드
    this.tileGrid = new TileGrid();
    
    // 입력 처리
    this.inputHandler = new InputHandler(this.renderer.canvas, this.telegram);
    this.setupInputHandlers();
    
    // 게임 루프
    this.lastTime = 0;
    this.frameTime = 1000 / TARGET_FPS;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsUpdateTime = 0;
    
    // 사용자 정보 표시
    this.updateInfoPanel();
  }

  setupInputHandlers() {
    // 포인터 이동 (호버/터치)
    this.inputHandler.on('move', (pos) => {
      const { col, row } = screenToGrid(pos.x, pos.y);
      
      if (isValidGridPosition(col, row)) {
        this.tileGrid.setHoveredTile(col, row);
      } else {
        this.tileGrid.clearHover();
      }
    });

    // 포인터 다운 (클릭/탭)
    this.inputHandler.on('down', (pos) => {
      const { col, row } = screenToGrid(pos.x, pos.y);
      
      if (isValidGridPosition(col, row)) {
        console.log('[Input] 타일 선택:', col, row);
        // TODO: 타일 선택 로직
      }
    });
  }

  updateInfoPanel() {
    const info = document.getElementById('info');
    const user = this.telegram.getUserInfo();
    
    if (DEBUG.ENABLED) {
      info.innerHTML = `
        <strong>🎮 Tavern Defense</strong><br>
        👤 ${user.firstName}<br>
        ${DEBUG.SHOW_FPS ? '⚡ <span id="fps">60</span> FPS' : ''}
      `;
    } else {
      info.style.display = 'none';
    }
  }

  start() {
    console.log('[Game] 게임 시작!');
    this.telegram.hapticFeedback('impact');
    requestAnimationFrame(this.tick.bind(this));
  }

  tick(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= this.frameTime) {
      this.lastTime = currentTime - (deltaTime % this.frameTime);
      this.render();
      
      if (DEBUG.SHOW_FPS) {
        this.updateFPS(currentTime);
      }
    }
    
    requestAnimationFrame(this.tick.bind(this));
  }

  render() {
    this.renderer.clear();
    this.tileGrid.render(this.renderer.ctx);
  }

  updateFPS(currentTime) {
    this.frameCount++;
    
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
      
      const fpsElement = document.getElementById('fps');
      if (fpsElement) {
        fpsElement.textContent = this.fps;
      }
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.start();
  });
} else {
  const game = new Game();
  game.start();
}
```

### ✅ 완료 기준
- [ ] 6x10 그리드 표시
- [ ] 터치/마우스 모두 동작
- [ ] 타일 탭 시 햅틱 피드백
- [ ] 모바일에서 정상 동작

---

## 📆 Day 5: 드래그 앤 드롭 + CloudStorage

### 🎯 목표
- 드래그 앤 드롭 구현
- 텔레그램 CloudStorage에 데이터 저장
- 저장/불러오기 테스트

### 💻 구현 파일

#### `src/telegram/CloudStorage.js`
```javascript
/**
 * 텔레그램 CloudStorage 래퍼
 */
export class CloudStorage {
  constructor(telegram) {
    this.tg = telegram.tg;
  }

  async save(key, value) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(value);
      
      this.tg.CloudStorage.setItem(key, data, (error, success) => {
        if (error) {
          console.error('[Storage] 저장 실패:', error);
          reject(error);
        } else {
          console.log('[Storage] 저장 성공:', key);
          resolve(success);
        }
      });
    });
  }

  async load(key) {
    return new Promise((resolve, reject) => {
      this.tg.CloudStorage.getItem(key, (error, value) => {
        if (error) {
          console.error('[Storage] 불러오기 실패:', error);
          reject(error);
        } else {
          console.log('[Storage] 불러오기 성공:', key);
          const data = value ? JSON.parse(value) : null;
          resolve(data);
        }
      });
    });
  }

  async remove(key) {
    return new Promise((resolve, reject) => {
      this.tg.CloudStorage.removeItem(key, (error, success) => {
        if (error) {
          reject(error);
        } else {
          resolve(success);
        }
      });
    });
  }
}
```

---

## 🎯 Week 1 종합 체크리스트

### 파일 구조
```
canvas-tavern-defense/
├── index.html
├── src/
│   ├── main.js
│   ├── core/
│   │   └── CanvasRenderer.js
│   ├── components/
│   │   └── TileGrid.js
│   ├── telegram/
│   │   ├── TelegramAPI.js
│   │   └── CloudStorage.js
│   └── utils/
│       ├── constants.js
│       ├── helpers.js
│       └── InputHandler.js
└── docs/
    ├── RENDERING_GUIDE.md
    ├── CODING_CONVENTION.md
    └── WEEK1_PLAN_TELEGRAM.md
```

### 완성도 체크
- [ ] 텔레그램 봇에서 정상 실행
- [ ] Canvas 렌더링 정상
- [ ] 터치/마우스 입력 처리
- [ ] 햅틱 피드백 동작
- [ ] CloudStorage 저장/로드
- [ ] 코딩 컨벤션 준수
- [ ] GitHub Actions 배포 성공

### Git 커밋 기록
```bash
git commit -m "[Day1] 텔레그램 WebApp 초기 설정"
git commit -m "[Day2] Canvas 렌더러 및 FPS 카운터"
git commit -m "[Day3] 타일 그리드 렌더링"
git commit -m "[Day4] 터치/마우스 입력 통합"
git commit -m "[Day5] CloudStorage 연동"
```

---

## 🚀 배포 및 테스트

### GitHub Actions 워크플로우
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

### 배포 후 테스트
1. GitHub Actions 실행 확인
2. Pages URL 접속: https://슬뚜계정.github.io/canvas-tavern-defense/
3. 텔레그램 봇 Menu Button 클릭
4. WebApp 정상 실행 확인

---

## 💡 텔레그램 디버깅 팁

### 로컬 테스트 (ngrok)
```bash
# ngrok 설치 후
ngrok http 8000

# 임시 URL을 봇에 등록
# 예: https://abc123.ngrok.io
```

### 콘솔 로그 확인
```javascript
// 텔레그램 앱 내 디버깅
window.Telegram.WebApp.version
window.Telegram.WebApp.platform
window.Telegram.WebApp.isExpanded
```

---

**작성일**: 2025-01-11  
**버전**: 2.0 (텔레그램 통합)  
**담당**: 슬뚜  
**지원**: Claude CLI
