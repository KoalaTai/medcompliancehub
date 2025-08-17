import { useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface RegulatoryNotification {
  id: string
  title: string
  description: string
  regulation: string
  severity: 'high' | 'medium' | 'low'
  type: 'new_rule' | 'amendment' | 'guidance' | 'deadline'
  publishedAt: string
  effectiveDate?: string
  read: boolean
  dismissed: boolean
  affectedSystems?: string[]
  actionRequired: boolean
}

interface NotificationSettings {
  enabled: boolean
  criticalAlerts: boolean
  emailNotifications: boolean
  desktopNotifications: boolean
  severityFilter: 'all' | 'high' | 'critical'
  mutedRegulations: string[]
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  criticalAlerts: true,
  emailNotifications: true,
  desktopNotifications: true,
  severityFilter: 'all',
  mutedRegulations: []
}

export function useNotificationService() {
  const [notifications, setNotifications] = useKV<RegulatoryNotification[]>('regulatory-notifications', [])
  const [settings, setSettings] = useKV<NotificationSettings>('notification-settings', defaultSettings)

  // Simulate real-time notifications (in a real app, this would connect to a WebSocket or SSE)
  const simulateRealTimeUpdates = useCallback(() => {
    if (!settings.enabled) return

    const newNotifications: RegulatoryNotification[] = [
      {
        id: `notification-${Date.now()}`,
        title: 'FDA Issues Emergency Use Authorization Update',
        description: 'New EUA requirements for AI-based diagnostic tools in emergency situations.',
        regulation: 'FDA EUA Guidance',
        severity: 'high',
        type: 'guidance',
        publishedAt: new Date().toISOString(),
        effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        read: false,
        dismissed: false,
        affectedSystems: ['AI Diagnostics', 'Emergency Protocols'],
        actionRequired: true
      }
    ]

    // Add new notifications if they don't already exist
    setNotifications(current => {
      const existingIds = new Set(current.map(n => n.id))
      const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id))
      
      if (uniqueNew.length > 0) {
        // Show toast notification for new updates
        uniqueNew.forEach(notification => {
          if (settings.desktopNotifications) {
            toast(notification.title, {
              description: notification.description,
              action: {
                label: 'View',
                onClick: () => console.log('View notification', notification.id)
              }
            })
          }
        })
        
        return [...current, ...uniqueNew]
      }
      
      return current
    })
  }, [settings, setNotifications])

  // Request desktop notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }, [])

  // Send desktop notification
  const sendDesktopNotification = useCallback((notification: RegulatoryNotification) => {
    if (!settings.desktopNotifications || Notification.permission !== 'granted') return

    const desktopNotification = new Notification(notification.title, {
      body: notification.description,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.severity === 'high'
    })

    desktopNotification.onclick = () => {
      window.focus()
      desktopNotification.close()
    }

    // Auto-close after 10 seconds for non-critical notifications
    if (notification.severity !== 'high') {
      setTimeout(() => desktopNotification.close(), 10000)
    }
  }, [settings.desktopNotifications])

  // Check for regulatory updates (simulated API call)
  const checkForUpdates = useCallback(async () => {
    if (!settings.enabled) return

    try {
      // In a real app, this would be an API call to your regulatory monitoring service
      // const response = await fetch('/api/regulatory/updates')
      // const updates = await response.json()
      
      // For demo, we'll simulate finding new updates occasionally
      if (Math.random() < 0.1) { // 10% chance of new update
        simulateRealTimeUpdates()
      }
    } catch (error) {
      console.error('Failed to check for regulatory updates:', error)
    }
  }, [settings.enabled, simulateRealTimeUpdates])

  // Set up periodic checking for updates
  useEffect(() => {
    if (!settings.enabled) return

    const interval = setInterval(checkForUpdates, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [settings.enabled, checkForUpdates])

  // Initialize notification permission on first load
  useEffect(() => {
    if (settings.desktopNotifications && settings.enabled) {
      requestNotificationPermission()
    }
  }, [settings.desktopNotifications, settings.enabled, requestNotificationPermission])

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(current => ({ ...current, ...newSettings }))
  }, [setSettings])

  const markAsRead = useCallback((id: string) => {
    setNotifications(current => 
      current.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [setNotifications])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(current => 
      current.map(n => n.id === id ? { ...n, dismissed: true } : n)
    )
  }, [setNotifications])

  const markAllAsRead = useCallback(() => {
    setNotifications(current => 
      current.map(n => ({ ...n, read: true }))
    )
  }, [setNotifications])

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read && !n.dismissed).length
  }, [notifications])

  const getCriticalCount = useCallback(() => {
    return notifications.filter(n => n.severity === 'high' && !n.dismissed).length
  }, [notifications])

  return {
    notifications,
    settings,
    updateSettings,
    markAsRead,
    dismissNotification,
    markAllAsRead,
    getUnreadCount,
    getCriticalCount,
    checkForUpdates,
    requestNotificationPermission
  }
}