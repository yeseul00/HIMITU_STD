# [D-G-004] Canvas 레이어 구조 v0.1

> **문서 번호**: HIMITU-D-G-004 **버전**: 1.0 **작성일**: 2025-01-08 **작성자**: 수삼 (초안 by AI) **상태**: 참고용 초안

---

## 📌 문서 목적

Canvas 렌더링 순서, 레이어 구조, 좌표계를 정의하여 화면 구성의 일관성을 유지하고 Z-Index 충돌을 방지합니다.

---

## 1. Canvas 기본 사양

javascript

````javascript
const CANVAS_CONFIG = {
  // 논리적 해상도 (디자인 기준)
  logicalWidth: 1080,
  logicalHeight: 1920,
  
  // 실제 Canvas 크기 (DPR 적용)
  physicalWidth: 1080 * window.devicePixelRatio,
  physicalHeight: 1920 * window.devicePixelRatio,
  
  // 타일 크기
  tileSize: 130,  // dp
  
  // 그리드
  gridCols: 8,
  gridRows: 9,
  
  // FPS
  targetFPS: 60
};
```

---

## 2. 좌표계

### 2.1 좌표 원점
```
(0, 0) ──────────────────────► X (col)
  │
  │
  │
  │
  │
  ▼
  Y (row)

원점: 좌상단
X축: 오른쪽으로 증가 (0~7)
Y축: 아래로 증가 (0~8)
````

### 2.2 좌표 변환 함수

javascript

````javascript
// 그리드 좌표 → 화면 픽셀 (타일 좌상단)
function gridToScreen(col, row) {
  return {
    x: col * CANVAS_CONFIG.tileSize,
    y: row * CANVAS_CONFIG.tileSize
  };
}

// 그리드 좌표 → 화면 픽셀 (타일 중심)
function gridToScreenCenter(col, row) {
  const halfTile = CANVAS_CONFIG.tileSize / 2;
  return {
    x: col * CANVAS_CONFIG.tileSize + halfTile,
    y: row * CANVAS_CONFIG.tileSize + halfTile
  };
}

// 화면 픽셀 → 그리드 좌표
function screenToGrid(x, y) {
  return {
    col: Math.floor(x / CANVAS_CONFIG.tileSize),
    row: Math.floor(y / CANVAS_CONFIG.tileSize)
  };
}

// 그리드 범위 검증
function isValidGridPosition(col, row) {
  return col >= 0 && col < 8 && row >= 0 && row < 9;
}
```

---

## 3. 렌더링 레이어 구조

### 3.1 레이어 순서 (뒤→앞)
```
Layer 0: 배경 (Background)
    ↓
Layer 1: 그리드 (Grid Lines)
    ↓
Layer 2: 타일 - 빈 타일 (Empty Tiles)
    ↓
Layer 3: 타일 - 건물 (Buildings)
    ↓
Layer 4: 특수 타일 (Hearth, Player)
    ↓
Layer 5: 캐릭터 - 손님 (Guests)
    ↓
Layer 6: 캐릭터 - 몬스터 (Monsters)
    ↓
Layer 7: 이펙트 - 공격 (Attack Effects)
    ↓
Layer 8: 이펙트 - 파티클 (Particles)
    ↓
Layer 9: UI - 체력바 (HP Bars)
    ↓
Layer 10: UI - 말풍선 (Speech Bubbles)
    ↓
Layer 11: UI - 버튼 (Buttons)
    ↓
Layer 12: UI - 오버레이 (Overlay)
    ↓
Layer 13: 디버그 (Debug Info)
````

---

## 4. 레이어별 상세

### Layer 0: 배경 (Background)

**목적**: 게임판 전체 배경

**렌더링 내용**:

- 배경색 또는 배경 이미지
- 밤/낮에 따라 색조 변경 가능

**렌더링 조건**: 항상

javascript

```javascript
function renderBackground(ctx) {
  const bgColor = gameState.phase === 'night' ? '#1a1a2e' : '#3a506b';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, CANVAS_CONFIG.logicalWidth, CANVAS_CONFIG.logicalHeight);
}
```

---

### Layer 1: 그리드 (Grid Lines)

**목적**: 8×9 그리드 선 표시 (디버그용 또는 배치 시 가이드)

**렌더링 내용**:

- 세로선 8개 (col 경계)
- 가로선 9개 (row 경계)

**렌더링 조건**: 개발 모드 또는 타일 배치 중

javascript

