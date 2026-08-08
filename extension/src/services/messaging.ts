import type { AiRequest, AiResponse, ExtensionMessage, SelectionPayload } from '../types'
import { DEFAULT_API_BASE } from '../types'
import { isExtensionAlive, safeRuntimeSendMessage } from '../utils/runtime'

export async function getApiBase(): Promise<string> {
  if (!isExtensionAlive()) return DEFAULT_API_BASE
  try {
    const stored = await chrome.storage.local.get(['apiBase'])
    return ((stored.apiBase as string) || DEFAULT_API_BASE).replace(/\/$/, '')
  } catch {
    return DEFAULT_API_BASE
  }
}

export async function setApiBase(apiBase: string): Promise<void> {
  if (!isExtensionAlive()) throw new Error('Extension context invalidated')
  await chrome.storage.local.set({ apiBase: apiBase.replace(/\/$/, '') })
}

export async function getOpenAiApiKey(): Promise<string> {
  if (!isExtensionAlive()) return ''
  try {
    const stored = await chrome.storage.local.get(['openaiApiKey'])
    return (stored.openaiApiKey as string) || ''
  } catch {
    return ''
  }
}

export async function setOpenAiApiKey(openaiApiKey: string): Promise<void> {
  if (!isExtensionAlive()) throw new Error('Extension context invalidated')
  await chrome.storage.local.set({ openaiApiKey })
}

export async function ensureHostPermission(apiBase: string): Promise<boolean> {
  if (!isExtensionAlive()) return false
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
  if (!isExtensionAlive()) return undefined
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    return tab
  } catch {
    return undefined
  }
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
  const response = await safeRuntimeSendMessage<ExtensionMessage>({
    type: 'RUN_AI',
    payload: request,
  } satisfies ExtensionMessage)
  if (!response) throw new Error('No response from background')
  if (response.type === 'AI_RESULT') return response.payload
  if (response.type === 'AI_ERROR') throw new Error(response.payload.message)
  throw new Error('Unexpected response')
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
