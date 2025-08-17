import { useState } from 'react'
import { Bell, X, Warning, CheckCircle, Clock, ArrowRight, Settings } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useNotificationService } from '@/hooks/useNotificationService'

export function RegulatoryNotifications() {
  const { 
    notifications, 
    settings, 
    updateSettings,
    markAsRead, 
    dismissNotification, 
    markAllAsRead,
    getUnreadCount
  } = useNotificationService()
  
  const [open, setOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const unreadCount = getUnreadCount()
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.dismissed).length
  const visibleNotifications = notifications.filter(n => !n.dismissed)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-amber-600 bg-amber-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_rule': return <Warning className="h-4 w-4" />
      case 'amendment': return <CheckCircle className="h-4 w-4" />
      case 'guidance': return <CheckCircle className="h-4 w-4" />
      case 'deadline': return <Clock className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (showSettings) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Notification Settings</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Enable Notifications</div>
                  <div className="text-xs text-muted-foreground">
                    Receive regulatory update notifications
                  </div>
                </div>
                <Switch 
                  checked={settings.enabled}
                  onCheckedChange={(enabled) => updateSettings({ enabled })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Desktop Notifications</div>
                  <div className="text-xs text-muted-foreground">
                    Show browser notifications
                  </div>
                </div>
                <Switch 
                  checked={settings.desktopNotifications}
                  onCheckedChange={(desktopNotifications) => updateSettings({ desktopNotifications })}
                  disabled={!settings.enabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Critical Alerts</div>
                  <div className="text-xs text-muted-foreground">
                    Immediate alerts for critical updates
                  </div>
                </div>
                <Switch 
                  checked={settings.criticalAlerts}
                  onCheckedChange={(criticalAlerts) => updateSettings({ criticalAlerts })}
                  disabled={!settings.enabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Email Notifications</div>
                  <div className="text-xs text-muted-foreground">
                    Daily digest of updates
                  </div>
                </div>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={(emailNotifications) => updateSettings({ emailNotifications })}
                  disabled={!settings.enabled}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-3">
          <div>
            <h3 className="font-semibold">Regulatory Updates</h3>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread • {actionRequiredCount} require action
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Separator />
        
        {visibleNotifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No regulatory updates</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="p-2 space-y-2">
              {visibleNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.read ? 'border-l-4 border-l-primary bg-accent/20' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${getSeverityColor(notification.severity)}`}>
                            {getTypeIcon(notification.type)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {notification.regulation}
                          </Badge>
                          {notification.actionRequired && (
                            <Badge className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-100">
                              Action Required
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="text-sm font-medium leading-tight">
                          {notification.title}
                        </h4>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Published {formatDate(notification.publishedAt)}</span>
                          {notification.effectiveDate && (
                            <span>Effective {formatDate(notification.effectiveDate)}</span>
                          )}
                        </div>
                        
                        {notification.affectedSystems && notification.affectedSystems.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {notification.affectedSystems.slice(0, 2).map((system) => (
                              <Badge key={system} variant="secondary" className="text-xs">
                                {system}
                              </Badge>
                            ))}
                            {notification.affectedSystems.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{notification.affectedSystems.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-50 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            dismissNotification(notification.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <ArrowRight className="h-3 w-3 opacity-30" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <Separator />
        <div className="p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <ArrowRight className="h-4 w-4 mr-2" />
            View all regulatory updates
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}