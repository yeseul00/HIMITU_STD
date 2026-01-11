# 연습 프로젝트 #1: Canvas 미니게임 프로토타입

> **예상 소요 시간**: 8-10시간  
> **난이도**: ⭐⭐⭐ (중급)  
> **Tavern Defense 연관도**: ⭐⭐⭐⭐⭐ (핵심)

---

## 📌 프로젝트 개요

### 목표

HTML5 Canvas를 사용하여 **간단한 타일 배치 게임**을 만들면서 Tavern Defense에 필요한 핵심 기술을 습득합니다.

### 만들 게임: **Memory Tiles (기억력 타일 게임)**

```
┌─────────────────────────────────────────────────────────────────┐
│  Memory Tiles - 게임 화면 구성                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    ┌────┬────┬────┬────┐                                       │
│    │ 🍎 │ ?? │ 🍊 │ ?? │   4x4 타일 그리드                      │
│    ├────┼────┼────┼────┤                                       │
│    │ ?? │ 🍇 │ ?? │ 🍎 │   - 클릭으로 타일 뒤집기               │
│    ├────┼────┼────┼────┤   - 같은 쌍 찾으면 제거                │
│    │ 🍊 │ ?? │ ?? │ 🍇 │   - 점수/시간 표시                     │
│    ├────┼────┼────┼────┤                                       │
│    │ ?? │ ?? │ ?? │ ?? │                                       │
│    └────┴────┴────┴────┘                                       │
│                                                                 │
│    Score: 240   Time: 01:23   Moves: 12                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tavern Defense에 활용되는 기술

| 이 프로젝트에서 배우는 것         | Tavern Defense에서 사용되는 곳 |
| --------------------------------- | ------------------------------ |
| Canvas 타일 그리드 렌더링         | 맵 타일 시스템                 |
| 클릭/터치 좌표 → 타일 변환        | 건물 배치 인터랙션             |
| 게임 루프 (requestAnimationFrame) | 전투/생산 업데이트             |
| 상태 관리 패턴                    | 게임 세이브/로드               |
| 애니메이션 처리                   | 캐릭터 이동, 전투 효과         |

---

## 🗓️ 일자별 작업 계획

### Day 1 (3시간): 기본 구조 + 타일 렌더링

**목표**: Canvas에 타일 그리드를 그리고 클릭 이벤트 처리

#### 작업 내용

```
□ 프로젝트 폴더 구조 생성
□ index.html + style.css 기본 틀
□ Canvas 초기화 (반응형 크기 조정)
□ 4x4 타일 그리드 렌더링
□ 타일 클릭 시 좌표 → 그리드 위치 변환
□ 클릭한 타일 하이라이트 표시
```

#### 코드 구조

```javascript
// Day 1 결과물 구조
class Game {
  constructor(canvas) { ... }
  initCanvas() { ... }
  drawGrid() { ... }
  handleClick(x, y) { ... }
  getTileFromPosition(x, y) { ... }
}
```

---

### Day 2 (3시간): 게임 로직 + 타일 뒤집기 애니메이션

**목표**: 메모리 게임 로직 구현 및 타일 뒤집기 효과

#### 작업 내용

```
□ 타일 데이터 구조 설계 (id, symbol, isFlipped, isMatched)
□ 타일 쌍 무작위 배치 로직
□ 타일 뒤집기 애니메이션 (스케일 or 페이드)
□ 두 타일 비교 로직 (같으면 제거, 다르면 다시 뒤집기)
□ 게임 루프 (requestAnimationFrame)
□ 점수/이동 횟수 카운터
```

#### 핵심 코드 패턴

```javascript
// 게임 루프 패턴 (Tavern Defense에서도 동일하게 사용)
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime); // 상태 업데이트
  render(); // 화면 그리기

  requestAnimationFrame(gameLoop);
}
```

---

### Day 3 (3시간): UI 완성 + 게임오버/재시작

**목표**: 완성도 높은 게임 경험 구현

#### 작업 내용

```
□ 타이머 기능 (시간 제한 or 기록)
□ 게임 완료 판정 (모든 쌍 찾기)
□ 게임오버/승리 화면
□ 재시작 기능
□ 최고 기록 저장 (localStorage)
□ 사운드/진동 피드백 (선택)
□ 모바일 터치 최적화
```

---

### Day 4 (1시간, 선택): 리팩토링 + 문서화

**목표**: 코드 정리 및 Tavern Defense용 재사용 모듈 분리

#### 작업 내용

```
□ 재사용 가능한 클래스 분리
   - CanvasRenderer.js (범용 렌더러)
   - TileGrid.js (그리드 시스템)
   - GameLoop.js (게임 루프)
□ 코드 주석 정리
□ README.md 작성
```

---

## 📁 프로젝트 구조

```
practice/canvas-memory-game/
├── index.html              # 진입점
├── css/
│   └── style.css           # 스타일
├── src/
│   ├── main.js             # 엔트리 포인트
│   ├── Game.js             # 메인 게임 클래스
│   ├── TileGrid.js         # 타일 그리드
│   ├── Tile.js             # 타일 객체
│   ├── Renderer.js         # Canvas 렌더러
│   └── InputHandler.js     # 입력 처리
├── assets/
│   └── sounds/             # 효과음 (선택)
└── README.md               # 프로젝트 설명
```

---

## 🎯 학습 체크리스트

### Canvas 기초

- [ ] Canvas 요소 생성 및 크기 조정
- [ ] 2D Context 가져오기
- [ ] 도형 그리기 (rect, arc, path)
- [ ] 이미지/텍스트 렌더링
- [ ] 좌표계 이해 (translate, scale)

### 게임 개발 패턴

- [ ] 게임 루프 구현 (requestAnimationFrame)
- [ ] 델타 타임 활용
- [ ] 상태 머신 패턴
- [ ] 이벤트 기반 아키텍처

### 인터랙션

- [ ] 마우스 클릭 이벤트
- [ ] 터치 이벤트 (모바일)
- [ ] 클릭 좌표 → 게임 좌표 변환

---

## 🔗 참고 자료

| 자료                  | URL                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------ |
| MDN Canvas Tutorial   | https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial                 |
| Canvas 좌표 변환      | https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations |
| requestAnimationFrame | https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame        |

---

## ✅ 완료 기준

1. 4x4 타일 그리드가 Canvas에 렌더링됨
2. 타일 클릭 시 뒤집기 애니메이션 동작
3. 같은 쌍을 찾으면 제거됨
4. 모든 쌍을 찾으면 게임 완료
5. 점수/시간/이동횟수 표시
6. 모바일에서도 정상 동작
7. 최고 기록이 localStorage에 저장됨

---

_이 프로젝트를 완료하면 Tavern Defense의 타일 시스템과 Canvas 렌더링에 대한 기초가 완성됩니다!_
