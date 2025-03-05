import { openDB } from 'idb'

const DB_NAME = 'api-cache-db'
const STORE_NAME = 'api-cache'
const PENDING_STORE = 'pending-requests' // 離線請求的 store

// 開啟資料庫
export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'url' })
      }
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { autoIncrement: true }) // 自動遞增 key
      }
    },
  })
}

// 儲存 API 回應
export async function saveToDB(type: string, url: string, data: unknown) {
  const db = await getDB()
  await db.put(STORE_NAME, { type, url, data, timestamp: Date.now() })
}

// 從 DB 讀取快取
export async function getFromDB(type: string, url: string) {
  const db = await getDB()
  const allData = await db.getAll(STORE_NAME)
  return allData.find((item) => item.type === type && item.url === url)
}
