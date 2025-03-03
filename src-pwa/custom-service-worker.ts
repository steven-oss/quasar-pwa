/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

declare const self: ServiceWorkerGlobalScope & typeof globalThis & { skipWaiting: () => void }

import type { WorkboxPlugin } from 'workbox-core'
import { clientsClaim } from 'workbox-core'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { ExpirationPlugin } from 'workbox-expiration'
import { NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies'
import { Queue } from 'workbox-background-sync'

void self.skipWaiting()

clientsClaim()

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

const apiCacheConfig = [
  { urlPatten: '/api/announcements', cacheName: 'api-announcements' },
  { urlPatten: '/api/reg/doctor-schedules/doctors', cacheName: 'api-reg-doctor-schedules-doctors' },
]
// API 快取策略
apiCacheConfig.forEach(({ urlPatten, cacheName }) => {
  registerRoute(
    ({ url }) => url.origin === 'https://apidev.hiscloud.tw' && url.pathname.startsWith(urlPatten),
    new StaleWhileRevalidate({
      cacheName,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50, // 最多快取 50 個 API 回應
          maxAgeSeconds: 60 * 60 * 24, // 24 小時後過期
        }) as unknown as WorkboxPlugin,
      ],
    }),
  )
})

// 建立 Background Sync 隊列
const postQueue = new Queue('patient-registration-queue', {
  maxRetentionTime: 24 * 60, // 24 小時內同步請求
})

// POST API 快取策略（適用於所有 /api/ 開頭的 POST 請求）
registerRoute(
  ({ url, request }) =>
    url.origin === 'https://apidev.hiscloud.tw' &&
    request.method === 'POST' &&
    url.pathname.startsWith(
      '/api/rest/anonymous/web/registration/10000000-0000-0000-0000-000000000001/reg/patient/',
    ),
  new NetworkOnly({
    plugins: [
      {
        fetchDidFail: async ({ request }) => {
          console.log(`❌ POST Request failed, adding to queue: ${request.url}`)

          try {
            // 重新複製 Request，確保 body 可讀取
            const clonedRequest = new Request(request.url, {
              method: request.method,
              headers: request.headers,
              body: request.clone().body, // 重新複製 body
              mode: request.mode,
              credentials: request.credentials,
            })

            // 加入 Background Sync Queue
            await postQueue.pushRequest({ request: clonedRequest })
            console.log(`✅ Successfully added to queue: ${request.url}`)
          } catch (error) {
            console.error('Error adding request to queue:', error)
          }
        },
      },
    ],
  }),
)

// Non-SSR fallbacks to index.html
// Production SSR fallbacks to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML), {
      denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/],
    }),
  )
}
