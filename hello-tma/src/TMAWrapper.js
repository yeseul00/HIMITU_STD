/**
 * TMAWrapper.js
 * Telegram Mini App SDK를 래핑한 헬퍼 클래스
 * 개발 모드(브라우저) 폴백 포함
 */

export class TMAWrapper {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.isAvailable = !!this.tg;
    this.isDevMode = !this.isAvailable;

    if (this.isAvailable) {
      this.init();
    } else {
      console.log("🔧 개발 모드: 텔레그램 환경이 아닙니다.");
      this.initDevMode();
    }
  }

  /**
   * TMA 초기화
   */
  init() {
    this.tg.ready();
    this.tg.expand();
    console.log("✅ Telegram WebApp 초기화 완료");
  }

  /**
   * 개발 모드 초기화 (폴백 데이터)
   */
  initDevMode() {
    this.mockData = {
      user: {
        id: 123456789,
        first_name: "테스트",
        last_name: "유저",
        username: "testuser",
        language_code: "ko",
        is_premium: false,
      },
      platform: "browser",
      version: "dev",
      colorScheme: "light",
      themeParams: {
        bg_color: "#ffffff",
        text_color: "#000000",
        hint_color: "#999999",
        link_color: "#3390ec",
        button_color: "#3390ec",
        button_text_color: "#ffffff",
        secondary_bg_color: "#f5f5f5",
      },
    };
  }

  /**
   * 유저 정보 가져오기
   */
  getUserInfo() {
    if (this.isAvailable) {
      return this.tg.initDataUnsafe?.user || null;
    }
    return this.mockData.user;
  }

  /**
   * 플랫폼 정보 가져오기
   */
  getPlatform() {
    if (this.isAvailable) {
      return this.tg.platform || "unknown";
    }
    return this.mockData.platform;
  }

  /**
   * 버전 정보 가져오기
   */
  getVersion() {
    if (this.isAvailable) {
      return this.tg.version || "unknown";
    }
    return this.mockData.version;
  }

  /**
   * 테마 파라미터 가져오기
   */
  getThemeParams() {
    if (this.isAvailable) {
      return this.tg.themeParams || {};
    }
    return this.mockData.themeParams;
  }

  /**
   * 색상 스키마 (light/dark)
   */
  getColorScheme() {
    if (this.isAvailable) {
      return this.tg.colorScheme || "light";
    }
    return this.mockData.colorScheme;
  }

  /**
   * HapticFeedback - Impact
   */
  hapticImpact(style = "light") {
    if (this.isAvailable && this.tg.HapticFeedback) {
      this.tg.HapticFeedback.impactOccurred(style);
    } else {
      console.log(`📳 [DEV] Haptic Impact: ${style}`);
    }
  }

  /**
   * HapticFeedback - Notification
   */
  hapticNotification(type = "success") {
    if (this.isAvailable && this.tg.HapticFeedback) {
      this.tg.HapticFeedback.notificationOccurred(type);
    } else {
      console.log(`📳 [DEV] Haptic Notification: ${type}`);
    }
  }

  /**
   * MainButton 표시
   */
  showMainButton(text, onClick) {
    if (this.isAvailable && this.tg.MainButton) {
      this.tg.MainButton.text = text;
      this.tg.MainButton.onClick(onClick);
      this.tg.MainButton.show();
    } else {
      console.log(`🔘 [DEV] MainButton 표시: "${text}"`);
    }
  }

  /**
   * MainButton 숨기기
   */
  hideMainButton() {
    if (this.isAvailable && this.tg.MainButton) {
      this.tg.MainButton.hide();
    } else {
      console.log("🔘 [DEV] MainButton 숨김");
    }
  }

  /**
   * BackButton 표시
   */
  showBackButton(onClick) {
    if (this.isAvailable && this.tg.BackButton) {
      this.tg.BackButton.onClick(onClick);
      this.tg.BackButton.show();
    } else {
      console.log("◀️ [DEV] BackButton 표시");
    }
  }

  /**
   * BackButton 숨기기
   */
  hideBackButton() {
    if (this.isAvailable && this.tg.BackButton) {
      this.tg.BackButton.hide();
    } else {
      console.log("◀️ [DEV] BackButton 숨김");
    }
  }

  /**
   * Alert 팝업
   */
  showAlert(message, callback) {
    if (this.isAvailable) {
      this.tg.showAlert(message, callback);
    } else {
      alert(message);
      if (callback) callback();
    }
  }

  /**
   * Confirm 팝업
   */
  showConfirm(message, callback) {
    if (this.isAvailable) {
      this.tg.showConfirm(message, callback);
    } else {
      const result = confirm(message);
      if (callback) callback(result);
    }
  }

  /**
   * 웹앱 닫기
   */
  close() {
    if (this.isAvailable) {
      this.tg.close();
    } else {
      console.log("❌ [DEV] WebApp 종료");
    }
  }
}
