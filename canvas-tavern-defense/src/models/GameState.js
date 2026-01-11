/**
 * Tavern Defense 게임 데이터 모델
 * CloudStorage에 저장될 전체 게임 상태 정의
 */

/**
 * 타일 타입 열거형
 */
export const TileType = {
    EMPTY: 'empty',           // 빈 타일
    TAVERN: 'tavern',         // 주점 (메인 건물)
    TURRET: 'turret',         // 포탑
    BARRICADE: 'barricade',   // 바리케이드
    GOLD_MINE: 'gold_mine',   // 금광
    WORKSHOP: 'workshop'      // 작업장
};

/**
 * 플레이어 데이터 구조
 */
export class Player {
    constructor() {
        this.gold = 100;          // 소지 골드
        this.reputation = 0;      // 평판 (명성)
        this.day = 1;             // 현재 날짜 (게임 진행일)
        this.level = 1;           // 플레이어 레벨
    }

    // 예시 데이터
    static createExample() {
        const player = new Player();
        player.gold = 500;
        player.reputation = 150;
        player.day = 5;
        player.level = 3;
        return player;
    }
}

/**
 * 타일 데이터 구조
 */
export class Tile {
    constructor(id, x, y, type = TileType.EMPTY, level = 0) {
        this.id = id;             // 고유 ID (예: "tile_0_0")
        this.type = type;         // 타일 타입
        this.level = level;       // 건물 레벨 (0 = 빈 타일)
        this.x = x;               // 그리드 X 좌표
        this.y = y;               // 그리드 Y 좌표
        this.hp = 100;            // 내구도 (건물일 경우)
        this.maxHp = 100;         // 최대 내구도
    }

    // 예시 데이터
    static createExample() {
        return [
            new Tile('tile_0_0', 0, 0, TileType.TAVERN, 2),
            new Tile('tile_1_0', 1, 0, TileType.TURRET, 1),
            new Tile('tile_2_0', 2, 0, TileType.BARRICADE, 1),
            new Tile('tile_0_1', 0, 1, TileType.GOLD_MINE, 1),
            new Tile('tile_1_1', 1, 1, TileType.EMPTY, 0)
        ];
    }
}

/**
 * 업그레이드 데이터 구조
 */
export class Upgrades {
    constructor() {
        this.turretDamage = 1;      // 포탑 공격력 레벨
        this.turretRange = 1;       // 포탑 사거리 레벨
        this.turretSpeed = 1;       // 포탑 공격속도 레벨
        this.barricadeHp = 1;       // 바리케이드 체력 레벨
        this.goldProduction = 1;    // 금광 생산량 레벨
        this.workshopSpeed = 1;     // 작업장 건설속도 레벨
    }

    // 예시 데이터
    static createExample() {
        const upgrades = new Upgrades();
        upgrades.turretDamage = 3;
        upgrades.turretRange = 2;
        upgrades.turretSpeed = 2;
        upgrades.barricadeHp = 2;
        upgrades.goldProduction = 3;
        upgrades.workshopSpeed = 1;
        return upgrades;
    }
}

/**
 * 진행 상황 데이터 구조
 */
export class Progress {
    constructor() {
        this.currentWave = 1;       // 현재 웨이브
        this.maxWaveCleared = 0;    // 최고 클리어한 웨이브
        this.totalPlayTime = 0;     // 총 플레이 시간 (초)
        this.lastSaveTime = Date.now(); // 마지막 저장 시간
    }

    // 예시 데이터
    static createExample() {
        const progress = new Progress();
        progress.currentWave = 12;
        progress.maxWaveCleared = 15;
        progress.totalPlayTime = 3600; // 1시간
        progress.lastSaveTime = Date.now();
        return progress;
    }
}

/**
 * 통계 데이터 구조
 */
export class Stats {
    constructor() {
        this.enemiesDefeated = 0;   // 처치한 적 수
        this.goldEarned = 0;         // 벌어들인 총 골드
        this.goldSpent = 0;          // 소비한 총 골드
        this.buildingsBuilt = 0;    // 건설한 건물 수
        this.buildingsDestroyed = 0; // 파괴된 건물 수
        this.wavesSurvived = 0;      // 생존한 웨이브 수
    }

