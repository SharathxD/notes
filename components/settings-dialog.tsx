"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTheme } from "next-themes"
import { CheckCircle, CloudOff, Download, Upload } from "lucide-react"

interface SettingsDialogProps {
  children: React.ReactNode
  cloudEnabled: boolean
  isOnline: boolean
  onEnableCloudSync: () => void
  onDisableCloudSync: () => void
  onExportAll: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function SettingsDialog({
  children,
  cloudEnabled,
  isOnline,
  onEnableCloudSync,
  onDisableCloudSync,
  onExportAll,
  onImport,
}: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light"
      case "dark":
        return "Dark"
      default:
        return "System"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize your notepad experience.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="cloud" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cloud">Cloud</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="export">Export/Import</TabsTrigger>
          </TabsList>

          <TabsContent value="cloud" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Supabase Cloud Storage</h3>
                    <p className="text-sm text-muted-foreground">
                      {cloudEnabled ? "Your notes are stored in the cloud" : "Enable to store notes in the cloud"}
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

                <div className="space-y-2">
                  {cloudEnabled ? (
                    <Button onClick={onDisableCloudSync} variant="outline" className="w-full">
                      <CloudOff className="h-4 w-4 mr-2" />
                      Disable Cloud Storage
                    </Button>
                  ) : (
                    <Button onClick={onEnableCloudSync} className="w-full" disabled={!isOnline}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enable Cloud Storage
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {cloudEnabled
                      ? "Your notes are stored in the cloud and will be available across devices."
                      : "Enable cloud storage to keep your notes safe and accessible from anywhere."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Theme</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        onClick={() => setTheme("light")}
                        className="w-full"
                      >
                        Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        onClick={() => setTheme("dark")}
                        className="w-full"
                      >
                        Dark
                      </Button>
                      <Button
                        variant={theme === "system" ? "default" : "outline"}
                        onClick={() => setTheme("system")}
                        className="w-full"
                      >
                        System
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm">
                      <p className="font-medium mb-1">Current theme: {getThemeLabel()}</p>
                      <p className="text-muted-foreground text-xs">
                        {theme === "system"
                          ? `Following system preference. Theme will automatically switch when your system settings change.`
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
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
