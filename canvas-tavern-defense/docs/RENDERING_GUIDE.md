# 🎨 Canvas 렌더링 가이드

> HIMITU 프로젝트 렌더링 시스템 핵심 규칙  
> 작성일: 2025-01-11  
> 참조: D-G-004, D-G-016

---

## 📐 Canvas 기본 설정

### 화면 크기
```javascript
const CANVAS_CONFIG = {
  WIDTH: 360,    // 논리적 너비 (모바일 세로 기준)
  HEIGHT: 640,   // 논리적 높이
  TILE_SIZE: 60, // 타일 크기 (픽셀)
  GRID_COLS: 6,  // 그리드 열 수
  GRID_ROWS: 10  // 그리드 행 수
};
```

### 배경색
```javascript
const COLORS = {
  BACKGROUND: '#1a1a2e',     // 게임 배경
  GRID_LINE: '#333',         // 그리드 선
  TILE_EMPTY: '#2a2a3e',     // 빈 타일
  TILE_HOVER: '#3a3a4e',     // 호버 타일
  TEXT_PRIMARY: '#fff',      // 주 텍스트
  TEXT_SECONDARY: '#999'     // 부 텍스트
};
```

---

## 🗺️ 좌표계

### 좌표 원점
```
(0, 0) ──────────────► X (col)
  │
  │
  ▼
  Y (row)

• 원점: 좌상단
• X축: 오른쪽으로 증가 (0~5)
• Y축: 아래로 증가 (0~9)
```

### 좌표 변환 함수
```javascript
// 그리드 좌표 → 화면 픽셀 (타일 좌상단)
function gridToScreen(col, row) {
  return {
    x: col * CANVAS_CONFIG.TILE_SIZE,
    y: row * CANVAS_CONFIG.TILE_SIZE + 80  // 상단 UI 영역 80px
  };
}

// 그리드 좌표 → 화면 픽셀 (타일 중심)
function gridToScreenCenter(col, row) {
  const halfTile = CANVAS_CONFIG.TILE_SIZE / 2;
  return {
    x: col * CANVAS_CONFIG.TILE_SIZE + halfTile,
    y: row * CANVAS_CONFIG.TILE_SIZE + halfTile + 80
  };
}

// 화면 픽셀 → 그리드 좌표
function screenToGrid(x, y) {
  const adjustedY = y - 80; // UI 영역 제외
  return {
    col: Math.floor(x / CANVAS_CONFIG.TILE_SIZE),
    row: Math.floor(adjustedY / CANVAS_CONFIG.TILE_SIZE)
  };
}

// 그리드 범위 검증
function isValidGridPosition(col, row) {
  return col >= 0 && col < 6 && row >= 0 && row < 10;
}
```

---

## 🎭 레이어 구조

### 렌더링 순서 (뒤 → 앞)
```
Layer 0: 배경 (Background)
    ↓
Layer 1: 그리드 선 (Grid Lines)
    ↓
Layer 2: 빈 타일 (Empty Tiles)
    ↓
Layer 3: 건물 (Buildings)
    ↓
Layer 4: 특수 타일 (Hearth, Player)
    ↓
Layer 5: 손님 (Guests)
    ↓
Layer 6: 몬스터 (Monsters)
    ↓
Layer 7: 공격 이펙트 (Attack Effects)
    ↓
Layer 8: 파티클 (Particles)
    ↓
Layer 9: 체력바 (HP Bars)
    ↓
Layer 10: UI 패널 (Panels)
    ↓
Layer 11: 버튼 (Buttons)
    ↓
Layer 12: 오버레이 (Overlay)
```

---

## 🔄 렌더링 루프

### 기본 구조
```javascript
class CanvasRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
  }

  setupCanvas() {
    // 캔버스 크기 설정
    this.canvas.width = CANVAS_CONFIG.WIDTH;
    this.canvas.height = CANVAS_CONFIG.HEIGHT;
    
    // 이미지 스무딩 비활성화 (픽셀 아트)
    this.ctx.imageSmoothingEnabled = false;
  }

  render() {
    // 1. 화면 클리어
    this.clear();
    
    // 2. 레이어별 렌더링
    this.renderBackground();
    this.renderGrid();
    this.renderTiles();
    this.renderBuildings();
    this.renderCharacters();
    this.renderEffects();
    this.renderUI();
  }

  clear() {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
```

### 60 FPS 루프
```javascript
class GameLoop {
  constructor(renderer) {
    this.renderer = renderer;
    this.lastTime = 0;
    this.targetFPS = 60;
    this.frameTime = 1000 / this.targetFPS;
  }

  start() {
    requestAnimationFrame(this.tick.bind(this));
  }

  tick(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= this.frameTime) {
      this.lastTime = currentTime - (deltaTime % this.frameTime);
      
      // 렌더링
      this.renderer.render();
    }
    
    requestAnimationFrame(this.tick.bind(this));
  }
}
```

---

## 🎨 레이어별 렌더링 예시

### Layer 0: 배경
```javascript
renderBackground() {
  this.ctx.fillStyle = COLORS.BACKGROUND;
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
}
```

