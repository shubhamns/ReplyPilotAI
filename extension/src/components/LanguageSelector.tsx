import { LANGUAGES } from '../types'

interface LanguageSelectorProps {
  value: string
  onChange: (language: string) => void
  disabled?: boolean
}

export function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Translate to</div>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-xl border border-border bg-surface-muted px-3 text-sm text-ink outline-none transition focus:border-brand-400 disabled:opacity-50"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>{lang.label}</option>
        ))}
      </select>
    </div>
  )
}
