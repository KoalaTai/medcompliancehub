import React from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Webhook, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  AlertTriangle,
  TrendUp,
  ArrowRight
} from '@phosphor-icons/react'

interface WebhookStatusWidgetProps {
  showDetails?: boolean
  onViewAll?: () => void
}

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  database: string
  active: boolean
  status: 'active' | 'error' | 'inactive'
  totalRequests: number
  successRate: number
  lastTriggered?: string
}

interface WebhookEvent {
  id: string
  webhookId: string
  timestamp: string
  status: 'success' | 'failed' | 'pending'
}

export function WebhookStatusWidget({ showDetails = true, onViewAll }: WebhookStatusWidgetProps) {
  const [webhooks] = useKV<WebhookEndpoint[]>('webhook-endpoints', [])
  const [webhookEvents] = useKV<WebhookEvent[]>('webhook-events', [])
  const [isMonitoring] = useKV('webhook-monitoring', false)

  const activeWebhooks = webhooks.filter(w => w.active)
  const totalRequests = webhooks.reduce((sum, w) => sum + w.totalRequests, 0)
  const recentEvents = webhookEvents.slice(0, 10)
  const todayEvents = webhookEvents.filter(e => {
    const eventDate = new Date(e.timestamp).toDateString()
    const today = new Date().toDateString()
    return eventDate === today
  })

  const successRate = webhookEvents.length > 0 
    ? Math.round((webhookEvents.filter(e => e.status === 'success').length / webhookEvents.length) * 100)
    : 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Webhook className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Webhook Integrations</CardTitle>
              <CardDescription>Real-time regulatory monitoring status</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isMonitoring ? (
              <Badge className="bg-green-100 text-green-700">
                <Activity className="w-3 h-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary">
                Inactive
              </Badge>
            )}
            {onViewAll && (
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{activeWebhooks.length}</div>
            <div className="text-xs text-muted-foreground">Active Webhooks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{todayEvents.length}</div>
            <div className="text-xs text-muted-foreground">Events Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalRequests}</div>
            <div className="text-xs text-muted-foreground">Total Requests</div>
          </div>
        </div>

        {showDetails && webhooks.length > 0 && (
          <>
            {/* Active Webhooks Status */}
            <div>
              <h4 className="text-sm font-medium mb-2">Endpoint Status</h4>
              <div className="space-y-2">
                {webhooks.slice(0, 3).map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      {webhook.status === 'active' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : webhook.status === 'error' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Activity className="w-4 h-4 text-gray-500" />
                      )}
                      <div>
                        <div className="text-sm font-medium">{webhook.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {webhook.database}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(webhook.status)}`}>
                        {webhook.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {webhook.totalRequests} requests
                      </div>
                    </div>
                  </div>
                ))}
                {webhooks.length > 3 && (
                  <div className="text-center py-2">
                    <Button variant="ghost" size="sm" onClick={onViewAll}>
                      View all {webhooks.length} webhooks
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
                <TrendUp className="w-4 h-4" />
                <span>Recent Activity</span>
              </h4>
              {recentEvents.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No recent webhook events
                </div>
              ) : (
                <div className="space-y-1">
                  {recentEvents.slice(0, 3).map((event) => {
                    const webhook = webhooks.find(w => w.id === event.webhookId)
                    return (
                      <div key={event.id} className="flex items-center justify-between py-1 text-sm">
                        <div className="flex items-center space-x-2">
                          {event.status === 'success' ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : event.status === 'failed' ? (
                            <XCircle className="w-3 h-3 text-red-500" />
                          ) : (
                            <Activity className="w-3 h-3 text-yellow-500" />
                          )}
                          <span className="truncate">
                            {webhook?.name || 'Unknown webhook'}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    )
                  })}
                  {recentEvents.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" onClick={onViewAll}>
                        View all activity
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {webhooks.length === 0 && (
          <div className="text-center py-6">
            <Webhook className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No webhook endpoints configured
            </p>
            {onViewAll && (
              <Button variant="outline" size="sm" onClick={onViewAll}>
                Set up webhooks
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function WebhookHealthIndicator() {
  const [webhooks] = useKV<WebhookEndpoint[]>('webhook-endpoints', [])
  const [webhookEvents] = useKV<WebhookEvent[]>('webhook-events', [])
  const [isMonitoring] = useKV('webhook-monitoring', false)

  const activeWebhooks = webhooks.filter(w => w.active)
  const errorWebhooks = webhooks.filter(w => w.status === 'error')
  const recentFailures = webhookEvents.filter(e => {
    const isRecent = Date.now() - new Date(e.timestamp).getTime() < 60 * 60 * 1000 // 1 hour
    return e.status === 'failed' && isRecent
  })

  if (!isMonitoring) {
    return (
      <Badge variant="secondary" className="text-xs">
        <Activity className="w-3 h-3 mr-1" />
        Monitoring Off
      </Badge>
    )
  }

  if (errorWebhooks.length > 0 || recentFailures.length > 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {errorWebhooks.length > 0 ? `${errorWebhooks.length} Error` : `${recentFailures.length} Failures`}
      </Badge>
    )
  }

  return (
    <Badge className="bg-green-100 text-green-700 text-xs">
      <CheckCircle2 className="w-3 h-3 mr-1" />
      {activeWebhooks.length} Active
    </Badge>
  )
}