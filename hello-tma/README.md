# 📱 TMA API Explorer

> Telegram Mini App 핵심 기능 테스트 애플리케이션

## 🎯 개요

Tavern Defense TMA 게임 개발 전 Telegram Mini App SDK의 핵심 기능을 테스트하기 위한 학습용 프로젝트입니다.

## ✨ 구현 기능

### 1. 유저 정보 표시
- User ID
- 이름 (First Name + Last Name)
- 프리미엄 여부
- 언어 코드

### 2. CloudStorage 테스트
- 데이터 저장 (setItem)
- 데이터 불러오기 (getItem)
- 데이터 삭제 (removeItem)
- 개발 모드 폴백 (localStorage)

### 3. HapticFeedback 테스트
- Impact: Light, Medium, Heavy
- Notification: Success, Error

### 4. MainButton 테스트
- MainButton 표시/숨기기
- 클릭 이벤트 처리

### 5. 팝업 테스트
- Alert 팝업
- Confirm 팝업

### 6. 테마 정보 표시
- Light/Dark 모드 감지
- 테마 색상 (배경, 텍스트, 버튼)
- CSS 변수 연동

## 📁 프로젝트 구조

```
hello-tma/
├── index.html                # 메인 HTML
├── css/
│   └── style.css             # TMA 테마 연동 스타일
├── src/
│   ├── main.js               # 메인 로직
│   ├── TMAWrapper.js         # TMA SDK 래퍼 ⭐
│   └── Storage.js            # CloudStorage 래퍼 ⭐
└── README.md
```

**⭐ 표시된 파일은 Tavern Defense에 그대로 재사용 가능**

## 🚀 사용 방법

### 로컬 테스트 (브라우저)

1. **Live Server로 실행**
   ```bash
   # VS Code Live Server 또는
   python3 -m http.server 8000
   ```

2. 브라우저에서 `http://localhost:8000` 접속

3. 개발 모드로 동작 (localStorage 사용)

### Telegram에서 테스트

#### 1. GitHub Pages 배포

```bash
# 프로젝트를 GitHub에 push
cd /Users/seul/DEVELOPER/HIMITU_Wiki/planning/practice
git add hello-tma
git commit -m "feat: Add TMA API Explorer"
git push origin main
```

#### 2. BotFather 설정

1. Telegram에서 [@BotFather](https://t.me/BotFather) 대화
2. `/newbot` 또는 기존 봇 선택
3. `/mybots` → 봇 선택
4. `Bot Settings` → `Menu Button`
5. `Configure menu button`
6. URL 입력: `https://<username>.github.io/<repo>/practice/hello-tma/`
7. 버튼 텍스트: `🧪 Test App`

#### 3. 텔레그램에서 실행

1. 봇 대화창 열기
2. 왼쪽 하단 메뉴 버튼 클릭
3. 미니앱 실행
4. 각 기능 테스트

## 🔍 주요 코드 패턴

### TMA 초기화 (개발 모드 폴백)

```javascript
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
} else {
  console.log("개발 모드: 텔레그램 환경 아님");
}
```

### CloudStorage 래퍼

```javascript
// 저장
await storage.save("key", "value");

// 로드
const value = await storage.load("key");

// 삭제
await storage.remove("key");
```

### HapticFeedback

```javascript
// Impact
tma.hapticImpact("light"); // "medium", "heavy"

// Notification
tma.hapticNotification("success"); // "error"
```

## 📚 학습 포인트

### 1. CloudStorage 제한사항
- 키 길이: 최대 128자
- 값 크기: **최대 4,096자** (중요!)
- 키 개수: 최대 1,024개

### 2. 개발 모드 폴백 패턴
```javascript
if (this.isAvailable) {
  // TMA API 사용
} else {
  // 개발 모드 폴백 (localStorage, console.log 등)
}
```

### 3. TMA 테마 CSS 변수 활용
```css
body {
  background: var(--tg-theme-bg-color, #ffffff);
  color: var(--tg-theme-text-color, #000000);
}
```

## ✅ 테스트 체크리스트

- [ ] 브라우저에서 정상 실행 (개발 모드)
- [ ] 유저 정보 표시 확인
- [ ] CloudStorage 저장/로드/삭제 동작
- [ ] HapticFeedback 진동 느껴짐
- [ ] MainButton 표시/숨기기 동작
- [ ] Alert/Confirm 팝업 동작
- [ ] 테마 색상 정상 표시

## 💡 Tavern Defense 적용

이 프로젝트의 다음 파일들은 **그대로 복사**하여 사용 가능:

```
✅ src/TMAWrapper.js  → Tavern Defense/src/telegram/MiniApp.js
✅ src/Storage.js     → Tavern Defense/src/telegram/CloudStorage.js
```

## 🔗 참고 자료

- [TMA 공식 문서](https://core.telegram.org/bots/webapps)
- [CloudStorage API](https://core.telegram.org/bots/webapps#cloudstorage)
- [Web App 예제](https://core.telegram.org/bots/webapps#implementing-mini-apps)

## 📝 다음 단계

1. ✅ TMA 테스트 앱 완성
2. ⬜ 게임 데이터 구조 설계
3. ⬜ Canvas 미니게임 프로토타입
4. ⬜ Tavern Defense 본 개발

---

**제작**: Tavern Defense TMA 게임 준비 프로젝트
**소요 시간**: 약 2-3시간
**난이도**: ⭐⭐ (초급-중급)
