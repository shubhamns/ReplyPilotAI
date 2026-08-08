import type { RewriteTone } from '../types'
import { REWRITE_TONES } from '../types'

interface ToneSelectorProps {
  value: RewriteTone
  onChange: (tone: RewriteTone) => void
  disabled?: boolean
}

export function ToneSelector({ value, onChange, disabled }: ToneSelectorProps) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Tone</div>
      <div className="flex flex-wrap gap-1.5">
        {REWRITE_TONES.map((tone) => {
          const selected = value === tone.value
          return (
            <button
              key={tone.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(tone.value)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-150 disabled:opacity-50 ${
                selected
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                  : 'bg-surface-muted text-ink-muted border border-border hover:border-brand-400 hover:text-ink'
              }`}
            >
              {tone.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
