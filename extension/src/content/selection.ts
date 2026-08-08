let savedRange: Range | null = null
let savedInput: { el: HTMLInputElement | HTMLTextAreaElement; start: number; end: number } | null = null

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'url', 'tel', ''])

export function getSelectionPayload(): { text: string; hasEditableTarget: boolean; rect: DOMRect | null } {
  const active = document.activeElement as HTMLElement | null
  if (active && isEditable(active)) {
    const text = getEditableSelection(active)
    if (text) {
      rememberSelection(active)
      return { text, hasEditableTarget: true, rect: getCaretOrElementRect(active) }
    }
  }
  const selection = window.getSelection()
  const text = selection?.toString() ?? ''
  const trimmed = text.trim()
  if (!trimmed) return { text: '', hasEditableTarget: isEditable(active), rect: null }
  const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
  if (range) {
    savedRange = range.cloneRange()
    savedInput = null
  }
  const rect = range ? range.getBoundingClientRect() : null
  const editableHost = findEditableHost(range?.commonAncestorContainer ?? null)
  return { text: trimmed, hasEditableTarget: Boolean(editableHost), rect }
}

export function isEditable(el: Element | null | undefined): boolean {
  if (!el || !(el instanceof HTMLElement)) return false
  if (el instanceof HTMLTextAreaElement) return !el.disabled && !el.readOnly
  if (el instanceof HTMLInputElement) {
    if (!TEXT_INPUT_TYPES.has(el.type)) return false
    return !el.disabled && !el.readOnly
  }
  return el.isContentEditable
}

function rememberSelection(el: HTMLElement): void {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    savedInput = { el, start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 }
    savedRange = null
    return
  }
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    savedRange = selection.getRangeAt(0).cloneRange()
    savedInput = null
  }
}

function findEditableHost(node: Node | null): HTMLElement | null {
  let current: Node | null = node
  while (current) {
    if (current instanceof HTMLElement && isEditable(current)) return current
    current = current.parentNode
  }
  return null
}

function getEditableSelection(el: HTMLElement): string {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    if (start === end) return ''
    return el.value.slice(start, end).trim()
  }
  if (el.isContentEditable) {
    return (window.getSelection()?.toString() ?? '').trim()
  }
  return ''
}

function getCaretOrElementRect(el: HTMLElement): DOMRect {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const rect = selection.getRangeAt(0).getBoundingClientRect()
    if (rect.width || rect.height) return rect
  }
  return el.getBoundingClientRect()
}

function setNativeInputValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value')
  descriptor?.set?.call(el, value)
}

function replaceInInput(el: HTMLInputElement | HTMLTextAreaElement, start: number, end: number, replacement: string): boolean {
  if (start === end) return false
  el.focus()
  const next = el.value.slice(0, start) + replacement + el.value.slice(end)
  setNativeInputValue(el, next)
  const caret = start + replacement.length
  el.setSelectionRange(caret, caret)
  el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: replacement }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
  return true
}

function replaceInContentEditable(range: Range, replacement: string): boolean {
  const selection = window.getSelection()
  if (!selection) return false
  selection.removeAllRanges()
  selection.addRange(range)
  const editable = findEditableHost(range.commonAncestorContainer)
  editable?.focus()
  try {
    const ok = document.execCommand('insertText', false, replacement)
    if (ok) return true
  } catch { /* fall through */ }
  range.deleteContents()
  const node = document.createTextNode(replacement)
  range.insertNode(node)
  range.setStartAfter(node)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
  editable?.dispatchEvent(new InputEvent('input', { bubbles: true, data: replacement, inputType: 'insertText' }))
  savedRange = range.cloneRange()
  return true
}

export function replaceSelectedText(replacement: string): boolean {
  if (savedInput?.el.isConnected) {
    const { el, start, end } = savedInput
    if (replaceInInput(el, start, end, replacement)) {
      savedInput = { el, start: start + replacement.length, end: start + replacement.length }
      return true
    }
  }
  const active = document.activeElement as HTMLElement | null
  if (active && (active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement) && isEditable(active)) {
    const start = active.selectionStart ?? 0
    const end = active.selectionEnd ?? 0
    if (replaceInInput(active, start, end, replacement)) return true
  }
  if (savedRange) {
    try {
      return replaceInContentEditable(savedRange, replacement)
    } catch {
      return false
    }
  }
  return false
}
