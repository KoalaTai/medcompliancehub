import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  Bell,
  Mail,
  Settings,
  Plus,
  Edit,
  Trash,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertTriangle,
  Filter,
  Calendar,
  BookOpen,
  RefreshCw,
  Globe,
  Activity,
  TestTube,
  Eye,
  Copy
} from '@phosphor-icons/react'

interface EmailNotificationRule {
  id: string
  name: string
  description: string
  isActive: boolean
  triggers: {
    newResources: boolean
    updatedResources: boolean
    syncSuccess: boolean
    syncFailure: boolean
    certificationAvailable: boolean
    deadlineReminders: boolean
  }
  platforms: string[] // Empty array means all platforms
  recipients: string[]
  template: {
    subject: string
    body: string
  }
  schedule: {
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
    time?: string // For scheduled notifications
    dayOfWeek?: number // For weekly (0 = Sunday)
    dayOfMonth?: number // For monthly
  }
  filters: {
    minResources?: number
    resourceTypes?: string[]
    difficulties?: string[]
    topics?: string[]
  }
  lastTriggered?: string
  totalSent: number
  createdAt: string
  updatedAt: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
  isDefault: boolean
  category: 'sync' | 'resources' | 'reminders' | 'alerts'
}

interface NotificationLog {
  id: string
  ruleId: string
  ruleName: string
  triggerType: string
  platform?: string
  recipients: string[]
  subject: string
  status: 'sent' | 'failed' | 'pending'
  sentAt: string
  resourcesCount?: number
  errorMessage?: string
}

// Default email templates
const defaultTemplates: EmailTemplate[] = [
  {
    id: 'new-resources',
    name: 'New Resources Available',
    subject: 'New Learning Resources Available - {PLATFORM_NAME}',
    body: `Hi there,

We've just synced {RESOURCE_COUNT} new learning resources from {PLATFORM_NAME}!

Here are some highlights:
{RESOURCE_LIST}

You can view and access these resources in your VirtualBackroom dashboard.

Best regards,
VirtualBackroom Team`,
    variables: ['PLATFORM_NAME', 'RESOURCE_COUNT', 'RESOURCE_LIST', 'SYNC_TIME'],
    isDefault: true,
    category: 'resources'
  },
  {
    id: 'sync-failure',
    name: 'Sync Failure Alert',
    subject: 'Learning Resource Sync Failed - {PLATFORM_NAME}',
    body: `Alert: Learning Resource Sync Issue

We encountered an issue while syncing learning resources from {PLATFORM_NAME}.

Error Details:
- Platform: {PLATFORM_NAME}
- Error: {ERROR_MESSAGE}
- Failed at: {SYNC_TIME}
- Resources affected: {RESOURCE_COUNT}

Please check your platform connection settings and try syncing again.

VirtualBackroom Support`,
    variables: ['PLATFORM_NAME', 'ERROR_MESSAGE', 'SYNC_TIME', 'RESOURCE_COUNT'],
    isDefault: true,
    category: 'alerts'
  },
  {
    id: 'weekly-digest',
    name: 'Weekly Learning Digest',
    subject: 'Your Weekly Learning Update - {RESOURCE_COUNT} New Resources',
    body: `Weekly Learning Resource Update

This week we've added {RESOURCE_COUNT} new resources to your library:

{RESOURCE_SUMMARY}

Popular Topics This Week:
{POPULAR_TOPICS}

Don't forget to check out your personalized learning recommendations!

Happy Learning,
VirtualBackroom Team`,
    variables: ['RESOURCE_COUNT', 'RESOURCE_SUMMARY', 'POPULAR_TOPICS', 'WEEK_RANGE'],
    isDefault: true,
    category: 'sync'
  }
]

