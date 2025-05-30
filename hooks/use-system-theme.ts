"use client"

import { useState, useEffect } from "react"

export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Check initial system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    setSystemTheme(mediaQuery.matches ? "dark" : "light")

    // Listen for changes in system preference
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return systemTheme
}
