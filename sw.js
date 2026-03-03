const CACHE_NAME = 'attendance-app-cache-v27'; // 버전을 업데이트하여 캐시를 갱신할 수 있습니다.
const urlsToCache = [
    './',
    './index.html',
    './app-icon.png',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    // FontAwesome 폰트 파일 등은 fetch 이벤트에서 동적으로 캐싱됩니다.
];

// 서비스 워커 설치
self.addEventListener('install', event => {
    self.skipWaiting(); // [FIX] 대기 없이 즉시 새로운 버전으로 교체 (강제 업데이트)
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// 메시지를 수신하여 대기 상태를 건너뜀
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// 서비스 워커 활성화 및 이전 캐시 정리
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // [FIX] 현재 열린 페이지들에 즉시 새 버전 적용
    );
});

// 요청 가로채기 (네트워크 또는 캐시에서 응답)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 캐시에 응답이 있으면 그것을 반환
                if (response) {
                    return response;
                }

                // 캐시에 없으면 네트워크에서 가져옴
                return fetch(event.request).then(
                    response => {
                        // 유효한 응답이 아니면 그대로 반환
                        if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
                            return response;
                        }

                        // 유효한 응답이면 복제해서 캐시에 저장하고, 원본은 앱으로 반환
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                        return response;
                    }
                );
            })
    );
});