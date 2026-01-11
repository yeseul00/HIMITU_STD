import { TILE_SIZE, GRID_COLS, GRID_ROWS, COLORS } from '../utils/constants.js';
import { gridToScreen } from '../utils/helpers.js';

export class TileGrid {
    constructor() {
        // 6x10 그리드 데이터 초기화 (null = 빈 타일)
        this.tiles = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));

        // 호버 상태 관리
        this.hoverTile = { col: -1, row: -1 };
    }

    // 특정 타일 호버 설정
    setHoveredTile(col, row) {
        // 상태가 변경되었을 때만 업데이트 (성능 최적화)
        if (this.hoverTile.col !== col || this.hoverTile.row !== row) {
            this.hoverTile = { col, row };
            return true; // 렌더링 필요함
        }
        return false;
    }

    // 호버 해제
    clearHover() {
        if (this.hoverTile.col !== -1) {
            this.hoverTile = { col: -1, row: -1 };
            return true;
        }
        return false;
    }

    render(ctx) {
        // 모든 타일 순회하며 그리기
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const pos = gridToScreen(col, row);

                // 1. 타일 배경 그리기
                this.renderTileBackground(ctx, pos.x, pos.y, col, row);

                // 2. 타일 내용 그리기 (나중에 구현)
                const tileData = this.tiles[row][col];
                if (tileData) {
                    // TODO: 건물이나 유닛 그리기
                }
            }
        }
    }

    renderTileBackground(ctx, x, y, col, row) {
        // 현재 타일이 호버 상태인지 확인
        const isHovered = this.hoverTile.col === col && this.hoverTile.row === row;

        // 색상 결정
        ctx.fillStyle = isHovered ? COLORS.TILE_HOVER : COLORS.TILE_EMPTY;

        // 타일 채우기 (경계선 여백을 위해 1px 줄임)
        ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);

        // 그리드 라인 (선택적)
        ctx.strokeStyle = COLORS.GRID_LINE;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

        // 호버 시 하이라이트 테두리
        if (isHovered) {
            ctx.strokeStyle = '#4a90e2'; // 파란색 하이라이트
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        }
    }
}
