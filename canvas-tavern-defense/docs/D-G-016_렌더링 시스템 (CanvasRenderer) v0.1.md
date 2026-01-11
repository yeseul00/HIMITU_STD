# [D-G-016] 렌더링 시스템 (CanvasRenderer) v0.1

> **문서 번호**: HIMITU-D-G-016 **버전**: 0.1 **작성일**: 2025-01-08 **작성자**: 찰스 (AI 지원) **상태**: Phase 1 초안 **의존 문서**: D-G-001, D-G-002, D-G-004, D-G-005

---

## 📌 문서 목적

Canvas 기반 렌더링 시스템의 구조, 렌더링 파이프라인, 최적화 전략을 정의하여 60 FPS 유지와 일관된 화면 출력을 보장합니다.

---

## 1. 시스템 개요

### 1.1 핵심 책임

|책임|설명|
|---|---|
|렌더링 파이프라인 관리|레이어 순서에 따른 순차 렌더링|
|좌표 변환|그리드 좌표 ↔ 화면 좌표 변환|
|애니메이션 처리|프레임 보간, 스프라이트 애니메이션|
|DPR 대응|고해상도 디스플레이 지원|
|최적화|더티 플래그, 오프스크린 캔버스|

### 1.2 시스템 위치

```
┌─────────────────────────────────────────────────┐
│                  GameEngine                      │
├─────────────────────────────────────────────────┤
│  GameLoop.render() → CanvasRenderer.render()    │
│                          ↓                       │
│              ┌───────────────────────┐          │
│              │   CanvasRenderer      │          │
│              ├───────────────────────┤          │
│              │ - ctx: CanvasContext  │          │
│              │ - offscreenCtx        │          │
│              │ - dirtyFlags          │          │
│              │ - spriteManager       │          │
│              │ - animationManager    │          │
│              └───────────────────────┘          │
│                          ↓                       │
│              각 레이어별 렌더 메서드              │
└─────────────────────────────────────────────────┘
```

### 1.3 렌더링 흐름 (프레임당)

```
GameLoop.tick()
    │
    ├─ update(deltaTime)  ← 게임 로직
    │
    └─ render()
         │
         ├─ 1. clear()
         │
         ├─ 2. renderStaticLayers()  ← 오프스크린 복사
         │       (배경, 그리드)
         │
         ├─ 3. renderDynamicLayers()
         │       ├─ renderTiles()
         │       ├─ renderCharacters()
         │       └─ renderEffects()
         │
         └─ 4. renderUI()
```

---

## 2. 데이터 구조

### 2.1 CanvasRenderer 클래스

```javascript
class CanvasRenderer {
  constructor(canvasId) {
    // 메인 캔버스
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // DPR 대응
    this.dpr = window.devicePixelRatio || 1;
    
    // 오프스크린 캔버스 (정적 레이어용)
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
    
    // 더티 플래그
    this.dirtyFlags = {
      static: true,      // 배경, 그리드
      tiles: true,       // 타일
      characters: true,  // 손님, 몬스터 (항상 true)
      effects: true,     // 이펙트 (항상 true)
      ui: true           // UI 요소
    };
    
    // 스프라이트 매니저
    this.spriteManager = new SpriteManager();
    
    // 애니메이션 매니저
    this.animationManager = new AnimationManager();
    
    // GameState 참조 (읽기 전용)
    this.gameState = null;
  }
}
```

### 2.2 더티 플래그 관리

```javascript
const DirtyFlags = {
  // 플래그 설정
  setDirty(flag) {
    this.dirtyFlags[flag] = true;
  },
  
  // 플래그 클리어
  clearDirty(flag) {
    this.dirtyFlags[flag] = false;
  },
  
  // 전체 클리어
  clearAll() {
    Object.keys(this.dirtyFlags).forEach(key => {
      // characters와 effects는 항상 true 유지
      if (key !== 'characters' && key !== 'effects') {
        this.dirtyFlags[key] = false;
      }
    });
  }
};
```

---

## 3. 초기화

### 3.1 캔버스 설정

