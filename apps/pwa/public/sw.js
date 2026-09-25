const CACHE_PREFIX = "krowds-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const PRESENTATION_ROUTES = ["/", "/tickets", "/wristbands", "/access", "/offline"];
const STATIC_ASSET_PATHS = new Set([
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/icon.svg",
  "/manifest.webmanifest",
]);
const presentationFallbacks = new Map();

function isHtmlResponse(response) {
  return (
    response.ok &&
    (response.type === "basic" || response.type === "default") &&
    response.headers.get("content-type")?.includes("text/html")
  );
}

function isCacheableAssetResponse(response) {
  if (!response.ok || response.type !== "basic") return false;

  const contentType = response.headers.get("content-type") ?? "";
  return [
    "text/css",
    "image/",
    "font/",
    "application/javascript",
    "text/javascript",
  ].some((type) => contentType.includes(type));
}

function isPresentationAsset(url) {
  return (
    STATIC_ASSET_PATHS.has(url.pathname) ||
    url.pathname.startsWith("/_next/static/")
  );
}

function extractPresentationAssets(html) {
  const assets = new Set();
  const attributePattern = /\b(?:href|src)=["']([^"']+)["']/g;

  for (const match of html.matchAll(attributePattern)) {
    try {
      const url = new URL(match[1], self.location.origin);
      if (url.origin === self.location.origin && isPresentationAsset(url)) {
        assets.add(url.href);
      }
    } catch {
      // Ignore malformed document references; they are not cache candidates.
    }
  }

  return assets;
}

async function precachePresentation() {
  const cache = await caches.open(CACHE_NAME);
  const discoveredAssets = new Set();

  await Promise.all(
    PRESENTATION_ROUTES.map(async (path) => {
      const response = await fetch(path, { cache: "reload" });
      if (!isHtmlResponse(response)) {
        throw new Error(`Presentation route is not cacheable: ${path}`);
      }

      await cache.put(path, response.clone());
      const html = await response.text();
      extractPresentationAssets(html).forEach((asset) =>
        discoveredAssets.add(asset),
      );
    }),
  );

  await cache.addAll([...STATIC_ASSET_PATHS]);
  await Promise.allSettled(
    [...discoveredAssets].map((asset) => cache.add(asset)),
  );
}

function isCacheableNavigation(request, url, response) {
  return (
    request.method === "GET" &&
    request.mode === "navigate" &&
    url.origin === self.location.origin &&
    url.search === "" &&
    PRESENTATION_ROUTES.includes(url.pathname) &&
    isHtmlResponse(response)
  );
}

async function networkFirstNavigation(request) {
  const url = new URL(request.url);

  try {
    const response = await fetch(request);

    if (isCacheableNavigation(request, url, response)) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }

    presentationFallbacks.delete(url.pathname);
    return response;
  } catch {
    const cache = await caches.open(CACHE_NAME);
    const cachedPage = await cache.match(request);

    if (cachedPage && isHtmlResponse(cachedPage)) {
      presentationFallbacks.set(
        url.pathname,
        url.pathname === "/offline" ? "unavailable" : "stale",
      );
      return cachedPage;
    }

    const unavailablePage = await cache.match("/offline");
    presentationFallbacks.set(url.pathname, "unavailable");

    if (unavailablePage && url.pathname !== "/offline") {
      return Response.redirect(`${self.location.origin}/offline`, 307);
    }

    return (
      unavailablePage ??
      new Response("This KROWDS presentation is unavailable while offline.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

async function servePresentationAsset(request, event) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  const networkResponse = fetch(request)
    .then(async (response) => {
      if (isCacheableAssetResponse(response)) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cachedResponse) {
    event.waitUntil(networkResponse.then(() => undefined));
    return cachedResponse;
  }

  return (
    (await networkResponse) ??
    new Response("Asset unavailable while offline.", {
      status: 504,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precachePresentation());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isPresentationAsset(url)) {
    event.respondWith(servePresentationAsset(request, event));
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE") {
    event.waitUntil(self.skipWaiting().then(() => self.clients.claim()));
    return;
  }

  if (event.data?.type === "GET_PRESENTATION_FALLBACK") {
    const path = typeof event.data.path === "string" ? event.data.path : "/";
    event.ports[0]?.postMessage({
      type: "PRESENTATION_STATUS",
      mode: presentationFallbacks.get(path) ?? null,
    });
  }
});
