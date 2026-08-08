const HOST_ID = 'replypilot-floating-root'
const BTN_ID = 'replypilot-floating-btn'

export function ensureFloatingHost(): HTMLElement {
  let host = document.getElementById(HOST_ID)
  if (host) return host
  host = document.createElement('div')
  host.id = HOST_ID
  host.style.cssText = 'all:initial;position:fixed;z-index:2147483646;top:0;left:0;pointer-events:none;'
  document.documentElement.appendChild(host)
  return host
}

export function showFloatingButton(rect: DOMRect, onClick: () => void): void {
  const host = ensureFloatingHost()
  let btn = document.getElementById(BTN_ID) as HTMLButtonElement | null
  if (!btn) {
    btn = document.createElement('button')
    btn.id = BTN_ID
    btn.type = 'button'
    btn.textContent = '✨ ReplyPilot AI'
    btn.setAttribute('aria-label', 'Open ReplyPilot AI')
    btn.style.cssText = [
      'pointer-events:auto',
      'position:fixed',
      'z-index:2147483647',
      'display:inline-flex',
      'align-items:center',
      'gap:4px',
      'height:30px',
      'padding:0 10px',
      'border:none',
      'border-radius:999px',
      'cursor:pointer',
      'font:600 12px/1 Segoe UI,system-ui,sans-serif',
      'color:#fff',
      'background:linear-gradient(135deg,#7c3aed,#2563eb)',
      'box-shadow:0 8px 20px rgba(37,99,235,.28)',
      'transition:transform .15s ease,opacity .15s ease',
    ].join(';')
    btn.addEventListener('mouseenter', () => { btn!.style.transform = 'translateY(-1px) scale(1.03)' })
    btn.addEventListener('mouseleave', () => { btn!.style.transform = 'none' })
    host.appendChild(btn)
  }
  btn.onclick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onClick()
  }
  const top = Math.max(8, rect.top + window.scrollY - 38)
  const left = Math.min(window.scrollX + rect.left, window.scrollX + window.innerWidth - 160)
  btn.style.top = `${top - window.scrollY}px`
  btn.style.left = `${left - window.scrollX}px`
  btn.style.display = 'inline-flex'
  btn.style.opacity = '1'
}

export function hideFloatingButton(): void {
  const btn = document.getElementById(BTN_ID)
  if (btn) btn.style.display = 'none'
}
