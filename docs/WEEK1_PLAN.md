# 📅 Week 1 실습 계획서

> Canvas 렌더링 기초 + 타일 시스템  
> 작성일: 2025-01-11  
> 담당: 슬뚜

---

## 🎯 Week 1 목표

```
✅ Canvas 초기화 및 기본 설정
✅ 타일 그리드 렌더링 (6x10)
✅ 마우스 이벤트 처리 (클릭, 호버)
✅ 드래그 앤 드롭 시각적 피드백
```

---

## 📆 Day 1-2: Canvas 기본 설정

### 🎯 목표
- Canvas 초기화 및 좌표계 이해
- 렌더링 루프 구현 (60 FPS)
- 기본 도형 그리기 (배경, 테두리)

### 📝 작업 체크리스트

#### 1. 프로젝트 초기화
- [ ] 개인 GitHub 저장소 생성 (`canvas-tavern-defense`)
- [ ] 로컬에 클론
- [ ] 기본 폴더 구조 생성

#### 2. 파일 생성
- [ ] `index.html` - 테스트 페이지
- [ ] `src/utils/constants.js` - 게임 상수
- [ ] `src/core/CanvasRenderer.js` - 렌더러
- [ ] `src/main.js` - 진입점

#### 3. 기능 구현
- [ ] Canvas 360x640 생성
- [ ] 배경색 #1a1a2e 적용
- [ ] 렌더링 루프 60 FPS
- [ ] 테두리 그리기

### 💻 구현 파일

#### `index.html`
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canvas 실습 - Day 1</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #0a0a1a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    #gameCanvas {
      border: 2px solid #333;
      background: #1a1a2e;
    }
  </style>
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
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
    
    // 이미지 스무딩 비활성화 (픽셀 아트용)
    this.ctx.imageSmoothingEnabled = false;
  }

  clear() {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
  }
}
```

#### `src/main.js`
```javascript
import { CanvasRenderer } from './core/CanvasRenderer.js';
import { TARGET_FPS } from './utils/constants.js';

class Game {
  constructor() {
    this.renderer = new CanvasRenderer('gameCanvas');
    this.lastTime = 0;
    this.frameTime = 1000 / TARGET_FPS;
  }

  start() {
    console.log('게임 시작!');
    requestAnimationFrame(this.tick.bind(this));
  }

  tick(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= this.frameTime) {
      this.lastTime = currentTime - (deltaTime % this.frameTime);
      this.renderer.render();
    }
    
    requestAnimationFrame(this.tick.bind(this));
  }
}

// 게임 시작
const game = new Game();
game.start();
```

### ✅ 완료 기준
- [ ] 브라우저에서 Canvas 표시
- [ ] 배경색이 올바르게 적용
- [ ] 테두리와 텍스트 표시
- [ ] 콘솔에 "게임 시작!" 출력

### 🎓 학습 포인트
- Canvas 2D context API
- requestAnimationFrame 동작 원리
- 좌표계 (0,0이 좌상단)
- FPS 계산 방식

---

## 📆 Day 3-4: 타일 그리드 렌더링

### 🎯 목표
- 6x10 타일 그리드 구현
- 마우스 이벤트 처리 (호버)
- 타일 상태 관리

### 📝 작업 체크리스트

#### 1. 파일 추가
- [ ] `src/components/TileGrid.js` - 타일 그리드 클래스
- [ ] `src/utils/helpers.js` - 좌표 변환 함수

#### 2. 기능 구현
- [ ] 타일 그리드 초기화
- [ ] 그리드 선 렌더링
- [ ] 타일 호버 효과
- [ ] 좌표 변환 (screen ↔ grid)

### 💻 구현 파일

#### `src/utils/helpers.js`
```javascript
import { TILE_SIZE, UI_HEIGHT } from './constants.js';

/**
 * 그리드 좌표 → 화면 좌표 (타일 좌상단)
 */
export function gridToScreen(col, row) {
  return {
    x: col * TILE_SIZE,
    y: row * TILE_SIZE + UI_HEIGHT
  };
}

/**
 * 그리드 좌표 → 화면 좌표 (타일 중심)
 */
export function gridToScreenCenter(col, row) {
  const halfTile = TILE_SIZE / 2;
  return {
    x: col * TILE_SIZE + halfTile,
    y: row * TILE_SIZE + halfTile + UI_HEIGHT
  };
}

/**
 * 화면 좌표 → 그리드 좌표
 */
export function screenToGrid(x, y) {
  const adjustedY = y - UI_HEIGHT;
  return {
    col: Math.floor(x / TILE_SIZE),
    row: Math.floor(adjustedY / TILE_SIZE)
  };
}

/**
 * 그리드 범위 검증
 */
export function isValidGridPosition(col, row) {
  return col >= 0 && col < 6 && row >= 0 && row < 10;
}

/**
 * 그리드 인덱스 변환
 */
