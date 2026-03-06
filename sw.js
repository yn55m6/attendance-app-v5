const CACHE_NAME = 'attendance-app-cache-v67'; // 캐시 완전 초기화를 위한 버전업
const urlsToCache = [
    './',
    './index.html',
    './app-icon.png',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js',
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
    // [ULTIMATE FIX] 페이지 이동 요청(index.html)에 대해서는 항상 네트워크를 사용합니다.
    // 캐시를 전혀 사용하지 않음으로써, 오래된 버전의 HTML이 표시되는 문제를 원천적으로 차단합니다.
    if (event.request.mode === 'navigate') {
        event.respondWith(fetch(event.request));
        return;
    }

    // 다른 모든 요청(CSS, JS, 이미지 등)은 '캐시 우선' 전략을 사용하여 성능을 확보합니다.
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    // CORS 요청이 아닌 경우에만 캐싱 (예: 폰트 파일)
                    if (fetchResponse.type === 'basic' || fetchResponse.type === 'cors') {
                        cache.put(event.request, fetchResponse.clone());
                    }
                    return fetchResponse;
                });
            });
        })
    );
});