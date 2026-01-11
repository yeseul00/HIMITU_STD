/**
 * 마우스 및 터치 이벤트 통합 처리기
 */
export class InputHandler {
    constructor(canvas, telegram) {
        this.canvas = canvas;
        this.telegram = telegram;
        this.handlers = {
            down: [],
            move: [],
            up: []
        };

        this.isDragging = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 마우스 이벤트
        this.canvas.addEventListener('mousedown', this.onPointerDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onPointerMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onPointerUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onPointerUp.bind(this));

        // 터치 이벤트 (passive: false는 스크롤 방지에 필요)
        this.canvas.addEventListener('touchstart', this.onPointerDown.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.onPointerMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.onPointerUp.bind(this), { passive: false });
    }

    // 화면 좌표 계산 (마우스/터치 통합)
    getPointerPosition(e) {
        // 모바일 스크롤 방지
        if (e.type.startsWith('touch')) {
            e.preventDefault();
        }

        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            // 터치 이벤트
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            // 터치 엔드 이벤트
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            // 마우스 이벤트
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // Canvas 내부 좌표로 변환 및 스케일 보정
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    onPointerDown(e) {
        this.isDragging = true;
        const pos = this.getPointerPosition(e);

        this.handlers.down.forEach(handler => handler(pos));

        // 터치 시 가벼운 진동 피드백
        this.telegram.hapticFeedback('selection');
    }

    onPointerMove(e) {
        const pos = this.getPointerPosition(e);
        this.handlers.move.forEach(handler => handler(pos));
    }

    onPointerUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            const pos = this.getPointerPosition(e);
            this.handlers.up.forEach(handler => handler(pos));
        }
    }

    // 이벤트 구독
    on(eventType, handler) {
        if (this.handlers[eventType]) {
            this.handlers[eventType].push(handler);
        }
    }

    // 이벤트 구독 취소
    off(eventType, handler) {
        if (this.handlers[eventType]) {
            const index = this.handlers[eventType].indexOf(handler);
            if (index > -1) {
                this.handlers[eventType].splice(index, 1);
            }
        }
    }
}