export function LearningResourceNotifications() {
  const [notificationRules, setNotificationRules] = useKV<EmailNotificationRule[]>('notification-rules', [])
  const [emailTemplates, setEmailTemplates] = useKV<EmailTemplate[]>('email-templates', defaultTemplates)
  const [notificationLogs, setNotificationLogs] = useKV<NotificationLog[]>('notification-logs', [])
  
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<EmailNotificationRule | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  
  // Form state for new/edit rule
  const [ruleForm, setRuleForm] = useState<Partial<EmailNotificationRule>>({
    name: '',
    description: '',
    isActive: true,
    triggers: {
      newResources: true,
      updatedResources: false,
      syncSuccess: false,
      syncFailure: true,
      certificationAvailable: false,
      deadlineReminders: false
    },
    platforms: [],
    recipients: [''],
    template: {
      subject: 'New Learning Resources - {PLATFORM_NAME}',
      body: ''
    },
    schedule: {
      frequency: 'immediate'
    },
    filters: {},
    totalSent: 0
  })

  // Form state for templates
  const [templateForm, setTemplateForm] = useState<Partial<EmailTemplate>>({
    name: '',
    subject: '',
    body: '',
    variables: [],
    isDefault: false,
    category: 'resources'
  })

  // Mock platforms for demonstration
  const platforms = [
    { id: 'coursera', name: 'Coursera', icon: '🎓' },
    { id: 'linkedin', name: 'LinkedIn Learning', icon: '💼' },
    { id: 'complianceai', name: 'ComplianceAI Academy', icon: '🛡️' },
    { id: 'iapp', name: 'IAPP Training', icon: '🏆' }
  ]

  // Listen for sync events to trigger notifications
  useEffect(() => {
    const handleResourceSync = (event: CustomEvent) => {
      const { platform, resourcesAdded, resourcesUpdated, status, error } = event.detail
      processNotificationTriggers('sync', { platform, resourcesAdded, resourcesUpdated, status, error })
    }

    const handleNewResources = (event: CustomEvent) => {
      const { platform, resources } = event.detail
      processNotificationTriggers('new_resources', { platform, resources })
    }

    window.addEventListener('learning-resource-sync', handleResourceSync as EventListener)
    window.addEventListener('new-learning-resources', handleNewResources as EventListener)

    return () => {
      window.removeEventListener('learning-resource-sync', handleResourceSync as EventListener)
      window.removeEventListener('new-learning-resources', handleNewResources as EventListener)
    }
  }, [notificationRules])

  const processNotificationTriggers = async (triggerType: string, data: any) => {
    const activeRules = notificationRules.filter(rule => rule.isActive)
    
    for (const rule of activeRules) {
      let shouldTrigger = false
      
      // Check trigger conditions
      if (triggerType === 'sync' && data.status === 'success' && rule.triggers.syncSuccess) {
        shouldTrigger = true
      } else if (triggerType === 'sync' && data.status === 'error' && rule.triggers.syncFailure) {
        shouldTrigger = true
      } else if (triggerType === 'new_resources' && rule.triggers.newResources) {
        shouldTrigger = true
      } else if (triggerType === 'updated_resources' && rule.triggers.updatedResources) {
        shouldTrigger = true
      }

      // Check platform filter
      if (shouldTrigger && rule.platforms.length > 0 && !rule.platforms.includes(data.platform)) {
        shouldTrigger = false
      }

      // Check minimum resources filter
      if (shouldTrigger && rule.filters.minResources && 
          (data.resourcesAdded || 0) + (data.resourcesUpdated || 0) < rule.filters.minResources) {
        shouldTrigger = false
      }

      if (shouldTrigger) {
        await sendNotification(rule, data)
      }
    }
  }

  const sendNotification = async (rule: EmailNotificationRule, data: any) => {
    try {
      const platform = platforms.find(p => p.id === data.platform)
      const platformName = platform?.name || data.platform
      
      // Process template variables
      let subject = rule.template.subject
      let body = rule.template.body
      
      // Replace common variables
      subject = subject.replace('{PLATFORM_NAME}', platformName)
      subject = subject.replace('{RESOURCE_COUNT}', (data.resourcesAdded || 0).toString())
      
      body = body.replace('{PLATFORM_NAME}', platformName)
      body = body.replace('{RESOURCE_COUNT}', (data.resourcesAdded || 0).toString())
      body = body.replace('{SYNC_TIME}', new Date().toLocaleString())
      body = body.replace('{ERROR_MESSAGE}', data.error || 'N/A')
      
      // Create resource list if available
      if (data.resources && data.resources.length > 0) {
        const resourceList = data.resources.slice(0, 5).map((resource: any, index: number) => 
          `${index + 1}. ${resource.title} (${resource.type})`
        ).join('\n')
        body = body.replace('{RESOURCE_LIST}', resourceList)
      }

      // Simulate email sending (in real implementation, this would call an email service)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Log the notification
      const log: NotificationLog = {
        id: Date.now().toString(),
        ruleId: rule.id,
        ruleName: rule.name,
        triggerType: data.status || 'resource_update',
        platform: data.platform,
        recipients: rule.recipients,
        subject,
        status: Math.random() > 0.1 ? 'sent' : 'failed', // 90% success rate for demo
        sentAt: new Date().toISOString(),
        resourcesCount: data.resourcesAdded || data.resources?.length || 0,
        errorMessage: Math.random() > 0.1 ? undefined : 'SMTP connection failed'
      }

      setNotificationLogs(current => [log, ...current.slice(0, 99)])

      // Update rule last triggered and total sent
      setNotificationRules(current => 
        current.map(r => r.id === rule.id 
          ? { 
              ...r, 
              lastTriggered: new Date().toISOString(),
              totalSent: r.totalSent + (log.status === 'sent' ? rule.recipients.length : 0)
            }
          : r
        )
      )

      if (log.status === 'sent') {
        toast.success(`Notification sent to ${rule.recipients.length} recipients`)
      } else {
        toast.error(`Failed to send notification: ${log.errorMessage}`)
      }

    } catch (error) {
      console.error('Failed to send notification:', error)
      toast.error('Failed to send email notification')
    }
  }

  const handleSaveRule = () => {
    const rule: EmailNotificationRule = {
      id: selectedRule?.id || Date.now().toString(),
      ...ruleForm as EmailNotificationRule,
      recipients: ruleForm.recipients?.filter(email => email.trim()) || [],
      createdAt: selectedRule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalSent: selectedRule?.totalSent || 0
    }

    if (selectedRule) {
      setNotificationRules(current => current.map(r => r.id === rule.id ? rule : r))
      toast.success('Notification rule updated')
    } else {
      setNotificationRules(current => [...current, rule])
      toast.success('Notification rule created')
    }

    setIsRuleDialogOpen(false)
    setSelectedRule(null)
    resetRuleForm()
  }

  const handleSaveTemplate = () => {
    const template: EmailTemplate = {
      id: selectedTemplate?.id || Date.now().toString(),
      ...templateForm as EmailTemplate,
      variables: extractVariables(templateForm.body || '')
    }

    if (selectedTemplate) {
      setEmailTemplates(current => current.map(t => t.id === template.id ? template : t))
      toast.success('Email template updated')
    } else {
      setEmailTemplates(current => [...current, template])
      toast.success('Email template created')
    }

    setIsTemplateDialogOpen(false)
    setSelectedTemplate(null)
    resetTemplateForm()
  }

  const extractVariables = (text: string): string[] => {
    const regex = /\{([^}]+)\}/g
    const variables: string[] = []
    let match
    while ((match = regex.exec(text)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }
    return variables
  }

  const handleSendTestEmail = async () => {
    if (!testEmail || !selectedRule) return

    setIsSendingTest(true)
    try {
      // Simulate sending test email
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const testLog: NotificationLog = {
        id: Date.now().toString(),
        ruleId: selectedRule.id,
        ruleName: `${selectedRule.name} (Test)`,
        triggerType: 'manual_test',
        recipients: [testEmail],
        subject: selectedRule.template.subject.replace('{PLATFORM_NAME}', 'Test Platform'),
        status: 'sent',
        sentAt: new Date().toISOString(),
        resourcesCount: 3
      }

      setNotificationLogs(current => [testLog, ...current.slice(0, 99)])
      toast.success('Test email sent successfully!')
      setIsTestDialogOpen(false)
      setTestEmail('')
    } catch (error) {
      toast.error('Failed to send test email')
    } finally {
      setIsSendingTest(false)
    }
  }

  const resetRuleForm = () => {
    setRuleForm({
      name: '',
      description: '',
      isActive: true,
      triggers: {
        newResources: true,
        updatedResources: false,
        syncSuccess: false,
        syncFailure: true,
        certificationAvailable: false,
        deadlineReminders: false
      },
      platforms: [],
      recipients: [''],
      template: {
        subject: 'New Learning Resources - {PLATFORM_NAME}',
        body: ''
      },
      schedule: {
        frequency: 'immediate'
      },
      filters: {},
      totalSent: 0
    })
  }

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      subject: '',
      body: '',
      variables: [],
      isDefault: false,
      category: 'resources'
    })
  }

  const handleDeleteRule = (ruleId: string) => {
    setNotificationRules(current => current.filter(r => r.id !== ruleId))
    toast.success('Notification rule deleted')
  }

  const handleDeleteTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId)
    if (template?.isDefault) {
      toast.error('Cannot delete default templates')
      return
    }
    setEmailTemplates(current => current.filter(t => t.id !== templateId))
    toast.success('Email template deleted')
  }

  const copyTemplateToRule = (template: EmailTemplate) => {
    setRuleForm(current => ({
      ...current,
      template: {
        subject: template.subject,
        body: template.body
      }
    }))
    toast.success('Template copied to notification rule')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Notifications</h2>
          <p className="text-muted-foreground">
            Automated email alerts for learning resource synchronization
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsTemplateDialogOpen(true)}
          >
            <Mail className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            onClick={() => setIsRuleDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notificationRules.filter(r => r.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {notificationRules.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notificationLogs.filter(log => log.status === 'sent').length}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notificationLogs.length > 0 
                ? Math.round((notificationLogs.filter(log => log.status === 'sent').length / notificationLogs.length) * 100)
                : 100}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                {notificationLogs.filter(log => log.status === 'failed').length} failed
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Triggered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notificationLogs.length > 0 ? 'Today' : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Rules
          </CardTitle>
          <CardDescription>
            Configure when and how to send email notifications for learning resource updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationRules.length > 0 ? (
              notificationRules.map(rule => (
                <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => {
                          setNotificationRules(current =>
                            current.map(r => r.id === rule.id ? { ...r, isActive: checked } : r)
                          )
                        }}
                      />
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.isActive ? "default" : "outline"}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRule(rule)
                          setTestEmail('')
                          setIsTestDialogOpen(true)
                        }}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRule(rule)
                          setRuleForm(rule)
                          setIsRuleDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{rule.recipients.length} recipients</span>
                    </div>
                    {rule.platforms.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{rule.platforms.length} platforms</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="capitalize">{rule.schedule.frequency}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span>{rule.totalSent} sent</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {Object.entries(rule.triggers).filter(([_, enabled]) => enabled).map(([trigger, _]) => (
                      <Badge key={trigger} variant="secondary" className="text-xs">
                        {trigger.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </Badge>
                    ))}
                  </div>

                  {rule.lastTriggered && (
                    <div className="text-xs text-muted-foreground">
                      Last triggered: {new Date(rule.lastTriggered).toLocaleString()}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-semibold mb-2">No Notification Rules</h4>
                <p className="text-muted-foreground mb-4">
                  Create your first notification rule to get email alerts when learning resources are synced
                </p>
                <Button onClick={() => setIsRuleDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationLogs.length > 0 ? (
              notificationLogs.slice(0, 10).map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'sent' ? 'bg-green-500' : 
                      log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <div className="font-medium">{log.ruleName}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.subject}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>To: {log.recipients.join(', ')}</span>
                        {log.resourcesCount && (
                          <>
                            <span>•</span>
                            <span>{log.resourcesCount} resources</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                      {log.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(log.sentAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-semibold mb-2">No Notifications Sent</h4>
                <p className="text-muted-foreground">
                  Email notification activity will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Rule Dialog */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRule ? 'Edit Notification Rule' : 'Create Notification Rule'}
            </DialogTitle>
            <DialogDescription>
              Configure when and how to send email notifications for learning resource updates
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    placeholder="e.g., New Course Notifications"
                    value={ruleForm.name}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="rule-active"
                    checked={ruleForm.isActive}
                    onCheckedChange={(checked) => setRuleForm(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="rule-active">Active</Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="rule-description">Description</Label>
                <Input
                  id="rule-description"
                  placeholder="Brief description of when this rule triggers"
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            {/* Triggers */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Trigger Events</Label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(ruleForm.triggers || {}).map(([trigger, enabled]) => (
                  <div key={trigger} className="flex items-center space-x-2">
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        setRuleForm(prev => ({
                          ...prev,
                          triggers: { ...prev.triggers!, [trigger]: checked }
                        }))
                      }
                    />
                    <Label className="capitalize text-sm">
                      {trigger.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Recipients */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Email Recipients</Label>
              {ruleForm.recipients?.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => {
                      const newRecipients = [...(ruleForm.recipients || [])]
                      newRecipients[index] = e.target.value
                      setRuleForm(prev => ({ ...prev, recipients: newRecipients }))
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newRecipients = ruleForm.recipients?.filter((_, i) => i !== index)
                      setRuleForm(prev => ({ ...prev, recipients: newRecipients }))
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRuleForm(prev => ({
                  ...prev,
                  recipients: [...(prev.recipients || []), '']
                }))}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Email
              </Button>
            </div>

            <Separator />

            {/* Email Template */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Email Template</Label>
                <div className="flex gap-2">
                  {emailTemplates.map(template => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => copyTemplateToRule(template)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="template-subject">Subject Line</Label>
                <Input
                  id="template-subject"
                  placeholder="New Learning Resources - {PLATFORM_NAME}"
                  value={ruleForm.template?.subject}
                  onChange={(e) => setRuleForm(prev => ({
                    ...prev,
                    template: { ...prev.template!, subject: e.target.value }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="template-body">Email Body</Label>
                <Textarea
                  id="template-body"
                  placeholder="Email content with {VARIABLE_NAME} placeholders"
                  value={ruleForm.template?.body}
                  onChange={(e) => setRuleForm(prev => ({
                    ...prev,
                    template: { ...prev.template!, body: e.target.value }
                  }))}
                  rows={6}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Available variables: {'{PLATFORM_NAME}'}, {'{RESOURCE_COUNT}'}, {'{SYNC_TIME}'}, {'{ERROR_MESSAGE}'}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveRule}
              disabled={!ruleForm.name || !ruleForm.recipients?.some(email => email.trim())}
            >
              {selectedRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test notification to verify your email configuration
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            
            {selectedRule && (
              <div className="p-3 bg-muted rounded text-sm">
                <div className="font-medium mb-2">Preview:</div>
                <div><strong>Subject:</strong> {selectedRule.template.subject.replace('{PLATFORM_NAME}', 'Test Platform')}</div>
                <div className="mt-2"><strong>Body Preview:</strong></div>
                <div className="whitespace-pre-line text-xs">
                  {selectedRule.template.body.substring(0, 200)}...
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendTestEmail}
              disabled={!testEmail || isSendingTest}
            >
              <Send className={`w-4 h-4 mr-2 ${isSendingTest ? 'animate-pulse' : ''}`} />
              Send Test Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Management Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Email Templates</DialogTitle>
            <DialogDescription>
              Manage email templates for different notification types
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {emailTemplates.map(template => (
              <div key={template.id} className="border rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {template.name}
                      {template.isDefault && (
                        <Badge variant="outline" className="text-xs">Default</Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {template.category} template
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyTemplateToRule(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {!template.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-sm space-y-1">
                  <div><strong>Subject:</strong> {template.subject}</div>
                  <div><strong>Variables:</strong> {template.variables.join(', ') || 'None'}</div>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}