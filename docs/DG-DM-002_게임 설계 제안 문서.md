# 1. 문서 목적

이 문서는 **히미쯔 프로젝트(용사의 여관)**의

게임 기획을 바탕으로 설계한 **프로그램 구조를 팀 내 개발자 간 공유**하고,

- 구조 이해를 빠르게 돕고
- 모듈 단위 분업을 가능하게 하며
- 아직 확정되지 않은 부분을 **논의 안건으로 명확히 분리**

하는 것을 목적으로 한다.

> ⚠️ 본 문서는 "정답 구조"가 아니라 MVP 개발을 위한 논의용 구조 초안이다.

---

## 📝 개정 이력 (2026-01-10)

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 그리드 크기 | 8×6 | **8×9** |
| 페이즈 명명 | Operation/Battle | **NIGHT/DAY** |
| 몬스터 | Goblin만 | **Slime + Goblin** |
| 신규 엔티티 | - | **BarTable (HP 10)** |
| 건물 최대 레벨 | Lv4 | **Lv5** |

---

## 2. 프로젝트 전제 조건

### 2.1 사용 기술

- HTML5
- Canvas
- ES6 (Class 기반)

### 2.2 플랫폼

- Telegram Mini Apps
- Telegram WebApp API 사용 (Wrapper로 캡슐화)

### 2.3 그리드 설정 (확정)

```javascript
const GRID_CONFIG = {
  COLS: 8,           // 가로 타일 수
  ROWS: 9,           // 세로 타일 수 (기획서 정합성)
  TILE_SIZE: 64      // 픽셀
};
```

---

## 3. 전체 아키텍처 개요

### 핵심 설계 방향

- **Core / Domain / Entities / UI / Platform** 계층 분리
- UI ↔ 게임 규칙은 **Event 기반 통신**
- Game Loop는 **Fixed Frame Rate + tickCount 기반**
- DataTable은 **Singleton**으로 전역 접근 허용

---

## 4. 디렉토리 구조 (분업 기준)

```
src/
 ├ core/        # 엔진 성격의 공통 시스템
 ├ domain/      # 게임 규칙 (영업/전투/스테이지)
 ├ entities/    # 게임 오브젝트 (FSM, 애니메이션)
 ├ ui/          # UI / Drag & Drop
 ├ data/        # DataTable (json)
 ├ platform/    # Telegram API Wrapper
 └ assets/      # 이미지/사운드

```

> 📌 분업 기준
> 
> - core: 엔진 담당
> - domain: 게임 로직 담당
> - entities: 오브젝트/FSM 담당
> - ui: UX/UI 담당
> - platform: Telegram 연동 담당

---

## 5. Core 레이어 (공통 인프라)

### 5.1 Game Loop & Scene

- `GameLoop`
    - Fixed FPS 유지
    - `tickCount` 관리
    - update / draw 분리
- `Scene`
    - 오브젝트 관리 및 정렬
    - `update(tickCount)`
    - `draw(ctx)`
- `SceneManager`
    - Scene 전환 (push / pop / replace)

---

## 6. Domain 레이어 (게임 규칙)

### 6.1 GamePhase (페이즈 관리)

- 페이즈 상수 (확정):
  ```javascript
  const PHASES = {
    PREPARATION: 'preparation',
    NIGHT: 'night',   // 영업 (구: OPERATION)
    DAY: 'day'        // 전투 (구: BATTLE)
  };
  ```
- 이벤트:
  - `night:start`, `night:end`
  - `day:start`, `day:end`

---

### 6.2 영업 시스템 (Night Phase)

**주요 책임**

- 손님 스폰
- 건물 배치/합병
- 음식 생산 및 소모

**세부 시스템**

- 손님 타입 결정 및 스폰
- 랜덤 건물 결정
- 타일 배치 및 합병
    - 합병 시 레벨업
    - 외형 변경
- 음식 생산
- 음식 소비

---

### 6.3 전투 시스템 (Battle Phase)

**주요 책임**

- 몬스터 스폰
- 웨이브 관리
- 전투 처리

**세부 시스템**

- 몬스터 스폰 로직
- 몬스터 타입 결정
- Wave 관리

---

### 6.4 Stage 시스템

- `Stage` (Base Class)
    - 난이도 파라미터 관리
- `TileManager`
    - 타일 배치/점유 관리
    - 이동 가능/불가능 판단

---

## 7. Entities 레이어 (GameObject 계층)

### 7.1 GameObject (Base)

- 위치 / HP
- FSM (Finite State Machine)
- Sprite 애니메이션
- update / draw

---

### 7.2 주요 엔티티

### 플레이어

- 여관 주인

### 몬스터

- Monster Base Class
- 몬스터 타입별 상속
- ⚠️ 현재 기획 미정 (추후 정의)

### 손님

- 성별 요소
- 외형 타입
- 요구 음식

### 음식

- 술
    - 와인 / 맥주 / 위스키
- 고기
    - 닭 / 소 / 돼지
- 피자

### 타일

- 이동 가능 / 불가능 타일
- 건물 타일
    - 합병 가능 / 불가능
    - 합병 시 레벨업 + 외형 변경
    - 화덕 / 바테이블 / 방어용 건물

---

## 8. UI 레이어

- 버튼
- 프로그래스 바
- 아이콘
- 팝업
- Drag & Drop
    - 타일 이동 지원
    - 드롭 시 이벤트 발생

> UI는 GameRules를 직접 호출하지 않고 EventBus를 통해 통신

---

## 9. Data 레이어

### 9.1 DataTable (Singleton)

- JSON 기반
- 전역 접근 허용

**포함 데이터**

- 몬스터 데이터
- 플레이어 데이터
- 음식 데이터
- 타일 데이터

---

## 10. Platform 레이어

### 10.1 Telegram Wrapper

- Telegram WebApp API 캡슐화
- 입력 / 저장 / 햅틱 / 분석 등 확장 가능
- 게임 로직에서 Telegram API 직접 접근 금지

---

## 11. 결정 사항 (현재 합의된 내용)

- Canvas 기반 단일 Scene + Layered Render 구조
- Fixed FPS + tickCount 사용
- DataTable Singleton 허용
- UI ↔ Domain은 Event 기반 통신
- Stage 단위로 난이도 조절

---

## 12. 오픈 이슈 (논의 필요)

- 몬스터 타입 및 행동 패턴 정의
- 건물 합병 규칙 상세 (조건 / 최대 레벨)
- 타일과 GameObject 상속 관계 유지 여부
- Phase 전환 조건 (시간 / 조건 충족)
- 전투 판정 방식 (충돌 / 거리 / 타일 기준)

---

## 13. 다음 액션 아이템

- [ ] Core(GameLoop / Scene / EventBus) 최소 구현
- [ ] TileManager + Grid 구조 확정
- [ ] 영업 Phase MVP 스펙 확정
- [ ] Drag & Drop UX 테스트
- [ ] 몬스터 최소 1종 정의