```javascript
init(gameState) {
  this.gameState = gameState;
  
  // 1. 캔버스 크기 설정 (DPR 적용)
  this.setupCanvas();
  
  // 2. 오프스크린 캔버스 생성
  this.setupOffscreenCanvas();
  
  // 3. 정적 레이어 사전 렌더링
  this.prerenderStaticLayers();
  
  // 4. 스프라이트 로드
  this.spriteManager.loadAll();
  
  // 5. 이벤트 구독
  this.subscribeEvents();
}

setupCanvas() {
  const { WIDTH, HEIGHT } = CANVAS;
  
  // CSS 크기 (논리적)
  this.canvas.style.width = `${WIDTH}px`;
  this.canvas.style.height = `${HEIGHT}px`;
  
  // 실제 크기 (물리적, DPR 적용)
  this.canvas.width = WIDTH * this.dpr;
  this.canvas.height = HEIGHT * this.dpr;
  
  // 스케일 적용
  this.ctx.scale(this.dpr, this.dpr);
  
  // 이미지 스무딩 설정
  this.ctx.imageSmoothingEnabled = true;
  this.ctx.imageSmoothingQuality = 'high';
}

setupOffscreenCanvas() {
  const { WIDTH, HEIGHT } = CANVAS;
  
  this.offscreenCanvas = document.createElement('canvas');
  this.offscreenCanvas.width = WIDTH * this.dpr;
  this.offscreenCanvas.height = HEIGHT * this.dpr;
  
  this.offscreenCtx = this.offscreenCanvas.getContext('2d');
  this.offscreenCtx.scale(this.dpr, this.dpr);
}
```

---

## 4. 렌더링 파이프라인

### 4.1 메인 렌더 메서드

```javascript
render() {
  // 1. 화면 클리어
  this.clear();
  
  // 2. 정적 레이어 (오프스크린에서 복사)
  this.renderStaticLayers();
  
  // 3. 동적 레이어
  this.renderTiles();
  this.renderSpecialTiles();
  this.renderCharacters();
  this.renderEffects();
  
  // 4. UI 레이어
  this.renderUI();
  
  // 5. 디버그 (개발 모드)
  if (DEBUG.ENABLED) {
    this.renderDebug();
  }
  
  // 6. 더티 플래그 클리어
  this.clearDirtyFlags();
}
```

### 4.2 레이어별 렌더링 순서

```javascript
// D-G-004 기반 14개 레이어

const RENDER_LAYERS = [
  // === 정적 레이어 (오프스크린) ===
  { id: 0, name: 'background', method: 'renderBackground' },
  { id: 1, name: 'grid', method: 'renderGrid' },
  
  // === 동적 레이어 ===
  { id: 2, name: 'emptyTiles', method: 'renderEmptyTiles' },
  { id: 3, name: 'buildings', method: 'renderBuildings' },
  { id: 4, name: 'specialTiles', method: 'renderSpecialTiles' },
  { id: 5, name: 'guests', method: 'renderGuests' },
  { id: 6, name: 'monsters', method: 'renderMonsters' },
  { id: 7, name: 'attackEffects', method: 'renderAttackEffects' },
  { id: 8, name: 'particles', method: 'renderParticles' },
  
  // === UI 레이어 ===
  { id: 9, name: 'hpBars', method: 'renderHPBars' },
  { id: 10, name: 'speechBubbles', method: 'renderSpeechBubbles' },
  { id: 11, name: 'buttons', method: 'renderButtons' },
  { id: 12, name: 'overlay', method: 'renderOverlay' },
  { id: 13, name: 'debug', method: 'renderDebug' }
];
```

---

## 5. 좌표 변환 시스템

### 5.1 좌표 변환 함수

```javascript
// src/utils/CoordinateUtils.js

const CoordinateUtils = {
  /**
   * 그리드 좌표 → 화면 픽셀 (타일 좌상단)
   */
  gridToScreen(col, row) {
    const { TILE_SIZE } = CANVAS;
    const gridTop = UI_LAYOUT.GRID_TOP; // 300px (상단바+손님영역+바테이블)
    
    return {
      x: col * TILE_SIZE,
      y: gridTop + row * TILE_SIZE
    };
  },
  
  /**
   * 그리드 좌표 → 화면 픽셀 (타일 중심)
   */
  gridToScreenCenter(col, row) {
    const { x, y } = this.gridToScreen(col, row);
    const halfTile = CANVAS.TILE_SIZE / 2;
    
    return {
      x: x + halfTile,
      y: y + halfTile
    };
  },
  
  /**
   * 화면 픽셀 → 그리드 좌표
   */
  screenToGrid(screenX, screenY) {
    const { TILE_SIZE } = CANVAS;
    const gridTop = UI_LAYOUT.GRID_TOP;
    
    // 그리드 영역 밖 체크
    if (screenY < gridTop || screenY >= gridTop + CANVAS.GRID_ROWS * TILE_SIZE) {
      return null;
    }
    
    const col = Math.floor(screenX / TILE_SIZE);
    const row = Math.floor((screenY - gridTop) / TILE_SIZE);
    
    // 범위 체크
    if (col < 0 || col >= CANVAS.GRID_COLS || 
        row < 0 || row >= CANVAS.GRID_ROWS) {
      return null;
    }
    
    return { col, row, index: row * CANVAS.GRID_COLS + col };
  },
  
  /**
   * 그리드 인덱스 → (col, row)
   */
  indexToGrid(index) {
    return {
      col: index % CANVAS.GRID_COLS,
      row: Math.floor(index / CANVAS.GRID_COLS)
    };
  },
  
  /**
   * (col, row) → 그리드 인덱스
   */
  gridToIndex(col, row) {
    return row * CANVAS.GRID_COLS + col;
  }
};
```

