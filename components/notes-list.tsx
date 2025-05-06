"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { formatDistanceToNow } from "@/lib/utils"
import type { Note } from "@/lib/types"
import { getNotes } from "@/lib/storage"

interface NotesListProps {
  selectedTags?: string[]
}

export default function NotesList({ selectedTags = [] }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])

  useEffect(() => {
    setNotes(getNotes())
  }, [])

  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredNotes(notes)
    } else {
      setFilteredNotes(notes.filter((note) => selectedTags.every((tag) => note.tags.includes(tag))))
    }
  }, [notes, selectedTags])

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No notes yet</h3>
        <p className="text-muted-foreground mb-4">Create your first note to get started</p>
        <Link href="/notes/new" className="text-primary hover:underline">
          Create a new note
        </Link>
      </div>
    )
  }

  if (filteredNotes.length === 0 && selectedTags.length > 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No notes match the selected tags</h3>
        <p className="text-muted-foreground mb-4">Try selecting different tags or clear the filter</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredNotes.map((note) => (
        <Card key={note.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">
              <Link href={`/notes/${note.id}`} className="hover:underline">
                {note.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-muted-foreground line-clamp-2">{note.summary}</p>
          </CardContent>
          <CardFooter className="flex justify-between pt-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {formatDistanceToNow(note.updatedAt)}
            </div>
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
