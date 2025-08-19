import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  Bell, 
  BellRinging,
  CheckCircle,
  Warning,
  Info,
  X,
  Webhook,
  ArrowSquareOut,
  Clock,
  FileText,
  Shield
} from '@phosphor-icons/react'

interface WebhookNotification {
  id: string
  type: 'guidance' | 'recall' | 'standard' | 'alert' | 'update'
  title: string
  description: string
  source: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  read: boolean
  actionRequired: boolean
  url?: string
  metadata: {
    document?: string
    version?: string
    changes?: string[]
    devices?: string[]
    standards?: string[]
  }
}

interface WebhookNotificationSystemProps {
  isMonitoring?: boolean
}

const MOCK_NOTIFICATIONS: WebhookNotification[] = [
  {
    id: 'notif-1',
    type: 'guidance',
    title: 'FDA AI/ML Guidance Updated',
    description: 'New requirements for AI/ML validation in medical devices',
    source: 'FDA Guidance Documents',
    severity: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
    actionRequired: true,
    url: 'https://fda.gov/guidance/ai-ml-2024',
    metadata: {
      document: 'AI/ML-Based Medical Device Software as Medical Device (SaMD)',
      version: '2.1',
      changes: [
        'Updated validation requirements',
        'New risk management guidance',
        'Enhanced cybersecurity considerations'
      ]
    }
  },
  {
    id: 'notif-2',
    type: 'recall',
    title: 'Class II Recall: Cardiac Monitor',
    description: 'Software malfunction affecting alarm functionality',
    source: 'FDA Device Recalls',
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    actionRequired: true,
    url: 'https://fda.gov/recalls/cardiac-monitor-xyz',
    metadata: {
      devices: ['Cardiac Monitor Model XYZ-2000'],
      document: 'Recall Notice #RC-2024-001'
    }
  },
  {
    id: 'notif-3',
    type: 'standard',
    title: 'ISO 13485:2016 Amendment Published',
    description: 'Amendment 1:2024 includes new cybersecurity requirements',
    source: 'ISO Standards Updates',
    severity: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
    read: true,
    actionRequired: false,
    metadata: {
      standards: ['ISO 13485:2016'],
      version: 'Amendment 1:2024',
      changes: [
        'Updated cybersecurity requirements',
        'AI/ML device considerations',
        'Risk management enhancements'
      ]
    }
  },
  {
    id: 'notif-4',
    type: 'alert',
    title: 'Compliance Gap Detected',
    description: 'Your QMS may be affected by recent FDA guidance changes',
    source: 'VirtualBackroom Analysis',
    severity: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    read: false,
    actionRequired: true,
    metadata: {
      document: 'Gap Analysis Report #GA-2024-003'
    }
  }
]

export function WebhookNotificationSystem({ isMonitoring = false }: WebhookNotificationSystemProps) {
  const [notifications, setNotifications] = useKV<WebhookNotification[]>('webhook-notifications', MOCK_NOTIFICATIONS)
  const [isExpanded, setIsExpanded] = useState(false)

  // Simulate new notifications when monitoring is active
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 10 seconds
        const newNotification: WebhookNotification = {
          id: `notif-${Date.now()}`,
          type: ['guidance', 'recall', 'standard', 'alert'][Math.floor(Math.random() * 4)] as any,
          title: `New Regulatory Update ${Math.floor(Math.random() * 1000)}`,
          description: 'Real-time update from regulatory database',
          source: 'Regulatory Database',
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          timestamp: new Date().toISOString(),
          read: false,
          actionRequired: Math.random() > 0.5,
          metadata: {}
        }

        setNotifications(current => [newNotification, ...current.slice(0, 49)])
        
        toast.success('New regulatory notification received', {
          description: newNotification.title,
          action: {
            label: 'View',
            onClick: () => setIsExpanded(true)
          }
        })
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [isMonitoring, setNotifications])

  const unreadCount = notifications.filter(n => !n.read).length
  const criticalCount = notifications.filter(n => n.severity === 'critical' && !n.read).length
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(current =>
      current.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(current =>
      current.map(n => ({ ...n, read: true }))
    )
  }

  const handleDismiss = (notificationId: string) => {
    setNotifications(current =>
      current.filter(n => n.id !== notificationId)
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200'
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-500 bg-blue-50 border-blue-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guidance': return <FileText className="w-4 h-4" />
      case 'recall': return <Warning className="w-4 h-4" />
      case 'standard': return <Shield className="w-4 h-4" />
      case 'alert': return <Bell className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="relative shadow-lg"
          size="lg"
        >
          {criticalCount > 0 ? (
            <BellRinging className="w-5 h-5 mr-2 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5 mr-2" />
          )}
          Notifications
          {unreadCount > 0 && (
            <Badge className="ml-2 px-1.5 py-0.5 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] bg-background border rounded-lg shadow-xl">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center space-x-2">
              <Webhook className="w-5 h-5" />
              <span>Live Notifications</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread • {actionRequiredCount} require action
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="max-h-96">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-0">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-1 rounded ${getSeverityColor(notification.severity)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {notification.source}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getSeverityColor(notification.severity)}`}
                          >
                            {notification.severity}
                          </Badge>
                          {notification.actionRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(notification.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {notification.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(notification.url, '_blank')}
                        >
                          <ArrowSquareOut className="w-4 h-4" />
                        </Button>
                      )}
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(notification.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {notification.metadata && (
                    <div className="mt-3 pl-7">
                      {notification.metadata.changes && (
                        <div className="text-xs text-muted-foreground">
                          <strong>Changes:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {notification.metadata.changes.map((change, i) => (
                              <li key={i}>{change}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {notification.metadata.devices && (
                        <div className="text-xs text-muted-foreground mt-2">
                          <strong>Affected Devices:</strong> {notification.metadata.devices.join(', ')}
                        </div>
                      )}
                      {notification.metadata.standards && (
                        <div className="text-xs text-muted-foreground mt-2">
                          <strong>Standards:</strong> {notification.metadata.standards.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  {notification.actionRequired && !notification.read && (
                    <Alert className="mt-3 ml-7">
                      <Warning className="w-4 h-4" />
                      <AlertDescription className="text-sm">
                        This notification requires your attention and may impact compliance.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                {index < notifications.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}