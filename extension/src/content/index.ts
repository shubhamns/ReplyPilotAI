import type { ExtensionMessage } from '../types'
import { hideFloatingButton, showFloatingButton } from './floatingButton'
import { closeActionPanel, openActionPanel, resizeActionPanel, startPanelDrag } from './panel'
import { getSelectionPayload, replaceSelectedText } from './selection'

let lastPayload = { text: '', hasEditableTarget: false, rect: null as DOMRect | null }

function refreshSelection(): void {
  lastPayload = getSelectionPayload()
  if (lastPayload.text && lastPayload.rect) {
    showFloatingButton(lastPayload.rect, () => {
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

document.addEventListener('scroll', () => hideFloatingButton(), true)

window.addEventListener('message', (event) => {
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

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
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
