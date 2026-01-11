import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../utils/constants.js';

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        // 캔버스 크기 설정
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        // 모바일 디바이스 DPR 대응
        const dpr = window.devicePixelRatio || 1;
        if (dpr > 1) {
            this.canvas.style.width = CANVAS_WIDTH + 'px';
            this.canvas.style.height = CANVAS_HEIGHT + 'px';
            this.canvas.width = CANVAS_WIDTH * dpr;
            this.canvas.height = CANVAS_HEIGHT * dpr;
            this.ctx.scale(dpr, dpr);
        }

        // 이미지 스무딩 비활성화 (픽셀 아트용)
        this.ctx.imageSmoothingEnabled = false;

        console.log('[Renderer] Canvas 초기화 완료');
    }

    clear() {
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    render() {
        this.clear();

        // 테스트: 테두리 그리기
        this.ctx.strokeStyle = '#4a90e2';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(10, 10, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 20);

        // 테스트: 텍스트 출력
        this.ctx.fillStyle = COLORS.TEXT_PRIMARY;
        this.ctx.font = '20px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Canvas 준비 완료!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

        this.ctx.font = '14px sans-serif';
        this.ctx.fillStyle = COLORS.TEXT_SECONDARY;
        this.ctx.fillText('텔레그램 WebApp 연동 성공', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    }
}
