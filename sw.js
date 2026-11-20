const CACHE_NAME = "caramel-store-v5";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "https://raw.githubusercontent.com/CaramelaSHINStore/Carmela.store/refs/heads/main/80512-cutout.png"
];

self.addEventListener("install", event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)).catch(() => {})
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    // للـ HTML والصفحة الرئيسية: دايماً جرب الشبكة الأول عشان التحديث يبان فوراً
    if (event.request.mode === "navigate" || event.request.destination === "document") {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
