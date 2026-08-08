import { Button } from './Button'

interface ResultAreaProps {
  result: string
  loading?: boolean
  onCopy: () => void
  onReplace: () => void
  copied?: boolean
}

export function ResultArea({ result, loading, onCopy, onReplace, copied }: ResultAreaProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted p-3 rp-fade-in">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Result</div>
        {result && (
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={onCopy} disabled={!result}>{copied ? 'Copied' : 'Copy'}</Button>
            <Button variant="secondary" size="sm" onClick={onReplace} disabled={!result}>Replace</Button>
          </div>
        )}
      </div>
      {loading && (
        <div className="flex items-center gap-2 py-4 text-sm text-ink-muted rp-pulse">
          <span className="rp-spin inline-block h-4 w-4 rounded-full border-2 border-brand-500 border-t-transparent" />
          Generating...
        </div>
      )}
      {!loading && result && <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{result}</p>}
      {!loading && !result && <p className="text-sm text-ink-muted italic py-2">AI output will appear here</p>}
    </div>
  )
}
