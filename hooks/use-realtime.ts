"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface UseRealtimeProps {
  anonymousUserId: string
  deviceId: string
  enabled: boolean
  onNoteChange: (payload: any) => void
}

export function useRealtime({ anonymousUserId, deviceId, enabled, onNoteChange }: UseRealtimeProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (!enabled || !anonymousUserId) return

    const channel = supabase
      .channel("notes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `anonymous_user_id=eq.${anonymousUserId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          // Don't process changes from the same device
          if (newRecord?.device_id === deviceId || oldRecord?.device_id === deviceId) {
            return
          }

          switch (eventType) {
            case "INSERT":
              toast({
                title: "New note synced",
                description: `"${newRecord.title}" was added from another device.`,
              })
              break
            case "UPDATE":
              toast({
                title: "Note updated",
                description: `"${newRecord.title}" was updated from another device.`,
              })
              break
            case "DELETE":
              toast({
                title: "Note deleted",
                description: "A note was deleted from another device.",
              })
              break
          }

          onNoteChange(payload)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, anonymousUserId, deviceId, onNoteChange, toast])
}
