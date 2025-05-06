import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            &copy; {new Date().getFullYear()} Super Learn. All rights reserved.
          </p>
          <nav className="flex items-center space-x-8 order-1 sm:order-2">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
              About
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
