"use client"

import Link from "next/link"
import { PlusCircle, BookOpen, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getAllTags } from "@/lib/storage"
import { ImportExport } from "@/components/import-export"
import { Badge } from "@/components/ui/badge"

export function SidebarContent({ className = "" }: { className?: string }) {
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    setTags(getAllTags())
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col gap-2">
        <Link href="/notes/new">
          <Button className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </Link>
        <ImportExport />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <BookOpen className="mr-2 h-4 w-4" />
          Navigation
        </h2>
        <nav className="space-y-1">
          <Link href="/" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary">
            All Notes
          </Link>
          <Link href="/flashcards" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary">
            Flashcards
          </Link>
          <Link href="/due-review" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary">
            Due Review
          </Link>
          <Link href="/quiz" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary">
            Quiz
          </Link>
        </nav>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <Tag className="mr-2 h-4 w-4" />
          Tags
        </h2>
        <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-md">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="px-3 py-1.5 text-sm cursor-pointer hover:bg-secondary/80">
              {tag}
            </Badge>
          ))}
          {tags.length === 0 && <span className="text-sm text-muted-foreground">No tags yet</span>}
        </div>
      </div>
    </div>
  )
}
