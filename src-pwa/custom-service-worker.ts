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
import { getFromDB, saveToDB } from './idb-utils'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { NetworkOnly } from 'workbox-strategies'

void self.skipWaiting()

clientsClaim()

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

const apiCacheConfig = [
  { type: 'announcements', urlPattern: '/api/announcements' },
  { type: 'doctor-schedules', urlPattern: '/api/reg/doctor-schedules/doctors' },
  { type: 'registration', urlPattern: '/api/rest/anonymous/web/registration' },
]

const apiPostCacheConfig = [{ urlPattern: '/api/rest/anonymous/web/registration' }]
// 使用 IndexedDB 來存取 API 資料
apiCacheConfig.forEach(({ type, urlPattern }) => {
  registerRoute(
    ({ url }) => url.origin === 'https://apidev.hiscloud.tw' && url.pathname.startsWith(urlPattern),
    async ({ request }) => {
      // 只儲存資料到 IndexedDB
      try {
        const networkResponse = await fetch(request)

        if (networkResponse.ok) {
          const clonedResponse = networkResponse.clone()

          // 儲存到 IndexedDB
          await saveToDB(type, request.url, await clonedResponse.json())
          return networkResponse
        }
      } catch (error) {
        console.log(`Network request failed for ${type}, fetching from IndexedDB:`, error)
      }

      // 如果網路請求失敗，從 IndexedDB 讀取資料
      const cachedData = await getFromDB(type, request.url)

      if (cachedData) {
        return new Response(JSON.stringify(cachedData.data), {
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return new Response(null, { status: 500, statusText: 'Network Error' })
    },
  )
})

const bgSyncPlugin: WorkboxPlugin = new BackgroundSyncPlugin('post-queue', {
  maxRetentionTime: 24 * 60, // 最多保留 24 小時
}) as WorkboxPlugin

apiPostCacheConfig.forEach(({ urlPattern }) => {
  registerRoute(
    ({ url }) => url.origin === 'https://apidev.hiscloud.tw' && url.pathname.startsWith(urlPattern),
    new NetworkOnly({
      plugins: [bgSyncPlugin], // 使用 Background Sync 插件來處理離線請求
    }),
    'POST',
  )
})

// Non-SSR fallbacks to index.html
// Production SSR fallbacks to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML), {
      denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/],
    }),
  )
}