### Layer 1: 그리드
```javascript
renderGrid() {
  this.ctx.strokeStyle = COLORS.GRID_LINE;
  this.ctx.lineWidth = 1;
  
  const startY = 80; // UI 영역 제외
  
  for (let row = 0; row <= CANVAS_CONFIG.GRID_ROWS; row++) {
    const y = startY + row * CANVAS_CONFIG.TILE_SIZE;
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(this.canvas.width, y);
    this.ctx.stroke();
  }
  
  for (let col = 0; col <= CANVAS_CONFIG.GRID_COLS; col++) {
    const x = col * CANVAS_CONFIG.TILE_SIZE;
    this.ctx.beginPath();
    this.ctx.moveTo(x, startY);
    this.ctx.lineTo(x, this.canvas.height);
    this.ctx.stroke();
  }
}
```

### Layer 2: 빈 타일
```javascript
renderTiles(tiles) {
  tiles.forEach((tile, index) => {
    if (tile.isEmpty) {
      const col = index % CANVAS_CONFIG.GRID_COLS;
      const row = Math.floor(index / CANVAS_CONFIG.GRID_COLS);
      const { x, y } = gridToScreen(col, row);
      
      // 타일 배경
      this.ctx.fillStyle = tile.isHovered ? 
        COLORS.TILE_HOVER : COLORS.TILE_EMPTY;
      this.ctx.fillRect(x, y, CANVAS_CONFIG.TILE_SIZE, CANVAS_CONFIG.TILE_SIZE);
      
      // 타일 테두리
      this.ctx.strokeStyle = COLORS.GRID_LINE;
      this.ctx.strokeRect(x, y, CANVAS_CONFIG.TILE_SIZE, CANVAS_CONFIG.TILE_SIZE);
    }
  });
}
```

### Layer 3: 건물
```javascript
renderBuildings(tiles) {
  tiles.forEach((tile, index) => {
    if (!tile.isEmpty && tile.building) {
      const col = index % CANVAS_CONFIG.GRID_COLS;
      const row = Math.floor(index / CANVAS_CONFIG.GRID_COLS);
      const { x, y } = gridToScreenCenter(col, row);
      
      // 건물 렌더링 (임시: 색상 박스)
      const building = tile.building;
      this.ctx.fillStyle = building.color || '#4a90e2';
      this.ctx.fillRect(
        x - 25, y - 25, 
        50, 50
      );
      
      // 레벨 표시
      this.ctx.fillStyle = COLORS.TEXT_PRIMARY;
      this.ctx.font = '14px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(`Lv.${building.level}`, x, y);
    }
  });
}
```

---

## 🖱️ 이벤트 처리

### 마우스 이벤트
```javascript
class InputHandler {
  constructor(canvas, renderer) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('click', this.onClick.bind(this));
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { col, row } = screenToGrid(x, y);
    
    if (isValidGridPosition(col, row)) {
      // 호버 상태 업데이트
      this.updateHoverState(col, row);
    }
  }

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { col, row } = screenToGrid(x, y);
    
    if (isValidGridPosition(col, row)) {
      // 타일 클릭 처리
      this.handleTileClick(col, row);
    }
  }
}
```

---

## ⚡ 최적화 기법

### 1. 더티 플래그
```javascript
class OptimizedRenderer {
  constructor() {
    this.dirtyFlags = {
      background: false,
      grid: false,
      tiles: true,  // 항상 리렌더
      ui: false
    };
  }

  setDirty(flag) {
    this.dirtyFlags[flag] = true;
  }

  render() {
    if (this.dirtyFlags.background) {
      this.renderBackground();
      this.dirtyFlags.background = false;
    }
    
    if (this.dirtyFlags.tiles) {
      this.renderTiles();
    }
    
    // ... 기타 레이어
  }
}
```

### 2. 오프스크린 캔버스
```javascript
class OffscreenRenderer {
  constructor() {
    // 정적 레이어용 오프스크린 캔버스
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    
    // 한 번만 렌더링
    this.renderStaticLayersToOffscreen();
  }

  renderStaticLayersToOffscreen() {
    // 배경 + 그리드를 오프스크린에 미리 그림
    this.offscreenCtx.fillStyle = COLORS.BACKGROUND;
    this.offscreenCtx.fillRect(0, 0, 360, 640);
    this.renderGridToOffscreen();
  }

  render() {
    // 오프스크린 캔버스 복사 (빠름)
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    
    // 동적 레이어만 다시 그림
    this.renderDynamicLayers();
  }
}
```

---

## 🎯 핵심 원칙

1. **단방향 렌더링**: 항상 뒤에서 앞으로
2. **상태 분리**: 렌더링은 GameState 읽기만
3. **좌표 변환**: 항상 헬퍼 함수 사용
4. **최적화**: 정적 레이어는 한 번만
5. **일관성**: 색상, 크기 상수 사용

---

## 📚 참고 자료

- **MDN Canvas Tutorial**: https://developer.mozilla.org/ko/docs/Web/API/Canvas_API/Tutorial
- **프로젝트 문서**: D-G-004, D-G-016
- **코딩 컨벤션**: CODING_CONVENTION.md

---

**작성일**: 2025-01-11  
**버전**: 1.0  
**작성자**: 슬뚜 + Claude
