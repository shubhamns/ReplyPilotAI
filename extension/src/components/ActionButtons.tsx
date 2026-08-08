import type { AiAction } from '../types'
import { Button } from './Button'

interface ActionButtonsProps {
  active?: AiAction | null
  loading?: boolean
  disabled?: boolean
  onAction: (action: AiAction) => void
}

const ACTIONS: { action: AiAction; label: string }[] = [
  { action: 'reply', label: 'AI Reply' },
  { action: 'grammar', label: 'Fix Grammar' },
  { action: 'rewrite', label: 'Rewrite' },
  { action: 'translate', label: 'Translate' },
  { action: 'summarize', label: 'Summarize' },
]

export function ActionButtons({ active, loading, disabled, onAction }: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ACTIONS.map(({ action, label }) => (
        <Button
          key={action}
          variant={active === action ? 'primary' : 'secondary'}
          size="sm"
          disabled={disabled}
          loading={loading && active === action}
          onClick={() => onAction(action)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
