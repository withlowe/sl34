"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, X } from "lucide-react"
import Link from "next/link"
import { searchNotes, searchFlashcards } from "@/lib/storage"
import type { Note, Flashcard } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/utils"

export function Search() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [noteResults, setNoteResults] = useState<Note[]>([])
  const [flashcardResults, setFlashcardResults] = useState<Flashcard[]>([])

  useEffect(() => {
    if (query.trim()) {
      setNoteResults(searchNotes(query))
      setFlashcardResults(searchFlashcards(query))
    } else {
      setNoteResults([])
      setFlashcardResults([])
    }
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
  }

  const clearSearch = () => {
    setQuery("")
    setIsSearching(false)
    setNoteResults([])
    setFlashcardResults([])
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="relative w-full">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search notes and flashcards..."
          className="pl-8 pr-10 w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-7 w-7 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>
        )}
      </form>

      {isSearching && query.trim() && (
        <div className="mt-4 space-y-6">
          {noteResults.length === 0 && flashcardResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No results found for "{query}"</p>
          ) : (
            <>
              {noteResults.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium mb-3">Notes ({noteResults.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {noteResults.map((note) => (
                      <Card key={note.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            <Link href={`/notes/${note.id}`} className="hover:underline">
                              {note.title}
                            </Link>
                          </CardTitle>
                          <div className="text-xs text-muted-foreground">
                            Updated {formatDistanceToNow(note.updatedAt)}
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">{note.summary}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {note.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {flashcardResults.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium mb-3">Flashcards ({flashcardResults.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {flashcardResults.map((card) => (
                      <Card key={card.id}>
                        <CardContent className="p-4">
                          <div className="font-medium mb-2">{card.front}</div>
                          <div className="text-sm text-muted-foreground">{card.back}</div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {card.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
