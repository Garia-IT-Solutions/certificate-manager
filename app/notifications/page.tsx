"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle,
  Settings,
  Mail,
  Smartphone,
  Calendar,
  Award,
  FileText,
} from "lucide-react"

interface Notification {
  id: number
  type: "certificate" | "document" | "system"
  title: string
  message: string
  date: string
  priority: "high" | "medium" | "low"
  read: boolean
  actionRequired: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "certificate",
      title: "Certificate Expiring Soon",
      message: "Your STCW Basic Safety Training certificate expires in 30 days (March 15, 2024)",
      date: "2024-02-14",
      priority: "high",
      read: false,
      actionRequired: true,
    },
    {
      id: 2,
      type: "document",
      title: "Medical Certificate Renewal",
      message: "Medical Certificate expires in 45 days. Schedule renewal appointment.",
      date: "2024-02-13",
      priority: "medium",
      read: false,
      actionRequired: true,
    },
    {
      id: 3,
      type: "certificate",
      title: "Certificate Expired",
      message: "Radar Observer Certificate has expired. Immediate renewal required.",
      date: "2024-02-10",
      priority: "high",
      read: true,
      actionRequired: true,
    },
    {
      id: 4,
      type: "system",
      title: "Backup Completed",
      message: "Your documents have been successfully backed up to cloud storage.",
      date: "2024-02-12",
      priority: "low",
      read: true,
      actionRequired: false,
    },
  ])

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    certificateExpiry: true,
    documentExpiry: true,
    systemUpdates: false,
    weeklyReports: true,
    reminderDays: 30,
  })

  const unreadCount = notifications.filter((n) => !n.read).length
  const actionRequiredCount = notifications.filter((n) => n.actionRequired && !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Medium
          </Badge>
        )
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "certificate":
        return <Award className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "system":
        return <Settings className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              Stay updated with certificate expirations and important alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{unreadCount} unread</Badge>
            {actionRequiredCount > 0 && <Badge variant="destructive">{actionRequiredCount} action required</Badge>}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notifications">All Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-border/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{notifications.length}</div>
                  <p className="text-xs text-muted-foreground">All notifications</p>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unread</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">{unreadCount}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Action Required</CardTitle>
                  <Clock className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">{actionRequiredCount}</div>
                  <p className="text-xs text-muted-foreground">Immediate action</p>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {notifications.filter((n) => n.read && !n.actionRequired).length}
                  </div>
                  <p className="text-xs text-muted-foreground">No action needed</p>
                </CardContent>
              </Card>
            </div>

            {/* Notifications List */}
            <Card className="border-border/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Notifications</CardTitle>
                    <CardDescription>Latest alerts and system notifications</CardDescription>
                  </div>
                  <Button variant="outline" onClick={markAllAsRead}>
                    Mark All as Read
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.read ? "border-border/40 bg-muted/20" : "border-primary/20 bg-primary/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`p-2 rounded-lg ${
                                notification.priority === "high"
                                  ? "bg-red-500/10 text-red-500"
                                  : notification.priority === "medium"
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : "bg-blue-500/10 text-blue-500"
                              }`}
                            >
                              {getTypeIcon(notification.type)}
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{notification.title}</h4>
                                {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {notification.date}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(notification.priority)}
                            {notification.actionRequired && (
                              <Badge variant="destructive" className="text-xs">
                                Action Required
                              </Badge>
                            )}
                            {!notification.read && (
                              <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                                Mark as Read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Delivery Methods */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Delivery Methods</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                        </div>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Types */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notification Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="certificate-expiry">Certificate Expiry Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when certificates are about to expire
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="certificate-expiry"
                        checked={preferences.certificateExpiry}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, certificateExpiry: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="document-expiry">Document Expiry Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when documents are about to expire
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="document-expiry"
                        checked={preferences.documentExpiry}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, documentExpiry: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="system-updates">System Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified about system updates and maintenance
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="system-updates"
                        checked={preferences.systemUpdates}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, systemUpdates: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="weekly-reports">Weekly Reports</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive weekly summary of your certificates and documents
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="weekly-reports"
                        checked={preferences.weeklyReports}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReports: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Timing Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Timing Settings</h3>
                  <div className="space-y-2">
                    <Label htmlFor="reminder-days">Expiry Reminder (Days in Advance)</Label>
                    <select
                      id="reminder-days"
                      className="w-full p-2 rounded-md border border-border bg-background"
                      value={preferences.reminderDays}
                      onChange={(e) =>
                        setPreferences({ ...preferences, reminderDays: Number.parseInt(e.target.value) })
                      }
                    >
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                    </select>
                    <p className="text-sm text-muted-foreground">How many days before expiry should we notify you?</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
