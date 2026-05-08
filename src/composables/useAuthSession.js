const STORAGE_KEY = 'bill-auth-session'

export function readAuthSession () {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session?.name || !session?.email) return null
    return session
  } catch {
    return null
  }
}

export function writeAuthSession (session) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession () {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
