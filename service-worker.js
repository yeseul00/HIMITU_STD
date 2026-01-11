// HIMITU Wiki - Service Worker
// Cache First Strategy

const CACHE_NAME = 'himitu-wiki-v1';

// 캐시할 파일 목록
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// 설치 이벤트 - 캐시 생성
self.addEventListener('install', (event) => {
    console.log('[Service Worker] 설치 중...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] 캐시 생성 완료');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[Service Worker] 모든 리소스 캐싱 완료');
                return self.skipWaiting(); // 즉시 활성화
            })
    );
});

// 활성화 이벤트 - 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] 활성화 중...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] 오래된 캐시 삭제:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] 활성화 완료');
                return self.clients.claim(); // 즉시 제어 시작
            })
    );
});

// Fetch 이벤트 - Cache First 전략
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // 캐시에 있으면 캐시 반환
                if (cachedResponse) {
                    console.log('[Service Worker] 캐시에서 반환:', event.request.url);
                    return cachedResponse;
                }

                // 캐시에 없으면 네트워크에서 가져오고 캐시에 저장
                console.log('[Service Worker] 네트워크에서 가져오기:', event.request.url);

                return fetch(event.request)
                    .then((response) => {
                        // 유효한 응답인지 확인
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 응답 복제 (한 번은 캐시에, 한 번은 반환용)
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                                console.log('[Service Worker] 캐시에 저장:', event.request.url);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch 실패:', error);
                        // 오프라인 페이지 반환 (선택사항)
                        return new Response('오프라인 상태입니다.', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// 메시지 이벤트 - 클라이언트와 통신
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.delete(CACHE_NAME).then(() => {
                console.log('[Service Worker] 캐시 삭제 완료');
            })
        );
    }
});
