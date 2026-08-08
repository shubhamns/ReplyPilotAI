import type { ThemeMode } from '../types'

const KEY = 'theme'

export async function getTheme(): Promise<ThemeMode> {
  const stored = await chrome.storage.sync.get([KEY])
  if (stored[KEY] === 'light' || stored[KEY] === 'dark') return stored[KEY]
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export async function setTheme(theme: ThemeMode): Promise<void> {
  await chrome.storage.sync.set({ [KEY]: theme })
}

export function applyTheme(theme: ThemeMode): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