export function gridToIndex(col, row) {
  return row * 6 + col;
}

export function indexToGrid(index) {
  return {
    col: index % 6,
    row: Math.floor(index / 6)
  };
}
```

#### `src/components/TileGrid.js`
```javascript
import { GRID_COLS, GRID_ROWS, TILE_SIZE, UI_HEIGHT, COLORS } from '../utils/constants.js';
import { gridToScreen } from '../utils/helpers.js';

export class TileGrid {
  constructor() {
    this.tiles = this.initializeTiles();
    this.hoveredTile = null;
  }

  initializeTiles() {
    const tiles = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        tiles.push({
          col,
          row,
          isEmpty: true,
          building: null
        });
      }
    }
    return tiles;
  }

  setHoveredTile(col, row) {
    this.hoveredTile = { col, row };
  }

  clearHover() {
    this.hoveredTile = null;
  }

  render(ctx) {
    this.renderGridLines(ctx);
    this.renderTiles(ctx);
  }

  renderGridLines(ctx) {
    ctx.strokeStyle = COLORS.GRID_LINE;
    ctx.lineWidth = 1;

    // 가로 선
    for (let row = 0; row <= GRID_ROWS; row++) {
      const y = UI_HEIGHT + row * TILE_SIZE;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GRID_COLS * TILE_SIZE, y);
      ctx.stroke();
    }

    // 세로 선
    for (let col = 0; col <= GRID_COLS; col++) {
      const x = col * TILE_SIZE;
      ctx.beginPath();
      ctx.moveTo(x, UI_HEIGHT);
      ctx.lineTo(x, UI_HEIGHT + GRID_ROWS * TILE_SIZE);
      ctx.stroke();
    }
  }

  renderTiles(ctx) {
    this.tiles.forEach(tile => {
      const { x, y } = gridToScreen(tile.col, tile.row);
      
      // 호버 상태 확인
      const isHovered = this.hoveredTile &&
        this.hoveredTile.col === tile.col &&
        this.hoveredTile.row === tile.row;

      // 타일 배경
      ctx.fillStyle = isHovered ? COLORS.TILE_HOVER : COLORS.TILE_EMPTY;
      ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    });
  }
}
```

#### `src/main.js` (수정)
```javascript
import { CanvasRenderer } from './core/CanvasRenderer.js';
import { TileGrid } from './components/TileGrid.js';
import { TARGET_FPS } from './utils/constants.js';
import { screenToGrid, isValidGridPosition } from './utils/helpers.js';

class Game {
  constructor() {
    this.renderer = new CanvasRenderer('gameCanvas');
    this.tileGrid = new TileGrid();
    this.lastTime = 0;
    this.frameTime = 1000 / TARGET_FPS;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.renderer.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
  }

  onMouseMove(e) {
    const rect = this.renderer.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { col, row } = screenToGrid(x, y);
    
    if (isValidGridPosition(col, row)) {
      this.tileGrid.setHoveredTile(col, row);
    } else {
      this.tileGrid.clearHover();
    }
  }

  onMouseLeave() {
    this.tileGrid.clearHover();
  }

  start() {
    console.log('게임 시작!');
    requestAnimationFrame(this.tick.bind(this));
  }

  tick(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= this.frameTime) {
      this.lastTime = currentTime - (deltaTime % this.frameTime);
      this.render();
    }
    
    requestAnimationFrame(this.tick.bind(this));
  }

  render() {
    this.renderer.clear();
    this.tileGrid.render(this.renderer.ctx);
  }
}

const game = new Game();
game.start();
```

### ✅ 완료 기준
- [ ] 6x10 그리드 선 표시
- [ ] 마우스 올리면 타일 색상 변경
- [ ] 그리드 밖으로 나가면 호버 해제
- [ ] 콘솔 에러 없음

### 🎓 학습 포인트
- 좌표 변환 로직
- 마우스 이벤트 처리
- 상태 기반 렌더링
- Canvas 좌표 계산

---

## 📆 Day 5: 드래그 앤 드롭

### 🎯 목표
- 타일 클릭 감지
- 드래그 시작/이동/종료 처리
- 드롭 가능 영역 시각화

### 📝 작업 체크리스트

#### 1. 파일 추가
- [ ] `src/utils/DragDrop.js` - 드래그 앤 드롭 핸들러

#### 2. 기능 구현
- [ ] 타일 클릭 감지
- [ ] 드래그 아이템 추적
- [ ] 드롭 가능 영역 하이라이트
- [ ] 유효성 검사

### 💻 구현 파일

#### `src/utils/DragDrop.js`
```javascript
import { screenToGrid, isValidGridPosition } from './helpers.js';
import { COLORS } from './constants.js';

