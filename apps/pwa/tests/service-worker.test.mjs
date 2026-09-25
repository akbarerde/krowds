import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const origin = "https://pwa.example";
const workerSource = await readFile(
  new URL("../public/sw.js", import.meta.url),
  "utf8",
);

function html(body) {
  return new Response(`<!doctype html><html><body>${body}</body></html>`, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function request(path, overrides = {}) {
  return {
    url: new URL(path, origin).href,
    method: "GET",
    mode: "navigate",
    destination: "",
    ...overrides,
  };
}

async function createHarness() {
  const listeners = new Map();
  const cacheStore = new Map();
  const network = new Map();
  const fetchCalls = [];
  let skipWaitingCalls = 0;
  let claimCalls = 0;

  const normalizeKey = (value) =>
    typeof value === "string"
      ? new URL(value, origin).href
      : value.url;

  const getCache = (name) => {
    if (!cacheStore.has(name)) cacheStore.set(name, new Map());
    return cacheStore.get(name);
  };

  const cacheApi = {
    async open(name) {
      const entries = getCache(name);
      return {
        async add(path) {
          const response = await fetchMock(path);
          if (!response.ok) throw new Error(`Unable to cache ${path}`);
          await this.put(path, response);
        },
        async addAll(paths) {
          await Promise.all(paths.map((path) => this.add(path)));
        },
        async delete(path) {
          return entries.delete(normalizeKey(path));
        },
        async match(value) {
          return entries.get(normalizeKey(value));
        },
        async put(value, response) {
          entries.set(normalizeKey(value), response.clone());
        },
      };
    },
    async delete(name) {
      return cacheStore.delete(name);
    },
    async keys() {
      return [...cacheStore.keys()];
    },
    match(value) {
      return cacheApi.open("krowds-pwa-v2").then((cache) => cache.match(value));
    },
  };

  async function fetchMock(input) {
    const url = new URL(typeof input === "string" ? input : input.url, origin);
    fetchCalls.push(url.href);
    const responder = network.get(url.href);
    if (responder) return responder(url);
    throw new TypeError(`Network unavailable for ${url.pathname}`);
  }

  const self = {
    location: { origin },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    async clientsClaim() {},
    async skipWaiting() {
      skipWaitingCalls += 1;
    },
    clients: {
      async claim() {
        claimCalls += 1;
      },
    },
  };

  const context = vm.createContext({
    URL,
    URLSearchParams,
    Request,
    Response,
    Headers,
    Map,
    Set,
    Promise,
    Error,
    TypeError,
    caches: cacheApi,
    fetch: fetchMock,
    self,
  });
  vm.runInContext(workerSource, context, { filename: "sw.js" });

  async function dispatch(type, event) {
    const listener = listeners.get(type);
    assert.ok(listener, `Missing ${type} listener`);

    const pending = [];
    let responsePromise;
    const dispatchEvent = {
      ...event,
      waitUntil(value) {
        pending.push(Promise.resolve(value));
      },
      respondWith(value) {
        responsePromise = Promise.resolve(value);
      },
    };

    listener(dispatchEvent);
    await Promise.all(pending);
    return responsePromise ? await responsePromise : undefined;
  }

  return {
    cacheStore,
    dispatch,
    fetchCalls,
    get skipWaitingCalls() {
      return skipWaitingCalls;
    },
    get claimCalls() {
      return claimCalls;
    },
    network,
    self,
  };
}

function defaultNetwork() {
  return new Map([
    [`${origin}/`, html("Overview")],
    [`${origin}/tickets`, html("Tickets")],
    [`${origin}/wristbands`, html("Wristbands")],
    [`${origin}/access`, html("Access")],
    [
      `${origin}/offline`,
      html(
        '<main>This presentation has not been saved</main><script src="/_next/static/offline.js"></script>',
      ),
    ],
    [
      `${origin}/_next/static/offline.js`,
      new Response("export {};", {
        headers: { "Content-Type": "text/javascript" },
      }),
    ],
    ...[
      "/icons/icon-192.png",
      "/icons/icon-512.png",
      "/icons/icon-maskable-512.png",
      "/icons/apple-touch-icon.png",
    ].map((path) => [
      `${origin}${path}`,
      new Response("icon", { headers: { "Content-Type": "image/png" } }),
    ]),
    [
      `${origin}/icon.svg`,
      new Response("<svg />", { headers: { "Content-Type": "image/svg+xml" } }),
    ],
    [
      `${origin}/manifest.webmanifest`,
      new Response("{}", {
        headers: { "Content-Type": "application/manifest+json" },
      }),
    ],
  ]);
}

test("install pre-caches presentation routes and discovered build assets", async () => {
  const harness = await createHarness();
  for (const [path, response] of defaultNetwork()) {
    harness.network.set(path, () => response.clone());
  }

  await harness.dispatch("install", {});

  const cache = harness.cacheStore.get("krowds-pwa-v2");
  assert.ok(cache);
  assert.ok(cache.has(`${origin}/`));
  assert.ok(cache.has(`${origin}/offline`));
  assert.ok(cache.has(`${origin}/manifest.webmanifest`));
  assert.ok(cache.has(`${origin}/_next/static/offline.js`));
});

test("activation removes only stale KROWDS presentation caches", async () => {
  const harness = await createHarness();
  harness.cacheStore.set("krowds-pwa-v1", new Map());
  harness.cacheStore.set("unrelated-cache", new Map());

  await harness.dispatch("activate", {});

  assert.equal(harness.cacheStore.has("krowds-pwa-v1"), false);
  assert.equal(harness.cacheStore.has("unrelated-cache"), true);
  assert.equal(harness.claimCalls, 1);
});

test("navigation is network-first and reports a cached stale fallback", async () => {
  const harness = await createHarness();
  for (const [path, response] of defaultNetwork()) {
    harness.network.set(path, () => response.clone());
  }
  await harness.dispatch("install", {});

  harness.network.set(`${origin}/tickets`, () => html("Fresh tickets"));
  const fresh = await harness.dispatch("fetch", {
    request: request("/tickets"),
  });
  assert.match(await fresh.text(), /Fresh tickets/);

  harness.network.set(`${origin}/tickets`, () => {
    throw new TypeError("offline");
  });
  const stale = await harness.dispatch("fetch", {
    request: request("/tickets"),
  });
  assert.match(await stale.text(), /Fresh tickets/);

  const messages = [];
  await harness.dispatch("message", {
    data: { type: "GET_PRESENTATION_FALLBACK", path: "/tickets" },
    ports: [{ postMessage: (message) => messages.push(message) }],
  });
  assert.equal(messages[0].mode, "stale");
});

test("an uncached query navigation gets only the unavailable shell", async () => {
  const harness = await createHarness();
  for (const [path, response] of defaultNetwork()) {
    harness.network.set(path, () => response.clone());
  }
  await harness.dispatch("install", {});

  const unavailable = await harness.dispatch("fetch", {
    request: request("/tickets?token=sensitive"),
  });
  assert.equal(unavailable.status, 307);
  assert.equal(new URL(unavailable.headers.get("location")).pathname, "/offline");

  harness.network.delete(`${origin}/offline`);
  const offlinePage = await harness.dispatch("fetch", {
    request: request("/offline"),
  });
  assert.match(await offlinePage.text(), /has not been saved/);

  const offlineMessages = [];
  await harness.dispatch("message", {
    data: { type: "GET_PRESENTATION_FALLBACK", path: "/offline" },
    ports: [{ postMessage: (message) => offlineMessages.push(message) }],
  });
  assert.equal(offlineMessages[0].mode, "unavailable");

  const messages = [];
  await harness.dispatch("message", {
    data: {
      type: "GET_PRESENTATION_FALLBACK",
      path: "/tickets",
    },
    ports: [{ postMessage: (message) => messages.push(message) }],
  });
  assert.equal(messages[0].mode, "unavailable");
});

test("API and write requests bypass presentation caching", async () => {
  const harness = await createHarness();
  const callsBefore = harness.fetchCalls.length;

  const apiResponse = await harness.dispatch("fetch", {
    request: request("/api/v1/payments", { mode: "cors", destination: "" }),
  });
  const postResponse = await harness.dispatch("fetch", {
    request: request("/tickets", { method: "POST" }),
  });

  assert.equal(apiResponse, undefined);
  assert.equal(postResponse, undefined);
  assert.equal(harness.fetchCalls.length, callsBefore);
});

test("an explicit client message activates a waiting update", async () => {
  const harness = await createHarness();
  await harness.dispatch("message", { data: { type: "ACTIVATE_UPDATE" } });
  assert.equal(harness.skipWaitingCalls, 1);
});
