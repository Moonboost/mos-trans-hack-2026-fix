/**
 * Centered content column for auth pages.
 * Header and Footer come from ClientRootLayout — no duplicates here.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="min-h-[calc(100dvh-8rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[360px]">
        <div className="mb-8">
          <h1 className="text-[26px] leading-tight font-extrabold tracking-tight mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] text-(--on-bg-medium) leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {children}
        {footer && <div className="mt-8">{footer}</div>}
      </div>
    </div>
  )
}
