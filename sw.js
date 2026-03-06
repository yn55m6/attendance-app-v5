const CACHE_NAME = 'attendance-app-cache-v65'; // 네트워크 우선 전략 적용 및 캐시 버전 업데이트
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
    // [FINAL FIX] index.html에 대해서는 '네트워크 우선' 전략을 사용합니다.
    // 이렇게 하면 사용자는 항상 최신 버전의 앱 셸을 받게 되어, 캐시로 인한 레이아웃 오류를 원천 차단합니다.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // 네트워크 요청 성공 시, 응답을 캐시에 저장하고 반환합니다.
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request.url, response.clone());
                        return response;
                    });
                })
                .catch(err => {
                    // 네트워크 실패 시 (오프라인), 캐시에서 가져옵니다.
                    return caches.match(event.request);
                })
        );
        return;
    }

    // 다른 모든 요청(CSS, JS, 이미지 등)은 '캐시 우선' 전략을 사용합니다.
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