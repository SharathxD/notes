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
  lastSynced?: string
  isLocal?: boolean
}

const DEVICE_ID_KEY = "notepad-device-id"
const ANONYMOUS_USER_ID_KEY = "notepad-anonymous-user-id"
const NOTES_STORAGE_KEY = "notepad-notes"

export function useNotes() {
  const [notes, setNotes] = useState<LocalNote[]>([])
  const [deviceId, setDeviceId] = useState("")
  const [anonymousUserId, setAnonymousUserId] = useState("")
  const [cloudEnabled, setCloudEnabled] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const { toast } = useToast()

  // Initialize device and user IDs
  useEffect(() => {
    let storedDeviceId = localStorage.getItem(DEVICE_ID_KEY)
    if (!storedDeviceId) {
      storedDeviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(DEVICE_ID_KEY, storedDeviceId)
    }
    setDeviceId(storedDeviceId)

    let storedAnonymousUserId = localStorage.getItem(ANONYMOUS_USER_ID_KEY)
    if (!storedAnonymousUserId) {
      storedAnonymousUserId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(ANONYMOUS_USER_ID_KEY, storedAnonymousUserId)
    }
    setAnonymousUserId(storedAnonymousUserId)

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
      lastSynced: supabaseNote.updated_at,
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

  const enableCloudSync = useCallback(async () => {
    setCloudEnabled(true)
    await registerDevice()
    await loadNotesFromSupabase()

    toast({
      title: "Cloud sync enabled",
      description: "Your notes will now sync across all devices.",
    })
  }, [anonymousUserId, deviceId])

  const disableCloudSync = useCallback(() => {
    setCloudEnabled(false)
    toast({
      title: "Cloud sync disabled",
      description: "Notes will only be stored locally.",
    })
  }, [])

  const registerDevice = useCallback(async () => {
    if (!cloudEnabled) return

    try {
      const { error } = await supabase.from("devices").upsert({
        device_id: deviceId,
        device_name: navigator.userAgent.includes("Mobile") ? "Mobile Device" : "Desktop",
        device_type: getDeviceInfo(),
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString()
      })

      if (error) throw error
    } catch (error) {
      console.error("Error registering device:", error)
    }
  }, [cloudEnabled, deviceId])

  const loadNotesFromSupabase = useCallback(async () => {
    if (!cloudEnabled || !anonymousUserId) return

    setIsSyncing(true)
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("anonymous_user_id", anonymousUserId)
        .eq("is_deleted", false)
        .order("updated_at", { ascending: false })

      if (error) throw error

      const cloudNotes = data.map(convertSupabaseNoteToLocal)

      // Merge with local notes, prioritizing cloud versions
      const mergedNotes = [...cloudNotes]
      notes.forEach((localNote) => {
        const existsInCloud = cloudNotes.find((cloudNote) => cloudNote.id === localNote.id)
        if (!existsInCloud && localNote.isLocal) {
          mergedNotes.push(localNote)
        }
      })

      setNotes(mergedNotes)
      saveNotesToLocal(mergedNotes)
      setLastSyncTime(new Date().toISOString())

      toast({
        title: "Notes loaded",
        description: `Loaded ${cloudNotes.length} notes from cloud.`,
      })
    } catch (error: any) {
      toast({
        title: "Failed to load notes",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }, [cloudEnabled, anonymousUserId, notes, convertSupabaseNoteToLocal, saveNotesToLocal, toast])

  const saveNoteToSupabase = useCallback(
    async (note: LocalNote) => {
      if (!cloudEnabled || !anonymousUserId) return

      try {
        const supabaseNote = convertLocalNoteToSupabase(note)
        const { error } = await supabase.from("notes").upsert(supabaseNote)

        if (error) throw error

        // Update local note with sync info
        const updatedNote = {
          ...note,
          cloudId: supabaseNote.id,
          lastSynced: new Date().toISOString(),
          isLocal: false,
        }

        setNotes((prev) => {
          const updated = prev.map((n) => (n.id === note.id ? updatedNote : n))
          saveNotesToLocal(updated)
          return updated
        })

        return updatedNote
      } catch (error: any) {
        toast({
          title: "Failed to save note",
          description: error.message,
          variant: "destructive",
        })
        return note
      }
    },
    [cloudEnabled, anonymousUserId, convertLocalNoteToSupabase, saveNotesToLocal, toast],
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
            .eq("anonymous_user_id", anonymousUserId)

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
    [notes, cloudEnabled, anonymousUserId, saveNotesToLocal, toast],
  )

  const syncWithSupabase = useCallback(async () => {
    if (!cloudEnabled || !anonymousUserId) return

    setIsSyncing(true)
    try {
      // Sync local notes to cloud
      for (const note of notes.filter((n) => n.isLocal)) {
        await saveNoteToSupabase(note)
      }

      // Update sync status
      await supabase.from("sync_status").upsert({
        anonymous_user_id: anonymousUserId,
        device_id: deviceId,
        last_sync: new Date().toISOString(),
        sync_count: 1,
      })

      // Update device last seen
      await supabase
        .from("devices")
        .update({ last_seen: new Date().toISOString() })
        .eq("device_id", deviceId)
        .eq("anonymous_user_id", anonymousUserId)

      setLastSyncTime(new Date().toISOString())

      toast({
        title: "Sync complete",
        description: "Your notes are up to date across all devices.",
      })
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }, [cloudEnabled, anonymousUserId, deviceId, notes, saveNoteToSupabase, toast])

  return {
    notes,
    deviceId,
    anonymousUserId,
    cloudEnabled,
    isSyncing,
    lastSyncTime,
    enableCloudSync,
    disableCloudSync,
    createNote,
    updateNote,
    deleteNote,
    syncWithSupabase,
    loadNotesFromSupabase,
  }
}
