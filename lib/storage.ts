"use client"

import type { Note, Flashcard, IndexEntry, CreateNoteInput, CreateFlashcardInput, CreateIndexEntryInput } from "./types"

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Notes Storage
export function getNotes(): Note[] {
  if (!isBrowser) return []

  try {
    const notes = localStorage.getItem("notes")
    const parsedNotes = notes ? JSON.parse(notes) : []

    // Ensure all notes have a reference field (for backward compatibility)
    return parsedNotes.map((note: any) => ({
      ...note,
      reference: note.reference || "",
    }))
  } catch (error) {
    console.error("Error getting notes:", error)
    return []
  }
}

export function getNote(id: string): Note | null {
  if (!isBrowser) return null

  const notes = getNotes()
  return notes.find((note) => note.id === id) || null
}

export function createNote(input: CreateNoteInput): Note {
  if (!isBrowser) {
    throw new Error("Cannot create note on the server")
  }

  try {
    // Get existing notes
    const notes = getNotes()
    console.log("Creating note with input:", input)
    console.log("Current notes count:", notes.length)

    // Create new note with default values for missing fields
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: input.title,
      cues: input.cues || "",
      notes: input.notes || "",
      summary: input.summary || "",
      reference: input.reference || "",
      tags: input.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add the new note to the array
    const updatedNotes = [...notes, newNote]

    // Save to localStorage
    localStorage.setItem("notes", JSON.stringify(updatedNotes))

    // Log for debugging
    console.log("Note created:", newNote)
    console.log("Total notes after creation:", updatedNotes.length)

    return newNote
  } catch (error) {
    console.error("Error creating note:", error)
    throw new Error("Failed to create note: " + (error instanceof Error ? error.message : String(error)))
  }
}

export function updateNote(id: string, updatedNote: Partial<Note>): Note {
  if (!isBrowser) {
    throw new Error("Cannot update note on the server")
  }

  try {
    // Get all notes
    const notes = getNotes()
    console.log("Updating note with id:", id)
    console.log("Update data:", updatedNote)
    console.log("Current notes count:", notes.length)

    // Find the note to update
    const existingNoteIndex = notes.findIndex((note) => note.id === id)

    if (existingNoteIndex === -1) {
      console.error("Note not found:", id)
      throw new Error("Note not found")
    }

    // Get the existing note
    const existingNote = notes[existingNoteIndex]
    console.log("Found existing note:", existingNote)

    // Create the updated note
    const mergedNote = {
      ...existingNote,
      ...updatedNote,
      reference: updatedNote.reference !== undefined ? updatedNote.reference : existingNote.reference || "",
      updatedAt: new Date().toISOString(),
    }

    // Replace the old note with the updated one
    notes[existingNoteIndex] = mergedNote

    // Save all notes back to localStorage
    localStorage.setItem("notes", JSON.stringify(notes))

    // Log for debugging
    console.log("Note updated:", mergedNote)
    console.log("Total notes after update:", notes.length)

    return mergedNote
  } catch (error) {
    console.error("Error updating note:", error)
    throw new Error("Failed to update note: " + (error instanceof Error ? error.message : String(error)))
  }
}

export function deleteNote(id: string): void {
  if (!isBrowser) {
    throw new Error("Cannot delete note on the server")
  }

  try {
    const notes = getNotes()
    const updatedNotes = notes.filter((note) => note.id !== id)

    localStorage.setItem("notes", JSON.stringify(updatedNotes))

    // Also delete associated flashcards
    const flashcards = getFlashcards()
    const updatedFlashcards = flashcards.filter((card) => card.noteId !== id)
    localStorage.setItem("flashcards", JSON.stringify(updatedFlashcards))

    console.log("Note deleted:", id)
  } catch (error) {
    console.error("Error deleting note:", error)
    throw new Error("Failed to delete note")
  }
}

// Flashcards Storage
export function getFlashcards(): Flashcard[] {
  if (!isBrowser) return []

  try {
    const flashcards = localStorage.getItem("flashcards")
    return flashcards ? JSON.parse(flashcards) : []
  } catch (error) {
    console.error("Error getting flashcards:", error)
    return []
  }
}

export function getFlashcard(id: string): Flashcard | null {
  if (!isBrowser) return null

  const flashcards = getFlashcards()
  return flashcards.find((card) => card.id === id) || null
}

