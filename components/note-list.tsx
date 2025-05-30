"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Cloud, CloudOff, Trash2 } from "lucide-react"
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
import { formatDate } from "@/lib/utils"
import type { LocalNote } from "@/hooks/use-notes"

interface NoteListProps {
  notes: LocalNote[]
  currentNote: LocalNote | null
  onNoteSelect: (note: LocalNote) => void
  onNoteDelete: (noteId: string) => void
  cloudEnabled: boolean
}

export function NoteList({ notes, currentNote, onNoteSelect, onNoteDelete, cloudEnabled }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No notes yet</p>
        <p className="text-sm mt-2">Create your first note to get started</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {notes.map((note) => (
          <Card
            key={note.id}
            className={`mb-2 cursor-pointer transition-colors hover:bg-accent group ${
              currentNote?.id === note.id ? "bg-accent" : ""
            }`}
            onClick={() => onNoteSelect(note)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{note.title}</h3>
                    {cloudEnabled && note.lastSynced && !note.isLocal ? (
                      <Cloud className="h-3 w-3 text-green-500 flex-shrink-0" />
                    ) : note.isLocal ? (
                      <CloudOff className="h-3 w-3 text-orange-500 flex-shrink-0" />
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{note.content || "Empty note"}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(note.updatedAt)}
                    </div>
                    {note.deviceInfo && (
                      <Badge variant="secondary" className="text-xs">
                        {note.deviceInfo}
                      </Badge>
                    )}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Note</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{note.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onNoteDelete(note.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
