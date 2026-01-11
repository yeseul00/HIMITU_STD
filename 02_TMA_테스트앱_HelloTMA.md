# 연습 프로젝트 #2: TMA 테스트 앱 (Hello TMA)

> **예상 소요 시간**: 2-3시간  
> **난이도**: ⭐⭐ (초급-중급)  
> **Tavern Defense 연관도**: ⭐⭐⭐⭐ (높음)

---

## 📌 프로젝트 개요

### 목표

텔레그램 미니앱(TMA) SDK의 핵심 기능을 직접 테스트하면서 플랫폼을 이해합니다.

### 만들 앱: **TMA API Explorer**

```
┌─────────────────────────────────────────────────────────────────┐
│  📱 TMA API Explorer                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👤 유저 정보                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ID: 123456789                                          │   │
│  │  이름: 홍길동                                            │   │
│  │  프리미엄: ✅                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💾 CloudStorage 테스트                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [저장할 값 입력 _______________]  [💾 저장]              │   │
│  │  저장된 값: "Hello TMA!"                                 │   │
│  │  [🔄 불러오기]  [🗑️ 삭제]                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  📳 HapticFeedback 테스트                                       │
│  [ Light ] [ Medium ] [ Heavy ] [ Success ] [ Error ]          │
│                                                                 │
│  🎨 테마 정보: Dark Mode                                        │
│  bg: #1c1c1e | text: #ffffff | button: #0a84ff                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    [ 📤 데이터 전송 테스트 ]                     │
└─────────────────────────────────────────────────────────────────┘
```

### Tavern Defense에 직접 활용되는 기능

| 테스트 항목    | Tavern Defense 사용처       |
| -------------- | --------------------------- |
| initDataUnsafe | 유저 식별, 진행도 저장      |
| CloudStorage   | **게임 세이브 전체**        |
| HapticFeedback | 터치 피드백, 전투/획득 효과 |
| MainButton     | 메인 액션 버튼              |
| themeParams    | UI 색상 연동                |
| openInvoice    | Telegram Stars 결제         |

---

## 🗓️ 작업 계획 (2-3시간)

### Phase 1 (1시간): 프로젝트 세팅 + 유저 정보

#### 작업 내용

```
□ 프로젝트 폴더 구조 생성
□ index.html + TMA SDK 스크립트 삽입
□ 기본 UI 레이아웃 (CSS)
□ TMA 초기화 (ready, expand)
□ initDataUnsafe에서 유저 정보 표시
□ 개발 모드 폴백 구현 (텔레그램 외부용)
```

#### 핵심 코드

```javascript
// TMA 초기화 템플릿
const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();

  const user = tg.initDataUnsafe?.user;
  displayUserInfo(user);
} else {
  console.log("개발 모드: 텔레그램 환경 아님");
  displayUserInfo({ id: "DEV", first_name: "테스트" });
}
```

---

### Phase 2 (1시간): CloudStorage 테스트

#### 작업 내용

```
□ 입력 필드 + 저장/불러오기/삭제 버튼 UI
□ CloudStorage.setItem 구현
□ CloudStorage.getItem 구현
□ CloudStorage.removeItem 구현
□ 에러 핸들링 (개발 모드: localStorage 폴백)
□ 저장된 값 실시간 표시
```

#### 핵심 코드 패턴

```javascript
// CloudStorage 래퍼 (Tavern Defense에서 그대로 사용)
class Storage {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.isAvailable = !!this.tg?.CloudStorage;
  }

  async save(key, value) {
    if (!this.isAvailable) {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }
    return new Promise((resolve) => {
      this.tg.CloudStorage.setItem(key, JSON.stringify(value), (err, ok) => {
        resolve(!err && ok);
      });
    });
  }

  async load(key) {
    if (!this.isAvailable) {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    }
    return new Promise((resolve) => {
      this.tg.CloudStorage.getItem(key, (err, value) => {
        resolve(value ? JSON.parse(value) : null);
      });
    });
  }
}
```

---

### Phase 3 (30분-1시간): UI 컴포넌트 + 피드백

#### 작업 내용

```
□ HapticFeedback 버튼들 구현
□ MainButton 표시/숨기기/클릭 테스트
□ BackButton 테스트
□ themeParams 색상 표시
□ showAlert / showConfirm 팝업 테스트
□ 전체 기능 동작 확인
```

#### 핵심 코드