### 5.2 화면 영역 정의

```javascript
// UI 레이아웃 상수 (D-G-012 참조)
const UI_LAYOUT = {
  // 상단바
  TOP_BAR: { y: 0, height: 80 },
  
  // 손님 영역 (빈 영역)
  GUEST_AREA: { y: 80, height: 140 },
  
  // 바 테이블
  BAR_TABLE: { y: 220, height: 80 },
  
  // 그리드 시작 Y 좌표
  GRID_TOP: 300,  // 80 + 140 + 80
  
  // 그리드 영역
  GRID: { 
    y: 300, 
    height: 1170  // 9 * 130
  },
  
  // 하단 UI
  BOTTOM_UI: { y: 1470, height: 450 }
};
```

---

## 6. 레이어별 렌더링 상세

### 6.1 배경 렌더링 (Layer 0)

```javascript
renderBackground() {
  const ctx = this.offscreenCtx;
  const { WIDTH, HEIGHT } = CANVAS;
  const phase = this.gameState.phase;
  
  // Phase별 배경색
  const bgColor = phase === 'night' ? '#1a1a2e' : '#3a506b';
  
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // 배경 이미지가 있으면 사용
  if (this.spriteManager.isLoaded('bg_' + phase)) {
    const bgImage = this.spriteManager.get('bg_' + phase);
    ctx.drawImage(bgImage, 0, 0, WIDTH, HEIGHT);
  }
}
```

### 6.2 그리드 렌더링 (Layer 1)

```javascript
renderGrid() {
  const ctx = this.offscreenCtx;
  const { TILE_SIZE, GRID_COLS, GRID_ROWS } = CANVAS;
  const gridTop = UI_LAYOUT.GRID_TOP;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  
  // 세로선
  for (let col = 0; col <= GRID_COLS; col++) {
    const x = col * TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(x, gridTop);
    ctx.lineTo(x, gridTop + GRID_ROWS * TILE_SIZE);
    ctx.stroke();
  }
  
  // 가로선
  for (let row = 0; row <= GRID_ROWS; row++) {
    const y = gridTop + row * TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(GRID_COLS * TILE_SIZE, y);
    ctx.stroke();
  }
}
```

### 6.3 타일 렌더링 (Layer 2~4)

```javascript
renderTiles() {
  if (!this.dirtyFlags.tiles) return;
  
  const ctx = this.ctx;
  const grid = this.gameState.grid;
  
  grid.forEach((tile, index) => {
    const { col, row } = CoordinateUtils.indexToGrid(index);
    const { x, y } = CoordinateUtils.gridToScreen(col, row);
    
    if (tile.type === 'empty') {
      this.renderEmptyTile(ctx, x, y, tile);
    } else if (tile.type !== 'special') {
      this.renderBuildingTile(ctx, x, y, tile);
    }
  });
}

renderEmptyTile(ctx, x, y, tile) {
  const { TILE_SIZE } = CANVAS;
  
  // 빈 타일 배경
  ctx.fillStyle = '#2a2a3e';
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  
  // 드래그 중 배치 가능 표시
  if (this.gameState.uiState.isDragging) {
    const canPlace = this.canPlaceAt(tile);
    ctx.strokeStyle = canPlace ? '#4ade80' : '#ef4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  }
}

renderBuildingTile(ctx, x, y, tile) {
  const { TILE_SIZE } = CANVAS;
  const building = tile.building;
  
  // 스프라이트 또는 폴백 색상
  const spriteKey = `tile_${building.buildingType}_lv${tile.level}`;
  
  if (this.spriteManager.isLoaded(spriteKey)) {
    const sprite = this.spriteManager.get(spriteKey);
    ctx.drawImage(sprite, x, y, TILE_SIZE, TILE_SIZE);
  } else {
    // 폴백: 색상으로 표시
    const color = this.getBuildingColor(building.buildingType);
    ctx.fillStyle = tile.isDestroyed ? 'rgba(100,100,100,0.5)' : color;
    ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
  }
  
  // 레벨 표시
  this.renderLevelIndicator(ctx, x, y, tile.level);
  
  // 파괴 표시
  if (tile.isDestroyed) {
    this.renderDestroyedOverlay(ctx, x, y);
  }
  
  // HP 바 (방어 건물)
  if (building.category === 'defense' && tile.hp < tile.maxHp) {
    this.renderTileHPBar(ctx, x, y, tile.hp, tile.maxHp);
  }
}
```

