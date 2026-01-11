import { TelegramAPI } from './telegram/TelegramAPI.js';
import { CanvasRenderer } from './core/CanvasRenderer.js';
import { TileGrid } from './components/TileGrid.js';
import { InputHandler } from './utils/InputHandler.js';
import { screenToGrid, isValidGridPosition } from './utils/helpers.js';
import { TARGET_FPS, DEBUG } from './utils/constants.js';
import { APP_VERSION, BUILD_DATE, COMMIT_SHA, GITHUB_RUN_NUMBER } from './version.js';

class Game {
    constructor() {
        // 버전 정보 로깅
        this.logVersionInfo();

        // 텔레그램 API 초기화
        this.telegram = new TelegramAPI();

        // 렌더러 초기화
        this.renderer = new CanvasRenderer('gameCanvas');

        // 타일 그리드 생성
        this.tileGrid = new TileGrid();

        // 입력 처리기 초기화
        this.inputHandler = new InputHandler(this.renderer.canvas, this.telegram);
        this.setupInputHandlers();

        // 게임 루프 변수
        this.lastTime = 0;
        this.frameTime = 1000 / TARGET_FPS;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;

        // 사용자 정보 표시
        this.updateInfoPanel();
    }

    logVersionInfo() {
        const style1 = 'color: #4a90e2; font-weight: bold; font-size: 14px';
        const style2 = 'color: #4a90e2';
        const style3 = 'color: #666';

        console.log('%c' + '='.repeat(60), style2);
        console.log('%c🎮 Tavern Defense - Telegram WebApp', style1);
        console.log('%c' + '='.repeat(60), style2);
        console.log('%c📦 Version:', style3, APP_VERSION);
        console.log('%c📅 Build Date:', style3, BUILD_DATE);
        console.log('%c🔖 Commit:', style3, COMMIT_SHA);
        console.log('%c🔢 Build #:', style3, GITHUB_RUN_NUMBER);
        console.log('%c' + '-'.repeat(60), style2);
        console.log('%c🌐 User Agent:', style3, navigator.userAgent);
        console.log('%c📱 Platform:', style3, navigator.platform);
        console.log('%c🖥️ Screen:', style3, `${window.innerWidth}x${window.innerHeight}`);
        console.log('%c' + '='.repeat(60), style2);
    }

    setupInputHandlers() {
        // 1. 포인터 이동 (호버 효과)
        this.inputHandler.on('move', (pos) => {
            const { col, row } = screenToGrid(pos.x, pos.y);

            if (isValidGridPosition(col, row)) {
                this.tileGrid.setHoveredTile(col, row);
            } else {
                this.tileGrid.clearHover();
            }
        });

        // 2. 포인터 클릭/터치
        this.inputHandler.on('down', (pos) => {
            const { col, row } = screenToGrid(pos.x, pos.y);

            if (isValidGridPosition(col, row)) {
                console.log(`[Game] 타일 선택됨: (${col}, ${row})`);

                // 클릭 시 강한 진동
                this.telegram.hapticFeedback('impact');
            }
        });
    }

    updateInfoPanel() {
        const info = document.getElementById('info');
        const user = this.telegram.getUserInfo();

        if (DEBUG.ENABLED) {
            info.innerHTML = `
        <strong>🎮 Tavern Defense</strong><br>
        📦 v${APP_VERSION.substring(0, 12)}<br>
        👤 ${user.firstName}<br>
        ⚡ <span id="fps">0.0</span> FPS
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
            this.render();

            // FPS 계산
            if (DEBUG.SHOW_FPS) {
                this.updateFPS(currentTime);
            }
        }

        requestAnimationFrame(this.tick.bind(this));
    }

    render() {
        // 화면 클리어
        this.renderer.clear();

        // 타일 그리드 렌더링
        this.tileGrid.render(this.renderer.ctx);
    }

    updateFPS(currentTime) {
        const now = performance.now();
        this.frameCount++;

        if (now - this.fpsUpdateTime >= 1000) {
            const elapsed = now - this.fpsUpdateTime;
            const rawFps = (this.frameCount / elapsed) * 1000;
            this.fps = rawFps.toFixed(1);
            this.frameCount = 0;
            this.fpsUpdateTime = now;

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
