"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Tag, SearchIcon, ArrowUpDown, ExternalLink, Edit, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { getIndexEntries, getAllTags, autoGenerateIndex } from "@/lib/storage"
import type { IndexEntry } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

type SortField = "title" | "reference" | "updatedAt"
type SortOrder = "asc" | "desc"

export default function IndexPage() {
  const [entries, setEntries] = useState<IndexEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<IndexEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>("updatedAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadEntries()
    setAllTags(getAllTags())
  }, [])

  const loadEntries = () => {
    setEntries(getIndexEntries())
  }

  useEffect(() => {
    let filtered = [...entries]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          entry.reference.toLowerCase().includes(query) ||
          entry.description.toLowerCase().includes(query),
      )
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((entry) => selectedTags.some((tag) => entry.tags.includes(tag)))
    }

    // Sort entries
    filtered.sort((a, b) => {
      let valueA: string | Date
      let valueB: string | Date

      if (sortField === "updatedAt") {
        valueA = new Date(a.updatedAt)
        valueB = new Date(b.updatedAt)
      } else {
        valueA = a[sortField].toLowerCase()
        valueB = b[sortField].toLowerCase()
      }

      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    setFilteredEntries(filtered)
  }, [entries, searchQuery, selectedTags, sortField, sortOrder])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleAutoGenerateIndex = () => {
    try {
      setIsGenerating(true)
      const { added } = autoGenerateIndex()

      if (added > 0) {
        toast({
          title: "Index auto-generated",
          description: `Successfully added ${added} entries to the index from notes and flashcards.`,
        })
      } else {
        toast({
          title: "No new entries added",
          description: "All notes and flashcards are already in the index.",
        })
      }

      // Reload entries
      loadEntries()
    } catch (error) {
      console.error("Error auto-generating index:", error)
      toast({
        title: "Error",
        description: "Failed to auto-generate index. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reference Index</h1>
        <p className="text-muted-foreground mb-6">Organize and search your reference materials</p>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title or reference..."
                className="pl-8 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {allTags.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Tag className="mr-2 h-4 w-4" />
                      Filter by Tag
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                    {allTags.map((tag) => (
                      <DropdownMenuCheckboxItem
                        key={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                      >
                        {tag}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleSort("title")}>
                    Title {sortField === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("reference")}>
                    Reference {sortField === "reference" && (sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleSort("updatedAt")}>
                    Last Updated {sortField === "updatedAt" && (sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={handleAutoGenerateIndex} disabled={isGenerating}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                Auto-Generate
              </Button>
              <Link href="/index/new">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Entry
                </Button>
              </Link>
            </div>
          </div>

          {(selectedTags.length > 0 || searchQuery) && (
            <div className="p-3 bg-muted/30 rounded-md">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium mr-1">Filtered by:</span>
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80"
                    onClick={() => setSearchQuery("")}
                  >
                    "{searchQuery}" ×
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex flex-row gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2">{entry.title}</h3>

                <div className="text-sm text-muted-foreground flex items-center">
                  {entry.reference}
                  {entry.reference.startsWith("http") && (
                    <a
                      href={entry.reference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/index/${entry.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No index entries yet</h3>
          <p className="text-muted-foreground mb-4">Create your first index entry to get started</p>
          <Link href="/index/new" className="text-primary hover:underline">
            Create a new index entry
          </Link>
        </div>
      )}

      {entries.length > 0 && filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No matching entries found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
