"use client"

import { useTheme } from "@/components/theme-provider"
import { useSystemTheme } from "@/hooks/use-system-theme"
import { Badge } from "@/components/ui/badge"
import { Moon, Sun } from "lucide-react"

export function ThemeStatus() {
  const { theme } = useTheme()
  const systemTheme = useSystemTheme()

  const getThemeIcon = () => {
    if (theme === "system") {
      return systemTheme === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />
    }
    return theme === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />
  }

  const getThemeLabel = () => {
    if (theme === "system") {
      return `Auto (${systemTheme})`
    }
    return theme.charAt(0).toUpperCase() + theme.slice(1)
  }

  return (
    <Badge variant="outline" className="text-xs">
      {getThemeIcon()}
      <span className="ml-1">{getThemeLabel()}</span>
    </Badge>
  )
}
