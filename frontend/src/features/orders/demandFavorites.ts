const demandFavoritesKey = 'ecocampus:demand-favorites'
const demandFavoritesEvent = 'ecocampus:demand-favorites-changed'

export interface DemandFavoriteItem {
  author: string
  budget: string
  category: string
  description: string
  favoritedAt: string
  id: number
  image: string
  publishedAt: string
  status: string
  title: string
}

export function listDemandFavorites() {
  return readDemandFavorites()
}

export function isDemandFavorited(demandId: number) {
  return readDemandFavorites().some((item) => item.id === demandId)
}

export function favoriteDemand(item: Omit<DemandFavoriteItem, 'favoritedAt'>) {
  const currentItems = readDemandFavorites()
  const nextItems = [
    { ...item, favoritedAt: new Date().toISOString() },
    ...currentItems.filter((currentItem) => currentItem.id !== item.id),
  ]

  writeDemandFavorites(nextItems)
}

export function unfavoriteDemand(demandId: number) {
  writeDemandFavorites(readDemandFavorites().filter((item) => item.id !== demandId))
}

export function toggleDemandFavorite(item: Omit<DemandFavoriteItem, 'favoritedAt'>) {
  if (isDemandFavorited(item.id)) {
    unfavoriteDemand(item.id)
    return false
  }

  favoriteDemand(item)
  return true
}

export function subscribeDemandFavorites(listener: () => void) {
  window.addEventListener(demandFavoritesEvent, listener)
  window.addEventListener('storage', listener)

  return () => {
    window.removeEventListener(demandFavoritesEvent, listener)
    window.removeEventListener('storage', listener)
  }
}

function readDemandFavorites(): DemandFavoriteItem[] {
  const rawValue = window.localStorage.getItem(demandFavoritesKey)

  if (!rawValue) {
    return []
  }

  try {
    const value = JSON.parse(rawValue)
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function writeDemandFavorites(items: DemandFavoriteItem[]) {
  window.localStorage.setItem(demandFavoritesKey, JSON.stringify(items))
  window.dispatchEvent(new Event(demandFavoritesEvent))
}
