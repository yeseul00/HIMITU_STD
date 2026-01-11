/**
 * SaveManager - 게임 데이터 저장/로드 관리자
 * 
 * 기능:
 * - Telegram CloudStorage에 게임 데이터 저장/로드
 * - 4KB 제한 대응 (데이터 분할 저장)
 * - 개발 모드에서 localStorage 사용
 * - 버전 마이그레이션 지원
 */

import { GameState } from '../models/GameState.js';

export class SaveManager {
    constructor(cloudStorage, isDevelopment = false) {
        this.storage = cloudStorage;
        this.isDevelopment = isDevelopment;

        // 저장 키 접두사
        this.SAVE_KEY_PREFIX = 'gameState_';
        this.CHUNK_SIZE = 3500; // 4KB 제한 대비 안전 마진

        // 현재 데이터 버전
        this.CURRENT_VERSION = '1.0.0';
    }

    /**
     * 게임 데이터 저장
     * @param {GameState} gameState - 저장할 게임 상태
     * @returns {Promise<boolean>}
     */
    async save(gameState) {
        try {
            console.log('[SaveManager] 저장 시작...');

            // GameState를 JSON으로 직렬화
            const jsonData = JSON.stringify(gameState.toJSON());
            const dataSize = new Blob([jsonData]).size;

            console.log(`[SaveManager] 데이터 크기: ${dataSize} bytes`);

            // 개발 모드에서는 localStorage 사용
            if (this.isDevelopment) {
                return this._saveToLocalStorage(jsonData);
            }

            // 데이터가 작으면 단일 저장
            if (dataSize < this.CHUNK_SIZE) {
                return this._saveSingle(jsonData);
            }

            // 데이터가 크면 분할 저장
            return this._saveChunked(jsonData);

        } catch (error) {
            console.error('[SaveManager] 저장 실패:', error);
            throw error;
        }
    }

    /**
     * 게임 데이터 로드
     * @returns {Promise<GameState|null>}
     */
    async load() {
        try {
            console.log('[SaveManager] 로드 시작...');

            // 개발 모드에서는 localStorage 사용
            if (this.isDevelopment) {
                return this._loadFromLocalStorage();
            }

            // 메타데이터 확인
            const meta = await this._loadMeta();

            if (!meta) {
                console.log('[SaveManager] 저장된 데이터 없음');
                return null;
            }

            // 청크 개수에 따라 로드 방식 결정
            const jsonData = meta.chunks > 1
                ? await this._loadChunked(meta.chunks)
                : await this._loadSingle();

            if (!jsonData) {
                return null;
            }

            // JSON 파싱 및 GameState 복원
            const parsedData = JSON.parse(jsonData);

            // 버전 마이그레이션
            const migratedData = this._migrateVersion(parsedData);

            // GameState 객체로 변환
            const gameState = GameState.fromJSON(migratedData);

            console.log('[SaveManager] 로드 성공!');
            return gameState;

        } catch (error) {
            console.error('[SaveManager] 로드 실패:', error);
            return null;
        }
    }

    /**
     * 저장된 데이터 삭제
     */
    async clear() {
        try {
            console.log('[SaveManager] 데이터 삭제 시작...');

            if (this.isDevelopment) {
                localStorage.removeItem(this.SAVE_KEY_PREFIX + 'main');
                return true;
            }

            const meta = await this._loadMeta();

            if (!meta) {
                console.log('[SaveManager] 삭제할 데이터 없음');
                return true;
            }

            // 메타데이터 삭제
            await this.storage.remove(this.SAVE_KEY_PREFIX + 'meta');

            // 모든 청크 삭제
            if (meta.chunks > 1) {
                for (let i = 0; i < meta.chunks; i++) {
                    await this.storage.remove(this.SAVE_KEY_PREFIX + 'chunk_' + i);
                }
            } else {
                await this.storage.remove(this.SAVE_KEY_PREFIX + 'main');
            }

            console.log('[SaveManager] 삭제 완료!');
            return true;

        } catch (error) {
            console.error('[SaveManager] 삭제 실패:', error);
            throw error;
        }
    }

    // ========== Private Methods ==========

