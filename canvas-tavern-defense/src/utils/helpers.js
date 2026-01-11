import { TILE_SIZE, GRID_COLS, GRID_ROWS, UI_HEIGHT, CANVAS_WIDTH } from './constants.js';

/**
 * 그리드 좌표를 화면 픽셀 좌표로 변환
 * @param {number} col - 그리드 열 인덱스 (0 ~ GRID_COLS-1)
 * @param {number} row - 그리드 행 인덱스 (0 ~ GRID_ROWS-1)
 * @returns {object} {x, y} - 타일의 좌상단 픽셀 좌표
 */
export function gridToScreen(col, row) {
    // 그리드 전체 너비 계산 (중앙 정렬을 위해)
    const gridWidth = GRID_COLS * TILE_SIZE;
    const startX = (CANVAS_WIDTH - gridWidth) / 2;
    const startY = UI_HEIGHT + 20; // UI 영역 아래 여백 20px

    return {
        x: startX + (col * TILE_SIZE),
        y: startY + (row * TILE_SIZE)
    };
}

/**
 * 화면 터치/클릭 좌표를 그리드 좌표로 변환
 * @param {number} x - 캔버스 내 x 좌표
 * @param {number} y - 캔버스 내 y 좌표
 * @returns {object} {col, row} - 그리드 인덱스
 */
export function screenToGrid(x, y) {
    // 그리드 전체 너비 및 시작점 재계산
    const gridWidth = GRID_COLS * TILE_SIZE;
    const startX = (CANVAS_WIDTH - gridWidth) / 2;
    const startY = UI_HEIGHT + 20;

    // 상대 좌표 계산
    const relativeX = x - startX;
    const relativeY = y - startY;

    // 그리드 인덱스로 변환 (Math.floor 사용)
    const col = Math.floor(relativeX / TILE_SIZE);
    const row = Math.floor(relativeY / TILE_SIZE);

    return { col, row };
}

/**
 * 유효한 그리드 위치인지 확인
 * @param {number} col 
 * @param {number} row 
 * @returns {boolean}
 */
export function isValidGridPosition(col, row) {
    return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
}
