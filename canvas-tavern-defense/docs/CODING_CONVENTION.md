# 📝 코딩 컨벤션

> HIMITU 프로젝트 코드 작성 표준  
> 작성일: 2025-01-11  
> 적용 범위: 전체 프로젝트

---

## 🎯 핵심 원칙

1. **간결성**: 불필요한 코드 없음
2. **일관성**: 팀원 모두 같은 스타일
3. **가독성**: 코드가 문서
4. **ES6 모듈**: import/export 사용

---

## 📛 네이밍 규칙

### 변수 / 함수
```javascript
// camelCase 사용
const tileSize = 60;
const gridCols = 6;

function getTilePosition(col, row) { }
function updateGameState() { }
```

### 클래스
```javascript
// PascalCase 사용
class GameEngine { }
class CanvasRenderer { }
class TileGrid { }
```

### 상수
```javascript
// UPPER_SNAKE_CASE 사용
const MAX_TILES = 60;
const TILE_SIZE = 60;
const GRID_COLS = 6;
const CANVAS_WIDTH = 360;

// 상수 객체
const COLORS = {
  BACKGROUND: '#1a1a2e',
  TILE_EMPTY: '#2a2a3e'
};
```

### 파일명
```javascript
// 클래스: PascalCase.js
GameEngine.js
CanvasRenderer.js
TileGrid.js

// 유틸/데이터: camelCase.js
constants.js
helpers.js
buildings.js
```

### Private 메서드 (관례)
```javascript
class MyClass {
  // public
  publicMethod() { }
  
  // private (언더스코어 접두사)
  _privateMethod() { }
  _internalHelper() { }
}
```

---

## 🎨 코드 스타일

### 들여쓰기
```javascript
// 2 spaces (탭 아님)
function example() {
  if (condition) {
    doSomething();
  }
}
```

### 따옴표
```javascript
// 작은따옴표 사용
const text = 'Hello';
const path = './module.js';

// 예외: HTML 속성, 템플릿 리터럴
const html = `<div class="container">${text}</div>`;
```

### 세미콜론
```javascript
// 항상 사용
const x = 1;
doSomething();

// 예외: export 선언 끝
export class MyClass { }  // 세미콜론 없음
export { myFunc };        // 세미콜론 있음
```

### 줄 길이
```javascript
// 100자 이하 권장
// 길면 적절히 줄바꿈

// 좋음
const result = calculateSomething(
  parameter1,
  parameter2,
  parameter3
);

// 나쁨
const result = calculateSomething(parameter1, parameter2, parameter3, parameter4, parameter5);
```

### 빈 줄
```javascript
// 논리적 블록 구분
import { something } from './module.js';

const CONSTANT = 'value';

export class MyClass {
  constructor() {
    // ...
  }

  method1() {
    // ...
  }

  method2() {
    // ...
  }
}
```

---

## 📦 모듈 구조

### 기본 구조
```javascript
// 1. import 선언
import { something } from './module.js';
import { another } from '../utils/helpers.js';

// 2. 상수 정의
const CONSTANT = 'value';
const CONFIG = {
  // ...
};

// 3. 클래스/함수 정의
export class MyClass {
  // ...
}

export function myFunction() {
  // ...
}

// 4. 단독 export (필요시)
// export { something };
```

### Import 순서
```javascript
// 1. 상위 레이어 모듈
import { EventBus } from '../core/EventBus.js';

// 2. 동일 레이어 모듈
import { TileSystem } from './TileSystem.js';

// 3. 하위 레이어 모듈
import { buildings } from '../data/buildings.js';

// 4. 유틸리티
import { gridToScreen } from '../utils/helpers.js';
```

### Export 규칙
```javascript
// Named export 사용 (default export 금지)
export class MyClass { }
export function myFunction() { }
export const MY_CONSTANT = 1;

// 한 파일에서 여러 개 export 가능
export { class1, class2, func1, CONST1 };
```

---

## 💬 주석 규칙

### 기본 원칙
```javascript
// 주석 최소화 (코드로 설명)
// 필요 시 한 줄 주석 사용

// 좋음: 명확한 함수명
function calculateTotalDamage(attackPower, defenseValue) {
  return Math.max(0, attackPower - defenseValue);
}

// 나쁨: 불필요한 주석
// 공격력에서 방어력을 뺀다
const damage = attack - defense;
```

### JSDoc (public API만)
```javascript
/**
 * 타일 그리드를 화면 좌표로 변환
 * @param {number} col - 그리드 열 (0~5)
 * @param {number} row - 그리드 행 (0~9)
 * @returns {{x: number, y: number}} 화면 좌표
 */
export function gridToScreen(col, row) {
  return {
    x: col * TILE_SIZE,
    y: row * TILE_SIZE + 80
  };
}
```

### TODO 주석
```javascript
// TODO: 성능 최적화 필요
// FIXME: 버그 - 음수 체력 가능
// HACK: 임시 처리 (추후 리팩토링)
```

---

## 🔧 함수 작성

### 함수 길이
```javascript
// 20줄 이하 권장
// 길면 분리

// 좋음
function processData(data) {
  const validated = validateData(data);
  const transformed = transformData(validated);
  return saveData(transformed);
}

// 나쁨: 50줄짜리 함수
```

