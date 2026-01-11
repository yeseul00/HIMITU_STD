/**
 * Storage.js
 * Telegram CloudStorage 래퍼 클래스
 * 개발 모드에서는 localStorage 폴백
 */

export class Storage {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.isAvailable = !!this.tg?.CloudStorage;
        this.storageKey = "tma_test_";

        if (!this.isAvailable) {
            console.log("💾 [DEV] CloudStorage 미지원, localStorage 사용");
        }
    }

    /**
     * 데이터 저장
     * @param {string} key - 저장 키
     * @param {any} value - 저장할 값 (자동으로 JSON.stringify)
     * @returns {Promise<boolean>} 성공 여부
     */
    async save(key, value) {
        const jsonValue = JSON.stringify(value);

        if (!this.isAvailable) {
            // localStorage 폴백
            try {
                localStorage.setItem(this.storageKey + key, jsonValue);
                console.log(`💾 [DEV] LocalStorage 저장: ${key} = ${jsonValue}`);
                return true;
            } catch (error) {
                console.error("LocalStorage 저장 실패:", error);
                return false;
            }
        }

        // CloudStorage 사용
        return new Promise((resolve) => {
            this.tg.CloudStorage.setItem(key, jsonValue, (error, success) => {
                if (error) {
                    console.error("CloudStorage 저장 실패:", error);
                    resolve(false);
                } else {
                    console.log(`💾 CloudStorage 저장: ${key} = ${jsonValue}`);
                    resolve(success);
                }
            });
        });
    }

    /**
     * 데이터 불러오기
     * @param {string} key - 불러올 키
     * @returns {Promise<any|null>} 저장된 값 (자동으로 JSON.parse)
     */
    async load(key) {
        if (!this.isAvailable) {
            // localStorage 폴백
            try {
                const value = localStorage.getItem(this.storageKey + key);
                if (value) {
                    console.log(`📂 [DEV] LocalStorage 로드: ${key} = ${value}`);
                    return JSON.parse(value);
                }
                return null;
            } catch (error) {
                console.error("LocalStorage 로드 실패:", error);
                return null;
            }
        }

        // CloudStorage 사용
        return new Promise((resolve) => {
            this.tg.CloudStorage.getItem(key, (error, value) => {
                if (error) {
                    console.error("CloudStorage 로드 실패:", error);
                    resolve(null);
                } else {
                    if (value) {
                        console.log(`📂 CloudStorage 로드: ${key} = ${value}`);
                        resolve(JSON.parse(value));
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    /**
     * 데이터 삭제
     * @param {string} key - 삭제할 키
     * @returns {Promise<boolean>} 성공 여부
     */
    async remove(key) {
        if (!this.isAvailable) {
            // localStorage 폴백
            try {
                localStorage.removeItem(this.storageKey + key);
                console.log(`🗑️ [DEV] LocalStorage 삭제: ${key}`);
                return true;
            } catch (error) {
                console.error("LocalStorage 삭제 실패:", error);
                return false;
            }
        }

        // CloudStorage 사용
        return new Promise((resolve) => {
            this.tg.CloudStorage.removeItem(key, (error, success) => {
                if (error) {
                    console.error("CloudStorage 삭제 실패:", error);
                    resolve(false);
                } else {
                    console.log(`🗑️ CloudStorage 삭제: ${key}`);
                    resolve(success);
                }
            });
        });
    }

    /**
     * 모든 키 가져오기
     * @returns {Promise<string[]>} 저장된 모든 키 목록
     */
    async getKeys() {
        if (!this.isAvailable) {
            // localStorage 폴백
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storageKey)) {
                    keys.push(key.replace(this.storageKey, ""));
                }
            }
            return keys;
        }

        // CloudStorage 사용
        return new Promise((resolve) => {
            this.tg.CloudStorage.getKeys((error, keys) => {
                if (error) {
                    console.error("CloudStorage 키 목록 가져오기 실패:", error);
                    resolve([]);
                } else {
                    resolve(keys || []);
                }
            });
        });
    }
}
