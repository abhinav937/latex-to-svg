// Enhanced Service Worker with separate static and dynamic caches
const STATIC_CACHE = 'latex-generator-static-v1.1.0';
const DYNAMIC_CACHE = 'latex-generator-dynamic-v1.1.0';
const RUNTIME_CACHE = 'latex-generator-runtime-v1.1.0';

// Static assets that should be cached immediately
// Only cache PWA manifest and essential icons, not website content
const STATIC_ASSETS = [
  './site.webmanifest',
  './assets/icons/favicon-16x16.png',
  './assets/icons/favicon-32x32.png',
  './assets/icons/android-chrome-192x192.png',
  './assets/icons/android-chrome-512x512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon.ico'
];

// External resources that should be cached
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
  'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2',
  'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache external resources
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('Caching external resources');
        return cache.addAll(EXTERNAL_RESOURCES);
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![STATIC_CACHE, DYNAMIC_CACHE, RUNTIME_CACHE].includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated successfully');
    })
  );
});

// Enhanced fetch event with different strategies for different resource types
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip unsupported schemes
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (isExternalResource(request)) {
    event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  } else {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  }
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache-first strategy failed:', error);
    // Don't cache unsupported schemes
    if (error.message.includes('chrome-extension') || error.message.includes('unsupported')) {
      return fetch(request);
    }
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network-first strategy for dynamic content
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Don't serve cached content for main website navigation
    // Only allow caching for external resources, not website content
    
    // Don't cache unsupported schemes
    if (error.message.includes('chrome-extension') || error.message.includes('unsupported')) {
      return fetch(request);
    }
    
    return new Response('Offline content not available', { status: 503 });
  }
}

// Helper functions to categorize requests
function isStaticAsset(request) {
  // Only cache PWA-related files and icons, not website content
  return request.url.includes('site.webmanifest') ||
         request.url.includes('/assets/icons/') ||
         (request.url.includes('.ico') && request.url.includes('/assets/icons/'));
}

function isExternalResource(request) {
  return request.url.includes('fonts.googleapis.com') ||
         request.url.includes('fonts.gstatic.com') ||
         request.url.includes('cdn.jsdelivr.net');
}

function isAPIRequest(request) {
  return request.url.includes('/api/') ||
         request.url.includes('latex2svg') ||
         request.url.includes('mathjax');
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Performing background sync...');
  // Implement background sync logic here
  // For example, sync cached LaTeX commands or user preferences
}

// Push notification handling
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New update available',
      icon: './assets/icons/android-chrome-192x192.png',
      badge: './assets/icons/favicon-32x32.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Open App',
          icon: './assets/icons/favicon-32x32.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: './assets/icons/favicon-32x32.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('LaTeX Generator', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
}); 