import type { ExtensionMessage } from '../types'
import { isExtensionAlive } from '../utils/runtime'
import { hideFloatingButton, showFloatingButton } from './floatingButton'
import { closeActionPanel, openActionPanel, resizeActionPanel, startPanelDrag } from './panel'
import { getSelectionPayload, replaceSelectedText } from './selection'

let lastPayload = { text: '', hasEditableTarget: false, rect: null as DOMRect | null }
let dead = false

function teardown(): void {
  dead = true
  closeActionPanel()
  hideFloatingButton()
}

function ensureAlive(): boolean {
  if (dead || !isExtensionAlive()) {
    teardown()
    return false
  }
  return true
}

function refreshSelection(): void {
  if (!ensureAlive()) return
  try {
    lastPayload = getSelectionPayload()
    if (lastPayload.text && lastPayload.rect) {
      showFloatingButton(lastPayload.rect, () => {
        if (!ensureAlive()) return
        openActionPanel({
          text: lastPayload.text,
          editable: lastPayload.hasEditableTarget,
          anchor: lastPayload.rect,
        })
        hideFloatingButton()
      })
    } else {
      hideFloatingButton()
    }
  } catch {
    teardown()
  }
}

document.addEventListener('mouseup', () => {
  window.setTimeout(refreshSelection, 10)
})

document.addEventListener('keyup', (e) => {
  if (e.key === 'Escape') {
    closeActionPanel()
    hideFloatingButton()
    return
  }
  window.setTimeout(refreshSelection, 10)
})

document.addEventListener('scroll', () => {
  if (!ensureAlive()) return
  hideFloatingButton()
}, true)

window.addEventListener('message', (event) => {
  if (!ensureAlive()) return
  const iframe = document.getElementById('replypilot-panel-iframe') as HTMLIFrameElement | null
  if (!iframe || event.source !== iframe.contentWindow) return
  const data = event.data
  if (data?.source !== 'replypilot') return
  if (data.type === 'CLOSE_PANEL') {
    closeActionPanel()
    return
  }
  if (data.type === 'RESIZE' && typeof data.height === 'number') {
    resizeActionPanel(data.height)
    return
  }
  if (data.type === 'DRAG_START' && typeof data.x === 'number' && typeof data.y === 'number') {
    startPanelDrag(data.x, data.y)
  }
})

try {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
    if (!ensureAlive()) {
      sendResponse({ ok: false })
      return false
    }
    if (message.type === 'GET_SELECTION') {
      const payload = getSelectionPayload()
      lastPayload = payload
      sendResponse({ text: payload.text, hasEditableTarget: payload.hasEditableTarget })
      return true
    }
    if (message.type === 'REPLACE_TEXT') {
      const ok = replaceSelectedText(message.payload.text)
      sendResponse({ ok })
      return true
    }
    if (message.type === 'OPEN_PANEL') {
      const payload = getSelectionPayload()
      lastPayload = payload
      if (payload.text) {
        openActionPanel({
          text: payload.text,
          editable: payload.hasEditableTarget,
          action: message.payload?.action ?? null,
          anchor: payload.rect,
        })
        hideFloatingButton()
      }
      sendResponse({ ok: true })
      return true
    }
    if (message.type === 'CLOSE_PANEL') {
      closeActionPanel()
      sendResponse({ ok: true })
      return true
    }
    if (message.type === 'CONTEXT_ACTION') {
      const payload = getSelectionPayload()
      lastPayload = payload
      if (payload.text) {
        openActionPanel({
          text: payload.text,
          editable: payload.hasEditableTarget,
          action: message.payload.action,
          anchor: payload.rect,
        })
        hideFloatingButton()
      }
      sendResponse({ ok: true })
      return true
    }
    return false
  })
} catch {
  teardown()
}