export function createFlashcard(input: CreateFlashcardInput): Flashcard {
  if (!isBrowser) {
    throw new Error("Cannot create flashcard on the server")
  }

  try {
    const flashcards = getFlashcards()

    const newFlashcard: Flashcard = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString(), // Due immediately for first review
      easeFactor: 2.5, // Initial ease factor
      interval: 0, // Initial interval in days
    }

    const updatedFlashcards = [...flashcards, newFlashcard]
    localStorage.setItem("flashcards", JSON.stringify(updatedFlashcards))
    return newFlashcard
  } catch (error) {
    console.error("Error creating flashcard:", error)
    throw new Error("Failed to create flashcard")
  }
}

export function updateFlashcard(id: string, updatedCard: Partial<Flashcard>): Flashcard {
  if (!isBrowser) {
    throw new Error("Cannot update flashcard on the server")
  }

  try {
    const flashcards = getFlashcards()
    const existingCardIndex = flashcards.findIndex((card) => card.id === id)

    if (existingCardIndex === -1) {
      throw new Error("Flashcard not found")
    }

    const existingCard = flashcards[existingCardIndex]

    const mergedCard = {
      ...existingCard,
      ...updatedCard,
    }

    flashcards[existingCardIndex] = mergedCard
    localStorage.setItem("flashcards", JSON.stringify(flashcards))

    return mergedCard
  } catch (error) {
    console.error("Error updating flashcard:", error)
    throw new Error("Failed to update flashcard")
  }
}

export function deleteFlashcard(id: string): void {
  if (!isBrowser) {
    throw new Error("Cannot delete flashcard on the server")
  }

  try {
    const flashcards = getFlashcards()
    const updatedFlashcards = flashcards.filter((card) => card.id !== id)

    localStorage.setItem("flashcards", JSON.stringify(updatedFlashcards))
  } catch (error) {
    console.error("Error deleting flashcard:", error)
    throw new Error("Failed to delete flashcard")
  }
}

// Index Entries Storage
export function getIndexEntries(): IndexEntry[] {
  if (!isBrowser) return []

  try {
    const entries = localStorage.getItem("indexEntries")
    return entries ? JSON.parse(entries) : []
  } catch (error) {
    console.error("Error getting index entries:", error)
    return []
  }
}

export function getIndexEntry(id: string): IndexEntry | null {
  if (!isBrowser) return null

  const entries = getIndexEntries()
  return entries.find((entry) => entry.id === id) || null
}

export function createIndexEntry(input: CreateIndexEntryInput): IndexEntry {
  if (!isBrowser) {
    throw new Error("Cannot create index entry on the server")
  }

  try {
    const entries = getIndexEntries()

    const newEntry: IndexEntry = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedEntries = [...entries, newEntry]
    localStorage.setItem("indexEntries", JSON.stringify(updatedEntries))
    return newEntry
  } catch (error) {
    console.error("Error creating index entry:", error)
    throw new Error("Failed to create index entry")
  }
}

export function updateIndexEntry(id: string, updatedEntry: Partial<IndexEntry>): IndexEntry {
  if (!isBrowser) {
    throw new Error("Cannot update index entry on the server")
  }

  try {
    const entries = getIndexEntries()
    const existingEntryIndex = entries.findIndex((entry) => entry.id === id)

    if (existingEntryIndex === -1) {
      throw new Error("Index entry not found")
    }

    const existingEntry = entries[existingEntryIndex]

    const mergedEntry = {
      ...existingEntry,
      ...updatedEntry,
      updatedAt: new Date().toISOString(),
    }

    entries[existingEntryIndex] = mergedEntry
    localStorage.setItem("indexEntries", JSON.stringify(entries))

    return mergedEntry
  } catch (error) {
    console.error("Error updating index entry:", error)
    throw new Error("Failed to update index entry")
  }
}

export function deleteIndexEntry(id: string): void {
  if (!isBrowser) {
    throw new Error("Cannot delete index entry on the server")
  }

  try {
    const entries = getIndexEntries()
    const updatedEntries = entries.filter((entry) => entry.id !== id)

    localStorage.setItem("indexEntries", JSON.stringify(updatedEntries))
  } catch (error) {
    console.error("Error deleting index entry:", error)
    throw new Error("Failed to delete index entry")
  }
}

