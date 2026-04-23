// ============================================
// SERVICE WORKER - PWA (VERSÃO CORRIGIDA)
// ============================================

const CACHE_NAME = 'centro-web-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando assets estáticos');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] Removendo cache antigo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estratégia: Cache First, com fallback para offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar requisições para APIs externas e analytics
    if (url.origin !== self.location.origin || 
        url.pathname.includes('chrome-extension') ||
        url.pathname.includes('safari-extension')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(request)
                    .then(networkResponse => {
                        // Cachear apenas respostas bem-sucedidas
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseClone);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Fallback para página offline
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        return new Response('Conteúdo indisponível offline', {
                            status: 503,
                            statusText: 'Offline'
                        });
                    });
            })
    );
});

// Sincronização em segundo plano (opcional)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-enrollments') {
        console.log('[SW] Sincronizando dados...');
        event.waitUntil(
            // Implementar sincronização real aqui
            Promise.resolve()
        );
    }
});

console.log('[SW] Service Worker pronto!');