### 6.4 캐릭터 렌더링 (Layer 5~6)

```javascript
renderCharacters() {
  const ctx = this.ctx;
  
  // 손님 렌더링 (밤 Phase)
  if (this.gameState.phase === 'night') {
    this.renderGuests(ctx);
  }
  
  // 몬스터 렌더링 (낮 Phase)
  if (this.gameState.phase === 'day') {
    this.renderMonsters(ctx);
  }
}

renderGuests(ctx) {
  const guests = this.gameState.guests;
  
  guests.forEach(guest => {
    // 걷기/앉기 애니메이션
    const animation = this.animationManager.get(`guest_${guest.id}`);
    const frame = animation ? animation.getFrame() : { x: 0, y: 0 };
    
    // 스프라이트 렌더링
    this.spriteManager.drawSprite(
      ctx,
      `guest_${guest.type}`,
      frame.x, frame.y,
      guest.x, guest.y,
      64, 64  // 스프라이트 크기
    );
    
    // 말풍선
    this.renderGuestBubble(ctx, guest);
  });
}

renderMonsters(ctx) {
  const monsters = this.gameState.monsters;
  
  // Y좌표 기준 정렬 (아래 몬스터가 위에 그려지도록)
  const sortedMonsters = [...monsters].sort((a, b) => a.y - b.y);
  
  sortedMonsters.forEach(monster => {
    if (!monster.isAlive) return;
    
    // 애니메이션 프레임
    const animation = this.animationManager.get(`monster_${monster.id}`);
    const frame = animation ? animation.getFrame() : { x: 0, y: 0 };
    
    // 몬스터 스프라이트
    this.spriteManager.drawSprite(
      ctx,
      `monster_${monster.type}`,
      frame.x, frame.y,
      monster.x - 32, monster.y - 32,  // 중심 기준
      64, 64
    );
    
    // HP 바
    this.renderMonsterHPBar(ctx, monster);
  });
}
```

### 6.5 이펙트 렌더링 (Layer 7~8)

```javascript
renderEffects() {
  const ctx = this.ctx;
  
  // 공격 이펙트
  this.renderAttackEffects(ctx);
  
  // 파티클 이펙트
  this.renderParticles(ctx);
  
  // 데미지 숫자
  this.renderDamageNumbers(ctx);
}

renderAttackEffects(ctx) {
  const effects = this.gameState.effects.attacks;
  
  effects.forEach(effect => {
    // 투사체 이펙트 (궁수 타워)
    if (effect.type === 'projectile') {
      this.renderProjectile(ctx, effect);
    }
    // 근접 이펙트 (용병)
    else if (effect.type === 'melee') {
      this.renderMeleeEffect(ctx, effect);
    }
    // 함정 이펙트
    else if (effect.type === 'trap') {
      this.renderTrapEffect(ctx, effect);
    }
  });
}

renderProjectile(ctx, effect) {
  const { startX, startY, endX, endY, progress } = effect;
  
  // 현재 위치 (lerp)
  const currentX = lerp(startX, endX, progress);
  const currentY = lerp(startY, endY, progress);
  
  // 화살 스프라이트 또는 원
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
  ctx.fill();
}

renderDamageNumbers(ctx) {
  const damages = this.gameState.effects.damages;
  
  damages.forEach(dmg => {
    const alpha = 1 - dmg.progress;
    const offsetY = -30 * dmg.progress;
    
    ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`-${dmg.value}`, dmg.x, dmg.y + offsetY);
  });
}
```

---

## 7. 애니메이션 시스템

### 7.1 AnimationManager

