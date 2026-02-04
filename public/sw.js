
const CACHE_NAME = 'modofoco-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/manifest.json',
                // '/icons/icon-192x192.png', // Icons missing
                // '/icons/icon-512x512.png', // Icons missing
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Listener simples de fetch para offline (Excluindo APIs e Auth)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Não cachear chamadas ao Supabase ou APIs
    if (url.hostname.includes('supabase.co') || url.pathname.startsWith('/api/') || event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Listener de Push (mesmo sem backend, deixamos preparado)
self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        self.registration.showNotification(data.title, {
            body: data.message,
            icon: '/icons/icon-192x192.png'
        });
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Se tiver uma janela aberta, foca nela
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Se não, abre uma nova
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
