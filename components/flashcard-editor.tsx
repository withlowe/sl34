"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Save } from "lucide-react"
import { updateFlashcard } from "@/lib/storage"
import type { Flashcard } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

interface FlashcardEditorProps {
  flashcard: Flashcard
  onClose: () => void
  onSave: () => void
}

export default function FlashcardEditor({ flashcard, onClose, onSave }: FlashcardEditorProps) {
  const [front, setFront] = useState(flashcard.front)
  const [back, setBack] = useState(flashcard.back)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>(flashcard.tags)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSave = () => {
    if (!front.trim() || !back.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in both front and back of the flashcard",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Update the flashcard
      updateFlashcard(flashcard.id, {
        ...flashcard,
        front,
        back,
        tags,
      })

      toast({
        title: "Flashcard updated",
        description: "Your flashcard has been updated successfully",
      })

      onSave()
    } catch (error) {
      console.error("Error updating flashcard:", error)
      toast({
        title: "Error",
        description: "Failed to update flashcard. Please try again.",
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
          <div>Edit Flashcard</div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Front (Question)</label>
            <Textarea
              placeholder="What is..."
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Back (Answer)</label>
            <Textarea
              placeholder="The answer is..."
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tags</label>
            <div className="p-3 bg-muted/30 rounded-md mb-2 min-h-[60px]">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div key={tag} className="flex items-center bg-secondary rounded-md px-3 py-1.5 text-sm">
                    <span className="mr-2">{tag}</span>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleRemoveTag(tag)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {tags.length === 0 && (
                  <p className="text-muted-foreground text-sm">No tags added yet. Add tags below.</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="ml-auto" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}