```javascript
// HapticFeedback 테스트
function testHaptic(type) {
  const haptic = window.Telegram?.WebApp?.HapticFeedback;
  if (!haptic) return;

  switch (type) {
    case "light":
      haptic.impactOccurred("light");
      break;
    case "medium":
      haptic.impactOccurred("medium");
      break;
    case "heavy":
      haptic.impactOccurred("heavy");
      break;
    case "success":
      haptic.notificationOccurred("success");
      break;
    case "error":
      haptic.notificationOccurred("error");
      break;
  }
}

// MainButton 테스트
const mainBtn = window.Telegram?.WebApp?.MainButton;
if (mainBtn) {
  mainBtn.text = "테스트 버튼";
  mainBtn.color = "#4CAF50";
  mainBtn.onClick(() => {
    alert("MainButton 클릭됨!");
  });
  mainBtn.show();
}
```

---

## 📁 프로젝트 구조

```
practice/hello-tma/
├── index.html              # 메인 페이지
├── css/
│   └── style.css           # 스타일 (TMA 테마 연동)
├── src/
│   ├── main.js             # 엔트리 포인트
│   ├── TMAWrapper.js       # TMA SDK 래퍼 클래스 ⭐
│   ├── Storage.js          # CloudStorage 래퍼 ⭐
│   └── UI.js               # UI 업데이트 함수
└── README.md               # 사용 방법
```

---

## 🚀 배포 및 테스트 방법

### Step 1: GitHub Pages 배포

```bash
# 저장소에 push 후
# Settings → Pages → Source: main branch
# URL: https://<username>.github.io/<repo>/practice/hello-tma/
```

### Step 2: BotFather 설정

```
1. @BotFather 대화
2. /newbot 또는 기존 봇 선택
3. /mybots → 봇 선택 → Bot Settings → Menu Button
4. Configure menu button
5. URL 입력: https://<your-url>/index.html
6. 버튼 텍스트: 🧪 Test App
```

### Step 3: 테스트

```
1. 텔레그램에서 봇 대화창 열기
2. 왼쪽 하단 메뉴 버튼 → 미니앱 실행
3. 각 기능 테스트
4. Console에서 로그 확인 (Telegram Desktop)
```

---

## 🎯 테스트 체크리스트

### 유저 정보

- [ ] User ID 표시
- [ ] 이름 표시
- [ ] 프리미엄 여부 표시
- [ ] 프로필 사진 표시 (가능 시)

### CloudStorage

- [ ] 값 저장 성공
- [ ] 값 불러오기 성공
- [ ] 값 삭제 성공
- [ ] 앱 재시작 후에도 데이터 유지

### HapticFeedback

- [ ] Light 진동 작동
- [ ] Medium 진동 작동
- [ ] Heavy 진동 작동
- [ ] Success 알림 작동
- [ ] Error 알림 작동

### UI 컴포넌트

- [ ] MainButton 표시/숨기기
- [ ] MainButton 클릭 이벤트
- [ ] BackButton 표시/클릭
- [ ] 팝업(showAlert) 표시

### 테마

- [ ] 라이트/다크 모드 감지
- [ ] 테마 색상 CSS 변수 적용

---

## 🔗 참고 자료

| 자료             | URL                                                 |
| ---------------- | --------------------------------------------------- |
| TMA 공식 문서    | https://core.telegram.org/bots/webapps              |
| CloudStorage API | https://core.telegram.org/bots/webapps#cloudstorage |
| @BotFather       | https://t.me/BotFather                              |
| 예제 봇          | https://t.me/DurgerKingBot                          |

---

## ✅ 완료 기준

1. 텔레그램 미니앱으로 정상 실행됨
2. 유저 정보가 화면에 표시됨
3. CloudStorage 저장/로드/삭제 모두 동작
4. HapticFeedback 진동이 느껴짐
5. MainButton이 정상 동작
6. 개발 모드(브라우저)에서도 에러 없이 실행됨

---

## 💡 Tavern Defense 적용 포인트

이 프로젝트에서 만든 다음 파일들은 **그대로 복사해서 사용 가능**:

```
✅ TMAWrapper.js → src/telegram/MiniApp.js
✅ Storage.js    → src/telegram/CloudStorage.js
```

---

_이 프로젝트를 완료하면 TMA 플랫폼의 핵심 기능을 모두 이해하게 됩니다!_