### 매개변수
```javascript
// 3개 이하 권장
// 많으면 객체 사용

// 좋음
function createTile({ col, row, type, level }) {
  // ...
}

// 나쁨
function createTile(col, row, type, level, hp, damage, range) {
  // ...
}
```

### 반환값
```javascript
// 명확한 반환
function getTile(index) {
  if (index < 0 || index >= tiles.length) {
    return null;  // 명확한 실패 표시
  }
  return tiles[index];
}

// 조기 반환 (early return)
function validateTile(tile) {
  if (!tile) return false;
  if (tile.isEmpty) return false;
  if (!tile.building) return false;
  return true;
}
```

---

## 🎯 클래스 작성

### 생성자
```javascript
class MyClass {
  constructor(param1, param2) {
    // 1. 매개변수 검증
    if (!param1) throw new Error('param1 required');
    
    // 2. 프로퍼티 초기화
    this.param1 = param1;
    this.param2 = param2;
    
    // 3. 내부 상태
    this._initialized = false;
  }
}
```

### 메서드 순서
```javascript
class MyClass {
  // 1. constructor
  constructor() { }
  
  // 2. public 메서드
  publicMethod1() { }
  publicMethod2() { }
  
  // 3. private 메서드
  _privateMethod1() { }
  _privateMethod2() { }
  
  // 4. static 메서드
  static staticMethod() { }
}
```

---

## 🗂️ 폴더 구조

```
src/
├── main.js              # 진입점
├── core/                # 핵심 (의존성 없음)
│   ├── GameEngine.js
│   ├── StateManager.js
│   └── EventBus.js
├── systems/             # 시스템 (core에만 의존)
│   ├── ProductionSystem.js
│   ├── CombatSystem.js
│   ├── TileSystem.js
│   └── UpgradeSystem.js
├── ui/                  # UI (core, systems에 의존)
│   ├── UIManager.js
│   ├── CanvasRenderer.js
│   └── components/
│       ├── Button.js
│       └── Modal.js
├── data/                # 데이터 (의존성 없음)
│   ├── buildings.js
│   ├── monsters.js
│   └── waves.js
├── utils/               # 유틸 (의존성 없음)
│   ├── constants.js
│   └── helpers.js
└── telegram/            # 텔레그램 (core에만 의존)
    ├── TelegramAPI.js
    └── CloudStorage.js
```

---

## 🔄 이벤트 네이밍

```javascript
// kebab-case 사용
eventBus.emit('tile-click', data);
eventBus.on('production-complete', handler);
eventBus.emit('wave-start', waveNumber);
eventBus.on('monster-defeated', handler);

// 네이밍 패턴
// {대상}-{동작}
'tile-placed'
'building-upgraded'
'monster-spawned'
'game-over'
```

---

## ⚠️ 피해야 할 것

### 전역 변수
```javascript
// 나쁨
let globalState = {};

// 좋음
export const gameState = {};  // 모듈 스코프
```

### 매직 넘버
```javascript
// 나쁨
if (hp < 50) { }

// 좋음
const CRITICAL_HP = 50;
if (hp < CRITICAL_HP) { }
```

### 중첩 콜백
```javascript
// 나쁨
getData(function(data) {
  processData(data, function(result) {
    saveData(result, function(response) {
      // ...
    });
  });
});

// 좋음 (async/await)
const data = await getData();
const result = await processData(data);
const response = await saveData(result);
```

---

## ✅ 체크리스트

코드 작성 후 확인:

- [ ] 네이밍 규칙 준수
- [ ] 들여쓰기 2 spaces
- [ ] 세미콜론 사용
- [ ] 주석 최소화
- [ ] 함수 20줄 이하
- [ ] import/export 정렬
- [ ] 상수 대문자
- [ ] 파일명 규칙 준수

---

## 🔍 예시: 전체 파일

```javascript
// src/systems/TileSystem.js

import { EventBus } from '../core/EventBus.js';
import { buildings } from '../data/buildings.js';
import { GRID_COLS, GRID_ROWS } from '../utils/constants.js';

const TILE_COUNT = GRID_COLS * GRID_ROWS;

export class TileSystem {
  constructor(gameState) {
    this.gameState = gameState;
    this.eventBus = EventBus.getInstance();
    this._setupEventListeners();
  }

  placeTile(index, buildingType, level) {
    if (!this._isValidPlacement(index)) {
      return false;
    }

    const tile = this.gameState.grid[index];
    tile.isEmpty = false;
    tile.building = {
      type: buildingType,
      level: level,
      ...buildings[buildingType]
    };

    this.eventBus.emit('tile-placed', { index, building: tile.building });
    return true;
  }

  _isValidPlacement(index) {
    if (index < 0 || index >= TILE_COUNT) return false;
    if (!this.gameState.grid[index].isEmpty) return false;
    return true;
  }

  _setupEventListeners() {
    this.eventBus.on('tile-click', this._handleTileClick.bind(this));
  }

  _handleTileClick({ index }) {
    // Handle tile click logic
  }
}
```

---

**작성일**: 2025-01-11  
**버전**: 1.0  
**작성자**: 슬뚜 + Claude
