"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil } from "lucide-react"
import type { Flashcard } from "@/lib/types"
import { getFlashcards } from "@/lib/storage"
import FlashcardReview from "@/components/flashcard-review"
import FlashcardEditor from "@/components/flashcard-editor"

export default function DueReviewPage() {
  const [dueFlashcards, setDueFlashcards] = useState<Flashcard[]>([])
  const [reviewMode, setReviewMode] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)

  useEffect(() => {
    loadFlashcards()
  }, [])

  const loadFlashcards = () => {
    const cards = getFlashcards()
    const due = cards.filter((card) => new Date(card.nextReview) <= new Date())
    setDueFlashcards(due)
  }

  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard)
  }

  const handleSaveEdit = () => {
    loadFlashcards()
    setEditingFlashcard(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Due for Review</h1>
        <p className="text-muted-foreground">Review flashcards that are scheduled for today</p>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{dueFlashcards.length} cards due for review</h2>
            <Button onClick={() => setReviewMode(true)} disabled={dueFlashcards.length === 0}>
              Start Review
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueFlashcards.map((card) => (
              <Card key={card.id} className="border-primary">
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
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">Due for review</div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {dueFlashcards.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No flashcards due for review</h3>
              <p className="text-muted-foreground mb-4">
                All caught up! Check back later or review all your flashcards.
              </p>
              <Button variant="outline" asChild>
                <a href="/flashcards">View all flashcards</a>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
