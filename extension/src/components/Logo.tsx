interface LogoProps {
  size?: number
  showWordmark?: boolean
}

export function Logo({ size = 28, showWordmark = true }: LogoProps) {
  const gradId = 'rp-logo-grad'
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect width="32" height="32" rx="9" fill={`url(#${gradId})`} />
        <path d="M10 8.5h6.2c3.05 0 5.05 1.7 5.05 4.35 0 2.15-1.2 3.55-3.1 4.15L22 23.5h-3.35l-3.45-6.2H13.2V23.5H10V8.5zm3.2 2.55v4.35h2.85c1.7 0 2.7-.85 2.7-2.2s-1-2.15-2.7-2.15H13.2z" fill="white" />
        <circle cx="23.2" cy="9.2" r="2" fill="#93c5fd" />
        <defs>
          <linearGradient id={gradId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>
      {showWordmark && (
        <div className="text-sm font-semibold tracking-tight text-ink">ReplyPilot AI</div>
      )}
    </div>
  )
}
