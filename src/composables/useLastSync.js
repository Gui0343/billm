import { ref } from 'vue'

const STORAGE_KEY = 'bill-last-sync-at'

/** Partilhado entre layout e páginas que concluem sync */
const lastSyncAt = ref(null)

function loadFromStorage () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) {
      lastSyncAt.value = raw
    }
  } catch {
    /* ignore */
  }
}

/**
 * Grava o momento da última sincronização bem-sucedida (persiste em localStorage).
 * @param {Date|string|number} [input] — default: agora
 */
function setLastSyncAt (input = new Date()) {
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return
  const iso = d.toISOString()
  try {
    localStorage.setItem(STORAGE_KEY, iso)
  } catch {
    /* ignore */
  }
  lastSyncAt.value = iso
}

export function useLastSync () {
  return {
    lastSyncAt,
    setLastSyncAt,
    loadLastSyncFromStorage: loadFromStorage
  }
}
