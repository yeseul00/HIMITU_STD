# 🎮 HIMITU 프로젝트 컨텍스트

> Gemini Code Assist (Antigravity) 전용  
> 작성일: 2025-01-11  
> 프로젝트: Tavern Defense (용사의 여관)

---

## 📋 프로젝트 개요

### 기본 정보
```
프로젝트명: HIMITU - Tavern Defense
장르: 타일 배치 + 타워 디펜스 + 타이쿤
플랫폼: 텔레그램 미니앱 (Telegram Mini Apps)
기술 스택: HTML5 Canvas + Vanilla JavaScript (ES6)
팀 구성: 4인 (찰스, 수삼, 쵸타, 슬뚜)
```

### 게임 핵심 메커니즘
```
🌙 밤 (Night): 술집 영업 + 전략 준비 (무제한 시간)
☀️ 낮 (Day): 몬스터 습격 방어 (실시간 전투)
🔥 목표: 술집 화덕 보호 (파괴 시 게임오버)
⭐ 타일 합병: 2048 방식 (같은 건물 + 같은 레벨)
📊 진행: 5일(5 Wave) × 5 스테이지
```

---

## 👥 팀 역할 (슬뚜 관점)

### 슬뚜 (Infra-Visual) - 내 역할
```
주 담당:
- UI Layer: Canvas 렌더링, 화면 구성
- Visual Systems: 이펙트, 애니메이션
- 인프라: 텔레그램 연동, GitHub Actions 배포

현재 작업:
- Canvas 렌더링 실습 프로젝트
- 개인 GitHub 저장소에서 학습 진행
- 텔레그램 WebApp 통합 개발
```

### 다른 팀원
```
수삼 (Core Lead): 게임 엔진, 통합, 메인 로직
찰스 (PD-Data): 게임 데이터, 밸런스, 기획 지원
쵸타 (Planner-Logic): 핵심 게임 시스템, 기획 리드
```

---

## 🏗️ 아키텍처 (4계층)

```
Entry Points (진입)
    ├── index.html
    └── main.js
    
UI Layer (화면)
    ├── CanvasRenderer.js
    ├── TileGrid.js
    └── InputHandler.js
    
Systems Layer (로직)
    ├── TileSystem.js
    ├── CombatSystem.js
    └── ProductionSystem.js
    
Data Layer (데이터)
    ├── buildings.js
    ├── monsters.js
    └── waves.js
```

### 의존성 규칙
```
❌ 상위 레이어 → 하위 레이어 의존 금지
✅ 하위 레이어 → 상위 레이어 의존만 허용
✅ EventBus 통해 느슨한 결합
```

---

## 📐 Canvas 렌더링 규격

### 화면 크기
```javascript
const CANVAS_WIDTH = 360;   // 모바일 세로
const CANVAS_HEIGHT = 640;
const TILE_SIZE = 60;       // 타일 크기
const GRID_COLS = 6;        // 그리드 6x10
const GRID_ROWS = 10;
```

### 좌표계
```
(0, 0) ──────► X (col: 0~5)
  │
  │
  ▼
  Y (row: 0~9)

원점: 좌상단
UI 영역: 상단 80px
게임 영역: 나머지
```

### 렌더링 순서 (13개 레이어)
```
0. 배경
1. 그리드 선
2. 빈 타일
3. 건물
4. 특수 타일 (화덕, 플레이어)
5. 손님
6. 몬스터
7. 공격 이펙트
8. 파티클
9. 체력바
10. UI 패널
11. 버튼
12. 오버레이
```

---

## 💻 코딩 규칙

### 네이밍
```javascript
// 변수/함수: camelCase
const tileSize = 60;
function getTile() {}

// 클래스: PascalCase
class CanvasRenderer {}

// 상수: UPPER_SNAKE_CASE
const MAX_TILES = 60;

// 파일명
GameEngine.js      // 클래스
constants.js       // 유틸
```

### 스타일
```javascript
// 들여쓰기: 2 spaces (탭 아님)
function example() {
  if (condition) {
    doSomething();
  }
}

// 따옴표: 작은따옴표
const text = 'Hello';

// 세미콜론: 항상 사용
const x = 1;

// 줄 길이: 100자 이하 권장
```