export class DragDrop {
  constructor(canvas, tileGrid) {
    this.canvas = canvas;
    this.tileGrid = tileGrid;
    this.draggedItem = null;
    this.isDragging = false;
    this.mousePos = { x: 0, y: 0 };
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { col, row } = screenToGrid(x, y);
    
    if (isValidGridPosition(col, row)) {
      // 테스트: 빈 타일에서 드래그 시작
      this.isDragging = true;
      this.draggedItem = {
        type: 'test',
        startCol: col,
        startRow: row
      };
      console.log('드래그 시작:', col, row);
    }
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (this.isDragging) {
      const { col, row } = screenToGrid(this.mousePos.x, this.mousePos.y);
      
      // 드롭 가능 영역 업데이트
      if (isValidGridPosition(col, row)) {
        this.tileGrid.setHoveredTile(col, row);
      }
    }
  }

  onMouseUp(e) {
    if (this.isDragging) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const { col, row } = screenToGrid(x, y);
      
      if (isValidGridPosition(col, row)) {
        console.log('드롭 완료:', col, row);
        // TODO: 실제 타일 배치 로직
      }
      
      this.isDragging = false;
      this.draggedItem = null;
    }
  }

  render(ctx) {
    if (this.isDragging && this.draggedItem) {
      // 드래그 중인 아이템 표시 (반투명 박스)
      ctx.fillStyle = 'rgba(74, 144, 226, 0.5)';
      ctx.fillRect(
        this.mousePos.x - 30,
        this.mousePos.y - 30,
        60, 60
      );
      
      // 텍스트
      ctx.fillStyle = COLORS.TEXT_PRIMARY;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Drag', this.mousePos.x, this.mousePos.y);
    }
  }
}
```

#### `src/main.js` (수정)
```javascript
// ... (이전 import)
import { DragDrop } from './utils/DragDrop.js';

class Game {
  constructor() {
    this.renderer = new CanvasRenderer('gameCanvas');
    this.tileGrid = new TileGrid();
    this.dragDrop = new DragDrop(this.renderer.canvas, this.tileGrid);
    // ...
  }

  render() {
    this.renderer.clear();
    this.tileGrid.render(this.renderer.ctx);
    this.dragDrop.render(this.renderer.ctx);  // 드래그 아이템 렌더링
  }
}
```

### ✅ 완료 기준
- [ ] 타일 클릭 시 드래그 시작
- [ ] 마우스 따라 반투명 박스 표시
- [ ] 드롭 시 콘솔에 좌표 출력
- [ ] 그리드 밖 드롭 시 무시

### 🎓 학습 포인트
- 마우스 이벤트 체이닝
- 상태 기반 렌더링
- 반투명 그리기 (alpha)
- 좌표 검증

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
│   └── utils/
│       ├── constants.js
│       ├── helpers.js
│       └── DragDrop.js
└── docs/
    ├── RENDERING_GUIDE.md
    ├── CODING_CONVENTION.md
    └── WEEK1_PLAN.md
```

### 완성도 체크
- [ ] Canvas 360x640 정상 표시
- [ ] 6x10 그리드 렌더링
- [ ] 타일 호버 효과 동작
- [ ] 드래그 앤 드롭 구현
- [ ] 코딩 컨벤션 준수
- [ ] 주석 적절히 작성
- [ ] Git 커밋 이력 정리

### Git 커밋 기록
```bash
git commit -m "[Day1] Canvas 초기화 및 렌더링 루프 구현"
git commit -m "[Day2] 좌표 변환 헬퍼 함수 추가"
git commit -m "[Day3] 타일 그리드 렌더링 구현"
git commit -m "[Day4] 마우스 호버 이벤트 처리"
git commit -m "[Day5] 드래그 앤 드롭 기본 구현"
```

---

## 📚 다음 주 준비

### Week 2 예고
- 건물 렌더링 (레벨별 색상)
- 간단한 애니메이션 (깜빡임)
- UI 컴포넌트 (버튼, 패널)

### 미리 읽어볼 자료
- MDN Canvas Animation: https://developer.mozilla.org/ko/docs/Web/API/Canvas_API/Tutorial/Basic_animations
- requestAnimationFrame 심화

---

## 💡 막힐 때 참고

### 자주 발생하는 문제

**1. Canvas 안 보임**
```javascript
// 해결: CSS로 크기 확인
#gameCanvas { border: 2px solid red; }
```

**2. 호버 안 먹힘**
```javascript
// 해결: 좌표 변환 확인
console.log('Mouse:', x, y);
console.log('Grid:', col, row);
```

**3. 드래그 버벅임**
```javascript
// 해결: 렌더링 루프 확인
console.log('FPS:', Math.round(1000 / deltaTime));
```

---

## 🎓 학습 자료

- **MDN Canvas Tutorial**: https://developer.mozilla.org/ko/docs/Web/API/Canvas_API/Tutorial
- **프로젝트 문서**: `RENDERING_GUIDE.md`
- **코딩 규칙**: `CODING_CONVENTION.md`

---

**작성일**: 2025-01-11  
**버전**: 1.0  
**담당**: 슬뚜  
**지원**: Claude CLI
