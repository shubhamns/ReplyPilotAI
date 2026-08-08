import { useEffect, useState } from 'react'
import { ensureHostPermission, getApiBase, getOpenAiApiKey, setApiBase, setOpenAiApiKey } from '../services/messaging'
import { Button } from './Button'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [base, setBase] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    void Promise.all([getApiBase(), getOpenAiApiKey()]).then(([b, k]) => {
      setBase(b)
      setOpenaiKey(k)
      setSaving(false)
      setError(null)
    })
  }, [open])

  if (!open) return null

  return (
    <div className="border-b border-border bg-surface-muted px-3.5 py-3 rp-fade-in">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold text-ink">Settings</div>
        <button type="button" onClick={onClose} className="rounded-lg px-2 py-0.5 text-ink-muted hover:bg-surface" aria-label="Close settings">✕</button>
      </div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-ink-muted">API URL</label>
      <input
        value={base}
        onChange={(e) => { setBase(e.target.value); setError(null) }}
        className="mb-2 h-8 w-full rounded-lg border border-border bg-surface px-2 text-xs text-ink outline-none focus:border-brand-400"
        placeholder="http://127.0.0.1:8000"
      />
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-ink-muted">OpenAI API Key</label>
      <input
        type="password"
        value={openaiKey}
        onChange={(e) => { setOpenaiKey(e.target.value); setError(null) }}
        className="mb-2 h-8 w-full rounded-lg border border-border bg-surface px-2 text-xs text-ink outline-none focus:border-brand-400"
        placeholder="sk-..."
        autoComplete="off"
      />
      <p className="mb-2 text-[10px] leading-relaxed text-ink-muted">Stored only in this browser. Each developer can use their own key and hosted API URL.</p>
      {error && <p className="mb-2 text-xs text-red-500 leading-relaxed">{error}</p>}
      <Button
        size="sm"
        className="w-full"
        loading={saving}
        onClick={() => {
          void (async () => {
            setSaving(true)
            setError(null)
            const nextBase = base.trim().replace(/\/$/, '')
            if (!nextBase) {
              setError('API URL is required')
              setSaving(false)
              return
            }
            if (!openaiKey.trim()) {
              setError('OpenAI API key is required')
              setSaving(false)
              return
            }
            const ok = await ensureHostPermission(nextBase)
            if (!ok) {
              setError('Host permission denied for that API URL')
              setSaving(false)
              return
            }
            try {
              await setApiBase(nextBase)
              await setOpenAiApiKey(openaiKey.trim())
              setSaving(false)
              onClose()
            } catch {
              setError('Could not save settings')
              setSaving(false)
            }
          })()
        }}
      >
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink" aria-label="Settings" title="Settings">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="2" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.2.6.7 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export function GitHubButton({ url }: { url: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink" aria-label="Open GitHub repo" title="GitHub">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.58.24 2.75.12 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.67.42.36.79 1.08.79 2.18 0 1.57-.01 2.84-.01 3.23 0 .31.21.68.8.56A10.53 10.53 0 0 0 23.5 12C23.5 5.74 18.27.5 12 .5z" />
      </svg>
    </a>
  )
}
