"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Tag, Pencil } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Flashcard } from "@/lib/types"
import { getFlashcards, getAllTags } from "@/lib/storage"
import FlashcardReview from "@/components/flashcard-review"
import FlashcardEditor from "@/components/flashcard-editor"

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([])
  const [reviewMode, setReviewMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)

  useEffect(() => {
    loadFlashcards()
    setAllTags(getAllTags())
  }, [])

  const loadFlashcards = () => {
    const cards = getFlashcards()
    setFlashcards(cards)
  }

  useEffect(() => {
    let filtered = [...flashcards]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (card) => card.front.toLowerCase().includes(query) || card.back.toLowerCase().includes(query),
      )
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((card) => selectedTags.every((tag) => card.tags.includes(tag)))
    }

    setFilteredFlashcards(filtered)
  }, [flashcards, searchQuery, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
  }

  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard)
  }

  const handleSaveEdit = () => {
    loadFlashcards()
    setEditingFlashcard(null)
  }

  const dueFlashcards = filteredFlashcards.filter((card) => new Date(card.nextReview) <= new Date())

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
        <p className="text-muted-foreground">Review your flashcards using spaced repetition</p>
      </div>

      {editingFlashcard ? (
        <FlashcardEditor
          flashcard={editingFlashcard}
          onClose={() => setEditingFlashcard(null)}
          onSave={handleSaveEdit}
        />
      ) : reviewMode ? (
        <FlashcardReview flashcards={dueFlashcards} onComplete={() => setReviewMode(false)} />
      ) : (
        <>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search flashcards..."
                  className="pl-8 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
                <Button onClick={() => setReviewMode(true)} disabled={dueFlashcards.length === 0}>
                  Start Review ({dueFlashcards.length})
                </Button>
              </div>
            </div>

            {(selectedTags.length > 0 || searchQuery) && (
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
                  {searchQuery && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80"
                      onClick={() => setSearchQuery("")}
                    >
                      "{searchQuery}" ×
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlashcards.map((card) => (
              <Card key={card.id} className={new Date(card.nextReview) <= new Date() ? "border-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <p className="font-medium mb-2">{card.front}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEditFlashcard(card)}
                      title="Edit flashcard"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{card.back}</p>
                </CardContent>
                <CardFooter className="px-4 py-2 border-t flex justify-between">
                  <div className="flex flex-wrap gap-1">
                    {card.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(card.nextReview) <= new Date()
                      ? "Due for review"
                      : `Next review: ${new Date(card.nextReview).toLocaleDateString()}`}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredFlashcards.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No flashcards found</h3>
              {flashcards.length === 0 ? (
                <p className="text-muted-foreground mb-4">Create flashcards from your notes to get started</p>
              ) : (
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