### 모듈 구조
```javascript
// 1. import
import { something } from './module.js';

// 2. 상수
const CONSTANT = 'value';

// 3. 클래스/함수
export class MyClass {
  // ...
}

// 4. export (필요시)
export { something };
```

### Export 규칙
```javascript
// Named export만 사용 (default export 금지)
export class MyClass {}
export function myFunc() {}
export const MY_CONST = 1;
```

---

## 📱 텔레그램 연동

### 필수 SDK
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

### 초기화
```javascript
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// 사용자 정보
const user = tg.initDataUnsafe?.user;

// 햅틱 피드백
tg.HapticFeedback.impactOccurred('medium');

// CloudStorage
tg.CloudStorage.setItem('key', 'value', callback);
tg.CloudStorage.getItem('key', callback);
```

---

## 🚀 개발 환경

### 로컬 개발
```bash
# 개인 저장소 (학습용)
~/DEVELOPER/canvas-tavern-defense/

# 구조
├── .ai/                    # AI 지침 (이 파일)
├── docs/                   # 가이드 문서
├── src/
│   ├── telegram/          # 텔레그램 연동
│   ├── core/              # 렌더러
│   ├── components/        # UI 컴포넌트
│   └── utils/             # 유틸리티
└── index.html
```

### 배포
```
GitHub Actions 자동 배포
→ GitHub Pages
→ 텔레그램 봇 Menu Button에서 실행
```

---

## ✅ 작업 원칙

### DO (해야 할 것)
```
✅ RENDERING_GUIDE.md 참조
✅ CODING_CONVENTION.md 준수
✅ 텔레그램 SDK 처음부터 포함
✅ 터치/마우스 통합 처리
✅ 코드 설명 (코드가 문서)
✅ 주석 최소화
✅ Git 커밋 자주
```

### DON'T (하지 말 것)
```
❌ Default export 사용
❌ 전역 변수 사용
❌ 매직 넘버 (상수화 필수)
❌ 함수 20줄 초과
❌ 탭 사용 (스페이스만)
❌ 프로젝트 문서 무시
❌ 텔레그램 연동 나중에
```

---

## 🎯 현재 목표

### Week 1 (진행 중)
```
Day 1-2: Canvas + 텔레그램 기본 설정
Day 3-4: 타일 그리드 + 터치 이벤트
Day 5: 드래그 앤 드롭 + CloudStorage
```

### 완성 기준
```
✅ 텔레그램 봇에서 실행
✅ Canvas 6x10 그리드
✅ 터치/마우스 입력
✅ 햅틱 피드백
✅ 저장/로드
```

---

## 📚 참고 문서

### 로컬 문서
```
docs/RENDERING_GUIDE.md      - Canvas 렌더링 규칙
docs/CODING_CONVENTION.md    - 코딩 표준
docs/WEEK1_PLAN_TELEGRAM.md  - 실습 계획
```

### 프로젝트 문서 (웹 Claude 참조)
```
D-G-004: Canvas 레이어 구조
D-G-016: 렌더링 시스템
D-G-003: 시스템 의존성 맵
```

---

## 💡 Gemini에게 요청할 때

### 좋은 예시
```
✅ "RENDERING_GUIDE의 좌표 변환 함수로 TileGrid 만들어줘"
✅ "CODING_CONVENTION 맞춰서 InputHandler 클래스 작성"
✅ "Day 3 체크리스트 보고 필요한 파일 생성해줘"
```

### 나쁜 예시
```
❌ "게임 전체 만들어줘"
❌ "타일 그리는 코드" (어디 규칙? 어떤 형식?)
❌ "에러 고쳐줘" (에러 내용 없음)
```

---

## 🔧 자주 쓰는 명령

### 문서 참조
```bash
# 가이드 읽기
cat docs/RENDERING_GUIDE.md

# 계획 확인
cat docs/WEEK1_PLAN_TELEGRAM.md

# 규칙 확인
cat docs/CODING_CONVENTION.md
```

### 파일 생성 요청
```
"docs/WEEK1_PLAN_TELEGRAM.md의 Day 1 파일 전부 생성해줘"
"TileGrid 클래스 만들어줘 (CODING_CONVENTION 준수)"
"index.html에 텔레그램 SDK 추가해줘"
```

---

**작성일**: 2025-01-11  
**버전**: 1.0  
**용도**: Gemini Code Assist 컨텍스트
