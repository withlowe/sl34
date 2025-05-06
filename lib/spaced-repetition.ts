import type { Flashcard } from "./types"

// Implements a simplified version of the SuperMemo SM-2 algorithm
export function calculateNextReview(card: Flashcard, rating: 1 | 2 | 3 | 4 | 5): string {
  let interval = card.interval
  const easeFactor = card.easeFactor

  // Calculate new interval based on rating
  if (rating === 1) {
    // Again - reset to 1 day
    interval = 1
  } else if (rating === 2) {
    // Hard - increase slightly
    interval = Math.max(1, Math.ceil(interval * 1.2))
  } else if (rating === 3) {
    // Good - standard increase
    interval = interval === 0 ? 1 : Math.ceil(interval * easeFactor)
  } else if (rating === 4) {
    // Easy - larger increase
    interval = interval === 0 ? 2 : Math.ceil(interval * easeFactor * 1.3)
  } else if (rating === 5) {
    // Perfect - even larger increase
    interval = interval === 0 ? 4 : Math.ceil(interval * easeFactor * 1.5)
  }

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return nextReview.toISOString()
}
