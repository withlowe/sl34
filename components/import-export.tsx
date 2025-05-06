"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function ImportExport() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Function to handle exporting data
  const handleExport = () => {
    try {
      // Get all data from localStorage
      const notes = localStorage.getItem("notes") || "[]"
      const flashcards = localStorage.getItem("flashcards") || "[]"
      const indexEntries = localStorage.getItem("indexEntries") || "[]"

      // Create export object
      const exportData = {
        notes: JSON.parse(notes),
        flashcards: JSON.parse(flashcards),
        indexEntries: JSON.parse(indexEntries),
        exportDate: new Date().toISOString(),
      }

      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2)

      // Create blob and download link
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      // Create download link and trigger click
      const downloadLink = document.createElement("a")
      downloadLink.href = url
      downloadLink.download = `super-learn-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(downloadLink)
      downloadLink.click()

      // Clean up
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Your data has been exported successfully.",
      })

      // Close modal after successful export
      setIsModalOpen(false)
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      })
    }
  }

  // Function to handle importing data
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        // Validate data structure
        if (!data.notes || !data.flashcards || !Array.isArray(data.notes) || !Array.isArray(data.flashcards)) {
          throw new Error("Invalid data format")
        }

        // Store data in localStorage
        localStorage.setItem("notes", JSON.stringify(data.notes))
        localStorage.setItem("flashcards", JSON.stringify(data.flashcards))

        // Handle index entries if they exist
        if (data.indexEntries && Array.isArray(data.indexEntries)) {
          localStorage.setItem("indexEntries", JSON.stringify(data.indexEntries))
        }

        toast({
          title: "Import successful",
          description: "Your data has been imported successfully. The page will reload.",
        })

        // Close modal and reload page to reflect changes
        setIsModalOpen(false)
        setTimeout(() => window.location.reload(), 1500)
      } catch (error) {
        console.error("Import error:", error)
        toast({
          title: "Import failed",
          description: "There was an error importing your data. Please check the file format.",
          variant: "destructive",
        })
      }
    }

    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "There was an error reading the file.",
        variant: "destructive",
      })
    }

    reader.readAsText(file)
  }

  // Function to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsModalOpen(true)}>
        Import/Export
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            <h2 className="text-xl font-semibold mb-4">Import/Export Data</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Export your notes and flashcards or import from a backup file.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Export Data</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Download all your notes and flashcards as a JSON file.
                </p>
                <Button onClick={handleExport} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Import Data</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Import notes and flashcards from a previously exported file.
                  <strong className="block mt-1 text-amber-500">
                    Warning: This will replace all your current data.
                  </strong>
                </p>
                <Button variant="outline" onClick={triggerFileInput} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Select File to Import
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                  onClick={(e) => {
                    // Reset the input value to allow selecting the same file again
                    ;(e.target as HTMLInputElement).value = ""
                  }}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
