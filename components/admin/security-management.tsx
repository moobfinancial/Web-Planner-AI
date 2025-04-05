"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Save, Shield, AlertTriangle, Clock, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SecurityManagement() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("authentication")
  const [isSaving, setIsSaving] = useState(false)

  // Authentication settings
  const [authSettings, setAuthSettings] = useState({
    passwordMinLength: "8",
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    maxLoginAttempts: "5",
    lockoutDuration: "30",
    sessionTimeout: "60",
    enableTwoFactor: true,
    allowSocialLogin: true,
  })

  // API security settings
  const [apiSettings, setApiSettings] = useState({
    enableApiAccess: true,
    defaultTokenExpiration: "7",
    maxTokensPerUser: "5",
    requireHttps: true,
    enableRateLimiting: true,
    rateLimit: "100",
    rateLimitWindow: "60",
  })

  // Recent security events
  const securityEvents = [
    {
      id: 1,
      type: "login_failed",
      user: "john@example.com",
      ip: "192.168.1.1",
      timestamp: "10 minutes ago",
      details: "Failed login attempt",
    },
    {
      id: 2,
      type: "login_success",
      user: "admin@webplanner.com",
      ip: "192.168.1.2",
      timestamp: "30 minutes ago",
      details: "Successful login",
    },
    {
      id: 3,
      type: "password_reset",
      user: "jane@example.com",
      ip: "192.168.1.3",
      timestamp: "2 hours ago",
      details: "Password reset requested",
    },
    {
      id: 4,
      type: "account_locked",
      user: "bob@example.com",
      ip: "192.168.1.4",
      timestamp: "3 hours ago",
      details: "Account locked after 5 failed attempts",
    },
    {
      id: 5,
      type: "api_key_created",
      user: "admin@webplanner.com",
      ip: "192.168.1.2",
      timestamp: "1 day ago",
      details: "New API key generated",
    },
  ]

  const handleAuthChange = (field: string, value: any) => {
    setAuthSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleApiChange = (field: string, value: any) => {
    setApiSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Security settings saved",
      description: "Your security settings have been updated successfully.",
    })

    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="api">API Security</TabsTrigger>
          <TabsTrigger value="logs">Security Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="authentication" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>Configure password policies and login security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={authSettings.passwordMinLength}
                    onChange={(e) => handleAuthChange("passwordMinLength", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={authSettings.maxLoginAttempts}
                    onChange={(e) => handleAuthChange("maxLoginAttempts", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={authSettings.lockoutDuration}
                    onChange={(e) => handleAuthChange("lockoutDuration", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={authSettings.sessionTimeout}
                    onChange={(e) => handleAuthChange("sessionTimeout", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireSpecialChars"
                      checked={authSettings.requireSpecialChars}
                      onCheckedChange={(checked) => handleAuthChange("requireSpecialChars", checked)}
                    />
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireNumbers"
                      checked={authSettings.requireNumbers}
                      onCheckedChange={(checked) => handleAuthChange("requireNumbers", checked)}
                    />
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireUppercase"
                      checked={authSettings.requireUppercase}
                      onCheckedChange={(checked) => handleAuthChange("requireUppercase", checked)}
                    />
                    <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableTwoFactor"
                      checked={authSettings.enableTwoFactor}
                      onCheckedChange={(checked) => handleAuthChange("enableTwoFactor", checked)}
                    />
                    <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowSocialLogin"
                      checked={authSettings.allowSocialLogin}
                      onCheckedChange={(checked) => handleAuthChange("allowSocialLogin", checked)}
                    />
                    <Label htmlFor="allowSocialLogin">Allow Social Login</Label>
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

        <TabsContent value="api" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Security</CardTitle>
              <CardDescription>Configure API access and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableApiAccess"
                    checked={apiSettings.enableApiAccess}
                    onCheckedChange={(checked) => handleApiChange("enableApiAccess", checked)}
                  />
                  <Label htmlFor="enableApiAccess">Enable API Access</Label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultTokenExpiration">Default Token Expiration (days)</Label>
                  <Input
                    id="defaultTokenExpiration"
                    type="number"
                    value={apiSettings.defaultTokenExpiration}
                    onChange={(e) => handleApiChange("defaultTokenExpiration", e.target.value)}
                    disabled={!apiSettings.enableApiAccess}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTokensPerUser">Max Tokens Per User</Label>
                  <Input
                    id="maxTokensPerUser"
                    type="number"
                    value={apiSettings.maxTokensPerUser}
                    onChange={(e) => handleApiChange("maxTokensPerUser", e.target.value)}
                    disabled={!apiSettings.enableApiAccess}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireHttps"
                      checked={apiSettings.requireHttps}
                      onCheckedChange={(checked) => handleApiChange("requireHttps", checked)}
                      disabled={!apiSettings.enableApiAccess}
                    />
                    <Label htmlFor="requireHttps">Require HTTPS</Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableRateLimiting"
                      checked={apiSettings.enableRateLimiting}
                      onCheckedChange={(checked) => handleApiChange("enableRateLimiting", checked)}
                      disabled={!apiSettings.enableApiAccess}
                    />
                    <Label htmlFor="enableRateLimiting">Enable Rate Limiting</Label>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rateLimit">Rate Limit (requests)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={apiSettings.rateLimit}
                    onChange={(e) => handleApiChange("rateLimit", e.target.value)}
                    disabled={!apiSettings.enableApiAccess || !apiSettings.enableRateLimiting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateLimitWindow">Rate Limit Window (seconds)</Label>
                  <Input
                    id="rateLimitWindow"
                    type="number"
                    value={apiSettings.rateLimitWindow}
                    onChange={(e) => handleApiChange("rateLimitWindow", e.target.value)}
                    disabled={!apiSettings.enableApiAccess || !apiSettings.enableRateLimiting}
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

        <TabsContent value="logs" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security Event Logs</CardTitle>
                  <CardDescription>Recent security-related events</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {event.type === "login_failed" || event.type === "account_locked" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          ) : event.type === "login_success" ? (
                            <Shield className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-blue-500" />
                          )}
                          <Badge
                            variant="outline"
                            className={
                              event.type === "login_failed" || event.type === "account_locked"
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                : event.type === "login_success"
                                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                                  : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            }
                          >
                            {event.type.replace("_", " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{event.user}</TableCell>
                      <TableCell>{event.ip}</TableCell>
                      <TableCell>{event.timestamp}</TableCell>
                      <TableCell>{event.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">Showing recent 5 events</div>
              <Button variant="outline" size="sm">
                View All Logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