```javascript
function renderGrid(ctx) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  
  const { tileSize, gridCols, gridRows } = CANVAS_CONFIG;
  
  // 세로선
  for (let col = 0; col <= gridCols; col++) {
    const x = col * tileSize;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, gridRows * tileSize);
    ctx.stroke();
  }
  
  // 가로선
  for (let row = 0; row <= gridRows; row++) {
    const y = row * tileSize;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(gridCols * tileSize, y);
    ctx.stroke();
  }
}
```

---

### Layer 2: 타일 - 빈 타일 (Empty Tiles)

**목적**: 빈 타일 표시

**렌더링 내용**:

- 회색 빈 타일
- 배치 가능 위치 표시 (초록 테두리)
- 배치 불가 위치 표시 (빨강 테두리)

**렌더링 조건**: 항상

javascript

```javascript
function renderEmptyTiles(ctx, gameState) {
  gameState.grid.forEach((tile, index) => {
    if (tile.type !== 'empty') return;
    
    const { col, row } = getGridPosition(index);
    const { x, y } = gridToScreen(col, row);
    const { tileSize } = CANVAS_CONFIG;
    
    // 빈 타일 배경
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(x, y, tileSize, tileSize);
    
    // 배치 가능 여부 (드래그 중일 때만)
    if (gameState.uiState.isDragging) {
      const canPlace = canPlaceTileAt(col, row);
      ctx.strokeStyle = canPlace ? '#4ade80' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  });
}
```

---

### Layer 3: 타일 - 건물 (Buildings)

**목적**: 배치된 건물 표시

**렌더링 내용**:

- 생산 건물 (양조장, 주방, 와인 저장고)
- 방어 건물 (궁수 타워, 벽, 용병, 함정)
- 레벨 표시 (⭐~🔴)
- 파괴된 타일 표시 (반투명 + X 표시)

**렌더링 조건**: tile.type !== 'empty'

javascript

```javascript
function renderBuildings(ctx, gameState) {
  gameState.grid.forEach((tile, index) => {
    if (tile.type === 'empty' || tile.type === 'special') return;
    
    const { col, row } = getGridPosition(index);
    const { x, y } = gridToScreen(col, row);
    const { tileSize } = CANVAS_CONFIG;
    
    // 건물 스프라이트 (에셋 로드 전에는 색상으로 대체)
    const building = tile.building;
    const color = getbuildingColor(building.buildingType);
    
    ctx.fillStyle = tile.isDestroyed ? 'rgba(100, 100, 100, 0.5)' : color;
    ctx.fillRect(x + 5, y + 5, tileSize - 10, tileSize - 10);
    
    // 레벨 표시
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(getLevelIcon(tile.level), x + tileSize / 2, y + tileSize - 10);
    
    // 파괴 표시
    if (tile.isDestroyed) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 10);
      ctx.lineTo(x + tileSize - 10, y + tileSize - 10);
      ctx.moveTo(x + tileSize - 10, y + 10);
      ctx.lineTo(x + 10, y + tileSize - 10);
      ctx.stroke();
    }
  });
}

function getLevelIcon(level) {
  const icons = ['', '⭐', '⭐⭐', '⭐⭐⭐', '🔴'];
  return icons[level] || '';
}
```

---

### Layer 4: 특수 타일 (Hearth, Player)

**목적**: 화덕, 플레이어 위치 표시

**렌더링 내용**:

- 화덕 (col: 3, row: 8)
- 플레이어 (col: 0, row: 8)

**렌더링 조건**: 항상

javascript

```javascript
function renderSpecialTiles(ctx) {
  const { tileSize } = CANVAS_CONFIG;
  
  // 화덕
  const hearth = gridToScreen(3, 8);
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(hearth.x + 10, hearth.y + 10, tileSize - 20, tileSize - 20);
  ctx.fillText('🔥', hearth.x + tileSize / 2, hearth.y + tileSize / 2);
  
  // 플레이어
  const player = gridToScreen(0, 8);
  ctx.fillStyle = '#51cf66';
  ctx.fillRect(player.x + 10, player.y + 10, tileSize - 20, tileSize - 20);
  ctx.fillText('🧙', player.x + tileSize / 2, player.y + tileSize / 2);
}
```

---

### Layer 5: 캐릭터 - 손님 (Guests)

**목적**: 밤 Phase 손님 표시

**렌더링 내용**:

- 손님 스프라이트
- 위치: 그리드 좌표 기반

**렌더링 조건**: gameState.phase === 'night' && guests.length > 0

javascript

