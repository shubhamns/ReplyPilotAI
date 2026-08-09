import type { AiAction, AiRequest, AiResponse, ExtensionMessage } from '../types'
import { DEFAULT_API_BASE } from '../types'

const MENU_PARENT = 'replypilot-root'
const SESSION_KEY = 'replypilot_panel_payload'
const ACTIONS: { id: string; title: string; action: AiAction }[] = [
  { id: 'replypilot-reply', title: 'AI Reply', action: 'reply' },
  { id: 'replypilot-grammar', title: 'Fix Grammar', action: 'grammar' },
  { id: 'replypilot-rewrite', title: 'Rewrite', action: 'rewrite' },
  { id: 'replypilot-translate', title: 'Translate', action: 'translate' },
  { id: 'replypilot-summarize', title: 'Summarize', action: 'summarize' },
]

async function getApiBase(): Promise<string> {
  const stored = await chrome.storage.local.get(['apiBase'])
  return ((stored.apiBase as string) || DEFAULT_API_BASE).replace(/\/$/, '')
}

async function getAccessToken(): Promise<string> {
  const stored = await chrome.storage.local.get(['accessToken'])
  return (stored.accessToken as string) || ''
}

function endpointFor(action: AiAction): string {
  switch (action) {
    case 'reply': return '/api/reply'
    case 'grammar': return '/api/grammar'
    case 'rewrite': return '/api/rewrite'
    case 'translate': return '/api/translate'
    case 'summarize': return '/api/summarize'
  }
}

async function callBackend(request: AiRequest): Promise<AiResponse> {
  const base = await getApiBase()
  const accessToken = await getAccessToken()
  if (!accessToken) {
    throw new Error('Add your OpenAI API key in Settings')
  }
  const body: Record<string, string> = { text: request.text }
  if (request.action === 'rewrite' && request.tone) body.tone = request.tone
  if (request.action === 'translate' && request.targetLanguage) body.target_language = request.targetLanguage
  const url = `${base}${endpointFor(request.action)}`
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': accessToken,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    })
  } catch {
    throw new Error(`Cannot reach backend at ${base}. Check API URL in Settings.`)
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const data = await res.json() as { detail?: string | { msg?: string }[] }
      if (typeof data.detail === 'string') detail = data.detail
      else if (Array.isArray(data.detail) && data.detail[0]?.msg) detail = data.detail[0].msg
    } catch { /* ignore */ }
    throw new Error(detail)
  }
  const data = await res.json() as { result: string }
  return { result: data.result, action: request.action }
}

function setupContextMenus(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_PARENT,
      title: 'ReplyPilot AI',
      contexts: ['selection'],
    })
    for (const item of ACTIONS) {
      chrome.contextMenus.create({
        id: item.id,
        parentId: MENU_PARENT,
        title: item.title,
        contexts: ['selection'],
      })
    }
  })
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus()
})

chrome.runtime.onStartup.addListener(() => {
  setupContextMenus()
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const matched = ACTIONS.find((a) => a.id === info.menuItemId)
  if (!matched || !tab?.id) return
  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'CONTEXT_ACTION',
      payload: { action: matched.action },
    } satisfies ExtensionMessage)
  } catch {
    // Content script may be unavailable on restricted pages
  }
})

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'RUN_AI') {
    void callBackend(message.payload)
      .then((payload) => sendResponse({ type: 'AI_RESULT', payload } satisfies ExtensionMessage))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Request failed'
        sendResponse({ type: 'AI_ERROR', payload: { message: msg } } satisfies ExtensionMessage)
      })
    return true
  }
  if (message.type === 'STORE_PANEL_PAYLOAD') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    void chrome.storage.session.set({ [SESSION_KEY]: { id, ...message.payload } }).then(() => {
      sendResponse({ type: 'PANEL_PAYLOAD_STORED', payload: { id } } satisfies ExtensionMessage)
    })
    return true
  }
  if (message.type === 'GET_PANEL_PAYLOAD') {
    void chrome.storage.session.get([SESSION_KEY]).then((stored) => {
      const data = stored[SESSION_KEY] as { id: string; text: string; editable: boolean; action?: AiAction | null } | undefined
      if (!data || data.id !== message.payload.id) {
        sendResponse({ type: 'PANEL_PAYLOAD_RESULT', payload: null } satisfies ExtensionMessage)
        return
      }
      sendResponse({
        type: 'PANEL_PAYLOAD_RESULT',
        payload: { text: data.text, editable: data.editable, action: data.action },
      } satisfies ExtensionMessage)
    })
    return true
  }
  return false
})
