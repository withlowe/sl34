"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import NotesList from "@/components/notes-list"
import { Search } from "@/components/search"
import { getAllTags } from "@/lib/storage"

export default function Home() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    setAllTags(getAllTags())
  }, [])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSelectedTags([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notes</h1>
        <p className="text-muted-foreground mb-6">Organize your knowledge with smart notes, flashcards, and quizzes</p>

        {/* Updated search and filter layout */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Search />
            </div>
            <div className="flex gap-2">
              {allTags.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Tag className="mr-2 h-4 w-4" />
                      Filter by Tag
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                    {allTags.map((tag) => (
                      <DropdownMenuCheckboxItem
                        key={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                      >
                        {tag}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Link href="/notes/new">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Note
                </Button>
              </Link>
            </div>
          </div>

          {selectedTags.length > 0 && (
            <div className="p-3 bg-muted/30 rounded-md">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium mr-1">Filtered by:</span>
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <NotesList selectedTags={selectedTags} />
    </div>
  )
}