```javascript
function renderGuests(ctx, gameState) {
  if (gameState.phase !== 'night') return;
  
  gameState.guests.forEach(guest => {
    const { x, y } = gridToScreenCenter(guest.col, guest.row);
    
    // 손님 스프라이트 (임시: 원)
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // 손님 타입 아이콘
    ctx.fillText(getGuestIcon(guest.type), x, y);
  });
}
```

---

### Layer 6: 캐릭터 - 몬스터 (Monsters)

**목적**: 낮 Phase 몬스터 표시

**렌더링 내용**:

- 몬스터 스프라이트
- 위치: 실수 픽셀 좌표 (부드러운 이동)

**렌더링 조건**: gameState.phase === 'day' && monsters.length > 0

javascript

```javascript
function renderMonsters(ctx, gameState) {
  if (gameState.phase !== 'day') return;
  
  gameState.monsters.forEach(monster => {
    // 몬스터 스프라이트 (임시: 원)
    ctx.fillStyle = '#e03131';
    ctx.beginPath();
    ctx.arc(monster.x, monster.y, 35, 0, Math.PI * 2);
    ctx.fill();
    
    // 몬스터 타입 아이콘
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(getMonsterIcon(monster.type), monster.x, monster.y);
  });
}
```

---

### Layer 7: 이펙트 - 공격 (Attack Effects)

**목적**: 타워 공격, 몬스터 공격 이펙트

**렌더링 내용**:

- 화살 (궁수 타워)
- 칼 이펙트 (용병)
- 몬스터 공격 애니메이션

**렌더링 조건**: 공격 중

javascript

```javascript
function renderAttackEffects(ctx, activeEffects) {
  activeEffects.forEach(effect => {
    if (effect.type === 'arrow') {
      // 화살 그리기
      ctx.strokeStyle = '#ffd93d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(effect.startX, effect.startY);
      ctx.lineTo(effect.endX, effect.endY);
      ctx.stroke();
    }
    
    if (effect.type === 'slash') {
      // 칼 이펙트
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 40, 0, Math.PI);
      ctx.stroke();
    }
  });
}
```

---

### Layer 8: 이펙트 - 파티클 (Particles)

**목적**: 타일 합병, 몬스터 사망 파티클

**렌더링 내용**:

- 합병 반짝임
- 사망 폭발 이펙트

**렌더링 조건**: 파티클 활성화 중

javascript

```javascript
function renderParticles(ctx, particles) {
  particles.forEach(particle => {
    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;
}
```

---

### Layer 9: UI - 체력바 (HP Bars)

**목적**: 몬스터, 바 테이블, 화덕 체력 표시

**렌더링 내용**:

- 몬스터 체력바 (머리 위)
- 바 테이블 체력바 (상단)
- 화덕 체력바 (하단)

**렌더링 조건**: 대상 존재 시

javascript

```javascript
function renderHPBars(ctx, gameState) {
  // 몬스터 체력바
  gameState.monsters.forEach(monster => {
    const hpPercent = monster.hp / monster.maxHP;
    const barWidth = 60;
    const barHeight = 8;
    
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(monster.x - barWidth / 2, monster.y - 50, barWidth, barHeight);
    
    ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : '#ef4444';
    ctx.fillRect(monster.x - barWidth / 2, monster.y - 50, barWidth * hpPercent, barHeight);
  });
  
  // 바 테이블 체력
  const barTablePercent = gameState.defense.barTableHP / 10;
  ctx.fillStyle = '#2a2a3e';
  ctx.fillRect(20, 20, 200, 20);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(20, 20, 200 * barTablePercent, 20);
  
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.fillText(`바 테이블: ${gameState.defense.barTableHP}/10`, 230, 35);
  
  // 화덕 체력
  const hearthPercent = gameState.defense.hearthHP / 1000;
  ctx.fillStyle = '#2a2a3e';
  ctx.fillRect(20, 1880, 200, 20);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(20, 1880, 200 * hearthPercent, 20);
  
  ctx.fillText(`화덕: ${gameState.defense.hearthHP}/1000`, 230, 1895);
}
```

---

### Layer 10: UI - 말풍선 (Speech Bubbles)

**목적**: 손님 주문, 몬스터 대사

**렌더링 내용**:

- 손님 주문 아이콘 (맥주/음식/와인)
- 대기 시간 표시

**렌더링 조건**: 손님/몬스터가 말풍선 출력 중

javascript

```javascript
function renderSpeechBubbles(ctx, gameState) {
  gameState.guests.forEach(guest => {
    if (guest.state !== 'waiting') return;
    
    const { x, y } = gridToScreenCenter(guest.col, guest.row);
    
    // 말풍선 배경
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x, y - 70, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // 주문 아이콘
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(getOrderIcon(guest.orderType), x, y - 65);
  });
}
```