    /**
     * 단일 저장 (4KB 이하)
     */
    async _saveSingle(jsonData) {
        await this.storage.save(this.SAVE_KEY_PREFIX + 'main', jsonData);
        await this.storage.save(this.SAVE_KEY_PREFIX + 'meta', {
            version: this.CURRENT_VERSION,
            chunks: 1,
            savedAt: Date.now()
        });
        console.log('[SaveManager] 단일 저장 완료');
        return true;
    }

    /**
     * 분할 저장 (4KB 초과)
     */
    async _saveChunked(jsonData) {
        const chunks = this._splitIntoChunks(jsonData, this.CHUNK_SIZE);

        console.log(`[SaveManager] ${chunks.length}개 청크로 분할 저장`);

        // 각 청크 저장
        for (let i = 0; i < chunks.length; i++) {
            await this.storage.save(this.SAVE_KEY_PREFIX + 'chunk_' + i, chunks[i]);
        }

        // 메타데이터 저장
        await this.storage.save(this.SAVE_KEY_PREFIX + 'meta', {
            version: this.CURRENT_VERSION,
            chunks: chunks.length,
            savedAt: Date.now()
        });

        console.log('[SaveManager] 분할 저장 완료');
        return true;
    }

    /**
     * 단일 로드
     */
    async _loadSingle() {
        return await this.storage.load(this.SAVE_KEY_PREFIX + 'main');
    }

    /**
     * 분할 로드
     */
    async _loadChunked(chunkCount) {
        const chunks = [];

        for (let i = 0; i < chunkCount; i++) {
            const chunk = await this.storage.load(this.SAVE_KEY_PREFIX + 'chunk_' + i);
            if (!chunk) {
                throw new Error(`청크 ${i} 로드 실패`);
            }
            chunks.push(chunk);
        }

        return chunks.join('');
    }

    /**
     * 메타데이터 로드
     */
    async _loadMeta() {
        return await this.storage.load(this.SAVE_KEY_PREFIX + 'meta');
    }

    /**
     * localStorage에 저장 (개발 모드)
     */
    _saveToLocalStorage(jsonData) {
        localStorage.setItem(this.SAVE_KEY_PREFIX + 'main', jsonData);
        localStorage.setItem(this.SAVE_KEY_PREFIX + 'meta', JSON.stringify({
            version: this.CURRENT_VERSION,
            chunks: 1,
            savedAt: Date.now()
        }));
        console.log('[SaveManager] localStorage 저장 완료');
        return true;
    }

    /**
     * localStorage에서 로드 (개발 모드)
     */
    _loadFromLocalStorage() {
        const jsonData = localStorage.getItem(this.SAVE_KEY_PREFIX + 'main');

        if (!jsonData) {
            console.log('[SaveManager] localStorage에 데이터 없음');
            return null;
        }

        const parsedData = JSON.parse(jsonData);
        const migratedData = this._migrateVersion(parsedData);
        const gameState = GameState.fromJSON(migratedData);

        console.log('[SaveManager] localStorage 로드 완료');
        return gameState;
    }

    /**
     * 문자열을 청크로 분할
     */
    _splitIntoChunks(str, chunkSize) {
        const chunks = [];
        for (let i = 0; i < str.length; i += chunkSize) {
            chunks.push(str.substring(i, i + chunkSize));
        }
        return chunks;
    }

    /**
     * 버전 마이그레이션
     */
    _migrateVersion(data) {
        const dataVersion = data.version || '0.0.0';

        console.log(`[SaveManager] 데이터 버전: ${dataVersion}, 현재 버전: ${this.CURRENT_VERSION}`);

        // 버전별 마이그레이션 로직
        if (dataVersion === '0.0.0') {
            // v0.0.0 -> v1.0.0 마이그레이션
            data = this._migrateFrom_0_0_0(data);
        }

        // 추가 마이그레이션 단계...

        data.version = this.CURRENT_VERSION;
        return data;
    }

    /**
     * v0.0.0 -> v1.0.0 마이그레이션
     */
    _migrateFrom_0_0_0(data) {
        console.log('[SaveManager] v0.0.0 -> v1.0.0 마이그레이션 수행');

        // 필드 추가 예시
        if (!data.stats) {
            data.stats = {
                enemiesDefeated: 0,
                goldEarned: 0,
                goldSpent: 0,
                buildingsBuilt: 0,
                buildingsDestroyed: 0,
                wavesSurvived: 0
            };
        }

        return data;
    }
}