```javascript
class AnimationManager {
  constructor() {
    this.animations = new Map();
  }
  
  /**
   * 애니메이션 생성
   */
  create(id, frames, frameDuration = 0.1, loop = true) {
    const animation = new Animation(frames, frameDuration, loop);
    this.animations.set(id, animation);
    return animation;
  }
  
  /**
   * 애니메이션 가져오기
   */
  get(id) {
    return this.animations.get(id);
  }
  
  /**
   * 전체 업데이트
   */
  update(deltaTime) {
    this.animations.forEach(anim => anim.update(deltaTime));
  }
  
  /**
   * 애니메이션 제거
   */
  remove(id) {
    this.animations.delete(id);
  }
}
```

### 7.2 Animation 클래스

```javascript
class Animation {
  constructor(frames, frameDuration, loop = true) {
    this.frames = frames;           // [{ x, y }, ...]
    this.frameDuration = frameDuration;
    this.loop = loop;
    
    this.currentFrame = 0;
    this.elapsed = 0;
    this.finished = false;
  }
  
  update(deltaTime) {
    if (this.finished) return;
    
    this.elapsed += deltaTime;
    
    if (this.elapsed >= this.frameDuration) {
      this.elapsed = 0;
      this.currentFrame++;
      
      if (this.currentFrame >= this.frames.length) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frames.length - 1;
          this.finished = true;
        }
      }
    }
  }
  
  getFrame() {
    return this.frames[this.currentFrame];
  }
  
  reset() {
    this.currentFrame = 0;
    this.elapsed = 0;
    this.finished = false;
  }
}
```

### 7.3 보간 함수

```javascript
// src/utils/MathUtils.js

const MathUtils = {
  /**
   * 선형 보간 (Linear Interpolation)
   */
  lerp(start, end, t) {
    return start + (end - start) * t;
  },
  
  /**
   * 이징 함수 - EaseOut
   */
  easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  },
  
  /**
   * 이징 함수 - EaseInOut
   */
  easeInOut(t) {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  
  /**
   * 두 점 사이 거리
   */
  distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
};
```

---

## 8. 스프라이트 관리

### 8.1 SpriteManager

```javascript
class SpriteManager {
  constructor() {
    this.sprites = new Map();
    this.loadQueue = [];
    this.loadedCount = 0;
    this.totalCount = 0;
  }
  
  /**
   * 스프라이트 등록
   */
  register(key, src) {
    this.loadQueue.push({ key, src });
    this.totalCount++;
  }
  
  /**
   * 전체 로드
   */
  async loadAll() {
    const promises = this.loadQueue.map(item => this.load(item.key, item.src));
    await Promise.all(promises);
    console.log(`[SpriteManager] ${this.loadedCount}/${this.totalCount} loaded`);
  }
  
  /**
   * 개별 로드
   */
  load(key, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(key, img);
        this.loadedCount++;
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`[SpriteManager] Failed to load: ${key}`);
        resolve(null);  // 실패해도 계속 진행
      };
      img.src = src;
    });
  }
  
  /**
   * 스프라이트 가져오기
   */
  get(key) {
    return this.sprites.get(key);
  }
  
  /**
   * 로드 여부 확인
   */
  isLoaded(key) {
    return this.sprites.has(key);
  }
  
  /**
   * 스프라이트 시트에서 프레임 그리기
   */
  drawSprite(ctx, key, frameX, frameY, destX, destY, width, height) {
    const sprite = this.sprites.get(key);
    if (!sprite) return;
    
    ctx.drawImage(
      sprite,
      frameX * width, frameY * height,  // 소스 위치
      width, height,                     // 소스 크기
      destX, destY,                      // 대상 위치
      width, height                      // 대상 크기
    );
  }
}
```

---

## 9. 최적화 전략

### 9.1 오프스크린 렌더링

```javascript
/**
 * 정적 레이어 사전 렌더링
 */
prerenderStaticLayers() {
  this.renderBackground();
  this.renderGrid();
  this.dirtyFlags.static = false;
}

/**
 * 정적 레이어 복사
 */
renderStaticLayers() {
  // 변경 시에만 재렌더링
  if (this.dirtyFlags.static) {
    this.prerenderStaticLayers();
  }
  
  // 오프스크린 → 메인 캔버스 복사
  this.ctx.drawImage(
    this.offscreenCanvas,
    0, 0,
    CANVAS.WIDTH, CANVAS.HEIGHT
  );
}
```

### 9.2 더티 영역 렌더링

