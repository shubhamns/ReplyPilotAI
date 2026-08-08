interface TextPreviewProps {
  text: string
  label?: string
  emptyLabel?: string
}

export function TextPreview({ text, label = 'Selected text', emptyLabel = 'Select text on any page to get started' }: TextPreviewProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted p-3">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{label}</div>
      <p className={`text-sm leading-relaxed ${text ? 'text-ink' : 'text-ink-muted italic'}`}>
        {text ? (text.length > 280 ? `${text.slice(0, 280)}...` : text) : emptyLabel}
      </p>
    </div>
  )
}
