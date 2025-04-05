"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Save, BellRing, Eye, Globe } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function CustomerSettings() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("notifications")
  const [isSaving, setIsSaving] = useState(false)

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    newPlanComment: true,
    planUpdates: true,
    productUpdates: true,
    marketingEmails: false,
    planFeedback: true,
    planCompleted: true,
    dailyDigest: false,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  })

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "registered",
    planVisibility: "private",
    activityVisible: true,
    searchable: true,
    shareAnalytics: true,
  })

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system",
    fontSize: "medium",
    animationsReduced: false,
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
  })

  const handleNotificationChange = (field: string, value: any) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePrivacyChange = (field: string, value: any) => {
    setPrivacySettings((prev) => ({
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
      description: "Your preferences have been updated successfully.",
    })

    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Decide which notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications" className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      Email Notifications
                    </Label>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushNotifications" className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                      </svg>
                      Push Notifications
                    </Label>
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smsNotifications" className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      SMS Notifications
                    </Label>
                    <Switch
                      id="smsNotifications"
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("smsNotifications", checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Plan Activity</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newPlanComment">New plan comments</Label>
                    <Switch
                      id="newPlanComment"
                      checked={notificationSettings.newPlanComment}
                      onCheckedChange={(checked) => handleNotificationChange("newPlanComment", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="planUpdates">Plan updates</Label>
                    <Switch
                      id="planUpdates"
                      checked={notificationSettings.planUpdates}
                      onCheckedChange={(checked) => handleNotificationChange("planUpdates", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="planFeedback">Feedback on your plans</Label>
                    <Switch
                      id="planFeedback"
                      checked={notificationSettings.planFeedback}
                      onCheckedChange={(checked) => handleNotificationChange("planFeedback", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="planCompleted">Plan completed</Label>
                    <Switch
                      id="planCompleted"
                      checked={notificationSettings.planCompleted}
                      onCheckedChange={(checked) => handleNotificationChange("planCompleted", checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Marketing & Updates</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="productUpdates">Product updates</Label>
                    <Switch
                      id="productUpdates"
                      checked={notificationSettings.productUpdates}
                      onCheckedChange={(checked) => handleNotificationChange("productUpdates", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketingEmails">Marketing emails</Label>
                    <Switch
                      id="marketingEmails"
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => handleNotificationChange("marketingEmails", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dailyDigest">Daily digest</Label>
                    <Switch
                      id="dailyDigest"
                      checked={notificationSettings.dailyDigest}
                      onCheckedChange={(checked) => handleNotificationChange("dailyDigest", checked)}
                    />
                  </div>
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

        <TabsContent value="privacy" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and what others can see</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profile Visibility</h3>
                <div className="space-y-2">
                  <Label htmlFor="profileVisibility">Who can see your profile</Label>
                  <Select
                    value={privacySettings.profileVisibility}
                    onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
                  >
                    <SelectTrigger id="profileVisibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Everyone</SelectItem>
                      <SelectItem value="registered">Registered Users</SelectItem>
                      <SelectItem value="connections">Connections Only</SelectItem>
                      <SelectItem value="private">Only Me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Plan Visibility</h3>
                <div className="space-y-2">
                  <Label htmlFor="planVisibility">Default plan visibility</Label>
                  <Select
                    value={privacySettings.planVisibility}
                    onValueChange={(value) => handlePrivacyChange("planVisibility", value)}
                  >
                    <SelectTrigger id="planVisibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted (accessible by link)</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data & Activity</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="activityVisible">Show my activity to others</Label>
                    <Switch
                      id="activityVisible"
                      checked={privacySettings.activityVisible}
                      onCheckedChange={(checked) => handlePrivacyChange("activityVisible", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="searchable">Allow others to find me in search</Label>
                    <Switch
                      id="searchable"
                      checked={privacySettings.searchable}
                      onCheckedChange={(checked) => handlePrivacyChange("searchable", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shareAnalytics">Share anonymous usage data to improve the product</Label>
                    <Switch
                      id="shareAnalytics"
                      checked={privacySettings.shareAnalytics}
                      onCheckedChange={(checked) => handlePrivacyChange("shareAnalytics", checked)}
                    />
                  </div>
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
              <CardDescription>Customize how WebPlanner looks and behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme & Display</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme Mode</Label>
                    <Select
                      value={appearanceSettings.theme}
                      onValueChange={(value) => handleAppearanceChange("theme", value)}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Select
                      value={appearanceSettings.fontSize}
                      onValueChange={(value) => handleAppearanceChange("fontSize", value)}
                    >
                      <SelectTrigger id="fontSize">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animationsReduced">Reduce animations</Label>
                    <Switch
                      id="animationsReduced"
                      checked={appearanceSettings.animationsReduced}
                      onCheckedChange={(checked) => handleAppearanceChange("animationsReduced", checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Region & Time</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={appearanceSettings.language}
                      onValueChange={(value) => handleAppearanceChange("language", value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={appearanceSettings.timezone}
                      onValueChange={(value) => handleAppearanceChange("timezone", value)}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                        <SelectItem value="CST">Central Time (CST)</SelectItem>
                        <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                        <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        value={appearanceSettings.dateFormat}
                        onValueChange={(value) => handleAppearanceChange("dateFormat", value)}
                      >
                        <SelectTrigger id="dateFormat">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeFormat">Time Format</Label>
                      <Select
                        value={appearanceSettings.timeFormat}
                        onValueChange={(value) => handleAppearanceChange("timeFormat", value)}
                      >
                        <SelectTrigger id="timeFormat">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                          <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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
      </Tabs>
    </div>
  )
}

