import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useWebhookMonitoring, useWebhookEvents, type WebhookEvent as ServiceWebhookEvent } from '@/hooks/useWebhookMonitoring'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  Plus, 
  Webhook, 
  Activity, 
  Settings, 
  Trash2, 
  Eye, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Database,
  Bell,
  Filter,
  Play,
  Pause
} from '@phosphor-icons/react'

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  database: string
  events: string[]
  filters: WebhookFilter[]
  headers: Record<string, string>
  active: boolean
  lastTriggered?: string
  status: 'active' | 'error' | 'inactive'
  totalRequests: number
  successRate: number
  created: string
}

interface WebhookFilter {
  field: string
  operator: 'equals' | 'contains' | 'startsWith' | 'regex'
  value: string
}

interface WebhookEvent {
  id: string
  webhookId: string
  database: string
  eventType: string
  payload: any
  timestamp: string
  status: 'success' | 'failed' | 'pending'
  responseCode?: number
  responseTime?: number
  error?: string
}

interface DatabaseSource {
  id: string
  name: string
  type: 'fda' | 'ema' | 'iso' | 'custom'
  endpoint: string
  description: string
  available: boolean
}

const REGULATORY_DATABASES: DatabaseSource[] = [
  {
    id: 'fda-guidance',
    name: 'FDA Guidance Documents',
    type: 'fda',
    endpoint: 'https://api.fda.gov/guidance',
    description: 'Real-time updates from FDA guidance database',
    available: true
  },
  {
    id: 'fda-recalls',
    name: 'FDA Device Recalls',
    type: 'fda',
    endpoint: 'https://api.fda.gov/device/recall',
    description: 'Medical device recall notifications',
    available: true
  },
  {
    id: 'ema-updates',
    name: 'EMA Regulatory Updates',
    type: 'ema',
    endpoint: 'https://api.ema.europa.eu/updates',
    description: 'European Medicines Agency updates',
    available: true
  },
  {
    id: 'iso-standards',
    name: 'ISO Standards Updates',
    type: 'iso',
    endpoint: 'https://api.iso.org/standards',
    description: 'ISO standard revisions and new releases',
    available: true
  }
]

const EVENT_TYPES = [
  'document.created',
  'document.updated',
  'document.withdrawn',
  'guidance.published',
  'recall.issued',
  'standard.revised',
  'compliance.alert'
]

