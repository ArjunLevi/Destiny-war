import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Destiny War" width={150} height={45} className="h-10 w-auto" />
          </div>

          {/* Center Text */}
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Destiny War. All rights reserved.</p>
          </div>

          {/* Base Logo */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Built on</span>
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">B</span>
              </div>
              <span className="font-bold text-primary">Base</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
