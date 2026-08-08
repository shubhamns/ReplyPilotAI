import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AssistantApp } from '../components/AssistantApp'
import type { AiAction, ExtensionMessage } from '../types'
import '../styles/index.css'

const params = new URLSearchParams(window.location.search)
const sid = params.get('sid') || ''

function loadPayload(id: string): Promise<{ text: string; editable: boolean; action?: AiAction | null } | null> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'GET_PANEL_PAYLOAD', payload: { id } } satisfies ExtensionMessage,
      (response: ExtensionMessage | undefined) => {
        if (chrome.runtime.lastError || response?.type !== 'PANEL_PAYLOAD_RESULT') {
          resolve(null)
          return
        }
        resolve(response.payload)
      },
    )
  })
}

async function boot(): Promise<void> {
  let initialAction: AiAction | null = null
  let initialText = ''
  if (sid) {
    const data = await loadPayload(sid)
    if (data) {
      initialText = data.text
      initialAction = data.action ?? null
    }
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AssistantApp
        compact
        initialAction={initialAction}
        initialText={initialText}
        onClose={() => {
          window.parent.postMessage({ source: 'replypilot', type: 'CLOSE_PANEL' }, '*')
        }}
      />
    </StrictMode>,
  )
}

void boot()
