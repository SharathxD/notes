"use client"

import type React from "react"

import { useTheme } from "@/components/theme-provider"
import { useSystemTheme } from "@/hooks/use-system-theme"
import { Button } from "@/components/ui/button"
import { Monitor, Moon, Sun } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cloud, CloudOff, CheckCircle, AlertCircle, RefreshCw, Download, Upload, QrCode, Copy, Key } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { ThemeStatus } from "@/components/theme-status"

interface SettingsDialogProps {
  children: React.ReactNode
  cloudEnabled: boolean
  isOnline: boolean
  isSyncing: boolean
  anonymousUserId: string
  lastSyncTime: string | null
  onEnableCloudSync: () => void
  onDisableCloudSync: () => void
  onSyncNow: () => void
  onExportAll: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
  onGenerateSyncUrl: () => void
  syncUrl: string
  onCopySyncUrl: () => void
}

export function SettingsDialog({
  children,
  cloudEnabled,
  isOnline,
  isSyncing,
  anonymousUserId,
  lastSyncTime,
  onEnableCloudSync,
  onDisableCloudSync,
  onSyncNow,
  onExportAll,
  onImport,
  onGenerateSyncUrl,
  syncUrl,
  onCopySyncUrl,
}: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const systemTheme = useSystemTheme()

  const getThemeLabel = () => {
    if (theme === "system") {
      return `Auto (${systemTheme})`
    }
    return theme.charAt(0).toUpperCase() + theme.slice(1)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings & Cloud Sync</DialogTitle>
          <DialogDescription>Configure cloud synchronization and manage your notes across devices.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="cloud" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cloud">Cloud Sync</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="export">Export/Import</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
          </TabsList>

          <TabsContent value="cloud" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Supabase Cloud Storage</h3>
                    <p className="text-sm text-muted-foreground">
                      {cloudEnabled ? "Real-time sync across all your devices" : "Enable to sync notes across devices"}
                    </p>
                  </div>
                  {cloudEnabled ? (
                    <Badge variant="secondary" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <CloudOff className="h-3 w-3 mr-1" />
                      Disabled
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  {!cloudEnabled ? (
                    <Button onClick={onEnableCloudSync} className="w-full">
                      <Cloud className="h-4 w-4 mr-2" />
                      Enable Cloud Sync
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={onSyncNow} disabled={isSyncing || !isOnline} className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </Button>
                      <Button onClick={onDisableCloudSync} variant="outline">
                        <CloudOff className="h-4 w-4 mr-2" />
                        Disable
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {lastSyncTime && cloudEnabled && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Last sync: {formatDate(lastSyncTime)}</span>
                </div>
              </div>
            )}

            {!isOnline && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Offline - Changes will sync when connection is restored</span>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Key className="h-4 w-4" />
                <span>Your sync ID: {anonymousUserId.slice(-8)}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Appearance</h3>
                    <p className="text-sm text-muted-foreground">Customize the appearance of the application</p>
                  </div>
                  <ThemeStatus />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className="flex flex-col gap-1 h-auto py-3"
                    >
                      <Sun className="h-4 w-4" />
                      <span className="text-xs">Light</span>
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className="flex flex-col gap-1 h-auto py-3"
                    >
                      <Moon className="h-4 w-4" />
                      <span className="text-xs">Dark</span>
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("system")}
                      className="flex flex-col gap-1 h-auto py-3"
                    >
                      <Monitor className="h-4 w-4" />
                      <span className="text-xs">System</span>
                    </Button>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm">
                      <p className="font-medium mb-1">Current theme: {getThemeLabel()}</p>
                      <p className="text-muted-foreground text-xs">
                        {theme === "system"
                          ? `Following system preference (${systemTheme}). Theme will automatically switch when your system settings change.`
                          : `Using ${theme} theme. You can switch to system to follow your device's preference.`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-2">
              <Button onClick={onExportAll} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export All Notes
              </Button>
              <p className="text-sm text-muted-foreground">Download a backup file containing all your notes.</p>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <label htmlFor="import-backup" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Backup
                  <input
                    id="import-backup"
                    type="file"
                    accept=".json,.txt,.md"
                    onChange={onImport}
                    className="hidden"
                  />
                </label>
              </Button>
              <p className="text-sm text-muted-foreground">Import notes from a backup file or text document.</p>
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-4">
            <div className="space-y-2">
              <Button onClick={onGenerateSyncUrl} className="w-full" disabled={!cloudEnabled}>
                <QrCode className="h-4 w-4 mr-2" />
                Generate Sync URL
              </Button>
              {syncUrl && (
                <div className="space-y-2">
                  <div className="p-2 bg-muted rounded text-xs break-all">{syncUrl}</div>
                  <Button onClick={onCopySyncUrl} variant="outline" size="sm" className="w-full">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {cloudEnabled
                  ? "Share this URL to access your notes on another device."
                  : "Enable cloud sync to generate shareable URLs."}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
