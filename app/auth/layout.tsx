export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 pb-10">
      <div className="w-full max-w-[400px]">
        {children}
      </div>
    </div>
  )
}