```javascript
/**
 * 변경된 타일만 다시 그리기
 */
renderDirtyTiles(dirtyTiles) {
  const ctx = this.ctx;
  
  dirtyTiles.forEach(index => {
    const { col, row } = CoordinateUtils.indexToGrid(index);
    const { x, y } = CoordinateUtils.gridToScreen(col, row);
    const tile = this.gameState.grid[index];
    
    // 해당 영역만 클리어
    ctx.clearRect(x, y, CANVAS.TILE_SIZE, CANVAS.TILE_SIZE);
    
    // 배경 복원
    ctx.drawImage(
      this.offscreenCanvas,
      x * this.dpr, y * this.dpr,
      CANVAS.TILE_SIZE * this.dpr, CANVAS.TILE_SIZE * this.dpr,
      x, y,
      CANVAS.TILE_SIZE, CANVAS.TILE_SIZE
    );
    
    // 타일 재렌더링
    this.renderTileAt(ctx, x, y, tile);
  });
}
```

### 9.3 렌더링 스킵 조건

```javascript
/**
 * 렌더링 필요 여부 체크
 */
shouldRender() {
  // 탭이 비활성화 상태면 스킵
  if (document.hidden) return false;
  
  // 게임 일시정지 상태면 스킵
  if (this.gameState.isPaused) return false;
  
  return true;
}
```

---

## 10. 이벤트 연동

### 10.1 구독 이벤트

```javascript
subscribeEvents() {
  // Phase 변경 → 배경 재렌더링
  eventBus.on('phase:changed', () => {
    this.dirtyFlags.static = true;
  });
  
  // 타일 변경 → 타일 재렌더링
  eventBus.on('tile:placed', (data) => {
    this.dirtyFlags.tiles = true;
    this.addDirtyTile(data.index);
  });
  
  eventBus.on('tile:merged', (data) => {
    this.dirtyFlags.tiles = true;
    this.addDirtyTile(data.sourceIndex);
    this.addDirtyTile(data.targetIndex);
  });
  
  eventBus.on('tile:destroyed', (data) => {
    this.dirtyFlags.tiles = true;
    this.addDirtyTile(data.index);
  });
  
  // 몬스터 이벤트 → 애니메이션 관리
  eventBus.on('monster:spawned', (data) => {
    this.animationManager.create(
      `monster_${data.monster.id}`,
      MONSTER_ANIMATIONS[data.monster.type].walk,
      0.1,
      true
    );
  });
  
  eventBus.on('monster:died', (data) => {
    this.animationManager.remove(`monster_${data.monsterId}`);
  });
  
  // UI 변경
  eventBus.on('ui:show_overlay', () => {
    this.dirtyFlags.ui = true;
  });
}
```

---

## 11. 구현 가이드

### 11.1 클래스 구조

```
src/
├── ui/
│   └── CanvasRenderer.js       # 메인 렌더러
├── utils/
│   ├── CoordinateUtils.js      # 좌표 변환
│   └── MathUtils.js            # 수학 유틸
└── managers/
    ├── SpriteManager.js        # 스프라이트 관리
    └── AnimationManager.js     # 애니메이션 관리
```

### 11.2 메서드 시그니처

```javascript
// CanvasRenderer
class CanvasRenderer {
  constructor(canvasId: string)
  init(gameState: GameState): void
  render(): void
  clear(): void
  
  // 좌표 변환 (CoordinateUtils로 위임)
  gridToScreen(col: number, row: number): { x, y }
  screenToGrid(x: number, y: number): { col, row, index } | null
  
  // 더티 플래그
  setDirty(flag: string): void
  addDirtyTile(index: number): void
  
  // 레이어별 렌더
  renderBackground(): void
  renderGrid(): void
  renderTiles(): void
  renderCharacters(): void
  renderEffects(): void
  renderUI(): void
  renderDebug(): void
}
```

---

## 12. 미결정 사항

|항목|현재 설계|대안|비고|
|---|---|---|---|
|캔버스 분리|단일 캔버스 + 오프스크린|다중 캔버스 (레이어별)|성능 테스트 필요|
|DPR 적용|전체 적용|선택적 적용|저사양 기기 고려|
|스프라이트 포맷|PNG|WebP|용량 vs 호환성|
|폰트 렌더링|Canvas fillText|프리렌더 텍스처|성능|
|애니메이션 FPS|10 FPS|12~15 FPS|스프라이트 수|

---

## 13. 개정 이력

|버전|날짜|작성자|내용|
|---|---|---|---|
|0.1|2025-01-08|찰스 (AI 지원)|초안 작성|