---

### Layer 11: UI - 버튼 (Buttons)

**목적**: 게임 제어 버튼

**렌더링 내용**:

- "낮 시작" / "밤 시작" 버튼
- 상점 버튼
- 일시정지 버튼

**렌더링 조건**: 항상 (Phase에 따라 내용 변경)

javascript

```javascript
function renderButtons(ctx, gameState) {
  // Phase 전환 버튼
  const phaseButtonText = gameState.phase === 'night' ? '낮 시작' : '밤으로';
  const buttonX = 1080 / 2 - 100;
  const buttonY = 1800;
  
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(buttonX, buttonY, 200, 60);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(phaseButtonText, buttonX + 100, buttonY + 38);
  
  // 상점 버튼 (밤에만)
  if (gameState.phase === 'night') {
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(20, 1800, 120, 60);
    ctx.fillStyle = '#000';
    ctx.fillText('🏪 상점', 80, 1838);
  }
}
```

---

### Layer 12: UI - 오버레이 (Overlay)

**목적**: 게임 오버, 웨이브 클리어 알림

**렌더링 내용**:

- 반투명 배경
- 결과 메시지
- 재시작 버튼

**렌더링 조건**: 특수 상황 (게임 오버, 웨이브 클리어)

javascript

```javascript
function renderOverlay(ctx, overlayState) {
  if (!overlayState.visible) return;
  
  // 반투명 배경
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, 1080, 1920);
  
  // 메시지
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(overlayState.message, 540, 960);
  
  // 재시작 버튼
  if (overlayState.showRestartButton) {
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(390, 1020, 300, 80);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('재시작', 540, 1070);
  }
}
```

---

### Layer 13: 디버그 (Debug Info)

**목적**: 개발자 정보 표시

**렌더링 내용**:

- FPS
- 현재 Phase
- 골드
- 몬스터 수
- 마우스 좌표

**렌더링 조건**: 개발 모드

javascript

```javascript
function renderDebugInfo(ctx, gameState, fps, mousePos) {
  if (!DEV_MODE) return;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(10, 10, 250, 150);
  
  ctx.fillStyle = '#4ade80';
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  
  const debugInfo = [
    `FPS: ${fps}`,
    `Phase: ${gameState.phase}`,
    `Day: ${gameState.day}`,
    `Gold: ${gameState.gold}`,
    `Monsters: ${gameState.monsters.length}`,
    `Mouse: (${mousePos.col}, ${mousePos.row})`
  ];
  
  debugInfo.forEach((line, i) => {
    ctx.fillText(line, 20, 30 + i * 20);
  });
}
```

---

## 5. 렌더링 최적화

### 5.1 더티 플래그 (Dirty Flag)

모든 프레임을 다시 그리는 대신, 변경된 영역만 갱신:

javascript

```javascript
const dirtyFlags = {
  background: false,
  grid: false,
  tiles: false,
  characters: true,  // 항상 갱신 (움직임)
  effects: true,
  ui: false
};

function render(ctx, gameState) {
  if (dirtyFlags.background) renderBackground(ctx);
  if (dirtyFlags.grid) renderGrid(ctx);
  if (dirtyFlags.tiles) renderTiles(ctx, gameState);
  
  // 항상 갱신
  renderCharacters(ctx, gameState);
  renderEffects(ctx, gameState);
  
  if (dirtyFlags.ui) renderUI(ctx, gameState);
}
```

### 5.2 오프스크린 Canvas

정적인 레이어(배경, 그리드)는 별도 Canvas에 미리 렌더링:

javascript

```javascript
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 1080;
offscreenCanvas.height = 1920;
const offscreenCtx = offscreenCanvas.getContext('2d');

// 초기화 시 한 번만 렌더링
renderBackground(offscreenCtx);
renderGrid(offscreenCtx);

// 메인 렌더 루프에서는 복사만
function render(ctx, gameState) {
  ctx.drawImage(offscreenCanvas, 0, 0);
  // 나머지 동적 레이어 렌더링
}
```

---

## 6. 다음 문서

- **[D-G-005] 상수 정의서**: 모든 수치 통합

---

## 질문/결정 필요 사항

1. **DPR (Device Pixel Ratio) 처리**: Retina 디스플레이 대응? (권장: 적용)
2. **레이어 분리 방식**: 단일 Canvas vs 다중 Canvas?
3. **애니메이션 프레임 보간**: 부드러운 이동을 위해 lerp 적용?