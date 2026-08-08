import type { AiRequest, AiResponse, ExtensionMessage, SelectionPayload } from '../types'
import { DEFAULT_API_BASE } from '../types'

export async function getApiBase(): Promise<string> {
  const stored = await chrome.storage.local.get(['apiBase'])
  return ((stored.apiBase as string) || DEFAULT_API_BASE).replace(/\/$/, '')
}

export async function setApiBase(apiBase: string): Promise<void> {
  await chrome.storage.local.set({ apiBase: apiBase.replace(/\/$/, '') })
}

export async function getOpenAiApiKey(): Promise<string> {
  const stored = await chrome.storage.local.get(['openaiApiKey'])
  return (stored.openaiApiKey as string) || ''
}

export async function setOpenAiApiKey(openaiApiKey: string): Promise<void> {
  await chrome.storage.local.set({ openaiApiKey })
}

export async function ensureHostPermission(apiBase: string): Promise<boolean> {
  try {
    const url = new URL(apiBase)
    const origin = `${url.protocol}//${url.host}/*`
    const have = await chrome.permissions.contains({ origins: [origin] })
    if (have) return true
    return await chrome.permissions.request({ origins: [origin] })
  } catch {
    return false
  }
}

export function sendToTab<T = unknown>(tabId: number, message: ExtensionMessage): Promise<T> {
  return chrome.tabs.sendMessage(tabId, message) as Promise<T>
}

export async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab
}

export async function getSelectionFromActiveTab(): Promise<SelectionPayload> {
  const tab = await getActiveTab()
  if (!tab?.id) return { text: '', hasEditableTarget: false }
  try {
    const result = await sendToTab<SelectionPayload>(tab.id, { type: 'GET_SELECTION' })
    return result ?? { text: '', hasEditableTarget: false }
  } catch {
    return { text: '', hasEditableTarget: false }
  }
}

export async function replaceTextInActiveTab(text: string): Promise<boolean> {
  const tab = await getActiveTab()
  if (!tab?.id) return false
  try {
    const result = await sendToTab<{ ok: boolean }>(tab.id, { type: 'REPLACE_TEXT', payload: { text } })
    return result?.ok === true
  } catch {
    return false
  }
}

export async function runAiAction(request: AiRequest): Promise<AiResponse> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'RUN_AI', payload: request } satisfies ExtensionMessage,
      (response: ExtensionMessage | undefined) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }
        if (!response) {
          reject(new Error('No response from background'))
          return
        }
        if (response.type === 'AI_RESULT') {
          resolve(response.payload)
          return
        }
        if (response.type === 'AI_ERROR') {
          reject(new Error(response.payload.message))
          return
        }
        reject(new Error('Unexpected response'))
      },
    )
  })
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }
  } catch {
    // fall through to legacy copy
  }
  const el = document.createElement('textarea')
  el.value = text
  el.setAttribute('readonly', '')
  el.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:none;outline:none;opacity:0;'
  document.body.appendChild(el)
  el.focus()
  el.select()
  el.setSelectionRange(0, text.length)
  const ok = document.execCommand('copy')
  el.remove()
  if (!ok) throw new Error('Copy failed')
}

