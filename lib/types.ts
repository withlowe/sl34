export interface Note {
  id: string
  title: string
  cues: string
  notes: string
  summary: string
  reference: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Flashcard {
  id: string
  front: string
  back: string
  noteId: string
  tags: string[]
  createdAt: string
  lastReviewed: string
  nextReview: string
  easeFactor: number
  interval: number
}

export interface IndexEntry {
  id: string
  title: string
  reference: string
  description: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateNoteInput {
  title: string
  cues: string
  notes: string
  summary: string
  reference: string
  tags: string[]
}

export interface CreateFlashcardInput {
  front: string
  back: string
  noteId: string
  tags: string[]
}

export interface CreateIndexEntryInput {
  title: string
  reference: string
  description: string
  tags: string[]
}
