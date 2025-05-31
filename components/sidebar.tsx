"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Settings, Search, Wifi, WifiOff } from "lucide-react"
import { NoteList } from "@/components/note-list"
import { SettingsDialog } from "@/components/settings-dialog"
import { countWords } from "@/lib/utils"
import type { LocalNote } from "@/hooks/use-notes"
import { ThemeToggle } from "@/components/theme-toggle"

interface SidebarProps {
  notes: LocalNote[]
  currentNote: LocalNote | null
  onNoteSelect: (note: LocalNote) => void
  onNoteCreate: () => void
  onNoteDelete: (noteId: string) => void
  cloudEnabled: boolean
  isOnline: boolean
  onEnableCloudSync: () => void
  onDisableCloudSync: () => void
  onExportAll: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function Sidebar({
  notes,
  currentNote,
  onNoteSelect,
  onNoteCreate,
  onNoteDelete,
  cloudEnabled,
  isOnline,
  onEnableCloudSync,
  onDisableCloudSync,
  onExportAll,
  onImport,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    totalNotes: notes.length,
    totalWords: notes.reduce((acc, note) => acc + countWords(note.content), 0),
    totalCharacters: notes.reduce((acc, note) => acc + note.content.length, 0),
    cloudNotes: notes.filter((note) => !note.isLocal).length,
  }

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Notepad</h1>
          <div className="ml-auto flex items-center gap-1">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            {cloudEnabled ? (
              <Badge variant="secondary" className="text-xs">
                Cloud
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Local
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Button onClick={onNoteCreate} size="sm" className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>

          <ThemeToggle />

          <SettingsDialog
            cloudEnabled={cloudEnabled}
            isOnline={isOnline}
            onEnableCloudSync={onEnableCloudSync}
            onDisableCloudSync={onDisableCloudSync}
            onExportAll={onExportAll}
            onImport={onImport}
          >
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </SettingsDialog>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs text-muted-foreground mb-4">
          <div>
            <div className="font-medium">{stats.totalNotes}</div>
            <div>Notes</div>
          </div>
          <div>
            <div className="font-medium">{cloudEnabled ? stats.cloudNotes : 0}</div>
            <div>Cloud</div>
          </div>
          <div>
            <div className="font-medium">{stats.totalWords}</div>
            <div>Words</div>
          </div>
          <div>
            <div className="font-medium">{stats.totalCharacters}</div>
            <div>Chars</div>
          </div>
        </div>
      </div>

      <NoteList
        notes={filteredNotes}
        currentNote={currentNote}
        onNoteSelect={onNoteSelect}
        onNoteDelete={onNoteDelete}
        cloudEnabled={cloudEnabled}
      />
    </div>
  )
}