export function WebhookIntegrations() {
  const [webhooks, setWebhooks] = useKV<WebhookEndpoint[]>('webhook-endpoints', [])
  const [webhookEvents, setWebhookEvents] = useKV<WebhookEvent[]>('webhook-events', [])
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isMonitoring, setIsMonitoring] = useKV('webhook-monitoring', false)
  const [eventFilter, setEventFilter] = useState<string>('all')

  const { startMonitoring, stopMonitoring } = useWebhookMonitoring()

  // Handle webhook monitoring toggle
  useEffect(() => {
    if (isMonitoring) {
      startMonitoring()
    } else {
      stopMonitoring()
    }
  }, [isMonitoring, startMonitoring, stopMonitoring])

  // Listen for webhook events from the service
  useWebhookEvents((event: ServiceWebhookEvent) => {
    const matchingWebhook = webhooks.find(w => w.database === event.source && w.active)
    if (matchingWebhook) {
      const newEvent: WebhookEvent = {
        id: event.id,
        webhookId: matchingWebhook.id,
        database: event.source,
        eventType: event.type,
        payload: event.data,
        timestamp: event.timestamp,
        status: Math.random() > 0.1 ? 'success' : 'failed',
        responseCode: Math.random() > 0.1 ? 200 : 500,
        responseTime: Math.floor(Math.random() * 500) + 100
      }

      setWebhookEvents(current => [newEvent, ...current.slice(0, 99)])
      
      // Update webhook stats
      setWebhooks(current => 
        current.map(webhook => 
          webhook.id === matchingWebhook.id
            ? {
                ...webhook,
                lastTriggered: new Date().toISOString(),
                totalRequests: webhook.totalRequests + 1,
                status: newEvent.status === 'success' ? 'active' : 'error'
              }
            : webhook
        )
      )
    }
  })

  const generateMockPayload = () => {
    const payloads = [
      {
        type: 'guidance_update',
        document: 'FDA Guidance on AI/ML-Based Medical Device Software',
        version: '2.1',
        changes: ['Updated validation requirements', 'New risk management guidance']
      },
      {
        type: 'recall_notice',
        device: 'Cardiac Monitor Model XYZ',
        severity: 'Class II',
        reason: 'Software malfunction affecting alarm functionality'
      },
      {
        type: 'standard_revision',
        standard: 'ISO 13485:2016',
        amendment: 'Amendment 1:2024',
        changes: ['Updated cybersecurity requirements', 'AI/ML device considerations']
      }
    ]
    return payloads[Math.floor(Math.random() * payloads.length)]
  }

  const handleCreateWebhook = (webhookData: Partial<WebhookEndpoint>) => {
    const newWebhook: WebhookEndpoint = {
      id: `wh-${Date.now()}`,
      name: webhookData.name || 'Untitled Webhook',
      url: webhookData.url || '',
      database: webhookData.database || '',
      events: webhookData.events || [],
      filters: webhookData.filters || [],
      headers: webhookData.headers || {},
      active: true,
      status: 'active',
      totalRequests: 0,
      successRate: 100,
      created: new Date().toISOString(),
      ...webhookData
    }

    setWebhooks(current => [...current, newWebhook])
    setIsCreateDialogOpen(false)
    toast.success('Webhook endpoint created successfully')
  }

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks(current => current.filter(w => w.id !== webhookId))
    setWebhookEvents(current => current.filter(e => e.webhookId !== webhookId))
    toast.success('Webhook endpoint deleted')
  }

  const handleToggleWebhook = (webhookId: string, active: boolean) => {
    setWebhooks(current =>
      current.map(w =>
        w.id === webhookId
          ? { ...w, active, status: active ? 'active' : 'inactive' }
          : w
      )
    )
  }

  const filteredEvents = webhookEvents.filter(event => {
    if (eventFilter === 'all') return true
    return event.status === eventFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'inactive': return <Pause className="w-4 h-4 text-gray-500" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Webhook Integrations</h2>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of regulatory databases with automated notifications
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isMonitoring}
              onCheckedChange={setIsMonitoring}
              id="monitoring-toggle"
            />
            <Label htmlFor="monitoring-toggle" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Live Monitoring</span>
            </Label>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <CreateWebhookForm onSubmit={handleCreateWebhook} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhooks.filter(w => w.active).length}</div>
            <p className="text-xs text-muted-foreground">
              {webhooks.length} total endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Events Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhookEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              {webhookEvents.filter(e => e.status === 'success').length} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webhookEvents.length > 0 
                ? Math.round((webhookEvents.filter(e => e.status === 'success').length / webhookEvents.length) * 100)
                : 100}%
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webhookEvents.length > 0
                ? Math.round(webhookEvents.reduce((acc, e) => acc + (e.responseTime || 0), 0) / webhookEvents.length)
                : 0}ms
            </div>
            <p className="text-xs text-muted-foreground">Across all endpoints</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList>
          <TabsTrigger value="endpoints" className="flex items-center space-x-2">
            <Webhook className="w-4 h-4" />
            <span>Endpoints</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Event Log</span>
          </TabsTrigger>
          <TabsTrigger value="databases" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Data Sources</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          {webhooks.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Webhook className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No webhook endpoints configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first webhook to start receiving real-time regulatory updates
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Webhook
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(webhook.status)}
                        <div>
                          <CardTitle className="text-lg">{webhook.name}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <span>{webhook.url}</span>
                            <Badge variant="secondary">{webhook.database}</Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={webhook.active}
                          onCheckedChange={(active) => handleToggleWebhook(webhook.id, active)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWebhook(webhook)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Events</div>
                        <div className="font-medium">{webhook.events.join(', ')}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Requests</div>
                        <div className="font-medium">{webhook.totalRequests}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Success Rate</div>
                        <div className="font-medium">{webhook.successRate}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Triggered</div>
                        <div className="font-medium">
                          {webhook.lastTriggered 
                            ? new Date(webhook.lastTriggered).toLocaleString()
                            : 'Never'
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center space-x-4">
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="success">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {filteredEvents.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No events found for the selected filter
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredEvents.map((event, index) => (
                      <div key={event.id}>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {event.status === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : event.status === 'failed' ? (
                                <XCircle className="w-4 h-4 text-red-500" />
                              ) : (
                                <Activity className="w-4 h-4 text-yellow-500" />
                              )}
                              <div>
                                <div className="font-medium">{event.eventType}</div>
                                <div className="text-sm text-muted-foreground">
                                  {event.database} • {new Date(event.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              {event.responseCode && (
                                <Badge variant={event.status === 'success' ? 'default' : 'destructive'}>
                                  {event.responseCode}
                                </Badge>
                              )}
                              {event.responseTime && (
                                <div className="text-muted-foreground mt-1">
                                  {event.responseTime}ms
                                </div>
                              )}
                            </div>
                          </div>
                          {event.error && (
                            <Alert className="mt-2">
                              <AlertTriangle className="w-4 h-4" />
                              <AlertDescription>{event.error}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                        {index < filteredEvents.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="databases" className="space-y-4">
          <div className="grid gap-4">
            {REGULATORY_DATABASES.map((db) => (
              <Card key={db.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5" />
                      <div>
                        <CardTitle>{db.name}</CardTitle>
                        <CardDescription>{db.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={db.available ? 'default' : 'secondary'}>
                        {db.available ? 'Available' : 'Unavailable'}
                      </Badge>
                      <Badge variant="outline">{db.type.toUpperCase()}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <strong>Endpoint:</strong> {db.endpoint}
                  </div>
                  <div className="mt-2">
                    <strong className="text-sm">Connected Webhooks:</strong>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {webhooks.filter(w => w.database === db.id).length} active
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedWebhook && (
        <WebhookDetailsDialog
          webhook={selectedWebhook}
          isOpen={!!selectedWebhook}
          onClose={() => setSelectedWebhook(null)}
          events={webhookEvents.filter(e => e.webhookId === selectedWebhook.id)}
        />
      )}
    </div>
  )
}

function CreateWebhookForm({ onSubmit }: { onSubmit: (data: Partial<WebhookEndpoint>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    database: '',
    events: [] as string[],
    headers: {} as Record<string, string>
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.url || !formData.database) {
      toast.error('Please fill in all required fields')
      return
    }
    onSubmit(formData)
  }

  const handleEventToggle = (event: string) => {
    setFormData(current => ({
      ...current,
      events: current.events.includes(event)
        ? current.events.filter(e => e !== event)
        : [...current.events, event]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>Create Webhook Endpoint</DialogTitle>
        <DialogDescription>
          Configure a new webhook to receive real-time regulatory database updates
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-name">Webhook Name *</Label>
          <Input
            id="webhook-name"
            value={formData.name}
            onChange={(e) => setFormData(current => ({ ...current, name: e.target.value }))}
            placeholder="e.g., FDA Guidance Monitor"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook-url">Endpoint URL *</Label>
          <Input
            id="webhook-url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(current => ({ ...current, url: e.target.value }))}
            placeholder="https://your-app.com/webhooks/regulatory"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="database-select">Database Source *</Label>
          <Select value={formData.database} onValueChange={(value) => setFormData(current => ({ ...current, database: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a database" />
            </SelectTrigger>
            <SelectContent>
              {REGULATORY_DATABASES.map((db) => (
                <SelectItem key={db.id} value={db.id} disabled={!db.available}>
                  {db.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Event Types</Label>
          <div className="grid grid-cols-2 gap-2">
            {EVENT_TYPES.map((event) => (
              <div key={event} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={event}
                  checked={formData.events.includes(event)}
                  onChange={() => handleEventToggle(event)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={event} className="text-sm">{event}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Create Webhook</Button>
      </div>
    </form>
  )
}

function WebhookDetailsDialog({ 
  webhook, 
  isOpen, 
  onClose, 
  events 
}: { 
  webhook: WebhookEndpoint
  isOpen: boolean
  onClose: () => void
  events: WebhookEvent[]
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{webhook.name}</DialogTitle>
          <DialogDescription>Webhook endpoint details and recent activity</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>URL</Label>
              <div className="font-mono text-sm bg-muted p-2 rounded">{webhook.url}</div>
            </div>
            <div>
              <Label>Database</Label>
              <div className="font-medium">{webhook.database}</div>
            </div>
          </div>

          <div>
            <Label>Event Types</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {webhook.events.map((event) => (
                <Badge key={event} variant="outline">{event}</Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Recent Events</Label>
            <ScrollArea className="h-64 mt-2">
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No events recorded for this webhook
                </div>
              ) : (
                <div className="space-y-2">
                  {events.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        {event.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium">{event.eventType}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}