// Auto-generate index entries from notes and flashcards
export function autoGenerateIndex(): { added: number } {
  if (!isBrowser) {
    throw new Error("Cannot auto-generate index on the server")
  }

  try {
    const notes = getNotes()
    const flashcards = getFlashcards()
    const existingEntries = getIndexEntries()

    let addedCount = 0

    // Create a set of existing titles to avoid duplicates
    const existingTitles = new Set(existingEntries.map((entry) => entry.title.toLowerCase()))

    // Add entries from notes
    notes.forEach((note) => {
      if (!existingTitles.has(note.title.toLowerCase())) {
        createIndexEntry({
          title: note.title,
          reference: note.reference || "From note",
          description: note.summary || note.notes.substring(0, 200) + (note.notes.length > 200 ? "..." : ""),
          tags: note.tags,
        })
        existingTitles.add(note.title.toLowerCase())
        addedCount++
      }
    })

    // Add entries from flashcards
    flashcards.forEach((card) => {
      if (!existingTitles.has(card.front.toLowerCase())) {
        // Find the associated note to get its reference
        const associatedNote = notes.find((note) => note.id === card.noteId)
        const reference = associatedNote?.reference || "From flashcard"

        createIndexEntry({
          title: card.front,
          reference: reference,
          description: card.back,
          tags: card.tags,
        })
        existingTitles.add(card.front.toLowerCase())
        addedCount++
      }
    })

    return { added: addedCount }
  } catch (error) {
    console.error("Error auto-generating index:", error)
    throw new Error("Failed to auto-generate index")
  }
}

// Search functionality
export function searchNotes(query: string): Note[] {
  if (!isBrowser || !query.trim()) return []

  const notes = getNotes()
  const lowerQuery = query.toLowerCase()

  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.notes.toLowerCase().includes(lowerQuery) ||
      note.summary.toLowerCase().includes(lowerQuery) ||
      note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}

export function searchFlashcards(query: string): Flashcard[] {
  if (!isBrowser || !query.trim()) return []

  const flashcards = getFlashcards()
  const lowerQuery = query.toLowerCase()

  return flashcards.filter(
    (card) =>
      card.front.toLowerCase().includes(lowerQuery) ||
      card.back.toLowerCase().includes(lowerQuery) ||
      card.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}

export function searchIndexEntries(query: string): IndexEntry[] {
  if (!isBrowser || !query.trim()) return []

  const entries = getIndexEntries()
  const lowerQuery = query.toLowerCase()

  return entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.reference.toLowerCase().includes(lowerQuery) ||
      entry.description.toLowerCase().includes(lowerQuery) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}

// Get all unique tags from notes, flashcards, and index entries
export function getAllTags(): string[] {
  if (!isBrowser) return []

  const notes = getNotes()
  const flashcards = getFlashcards()
  const indexEntries = getIndexEntries()

  const noteTags = notes.flatMap((note) => note.tags)
  const flashcardTags = flashcards.flatMap((card) => card.tags)
  const indexTags = indexEntries.flatMap((entry) => entry.tags)

  // Combine and deduplicate tags
  const allTags = [...new Set([...noteTags, ...flashcardTags, ...indexTags])]
  return allTags
}

// Import/Export functionality
export function exportData(): string {
  if (!isBrowser) {
    throw new Error("Cannot export data on the server")
  }

  try {
    const notes = getNotes()
    const flashcards = getFlashcards()
    const indexEntries = getIndexEntries()

    const data = {
      notes,
      flashcards,
      indexEntries,
      exportDate: new Date().toISOString(),
    }

    return JSON.stringify(data, null, 2)
  } catch (error) {
    console.error("Error exporting data:", error)
    throw new Error("Failed to export data")
  }
}

export function importData(jsonData: string): boolean {
  if (!isBrowser) {
    throw new Error("Cannot import data on the server")
  }

  try {\
    const data = JSON  
    throw new Error("Cannot import data on the server")

  try {
    const data = JSON.parse(jsonData)

    if (!data.notes || !data.flashcards || !Array.isArray(data.notes) || !Array.isArray(data.flashcards)) {
      throw new Error("Invalid data format")
    }

    // Ensure all notes have a reference field
    const notesWithReference = data.notes.map((note: any) => ({
      ...note,
      reference: note.reference || "",
    }))

    localStorage.setItem("notes", JSON.stringify(notesWithReference))
    localStorage.setItem("flashcards", JSON.stringify(data.flashcards))

    // Handle index entries if they exist
    if (data.indexEntries && Array.isArray(data.indexEntries)) {
      localStorage.setItem("indexEntries", JSON.stringify(data.indexEntries))
    }

    return true
  } catch (error) {
    console.error("Error importing data:", error)
    return false
  }
}
