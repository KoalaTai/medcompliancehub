import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Bell, 
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Mail,
  Settings
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface DigestNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
  metadata?: {
    digestId?: string
    recipientCount?: number
    errorDetails?: string
  }
}

interface NotificationSettings {
  emailEnabled: boolean
  desktopEnabled: boolean
  digestGeneration: boolean
  digestDelivery: boolean
  subscriberChanges: boolean
  systemErrors: boolean
}

const sampleNotifications: DigestNotification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Weekly digest sent successfully',
    message: 'Weekly regulatory digest for January 15th delivered to 47 subscribers',
    timestamp: '2024-01-15T09:00:00Z',
    read: false,
    metadata: {
      digestId: '1',
      recipientCount: 47
    }
  },
  {
    id: '2',
    type: 'warning',
    title: 'Critical regulatory update detected',
    message: 'FDA AI/ML guidance requires immediate attention - included in next digest',
    timestamp: '2024-01-14T16:30:00Z',
    read: true
  },
  {
    id: '3',
    type: 'info',
    title: 'New subscriber added',
    message: 'Michael Chen (regulatory@pharma.co) subscribed to weekly digests',
    timestamp: '2024-01-13T11:15:00Z',
    read: true
  },
  {
    id: '4',
    type: 'error',
    title: 'Digest delivery failed',
    message: '3 email addresses bounced during last digest delivery',
    timestamp: '2024-01-12T09:05:00Z',
    read: false,
    metadata: {
      digestId: '2',
      errorDetails: 'Invalid email addresses: old1@company.com, old2@company.com, old3@company.com'
    }
  }
]

const defaultSettings: NotificationSettings = {
  emailEnabled: true,
  desktopEnabled: false,
  digestGeneration: true,
  digestDelivery: true,
  subscriberChanges: true,
  systemErrors: true
}

export function DigestNotifications() {
  const [notifications, setNotifications] = useKV<DigestNotification[]>('digest-notifications', sampleNotifications)
  const [settings, setSettings] = useKV<NotificationSettings>('notification-settings', defaultSettings)
  const [showSettings, setShowSettings] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length
  const recentNotifications = notifications.slice(0, 10)

  const markAsRead = (id: string) => {
    setNotifications(current => 
      current.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(current => 
      current.map(notification => ({ ...notification, read: true }))
    )
  }

  const dismissNotification = (id: string) => {
    setNotifications(current => 
      current.filter(notification => notification.id !== id)
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(current => ({ ...current, [key]: value }))
  }

  if (showSettings) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Notification Settings</h3>
            <p className="text-sm text-muted-foreground">Configure when you receive digest notifications</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSettings(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery Channels</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch 
                  checked={settings.emailEnabled}
                  onCheckedChange={(value) => updateSetting('emailEnabled', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Desktop notifications</Label>
                  <p className="text-xs text-muted-foreground">Show browser notifications</p>
                </div>
                <Switch 
                  checked={settings.desktopEnabled}
                  onCheckedChange={(value) => updateSetting('desktopEnabled', value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Digest Events</CardTitle>
              <CardDescription>Notifications related to digest generation and delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Digest generation</Label>
                  <p className="text-xs text-muted-foreground">When digests are automatically generated</p>
                </div>
                <Switch 
                  checked={settings.digestGeneration}
                  onCheckedChange={(value) => updateSetting('digestGeneration', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Digest delivery</Label>
                  <p className="text-xs text-muted-foreground">Success/failure of digest sending</p>
                </div>
                <Switch 
                  checked={settings.digestDelivery}
                  onCheckedChange={(value) => updateSetting('digestDelivery', value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Events</CardTitle>
              <CardDescription>Other important system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Subscriber changes</Label>
                  <p className="text-xs text-muted-foreground">When users subscribe or unsubscribe</p>
                </div>
                <Switch 
                  checked={settings.subscriberChanges}
                  onCheckedChange={(value) => updateSetting('subscriberChanges', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">System errors</Label>
                  <p className="text-xs text-muted-foreground">Critical system errors and failures</p>
                </div>
                <Switch 
                  checked={settings.systemErrors}
                  onCheckedChange={(value) => updateSetting('systemErrors', value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Digest Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </Badge>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">Recent digest and system notifications</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {recentNotifications.map((notification, index) => (
            <Card 
              key={notification.id} 
              className={`transition-all duration-200 hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                        <Badge 
                          className={`${getNotificationBadgeColor(notification.type)} text-xs`}
                          variant="outline"
                        >
                          {notification.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      
                      {notification.metadata && (
                        <div className="space-y-1">
                          {notification.metadata.recipientCount && (
                            <div className="text-xs text-muted-foreground">
                              Recipients: {notification.metadata.recipientCount}
                            </div>
                          )}
                          {notification.metadata.errorDetails && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                              {notification.metadata.errorDetails}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(notification.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => dismissNotification(notification.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {recentNotifications.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  You'll see digest delivery updates and system notifications here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}