export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[480px] mx-auto px-5 py-6">
        {children}
      </div>
    </div>
  )
}
