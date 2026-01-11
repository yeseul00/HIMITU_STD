/**
 * 텔레그램 CloudStorage 래퍼
 * 게임 데이터를 텔레그램 클라우드에 저장/불러오기
 */
export class CloudStorage {
    constructor(telegram) {
        this.tg = telegram.tg;
    }

    /**
     * 데이터 저장
     * @param {string} key - 저장할 키
     * @param {*} value - 저장할 값 (자동으로 JSON 변환)
     * @returns {Promise<boolean>}
     */
    async save(key, value) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(value);

            this.tg.CloudStorage.setItem(key, data, (error, success) => {
                if (error) {
                    console.error('[CloudStorage] 저장 실패:', error);
                    reject(error);
                } else {
                    console.log('[CloudStorage] 저장 성공:', key, value);
                    resolve(success);
                }
            });
        });
    }

    /**
     * 데이터 불러오기
     * @param {string} key - 불러올 키
     * @returns {Promise<*>} - 저장된 값 (JSON 파싱됨)
     */
    async load(key) {
        return new Promise((resolve, reject) => {
            this.tg.CloudStorage.getItem(key, (error, value) => {
                if (error) {
                    console.error('[CloudStorage] 불러오기 실패:', error);
                    reject(error);
                } else {
                    console.log('[CloudStorage] 불러오기 성공:', key);
                    const data = value ? JSON.parse(value) : null;
                    console.log('[CloudStorage] 불러온 데이터:', data);
                    resolve(data);
                }
            });
        });
    }

    /**
     * 데이터 삭제
     * @param {string} key - 삭제할 키
     * @returns {Promise<boolean>}
     */
    async remove(key) {
        return new Promise((resolve, reject) => {
            this.tg.CloudStorage.removeItem(key, (error, success) => {
                if (error) {
                    console.error('[CloudStorage] 삭제 실패:', error);
                    reject(error);
                } else {
                    console.log('[CloudStorage] 삭제 성공:', key);
                    resolve(success);
                }
            });
        });
    }

    /**
     * 모든 키 가져오기
     * @returns {Promise<string[]>}
     */
    async getKeys() {
        return new Promise((resolve, reject) => {
            this.tg.CloudStorage.getKeys((error, keys) => {
                if (error) {
                    console.error('[CloudStorage] 키 목록 가져오기 실패:', error);
                    reject(error);
                } else {
                    console.log('[CloudStorage] 저장된 키 목록:', keys);
                    resolve(keys || []);
                }
            });
        });
    }

    /**
     * 여러 데이터 한 번에 저장
     * @param {Object} items - { key1: value1, key2: value2, ... }
     * @returns {Promise<boolean>}
     */
    async saveMultiple(items) {
        const entries = Object.entries(items).map(([key, value]) => [key, JSON.stringify(value)]);

        return new Promise((resolve, reject) => {
            this.tg.CloudStorage.setItems(entries, (error, success) => {
                if (error) {
                    console.error('[CloudStorage] 다중 저장 실패:', error);
                    reject(error);
                } else {
                    console.log('[CloudStorage] 다중 저장 성공:', Object.keys(items));
                    resolve(success);
                }
            });
        });
    }
}
