// ============================================================================
// SERVICE WORKER - PWA OFFLINE SUPPORT
// Arquivo: service-worker.js
// Descrição: Gerencia cache e funcionamento offline do aplicativo
// Versão: 36 (estoque saída simplificado)
// ============================================================================

const CACHE_NAME = 'estoque-certo-v36';
const CACHE_MAX_AGE_DAYS = 30; // Cache expira após 30 dias
const CACHE_MAX_ITEMS = 50; // Máximo de itens no cache

// Lista de URLs essenciais para cache (apenas arquivos que realmente existem)
const urlsToCache = [
    '/',
    '/static/css/style.css?v=36',
    '/static/css/admin.css?v=36',
    '/static/js/app.js?v=30',
    '/static/js/modules.js?v=30',
    '/static/js/dashboard.js?v=30',
    '/static/js/auth.js?v=30',
    '/static/js/firebase-config.js?v=30',
    '/static/js/firestore-service.js?v=30',
    '/static/js/admin-module.js?v=30',
    '/static/js/local-auth.js?v=30',
    '/static/js/local-firestore.js?v=30',
    '/static/js/pwa.js?v=30'
];

// ============================================================================
// FUNÇÕES AUXILIARES DE LIMPEZA DE CACHE
// ============================================================================

/**
 * Remove caches expirados baseado em timestamp
 */
async function cleanExpiredCache() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();
    const maxAge = CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000; // Dias em ms
    
    for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
            const dateHeader = response.headers.get('date');
            if (dateHeader) {
                const responseDate = new Date(dateHeader).getTime();
                if (now - responseDate > maxAge) {
                    console.log('Service Worker: Removendo cache expirado:', request.url);
                    await cache.delete(request);
                }
            }
        }
    }
}

/**
 * Limita o número de itens no cache (LRU - Least Recently Used)
 */
async function limitCacheSize() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    if (requests.length > CACHE_MAX_ITEMS) {
        const itemsToDelete = requests.length - CACHE_MAX_ITEMS;
        console.log(`Service Worker: Removendo ${itemsToDelete} itens antigos do cache`);
        
        // Remove os primeiros N itens (mais antigos)
        for (let i = 0; i < itemsToDelete; i++) {
            await cache.delete(requests[i]);
        }
    }
}

// ============================================================================
// INSTALAÇÁO DO SERVICE WORKER
// ============================================================================
self.addEventListener('install', (event) => {
    console.log('Service Worker v11: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                console.log('Service Worker: Cache aberto');
                
                // Tenta cachear cada arquivo individualmente para evitar falha total
                const cachePromises = urlsToCache.map(async (url) => {
                    try {
                        await cache.add(url);
                        console.log(`Service Worker: ✅ ${url} cacheado`);
                    } catch (error) {
                        console.warn(`Service Worker: ⚠️ Falha ao cachear ${url}:`, error.message);
                        // Não falha a instalação se um arquivo não existir
                    }
                });
                
                await Promise.allSettled(cachePromises);
                console.log('Service Worker: Cache concluído (com possíveis avisos)');
            })
            .then(() => {
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Erro crítico na instalação:', error);
            })
    );
});

// ============================================================================
// ATIVAÇÁO DO SERVICE WORKER (COM LIMPEZA DE CACHES ANTIGOS)
// ============================================================================
self.addEventListener('activate', (event) => {
    console.log('Service Worker v11: Ativando...');
    
    event.waitUntil(
        Promise.all([
            // Remove todas as versões antigas de cache
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: 🗑️ Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Executa limpeza de cache expirado (com tratamento de erro)
            cleanExpiredCache().catch(err => console.warn('Erro ao limpar cache expirado:', err)),
            // Limita tamanho do cache (com tratamento de erro)
            limitCacheSize().catch(err => console.warn('Erro ao limitar cache:', err))
        ]).then(() => {
            console.log('Service Worker: ✅ Ativado e caches limpos');
            return self.clients.claim();
        }).catch((error) => {
            console.error('Service Worker: Erro na ativação:', error);
        })
    );
});

// ============================================================================
// INTERCEPTAR REQUISIÇÕES (ESTRATÉGIA: CACHE FIRST)
// ============================================================================
self.addEventListener('fetch', (event) => {
    // Ignora requisições da API (sempre busca da rede)
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return new Response(
                        JSON.stringify({ 
                            success: false, 
                            error: 'Sem conexão com a internet' 
                        }),
                        { 
                            headers: { 'Content-Type': 'application/json' } 
                        }
                    );
                })
        );
        return;
    }
    
    // Para outros recursos, usa estratégia Cache First
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retorna do cache se encontrar
                if (response) {
                    // Log silencioso para não poluir o console
                    return response;
                }
                
                // Caso contrário, busca da rede
                return fetch(event.request).then((response) => {
                    // Não cacheia se não for uma resposta válida
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    
                    // Apenas cacheia requisições GET
                    if (event.request.method !== 'GET') {
                        return response;
                    }
                    
                    // Clona a resposta
                    const responseToCache = response.clone();
                    
                    // Adiciona ao cache (silenciosamente)
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    }).catch(() => {
                        // Ignora erros de cache
                    });
                    
                    return response;
                }).catch((error) => {
                    // Ignora erros de rede para recursos não essenciais
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }
                    return new Response('', { status: 408, statusText: 'Request timeout' });
                });
            })
    );
});

// ============================================================================
// SINCRONIZAÇÁO EM BACKGROUND (OPCIONAL)
// ============================================================================
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Sincronização em background');
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        console.log('Service Worker: Sincronizando dados...');
        // Implementar lógica de sincronização aqui
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Erro na sincronização:', error);
        return Promise.reject(error);
    }
}

// ============================================================================
// NOTIFICAÇÕES PUSH (OPCIONAL)
// ============================================================================
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push recebido');
    
    const options = {
        body: event.data ? event.data.text() : 'Nova notificação',
        icon: '/static/icons/icon-192x192.png',
        badge: '/static/icons/icon-192x192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('Quatro Cantos', options)
    );
});

// ============================================================================
// CLIQUE EM NOTIFICAÇÁO
// ============================================================================
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notificação clicada');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});
