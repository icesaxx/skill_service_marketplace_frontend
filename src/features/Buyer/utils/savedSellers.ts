const SAVED_SELLERS_STORAGE_KEY = "buyer_saved_seller_ids"

const getSavedSellersStorageKey = (buyerId?: number | string | null) => {
  return buyerId ? `${SAVED_SELLERS_STORAGE_KEY}:${buyerId}` : `${SAVED_SELLERS_STORAGE_KEY}:guest`
}

const readSavedSellerIds = (buyerId?: number | string | null) => {
  if (typeof window === "undefined") return []

  try {
    const value = window.localStorage.getItem(getSavedSellersStorageKey(buyerId))
    const parsed = value ? JSON.parse(value) : []
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

const writeSavedSellerIds = (sellerIds: string[], buyerId?: number | string | null) => {
  if (typeof window === "undefined") return

  window.localStorage.setItem(getSavedSellersStorageKey(buyerId), JSON.stringify(Array.from(new Set(sellerIds))))
}

export const getSavedSellerIds = (buyerId?: number | string | null) => readSavedSellerIds(buyerId)

export const isSavedSellerId = (sellerId: number | string | undefined, buyerId?: number | string | null) => {
  if (!sellerId) return false
  return readSavedSellerIds(buyerId).includes(String(sellerId))
}

export const saveSellerId = (sellerId: number | string, buyerId?: number | string | null) => {
  const nextSellerIds = [...readSavedSellerIds(buyerId), String(sellerId)]
  writeSavedSellerIds(nextSellerIds, buyerId)
  return Array.from(new Set(nextSellerIds))
}
