const CACHE_NAME = "gavroche-admin-mobile-v2"
const PUBLIC_ASSETS = [
  "/login",
  "/manifest.webmanifest",
  "/gavroche-logo.jpg",
  "/icon.svg",
  "/icon-light-32x32.png",
  "/icon-dark-32x32.png",
  "/apple-icon.png",
  "/gavroche-icon-192.png",
  "/gavroche-icon-512.png",
  "/gavroche-maskable-512.png",
  "/splash/gavroche-640x1136.png",
  "/splash/gavroche-750x1334.png",
  "/splash/gavroche-828x1792.png",
  "/splash/gavroche-1125x2436.png",
  "/splash/gavroche-1170x2532.png",
  "/splash/gavroche-1242x2688.png",
  "/splash/gavroche-1284x2778.png",
  "/splash/gavroche-1536x2048.png",
  "/splash/gavroche-1668x2224.png",
  "/splash/gavroche-1668x2388.png",
  "/splash/gavroche-2048x2732.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PUBLIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const request = event.request

  if (request.method !== "GET") {
    return
  }

  const url = new URL(request.url)

  if (url.pathname.startsWith("/api/")) {
    return
  }

  if (url.pathname.startsWith("/dashboard")) {
    return
  }

  const shouldCache =
    url.pathname === "/login" ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")

  if (!shouldCache) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/login"))),
  )
})