    // 예시 데이터
    static createExample() {
        const stats = new Stats();
        stats.enemiesDefeated = 150;
        stats.goldEarned = 5000;
        stats.goldSpent = 4500;
        stats.buildingsBuilt = 25;
        stats.buildingsDestroyed = 3;
        stats.wavesSurvived = 15;
        return stats;
    }
}

/**
 * 전체 게임 상태 컨테이너
 */
export class GameState {
    constructor() {
        this.version = '1.0.0';     // 데이터 버전 (호환성 체크용)
        this.player = new Player();
        this.tiles = [];            // Tile 배열
        this.upgrades = new Upgrades();
        this.progress = new Progress();
        this.stats = new Stats();
    }

    /**
     * 빈 그리드 초기화 (6x10)
     */
    initializeEmptyGrid() {
        this.tiles = [];
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 6; x++) {
                const id = `tile_${x}_${y}`;
                this.tiles.push(new Tile(id, x, y, TileType.EMPTY, 0));
            }
        }
    }

    /**
     * JSON 직렬화를 위한 변환
     */
    toJSON() {
        return {
            version: this.version,
            player: this.player,
            tiles: this.tiles,
            upgrades: this.upgrades,
            progress: this.progress,
            stats: this.stats,
            savedAt: new Date().toISOString()
        };
    }

    /**
     * JSON에서 GameState 복원
     */
    static fromJSON(json) {
        const state = new GameState();
        state.version = json.version || '1.0.0';

        // Player 복원
        Object.assign(state.player, json.player);

        // Tiles 복원
        state.tiles = json.tiles.map(t => {
            const tile = new Tile(t.id, t.x, t.y, t.type, t.level);
            tile.hp = t.hp;
            tile.maxHp = t.maxHp;
            return tile;
        });

        // Upgrades 복원
        Object.assign(state.upgrades, json.upgrades);

        // Progress 복원
        Object.assign(state.progress, json.progress);

        // Stats 복원
        Object.assign(state.stats, json.stats);

        return state;
    }

    /**
     * 예시 게임 상태 생성
     */
    static createExample() {
        const state = new GameState();
        state.player = Player.createExample();
        state.tiles = Tile.createExample();
        state.upgrades = Upgrades.createExample();
        state.progress = Progress.createExample();
        state.stats = Stats.createExample();
        return state;
    }
}

/**
 * 예시 데이터 (개발/테스트용)
 */
export const EXAMPLE_GAME_STATE = {
    version: '1.0.0',
    player: {
        gold: 500,
        reputation: 150,
        day: 5,
        level: 3
    },
    tiles: [
        { id: 'tile_2_5', type: 'tavern', level: 2, x: 2, y: 5, hp: 200, maxHp: 200 },
        { id: 'tile_1_5', type: 'turret', level: 1, x: 1, y: 5, hp: 100, maxHp: 100 },
        { id: 'tile_3_5', type: 'turret', level: 1, x: 3, y: 5, hp: 100, maxHp: 100 },
        { id: 'tile_2_4', type: 'barricade', level: 1, x: 2, y: 4, hp: 150, maxHp: 150 },
        { id: 'tile_0_6', type: 'gold_mine', level: 2, x: 0, y: 6, hp: 80, maxHp: 80 }
    ],
    upgrades: {
        turretDamage: 3,
        turretRange: 2,
        turretSpeed: 2,
        barricadeHp: 2,
        goldProduction: 3,
        workshopSpeed: 1
    },
    progress: {
        currentWave: 12,
        maxWaveCleared: 15,
        totalPlayTime: 3600,
        lastSaveTime: Date.now()
    },
    stats: {
        enemiesDefeated: 150,
        goldEarned: 5000,
        goldSpent: 4500,
        buildingsBuilt: 25,
        buildingsDestroyed: 3,
        wavesSurvived: 15
    },
    savedAt: new Date().toISOString()
};
