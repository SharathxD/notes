"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { generateId, getDeviceInfo } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export interface LocalNote {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  deviceInfo?: string
  cloudId?: string
  isLocal?: boolean
}

const DEVICE_ID_KEY = "notepad-device-id"
const NOTES_STORAGE_KEY = "notepad-notes"

export function useNotes() {
  const [notes, setNotes] = useState<LocalNote[]>([])
  const [deviceId, setDeviceId] = useState("")
  const [cloudEnabled, setCloudEnabled] = useState(false)
  const { toast } = useToast()

  // Initialize device ID
  useEffect(() => {
    let storedDeviceId = localStorage.getItem(DEVICE_ID_KEY)
    if (!storedDeviceId) {
      storedDeviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(DEVICE_ID_KEY, storedDeviceId)
    }
    setDeviceId(storedDeviceId)

    loadLocalNotes()
  }, [])

  const loadLocalNotes = useCallback(() => {
    const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY)
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes)
      setNotes(parsedNotes)
    }
  }, [])

  const saveNotesToLocal = useCallback((notesToSave: LocalNote[]) => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesToSave))
  }, [])

  const convertSupabaseNoteToLocal = useCallback(
    (supabaseNote: any): LocalNote => ({
      id: supabaseNote.id,
      title: supabaseNote.title,
      content: supabaseNote.content,
      createdAt: supabaseNote.created_at,
      updatedAt: supabaseNote.updated_at,
      deviceInfo: supabaseNote.device_info || undefined,
      cloudId: supabaseNote.id,
      isLocal: false,
    }),
    [],
  )

  const convertLocalNoteToSupabase = useCallback(
    (localNote: LocalNote) => ({
      id: localNote.cloudId || localNote.id,
      title: localNote.title,
      content: localNote.content,
      device_info: localNote.deviceInfo,
      device_id: deviceId,
      created_at: localNote.createdAt,
      updated_at: localNote.updatedAt,
      is_deleted: false
    }),
    [deviceId],
  )

  const loadNotesFromSupabase = useCallback(async (forceEnabled = false) => {
    const shouldLoad = forceEnabled || cloudEnabled
    console.log('Checking cloud sync state:', { cloudEnabled, forceEnabled, shouldLoad })
    
    if (!shouldLoad) {
      console.log('Cloud sync is disabled, skipping load from Supabase')
      return
    }

    try {
      console.log('Loading notes from Supabase...')
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("is_deleted", false)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }

      console.log('Retrieved notes from Supabase!')
      if (!data || data.length === 0) {
        console.log('No notes found in Supabase')
        return
      }

      const cloudNotes = data.map(convertSupabaseNoteToLocal)
      console.log('Converted cloud notes!')

      // Merge with local notes, prioritizing cloud versions
      const mergedNotes = [...cloudNotes]
      notes.forEach((localNote) => {
        const existsInCloud = cloudNotes.find((cloudNote) => cloudNote.id === localNote.id)
        if (!existsInCloud && localNote.isLocal) {
          mergedNotes.push(localNote)
        }
      })

      console.log('Final merged notes!')
      setNotes(mergedNotes)
      saveNotesToLocal(mergedNotes)

      toast({
        title: "Notes loaded",
        description: `Loaded ${cloudNotes.length} notes from cloud.`,
      })
    } catch (error: any) {
      console.error('Error loading notes:', error)
      toast({
        title: "Failed to load notes",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [cloudEnabled, notes, convertSupabaseNoteToLocal, saveNotesToLocal, toast])

  const enableCloudSync = useCallback(async () => {
    console.log('Enabling cloud sync...')
    setCloudEnabled(true)
    await loadNotesFromSupabase(true)

    toast({
      title: "Cloud enabled",
      description: "Your notes will now be stored in the cloud.",
    })
  }, [loadNotesFromSupabase])

  const disableCloudSync = useCallback(() => {
    setCloudEnabled(false)
    toast({
      title: "Cloud disabled",
      description: "Notes will only be stored locally.",
    })
  }, [])

  const saveNoteToSupabase = useCallback(
    async (note: LocalNote) => {
      if (!cloudEnabled) return

      try {
        console.log('Saving note to Supabase:', note)
        const supabaseNote = convertLocalNoteToSupabase(note)
        const { data, error } = await supabase.from("notes").upsert(supabaseNote)

        if (error) {
          console.error('Supabase save error:', error)
          throw error
        }

        console.log('Note saved to Supabase:', data)

        // Update local note with cloud info
        const updatedNote = {
          ...note,
          cloudId: supabaseNote.id,
          isLocal: false,
        }

        setNotes((prev) => {
          const updated = prev.map((n) => (n.id === note.id ? updatedNote : n))
          saveNotesToLocal(updated)
          return updated
        })

        return updatedNote
      } catch (error: any) {
        console.error('Error saving note:', error)
        toast({
          title: "Failed to save note",
          description: error.message,
          variant: "destructive",
        })
        return note
      }
    },
    [cloudEnabled, convertLocalNoteToSupabase, saveNotesToLocal, toast],
  )

  const createNote = useCallback(
    async (title = "Untitled Note", content = "") => {
      const newNote: LocalNote = {
        id: generateId(),
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deviceInfo: getDeviceInfo(),
        isLocal: !cloudEnabled,
      }

      setNotes((prev) => {
        const updated = [newNote, ...prev]
        saveNotesToLocal(updated)
        return updated
      })

      // Save to cloud if enabled
      if (cloudEnabled) {
        await saveNoteToSupabase(newNote)
      }

      return newNote
    },
    [cloudEnabled, saveNoteToSupabase, saveNotesToLocal],
  )

  const updateNote = useCallback(
    async (noteId: string, updates: Partial<LocalNote>) => {
      const updatedNote = {
        ...notes.find((n) => n.id === noteId),
        ...updates,
        updatedAt: new Date().toISOString(),
        deviceInfo: getDeviceInfo(),
      } as LocalNote

      setNotes((prev) => {
        const updated = prev.map((note) => (note.id === noteId ? updatedNote : note))
        saveNotesToLocal(updated)
        return updated
      })

      if (cloudEnabled) {
        await saveNoteToSupabase(updatedNote)
      }

      return updatedNote
    },
    [notes, cloudEnabled, saveNoteToSupabase, saveNotesToLocal],
  )

  const deleteNote = useCallback(
    async (noteId: string) => {
      const noteToDelete = notes.find((n) => n.id === noteId)
      if (!noteToDelete) return

      // Remove from local state
      setNotes((prev) => {
        const updated = prev.filter((note) => note.id !== noteId)
        saveNotesToLocal(updated)
        return updated
      })

      // Delete from Supabase if cloud enabled
      if (noteToDelete.cloudId && cloudEnabled) {
        try {
          const { error } = await supabase
            .from("notes")
            .update({ is_deleted: true })
            .eq("id", noteToDelete.cloudId)

          if (error) throw error
        } catch (error: any) {
          toast({
            title: "Failed to delete note from cloud",
            description: error.message,
            variant: "destructive",
          })
        }
      }
    },
    [notes, cloudEnabled, saveNotesToLocal, toast],
  )

  return {
    notes,
    deviceId,
    cloudEnabled,
    enableCloudSync,
    disableCloudSync,
    createNote,
    updateNote,
    deleteNote,
    loadNotesFromSupabase,
  }
}
