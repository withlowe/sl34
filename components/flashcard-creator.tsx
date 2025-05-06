"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Wand2 } from "lucide-react"
import { createFlashcard } from "@/lib/storage"
import type { Note } from "@/lib/types"
import { getNote } from "@/lib/storage"
import { toast } from "@/components/ui/use-toast"
import { extractFlashcardsFromMarkdown } from "@/lib/markdown-utils"

interface FlashcardCreatorProps {
  noteId: string
  onClose: () => void
}

export default function FlashcardCreator({ noteId, onClose }: FlashcardCreatorProps) {
  const [flashcards, setFlashcards] = useState<Array<{ front: string; back: string }>>([{ front: "", back: "" }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [note, setNote] = useState<Note | null>(null)

  useEffect(() => {
    const fetchedNote = getNote(noteId)
    setNote(fetchedNote)
  }, [noteId])

  const handleAddFlashcard = () => {
    setFlashcards([...flashcards, { front: "", back: "" }])
  }

  const handleRemoveFlashcard = (index: number) => {
    const newFlashcards = [...flashcards]
    newFlashcards.splice(index, 1)
    setFlashcards(newFlashcards)
  }

  const handleFlashcardChange = (index: number, field: "front" | "back", value: string) => {
    const newFlashcards = [...flashcards]
    newFlashcards[index][field] = value
    setFlashcards(newFlashcards)
  }

  const handleAutoGenerate = () => {
    if (!note) return

    const generatedFlashcards = extractFlashcardsFromMarkdown(note.notes)

    if (generatedFlashcards.length === 0) {
      toast({
        title: "No flashcards generated",
        description: "Could not generate flashcards. Make sure your note has headings and content.",
        variant: "destructive",
      })
      return
    }

    setFlashcards(generatedFlashcards)

    toast({
      title: "Flashcards generated",
      description: `Generated ${generatedFlashcards.length} flashcards from your note sections.`,
    })
  }

  const handleSave = () => {
    // Filter out empty flashcards
    const validFlashcards = flashcards.filter((card) => card.front.trim() && card.back.trim())

    if (validFlashcards.length === 0) {
      toast({
        title: "No valid flashcards",
        description: "Please fill in at least one flashcard with both front and back content",
        variant: "destructive",
      })
      return
    }

    if (!note) {
      toast({
        title: "Note not found",
        description: "The note you're trying to create flashcards for doesn't exist",
        variant: "destructive",
      })
      onClose()
      return
    }

    try {
      setIsSubmitting(true)

      // Save each flashcard
      validFlashcards.forEach((card) => {
        createFlashcard({
          front: card.front,
          back: card.back,
          noteId: noteId,
          tags: note.tags,
        })
      })

      toast({
        title: "Flashcards created",
        description: `Successfully created ${validFlashcards.length} flashcard(s)`,
      })

      onClose()
    } catch (error) {
      console.error("Error creating flashcards:", error)
      toast({
        title: "Error",
        description: "Failed to create flashcards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>Create Flashcards</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAutoGenerate} disabled={!note}>
              <Wand2 className="mr-1 h-4 w-4" />
              Auto-Generate
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flashcards.map((flashcard, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md relative">
              <div>
                <label className="text-sm font-medium mb-1 block">Front (Question)</label>
                <Textarea
                  placeholder="What is..."
                  value={flashcard.front}
                  onChange={(e) => handleFlashcardChange(index, "front", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Back (Answer)</label>
                <Textarea
                  placeholder="The answer is..."
                  value={flashcard.back}
                  onChange={(e) => handleFlashcardChange(index, "back", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              {flashcards.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveFlashcard(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={handleAddFlashcard} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Another Flashcard
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="ml-auto" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Flashcards"}
        </Button>
      </CardFooter>
    </Card>
  )
}
