"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { X, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createNote } from "@/lib/storage"
import { toast } from "@/components/ui/use-toast"

export default function NewNotePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [summary, setSummary] = useState("")
  const [reference, setReference] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
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
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Saving note with title:", title)

      // Create the note with explicit values for all fields
      const newNote = createNote({
        title: title,
        cues: "", // We'll generate this from markdown headings
        notes: notes,
        summary: summary,
        reference: reference,
        tags: tags,
      })

      console.log("New note created:", newNote)

      // Show success message
      toast({
        title: "Note created",
        description: "Your note has been created successfully",
      })

      // Navigate to the note page
      router.push(`/notes/${newNote.id}`)
    } catch (error) {
      console.error("Error saving note:", error)
      toast({
        title: "Error",
        description: `Failed to save note: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to notes
        </Link>
        <h1 className="text-3xl font-bold">Create New Note</h1>
      </div>

      <div className="space-y-6">
        <div>
          <Input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-medium"
          />
        </div>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-2">Reference</h2>
            <Input
              type="text"
              placeholder="Book, article, website, page number, etc."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-2">Notes (Markdown)</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Use markdown headings (# Heading) to create sections. Headings will appear aligned with their content and
              can be automatically converted to flashcards.
            </p>
            <Textarea
              placeholder="# Section 1
Write your notes here...

# Section 2
More notes here..."
              className="min-h-[300px] font-mono"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-2">Summary</h2>
            <Textarea
              placeholder="Write a summary of your notes here..."
              className="min-h-[100px]"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-4">Tags</h2>
            <div className="p-3 bg-muted/30 rounded-md mb-4 min-h-[60px]">
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
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSubmitting || !title.trim()}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </div>
    </div>
  )
}
