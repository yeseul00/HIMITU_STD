/**
 * 텔레그램 WebApp API 래퍼 클래스
 */
export class TelegramAPI {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.user = null;
        this.initData = null;

        this.init();
    }

    init() {
        // 텔레그램 WebApp 초기화
        this.tg.ready();

        // 전체 화면으로 확장
        this.tg.expand();

        // 사용자 정보 저장
        this.user = this.tg.initDataUnsafe?.user || null;
        this.initData = this.tg.initDataUnsafe;

        // 테마 색상 적용
        this.applyTheme();

        console.log('[Telegram] 초기화 완료');
        console.log('[Telegram] User:', this.user);
    }

    applyTheme() {
        // 텔레그램 테마 색상을 CSS 변수로 적용
        document.documentElement.style.setProperty(
            '--tg-theme-bg-color',
            this.tg.themeParams.bg_color || '#0a0a1a'
        );
        document.documentElement.style.setProperty(
            '--tg-theme-text-color',
            this.tg.themeParams.text_color || '#ffffff'
        );
        document.documentElement.style.setProperty(
            '--tg-theme-hint-color',
            this.tg.themeParams.hint_color || '#999999'
        );
    }

    getUserInfo() {
        if (!this.user) {
            return {
                id: 'guest',
                firstName: 'Guest',
                lastName: '',
                username: 'guest'
            };
        }

        return {
            id: this.user.id,
            firstName: this.user.first_name,
            lastName: this.user.last_name || '',
            username: this.user.username || '',
            languageCode: this.user.language_code || 'ko'
        };
    }

    showAlert(message) {
        this.tg.showAlert(message);
    }

    showConfirm(message, callback) {
        this.tg.showConfirm(message, callback);
    }

    // MainButton 제어
    showMainButton(text, callback) {
        this.tg.MainButton.setText(text);
        this.tg.MainButton.show();
        this.tg.MainButton.onClick(callback);
    }

    hideMainButton() {
        this.tg.MainButton.hide();
    }

    // HapticFeedback (진동)
    hapticFeedback(type = 'impact') {
        // type: 'impact', 'notification', 'selection'
        if (this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred(type);
        }
    }

    // 앱 닫기
    close() {
        this.tg.close();
    }
}
