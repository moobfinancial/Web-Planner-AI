"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SettingsManagement() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "WebPlanner",
    siteDescription: "AI-Powered Website Planning Tool",
    contactEmail: "support@webplanner.com",
    maxPlansPerUser: "10",
    defaultPlanVisibility: "private",
  })

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "notifications@webplanner.com",
    smtpPassword: "••••••••••••",
    senderName: "WebPlanner Notifications",
    senderEmail: "notifications@webplanner.com",
    enableEmailNotifications: true,
  })

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    defaultTheme: "system",
    enableDarkMode: true,
    primaryColor: "#06b6d4",
    accentColor: "#0ea5e9",
    customCss: "",
  })

  const handleGeneralChange = (field: string, value: string) => {
    setGeneralSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEmailChange = (field: string, value: any) => {
    setEmailSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAppearanceChange = (field: string, value: any) => {
    setAppearanceSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    })

    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => handleGeneralChange("siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => handleGeneralChange("contactEmail", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) => handleGeneralChange("siteDescription", e.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxPlansPerUser">Max Plans Per User</Label>
                  <Input
                    id="maxPlansPerUser"
                    type="number"
                    value={generalSettings.maxPlansPerUser}
                    onChange={(e) => handleGeneralChange("maxPlansPerUser", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultPlanVisibility">Default Plan Visibility</Label>
                  <Select
                    value={generalSettings.defaultPlanVisibility}
                    onValueChange={(value) => handleGeneralChange("defaultPlanVisibility", value)}
                  >
                    <SelectTrigger id="defaultPlanVisibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="team">Team Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email server and notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableEmailNotifications"
                    checked={emailSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => handleEmailChange("enableEmailNotifications", checked)}
                  />
                  <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={emailSettings.smtpServer}
                    onChange={(e) => handleEmailChange("smtpServer", e.target.value)}
                    disabled={!emailSettings.enableEmailNotifications}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={(e) => handleEmailChange("smtpPort", e.target.value)}
                    disabled={!emailSettings.enableEmailNotifications}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => handleEmailChange("smtpUsername", e.target.value)}
                    disabled={!emailSettings.enableEmailNotifications}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => handleEmailChange("smtpPassword", e.target.value)}
                    disabled={!emailSettings.enableEmailNotifications}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input
                    id="senderName"
                    value={emailSettings.senderName}
                    onChange={(e) => handleEmailChange("senderName", e.target.value)}
                    disabled={!emailSettings.enableEmailNotifications}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Sender Email</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={emailSettings.senderEmail}
                    onChange={(e) => handleEmailChange("senderEmail", e.target.value)}
                    disabled={!emailSettings.enableEmailNotifications}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultTheme">Default Theme</Label>
                  <Select
                    value={appearanceSettings.defaultTheme}
                    onValueChange={(value) => handleAppearanceChange("defaultTheme", value)}
                  >
                    <SelectTrigger id="defaultTheme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enableDarkMode">Dark Mode</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableDarkMode"
                      checked={appearanceSettings.enableDarkMode}
                      onCheckedChange={(checked) => handleAppearanceChange("enableDarkMode", checked)}
                    />
                    <Label htmlFor="enableDarkMode">Allow users to toggle dark mode</Label>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => handleAppearanceChange("primaryColor", e.target.value)}
                    />
                    <div
                      className="h-10 w-10 rounded-md border"
                      style={{ backgroundColor: appearanceSettings.primaryColor }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      value={appearanceSettings.accentColor}
                      onChange={(e) => handleAppearanceChange("accentColor", e.target.value)}
                    />
                    <div
                      className="h-10 w-10 rounded-md border"
                      style={{ backgroundColor: appearanceSettings.accentColor }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customCss">Custom CSS</Label>
                <Textarea
                  id="customCss"
                  value={appearanceSettings.customCss}
                  onChange={(e) => handleAppearanceChange("customCss", e.target.value)}
                  className="font-mono text-sm"
                  placeholder=":root { --custom-color: #ff0000; }"
                />
                <p className="text-sm text-muted-foreground">
                  Add custom CSS to override default styles. Use with caution.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

