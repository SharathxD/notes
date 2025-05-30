"use client"

import { Button } from "@/components/ui/button"
import { FileText, Plus, Monitor, Tablet, Smartphone } from "lucide-react"

interface EmptyStateProps {
  onCreateNote: () => void
  cloudEnabled: boolean
}

export function EmptyState({ onCreateNote, cloudEnabled }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Welcome to Notepad</h2>
        <p className="text-muted-foreground mb-6">
          Create notes that work offline and optionally sync across devices with cloud storage.
        </p>
        <div className="flex gap-2 justify-center mb-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Monitor className="h-4 w-4" />
            Desktop
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Tablet className="h-4 w-4" />
            Tablet
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            Mobile
          </div>
        </div>
        <Button onClick={onCreateNote} className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Note
        </Button>
        <p className="text-xs text-muted-foreground">
          {cloudEnabled
            ? "Cloud sync enabled - notes will sync across devices"
            : "Working offline - enable cloud sync in settings to sync across devices"}
        </p>
      </div>
    </div>
  )
}
