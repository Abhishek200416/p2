const CACHE_NAME = 'abhishek-portfolio-v1.1';
const RUNTIME_CACHE = 'runtime-cache-v1.1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add other static assets as needed
];

// API and dynamic content cache duration (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.filter(url => url));
    }).then(() => {
      // Force the waiting service worker to become active
      self.skipWaiting();
    }).catch((error) => {
      console.error('[SW] Failed to cache static assets:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external domains (except for GitHub API and images)
  const isExternalRequest = url.origin !== self.location.origin;
  const isGitHubAPI = url.hostname === 'api.github.com';
  const isImageRequest = request.destination === 'image';
  const isGoogleFonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  
  if (isExternalRequest && !isGitHubAPI && !isImageRequest && !isGoogleFonts) {
    return;
  }

  event.respondWith(
    handleFetch(request, url, isExternalRequest)
  );
});

async function handleFetch(request, url, isExternal) {
  const cacheKey = request.url;
  
  try {
    // For API requests, try network first with cache fallback
    if (url.pathname.startsWith('/api/') || url.hostname === 'api.github.com') {
      return await networkFirstStrategy(request, cacheKey);
    }
    
    // For images, use cache first strategy
    if (request.destination === 'image' || isExternal) {
      return await cacheFirstStrategy(request, cacheKey);
    }
    
    // For static assets, use cache first with network fallback
    return await cacheFirstStrategy(request, cacheKey);
    
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(CACHE_NAME);
      return await cache.match('/') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

async function networkFirstStrategy(request, cacheKey) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(cacheKey, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
    
  } catch (networkError) {
    console.log('[SW] Network failed, trying cache:', networkError.message);
    
    // Fallback to cache
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(cacheKey);
    
    if (cachedResponse) {
      // Check if cached response is still fresh (for API calls)
      const cachedDate = new Date(cachedResponse.headers.get('date') || 0);
      const now = new Date();
      
      if (now.getTime() - cachedDate.getTime() < CACHE_DURATION) {
        return cachedResponse;
      }
    }
    
    throw networkError;
  }
}

async function cacheFirstStrategy(request, cacheKey) {
  // Try cache first
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(cacheKey);
  
  if (cachedResponse) {
    // Return cached version and update in background
    updateCacheInBackground(request, cacheKey);
    return cachedResponse;
  }
  
  // If not in cache, fetch from network
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(cacheKey, networkResponse.clone());
  }
  
  return networkResponse;
}

// Update cache in background without blocking response
async function updateCacheInBackground(request, cacheKey) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(cacheKey, networkResponse.clone());
    }
  } catch (error) {
    // Silent fail for background updates
    console.log('[SW] Background cache update failed:', error.message);
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    }).catch((error) => {
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Sync event for background updates
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'github-sync') {
    event.waitUntil(syncGitHubData());
  }
});

async function syncGitHubData() {
  try {
    const response = await fetch('https://api.github.com/users/Abhishek200416/repos?sort=updated&per_page=10');
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put('github-repos-sync', response.clone());
      console.log('[SW] GitHub data synced successfully');
    }
  } catch (error) {
    console.error('[SW] GitHub sync failed:', error);
  }
}