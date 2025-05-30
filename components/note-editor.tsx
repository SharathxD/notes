"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, Download, Trash2, Cloud, CloudOff } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatDate, exportToFile } from "@/lib/utils"
import type { LocalNote } from "@/hooks/use-notes"

interface NoteEditorProps {
  note: LocalNote
  onNoteUpdate: (noteId: string, updates: Partial<LocalNote>) => void
  onNoteDelete: (noteId: string) => void
  cloudEnabled: boolean
}

export function NoteEditor({ note, onNoteUpdate, onNoteDelete, cloudEnabled }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isUnsaved, setIsUnsaved] = useState(false)

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setIsUnsaved(false)
  }, [note])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    onNoteUpdate(note.id, { title: newTitle })
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setIsUnsaved(true)
  }

  const handleSave = () => {
    onNoteUpdate(note.id, { content })
    setIsUnsaved(false)
  }

  const handleExport = () => {
    exportToFile(content, `${title}.txt`)
  }

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (isUnsaved) {
      const timeoutId = setTimeout(() => {
        handleSave()
      }, 2000)

      return () => clearTimeout(timeoutId)
    }
  }, [content, isUnsaved])

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-lg font-semibold border-none shadow-none p-0 h-auto"
              placeholder="Note title..."
            />
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
              <span>Last updated: {formatDate(note.updatedAt)}</span>
              {note.deviceInfo && (
                <Badge variant="outline" className="text-xs">
                  {note.deviceInfo}
                </Badge>
              )}
              {cloudEnabled && note.lastSynced && !note.isLocal ? (
                <Badge variant="outline" className="text-xs text-green-600">
                  <Cloud className="h-3 w-3 mr-1" />
                  Synced
                </Badge>
              ) : note.isLocal ? (
                <Badge variant="outline" className="text-xs text-orange-600">
                  <CloudOff className="h-3 w-3 mr-1" />
                  Local only
                </Badge>
              ) : null}
              {isUnsaved && <span className="text-orange-500">• Unsaved changes</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" disabled={!isUnsaved}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Note</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onNoteDelete(note.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing your note..."
          className="w-full h-full resize-none border-none shadow-none text-base leading-relaxed"
        />
      </div>
    </div>
  )
}
