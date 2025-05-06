"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { X, Save, ArrowLeft } from "lucide-react"
import { getIndexEntry, updateIndexEntry } from "@/lib/storage"
import { toast } from "@/components/ui/use-toast"
import type { IndexEntry } from "@/lib/types"

export default function EditIndexEntryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [entry, setEntry] = useState<IndexEntry | null>(null)
  const [title, setTitle] = useState("")
  const [reference, setReference] = useState("")
  const [description, setDescription] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wrap in try/catch to handle any errors during data fetching
    try {
      const fetchedEntry = getIndexEntry(params.id)
      if (fetchedEntry) {
        setEntry(fetchedEntry)
        setTitle(fetchedEntry.title)
        setReference(fetchedEntry.reference)
        setDescription(fetchedEntry.description)
        setTags(fetchedEntry.tags)
      } else {
        toast({
          title: "Entry not found",
          description: "The index entry you're trying to edit doesn't exist",
          variant: "destructive",
        })
        router.push("/index")
      }
    } catch (error) {
      console.error("Error fetching entry:", error)
      toast({
        title: "Error",
        description: "Failed to load entry data",
        variant: "destructive",
      })
      router.push("/index")
    } finally {
      setIsLoading(false)
    }
  }, [params.id, router])

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
    if (!title.trim() || !reference.trim() || !entry) {
      toast({
        title: "Required fields missing",
        description: "Please fill in title and reference fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Update the index entry
      updateIndexEntry(params.id, {
        title,
        reference,
        description,
        tags,
      })

      // Show success message
      toast({
        title: "Entry updated",
        description: "Your index entry has been updated successfully",
      })

      // Navigate to the index page
      router.push("/index")
    } catch (error) {
      console.error("Error updating index entry:", error)
      toast({
        title: "Error",
        description: `Failed to update entry: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!entry) {
    return <div className="container mx-auto px-4 py-8">Entry not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/index" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to index
        </Link>
        <h1 className="text-3xl font-bold">Edit Index Entry</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                placeholder="Specific title or concept"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="reference" className="block text-sm font-medium mb-1">
                Reference <span className="text-red-500">*</span>
              </label>
              <Input
                id="reference"
                placeholder="Book, article, website, page number, etc."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Brief description or notes about this reference"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
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
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSubmitting || !title.trim() || !reference.trim()}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
