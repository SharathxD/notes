"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { NoteEditor } from "@/components/note-editor"
import { EmptyState } from "@/components/empty-state"
import { useNotes, type LocalNote } from "@/hooks/use-notes"
import { useToast } from "@/hooks/use-toast"
import { exportToFile } from "@/lib/utils"

export default function NotepadApp() {
  const [currentNote, setCurrentNote] = useState<LocalNote | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const { toast } = useToast()

  const {
    notes,
    deviceId,
    cloudEnabled,
    enableCloudSync,
    disableCloudSync,
    createNote,
    updateNote,
    deleteNote,
    loadNotesFromSupabase,
  } = useNotes()

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (cloudEnabled) {
        loadNotesFromSupabase()
      }
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [cloudEnabled, loadNotesFromSupabase])

  // Set current note when notes change
  useEffect(() => {
    if (notes.length > 0 && !currentNote) {
      setCurrentNote(notes[0])
    } else if (currentNote && !notes.find((n) => n.id === currentNote.id)) {
      setCurrentNote(notes.length > 1 ? notes.find((n) => n.id !== currentNote.id) || null : null)
    }
  }, [notes, currentNote])

  const handleNoteCreate = async () => {
    const newNote = await createNote()
    setCurrentNote(newNote)
  }

  const handleNoteSelect = (note: LocalNote) => {
    setCurrentNote(note)
  }

  const handleNoteUpdate = async (noteId: string, updates: Partial<LocalNote>) => {
    const updatedNote = await updateNote(noteId, updates)
    if (currentNote?.id === noteId) {
      setCurrentNote(updatedNote)
    }
  }

  const handleNoteDelete = async (noteId: string) => {
    await deleteNote(noteId)
    if (currentNote?.id === noteId) {
      setCurrentNote(notes.length > 1 ? notes.find((n) => n.id !== noteId) || null : null)
    }
  }

  const handleExportAll = () => {
    const exportData = {
      notes,
      exportedAt: new Date().toISOString(),
      deviceId,
      version: "2.0",
    }

    exportToFile(
      JSON.stringify(exportData, null, 2),
      `notepad-backup-${new Date().toISOString().split("T")[0]}.json`,
      "application/json",
    )

    toast({
      title: "Backup Created",
      description: "All notes have been exported successfully.",
    })
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string

        if (file.name.endsWith(".json")) {
          const importData = JSON.parse(content)
          if (importData.notes && Array.isArray(importData.notes)) {
            for (const note of importData.notes) {
              await createNote(note.title || "Imported Note", note.content || "")
            }

            toast({
              title: "Import Successful",
              description: `Imported ${importData.notes.length} notes.`,
            })
          }
        } else {
          const newNote = await createNote(file.name.replace(/\.(txt|md)$/, ""), content)
          setCurrentNote(newNote)

          toast({
            title: "File Imported",
            description: "Text file has been imported as a new note.",
          })
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import the file. Please check the format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        notes={notes}
        currentNote={currentNote}
        onNoteSelect={handleNoteSelect}
        onNoteCreate={handleNoteCreate}
        onNoteDelete={handleNoteDelete}
        cloudEnabled={cloudEnabled}
        isOnline={isOnline}
        onEnableCloudSync={enableCloudSync}
        onDisableCloudSync={disableCloudSync}
        onExportAll={handleExportAll}
        onImport={handleImport}
      />

      {currentNote ? (
        <NoteEditor
          note={currentNote}
          onNoteUpdate={handleNoteUpdate}
          onNoteDelete={handleNoteDelete}
          cloudEnabled={cloudEnabled}
        />
      ) : (
        <EmptyState onCreateNote={handleNoteCreate} cloudEnabled={cloudEnabled} />
      )}
    </div>
  )
}
