import Link from "next/link"
import { PlusCircle, Menu, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ImportExport } from "@/components/import-export"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-sm">
              <div className="flex flex-col gap-4 py-4">
                <Link href="/" className="text-lg font-medium">
                  Notes
                </Link>
                <Link href="/flashcards" className="text-lg font-medium">
                  Flashcards
                </Link>
                <Link href="/due-review" className="text-lg font-medium">
                  Due Review
                </Link>
                <Link href="/quiz" className="text-lg font-medium">
                  Quiz
                </Link>
                <Link href="/index" className="text-lg font-medium">
                  Index
                </Link>
                <Link href="/notes/new" className="text-lg font-medium">
                  New Note
                </Link>
                <div className="pt-4">
                  <ImportExport />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="font-bold text-lg flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Super Learn
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:underline">
              Notes
            </Link>
            <Link href="/flashcards" className="text-sm font-medium hover:underline">
              Flashcards
            </Link>
            <Link href="/due-review" className="text-sm font-medium hover:underline">
              Due Review
            </Link>
            <Link href="/quiz" className="text-sm font-medium hover:underline">
              Quiz
            </Link>
            <Link href="/index" className="text-sm font-medium hover:underline">
              Index
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ImportExport />
          <Link href="/notes/new" className="hidden md:block">
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
