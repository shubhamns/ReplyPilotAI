import type { AiAction, ExtensionMessage } from '../types'

const PANEL_ID = 'replypilot-panel-iframe'
const PANEL_WIDTH = 360

function storePanelPayload(payload: { text: string; editable: boolean; action?: AiAction | null }): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'STORE_PANEL_PAYLOAD', payload } satisfies ExtensionMessage,
      (response: ExtensionMessage | undefined) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }
        if (response?.type === 'PANEL_PAYLOAD_STORED') {
          resolve(response.payload.id)
          return
        }
        reject(new Error('Failed to store panel payload'))
      },
    )
  })
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

export function openActionPanel(opts: { text: string; editable: boolean; action?: AiAction | null; anchor?: DOMRect | null }): void {
  closeActionPanel()
  void (async () => {
    try {
      const id = await storePanelPayload({
        text: opts.text,
        editable: opts.editable,
        action: opts.action ?? null,
      })
      const iframe = document.createElement('iframe')
      iframe.id = PANEL_ID
      const params = new URLSearchParams()
      params.set('sid', id)
      iframe.src = chrome.runtime.getURL(`src/panel/index.html?${params.toString()}`)
      const anchor = opts.anchor
      const initialH = Math.min(480, window.innerHeight - 24)
      const top = anchor
        ? clamp(anchor.bottom + 8, 8, window.innerHeight - initialH - 8)
        : 72
      const left = anchor
        ? clamp(anchor.left, 8, window.innerWidth - PANEL_WIDTH - 8)
        : window.innerWidth - PANEL_WIDTH - 16
      iframe.style.cssText = [
        'position:fixed',
        `top:${top}px`,
        `left:${left}px`,
        `width:${PANEL_WIDTH}px`,
        `height:${initialH}px`,
        'z-index:2147483647',
        'border:none',
        'border-radius:18px',
        'overflow:hidden',
        'box-shadow:0 24px 60px rgba(15,23,42,.28)',
        'background:#0f1220',
      ].join(';')
      document.documentElement.appendChild(iframe)
    } catch {
      // ignore open failures on restricted pages
    }
  })()
}

export function resizeActionPanel(height: number): void {
  const iframe = document.getElementById(PANEL_ID) as HTMLIFrameElement | null
  if (!iframe) return
  const next = clamp(Math.ceil(height), 280, window.innerHeight - 16)
  iframe.style.height = `${next}px`
  const top = parseFloat(iframe.style.top || '0')
  if (top + next > window.innerHeight - 8) {
    iframe.style.top = `${Math.max(8, window.innerHeight - next - 8)}px`
  }
}

export function startPanelDrag(screenX: number, screenY: number): void {
  const iframe = document.getElementById(PANEL_ID) as HTMLIFrameElement | null
  if (!iframe) return
  const startLeft = parseFloat(iframe.style.left || '0')
  const startTop = parseFloat(iframe.style.top || '0')
  const w = iframe.offsetWidth
  const h = iframe.offsetHeight
  let nextLeft = startLeft
  let nextTop = startTop
  let raf = 0
  iframe.style.pointerEvents = 'none'
  iframe.style.willChange = 'transform'
  iframe.style.transition = 'none'
  const prevCursor = document.body.style.cursor
  const prevSelect = document.body.style.userSelect
  document.body.style.cursor = 'grabbing'
  document.body.style.userSelect = 'none'
  const paint = () => {
    raf = 0
    iframe.style.transform = `translate3d(${nextLeft - startLeft}px,${nextTop - startTop}px,0)`
  }
  const onMove = (e: PointerEvent) => {
    e.preventDefault()
    nextLeft = clamp(startLeft + e.screenX - screenX, 0, window.innerWidth - w)
    nextTop = clamp(startTop + e.screenY - screenY, 0, window.innerHeight - h)
    if (!raf) raf = requestAnimationFrame(paint)
  }
  const onUp = () => {
    if (raf) cancelAnimationFrame(raf)
    iframe.style.transform = ''
    iframe.style.left = `${nextLeft}px`
    iframe.style.top = `${nextTop}px`
    iframe.style.pointerEvents = 'auto'
    iframe.style.willChange = ''
    document.body.style.cursor = prevCursor
    document.body.style.userSelect = prevSelect
    document.removeEventListener('pointermove', onMove, true)
    document.removeEventListener('pointerup', onUp, true)
    document.removeEventListener('pointercancel', onUp, true)
  }
  document.addEventListener('pointermove', onMove, true)
  document.addEventListener('pointerup', onUp, true)
  document.addEventListener('pointercancel', onUp, true)
}

export function closeActionPanel(): void {
  document.getElementById(PANEL_ID)?.remove()
}

export function isPanelOpen(): boolean {
  return Boolean(document.getElementById(PANEL_ID))
}
