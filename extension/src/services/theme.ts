import type { ThemeMode } from '../types'
import { isExtensionAlive } from '../utils/runtime'

const KEY = 'theme'

export async function getTheme(): Promise<ThemeMode> {
  const fallback = (): ThemeMode =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  if (!isExtensionAlive()) return fallback()
  try {
    const stored = await chrome.storage.sync.get([KEY])
    if (stored[KEY] === 'light' || stored[KEY] === 'dark') return stored[KEY]
    return fallback()
  } catch {
    return fallback()
  }
}

export async function setTheme(theme: ThemeMode): Promise<void> {
  if (!isExtensionAlive()) return
  try {
    await chrome.storage.sync.set({ [KEY]: theme })
  } catch {
    // ignore invalidated context
  }
}

export function applyTheme(theme: ThemeMode): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
