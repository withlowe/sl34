"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Flashcard } from "@/lib/types"
import { updateFlashcard } from "@/lib/storage"
import { calculateNextReview } from "@/lib/spaced-repetition"

interface FlashcardReviewProps {
  flashcards: Flashcard[]
  onComplete: () => void
}

export default function FlashcardReview({ flashcards, onComplete }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewedCards, setReviewedCards] = useState<string[]>([])

  const currentCard = flashcards[currentIndex]
  const isComplete = currentIndex >= flashcards.length

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const handleRating = (rating: "hard" | "easy") => {
    if (!currentCard) return

    // Map the simplified rating to a numeric value
    const numericRating = rating === "hard" ? 2 : 4

    // Calculate next review date based on rating
    const nextReview = calculateNextReview(currentCard, numericRating)

    // Update the flashcard
    updateFlashcard(currentCard.id, {
      ...currentCard,
      lastReviewed: new Date().toISOString(),
      nextReview,
      easeFactor: currentCard.easeFactor * (0.8 + numericRating * 0.04), // Adjust ease factor based on rating
    })

    // Mark as reviewed
    setReviewedCards([...reviewedCards, currentCard.id])

    // Move to next card
    setShowAnswer(false)
    setCurrentIndex(currentIndex + 1)
  }

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-medium mb-4">Review Complete!</h3>
        <p className="text-muted-foreground mb-6">You've reviewed {reviewedCards.length} flashcards.</p>
        <Button onClick={onComplete}>Return to Flashcards</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="min-h-[200px] flex flex-col justify-center">
            <h3 className="text-xl font-medium mb-6 text-center">{currentCard.front}</h3>

            {showAnswer ? (
              <div className="border-t pt-6 mt-6">
                <h4 className="text-sm uppercase text-muted-foreground mb-2">Answer:</h4>
                <div
                  className="text-lg prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentCard.back }}
                />
              </div>
            ) : (
              <Button onClick={handleShowAnswer} className="mx-auto">
                Show Answer
              </Button>
            )}
          </div>
        </CardContent>

        {showAnswer && (
          <CardFooter className="flex flex-col gap-4 p-6 border-t">
            <div className="text-sm text-center mb-2">How well did you know this?</div>
            <div className="flex justify-center w-full gap-4">
              <Button variant="outline" size="lg" className="flex-1 py-8" onClick={() => handleRating("hard")}>
                Hard
              </Button>
              <Button variant="outline" size="lg" className="flex-1 py-8" onClick={() => handleRating("easy")}>
                Easy
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <div className="flex justify-center">
        <div className="flex flex-wrap gap-1">
          {currentCard.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
