import { TelegramAPI } from './telegram/TelegramAPI.js';
import { CanvasRenderer } from './core/CanvasRenderer.js';
import { TARGET_FPS, DEBUG } from './utils/constants.js';

class Game {
    constructor() {
        // 텔레그램 API 초기화
        this.telegram = new TelegramAPI();

        // 렌더러 초기화
        this.renderer = new CanvasRenderer('gameCanvas');

        // 게임 루프
        this.lastTime = 0;
        this.frameTime = 1000 / TARGET_FPS;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;

        // 사용자 정보 표시
        this.updateInfoPanel();
    }

    updateInfoPanel() {
        const info = document.getElementById('info');
        const user = this.telegram.getUserInfo();

        if (DEBUG.ENABLED) {
            info.innerHTML = `
        <strong>🎮 Tavern Defense</strong><br>
        👤 ${user.firstName} ${user.lastName}<br>
        ID: ${user.id}<br>
        ${DEBUG.SHOW_FPS ? '⚡ <span id="fps">60</span> FPS' : ''}
      `;
        } else {
            info.style.display = 'none';
        }
    }

    start() {
        console.log('[Game] 게임 시작!');
        console.log('[Game] 사용자:', this.telegram.getUserInfo());

        // 시작 햅틱 피드백
        this.telegram.hapticFeedback('impact');

        requestAnimationFrame(this.tick.bind(this));
    }

    tick(currentTime) {
        const deltaTime = currentTime - this.lastTime;

        if (deltaTime >= this.frameTime) {
            this.lastTime = currentTime - (deltaTime % this.frameTime);

            // 렌더링
            this.renderer.render();

            // FPS 계산
            if (DEBUG.SHOW_FPS) {
                this.updateFPS(currentTime);
            }
        }

        requestAnimationFrame(this.tick.bind(this));
    }

    updateFPS(currentTime) {
        this.frameCount++;

        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;

            const fpsElement = document.getElementById('fps');
            if (fpsElement) {
                fpsElement.textContent = this.fps;
            }
        }
    }
}

// 게임 시작 (DOM 로드 후)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const game = new Game();
        game.start();
    });
} else {
    const game = new Game();
    game.start();
}
