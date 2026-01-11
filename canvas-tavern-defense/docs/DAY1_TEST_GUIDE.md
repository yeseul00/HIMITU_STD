# Day 1 테스트 가이드

## 🎯 테스트 목적
Canvas 렌더링 시스템이 정상적으로 작동하는지 검증하고, Telegram WebApp 연동이 올바르게 되었는지 확인합니다.

---

## 📋 사전 준비

### 필요한 것
- ✅ GitHub Pages 배포 완료 (커밋 50ff940)
- ✅ 배포 URL: `https://yeseul00.github.io/HIMITU_STD/canvas-tavern-defense/`
- ✅ Telegram 봇 설정 (Menu Button에 URL 등록)

### 테스트 환경
1. **로컬 브라우저 테스트** (Chrome/Safari)
2. **Telegram 앱 테스트** (iOS/Android)

---

## 🧪 테스트 시나리오

### 1️⃣ 로컬 브라우저 테스트 (1차 검증)

#### URL 접속
```
https://yeseul00.github.io/HIMITU_STD/canvas-tavern-defense/
```

#### 체크리스트

**A. 화면 렌더링 ✅**
- [ ] Canvas가 화면에 표시되는가?
- [ ] 크기가 적절한가? (360x640)
- [ ] 배경색이 어두운 색인가? (#1a1a2e)

**B. 시각적 요소 ✅**
- [ ] 파란색 테두리가 Canvas 가장자리에 표시되는가?
- [ ] "Canvas 준비 완료!" 텍스트가 중앙에 표시되는가?
- [ ] "텔레그램 WebApp 연동 성공" 텍스트가 하단에 표시되는가?

**C. 정보 패널 (좌측 상단) ✅**
- [ ] 정보 패널이 표시되는가?
- [ ] "🎮 Tavern Defense" 제목이 있는가?
- [ ] 사용자 이름이 표시되는가? (브라우저에서는 "Guest")
- [ ] User ID가 표시되는가? (브라우저에서는 "guest")
- [ ] **FPS 카운터가 표시되는가?**

**D. FPS 카운터 동작 ⚡ (중요)**
```
정상 기준:
- FPS 숫자가 1초마다 업데이트되어야 함
- 범위: 58~60 FPS (약간의 변동 정상)
- 고정값 (예: 항상 60): 비정상 ❌

테스트 방법:
1. 페이지 로드 후 10초간 FPS 값 관찰
2. FPS 값이 변하는지 확인
3. 브라우저 DevTools에서 Performance 모니터링
```

**E. 콘솔 로그 확인 (DevTools Console)**
```javascript
// 정상 로그 순서:
[Telegram] 초기화 완료
[Telegram] User: {id: 'guest', ...}
[Renderer] Canvas 초기화 완료
[Game] 게임 시작!
[Game] 사용자: {id: 'guest', ...}
```

**F. 에러 체크**
- [ ] 콘솔에 빨간색 에러 메시지가 없는가?
- [ ] 리소스 로딩 실패(404) 없는가?

---

### 2️⃣ Telegram 앱 테스트 (2차 검증)

#### 접속 방법
1. Telegram 앱 열기
2. 봇 선택
3. Menu Button 클릭
4. WebApp 실행

#### 체크리스트

**A. Telegram 환경 정보 ✅**
- [ ] 사용자 이름이 실제 Telegram 이름으로 표시되는가?
- [ ] User ID가 실제 Telegram ID로 표시되는가?
- [ ] 테마 색상이 Telegram 테마에 맞춰 변경되는가?

**B. 햅틱 피드백 진동 ✅**
- [ ] 페이지 로드 시 진동이 발생하는가?

**C. FPS 카운터 동작 ⚡ (핵심 문제)**
```
사용자 보고 문제:
- Telegram 앱에서 FPS가 변동하지 않음
- 브라우저에서는 정상 변동

예상 원인:
1. Telegram WebApp의 JavaScript 실행 제한
2. requestAnimationFrame의 동작 차이
3. 백그라운드 실행 시 frame throttling

확인 사항:
- FPS 값이 변하는가?
- 항상 60으로 고정되어 있는가?
- 0이나 NaN으로 표시되는가?
```

**D. 터치 반응성**
- [ ] Canvas 영역을 터치했을 때 반응이 있는가?
- [ ] 스크롤이 막혀있는가? (touch-action: none)

---

## 📊 예상 결과 vs 실제 결과

### 정상 동작 기준

| 항목 | 브라우저 | Telegram 앱 |
|------|----------|-------------|
| Canvas 표시 | ✅ | ✅ |
| 텍스트 렌더링 | ✅ | ✅ |
| 사용자 정보 | Guest | 실제 사용자 |
| FPS 카운터 출력 | ✅ | ✅ |
| **FPS 값 변동** | **⚠️ 변동됨** | **❌ 고정됨 (문제)** |
| 햅틱 피드백 | - | ✅ |
| 콘솔 로그 | ✅ | - (확인 불가) |

### 사용자 보고 문제
```
현상:
✅ GitHub URL (브라우저): FPS 변동 있음
❌ Telegram 앱: FPS 변동 없음

진단 필요:
- Telegram WebApp 환경에서 requestAnimationFrame 동작 확인
- FPS 계산 로직 검증
- 대안 구현 필요 여부 판단
```

---

## 🔧 문제 해결 가이드

### FPS가 0 또는 NaN인 경우
```javascript
// 원인: updateFPS가 호출되지 않음
// 해결: tick() 함수 확인
```

### FPS가 항상 60으로 고정된 경우
```javascript
// 원인 1: frameCount가 증가하지 않음
// 원인 2: 시간 갱신이 안됨
// 해결: 아래 디버그 코드 추가

updateFPS(currentTime) {
  console.log('[DEBUG] frameCount:', this.frameCount);
  console.log('[DEBUG] currentTime:', currentTime);
  this.frameCount++;
  // ...
}
```

### Canvas가 표시되지 않는 경우
```javascript
// 원인: 파일 경로 오류
// 해결: 브라우저 DevTools Network 탭 확인
```

---

## 🚀 다음 단계

### FPS 문제 해결 후
1. **Day 3-4 진행**: 타일 그리드 렌더링
2. **터치 이벤트 처리**: InputHandler 구현
3. **햅틱 피드백 연동**: 타일 클릭 시 진동

### 추가 개선 사항
- [ ] Telegram 환경 감지 로직 추가
- [ ] FPS 표시 방식 개선 (더 정확한 계산)
- [ ] 성능 모니터링 추가 (메모리, CPU)

---

**작성일**: 2026-01-11  
**버전**: 1.0  
**대상**: 개발자 테스트용
