import { useCallback, useEffect, useRef, useState } from 'react'
import { ActionButtons } from './ActionButtons'
import { LanguageSelector } from './LanguageSelector'
import { Logo } from './Logo'
import { ResultArea } from './ResultArea'
import { GitHubButton, SettingsButton, SettingsPanel } from './SettingsPanel'
import { TextPreview } from './TextPreview'
import { ThemeToggle } from './ThemeToggle'
import { ToneSelector } from './ToneSelector'
import { copyToClipboard, getAccessToken, getSelectionFromActiveTab, replaceTextInActiveTab, runAiAction } from '../services/messaging'
import { applyTheme, getTheme, setTheme } from '../services/theme'
import type { AiAction, RewriteTone, ThemeMode } from '../types'
import { GITHUB_REPO_URL } from '../types'

interface AssistantAppProps {
  compact?: boolean
  initialAction?: AiAction | null
  initialText?: string
  onClose?: () => void
}

export function AssistantApp({
  compact = false,
  initialAction = null,
  initialText = '',
  onClose,
}: AssistantAppProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [theme, setThemeState] = useState<ThemeMode>('light')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedText, setSelectedText] = useState(initialText)
  const [tone, setTone] = useState<RewriteTone>('professional')
  const [language, setLanguage] = useState('English')
  const [activeAction, setActiveAction] = useState<AiAction | null>(null)
  const [result, setResult] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const autoRan = useRef(false)

  useEffect(() => {
    void (async () => {
      const t = await getTheme()
      setThemeState(t)
      applyTheme(t)
      const token = await getAccessToken()
      if (!token) setSettingsOpen(true)
    })()
  }, [])

  useEffect(() => {
    if (initialText) return
    void (async () => {
      const selection = await getSelectionFromActiveTab()
      setSelectedText(selection.text)
    })()
  }, [initialText])

  useEffect(() => {
    if (!compact) return
    const el = rootRef.current
    if (!el) return
    const report = () => {
      window.parent.postMessage({ source: 'replypilot', type: 'RESIZE', height: el.scrollHeight }, '*')
    }
    report()
    const ro = new ResizeObserver(report)
    ro.observe(el)
    return () => ro.disconnect()
  }, [compact, result, loading, settingsOpen, error, activeAction])

  const handleAction = useCallback(async (action: AiAction, text = selectedText, currentTone = tone, currentLanguage = language) => {
    if (!text.trim()) {
      setError('Select some text first')
      return
    }
    const token = await getAccessToken()
    if (!token) {
      setError('Add your OpenAI API key in Settings')
      setSettingsOpen(true)
      return
    }
    setActiveAction(action)
    setLoading(true)
    setError(null)
    setResult('')
    setCopied(false)
    try {
      const response = await runAiAction({
        text,
        action,
        tone: action === 'rewrite' ? currentTone : undefined,
        targetLanguage: action === 'translate' ? currentLanguage : undefined,
      })
      setResult(response.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [selectedText, tone, language])

  useEffect(() => {
    if (autoRan.current || !initialAction || !selectedText.trim()) return
    autoRan.current = true
    void handleAction(initialAction, selectedText)
  }, [initialAction, selectedText, handleAction])

  const toggleTheme = useCallback(async () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark'
    setThemeState(next)
    applyTheme(next)
    await setTheme(next)
  }, [theme])

  const handleCopy = async () => {
    if (!result) return
    try {
      await copyToClipboard(result)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('Could not copy to clipboard')
    }
  }

  const handleReplace = async () => {
    if (!result) return
    const ok = await replaceTextInActiveTab(result)
    if (!ok) setError('Could not replace text on this page')
  }

  const showTone = activeAction === 'rewrite' || initialAction === 'rewrite'
  const showLang = activeAction === 'translate' || initialAction === 'translate'

  const onHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!compact || e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest('button,a,input,select,textarea')) return
    e.preventDefault()
    window.parent.postMessage({ source: 'replypilot', type: 'DRAG_START', x: e.screenX, y: e.screenY }, '*')
  }

  return (
    <div
      ref={rootRef}
      className={`bg-surface text-ink ${compact ? 'w-full' : 'w-90 max-h-145 overflow-y-auto'}`}
    >
      <div
        className={`flex items-center justify-between border-b border-border px-3.5 py-3 ${compact ? 'cursor-grab active:cursor-grabbing select-none' : ''}`}
        onPointerDown={onHeaderPointerDown}
      >
        <Logo size={26} />
        <div className="flex items-center gap-0.5">
          <GitHubButton url={GITHUB_REPO_URL} />
          <SettingsButton onClick={() => setSettingsOpen((v) => !v)} />
          <ThemeToggle theme={theme} onToggle={() => void toggleTheme()} />
          {onClose && (
            <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-ink-muted hover:bg-surface-muted" aria-label="Close">✕</button>
          )}
        </div>
      </div>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <div className="flex flex-col gap-3 p-3.5 pb-4">
        <TextPreview text={selectedText} />
        <ActionButtons active={activeAction} loading={loading} disabled={loading || !selectedText.trim()} onAction={(a) => void handleAction(a)} />
        {showTone && <ToneSelector value={tone} onChange={setTone} disabled={loading} />}
        {showLang && <LanguageSelector value={language} onChange={setLanguage} disabled={loading} />}
        {error && <p className="text-xs text-red-500 leading-relaxed">{error}</p>}
        <ResultArea result={result} loading={loading} onCopy={() => void handleCopy()} onReplace={() => void handleReplace()} copied={copied} />
      </div>
    </div>
  )
}
