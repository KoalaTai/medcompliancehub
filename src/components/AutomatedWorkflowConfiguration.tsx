import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Settings,
  Clock,
  Bell,
  Users,
  Shield,
  Warning,
  CheckCircle,
  Mail,
  Globe,
  Calendar,
  Target,
  Repeat,
  Zap,
  Brain,
  Database,
  Activity,
  Sliders,
  Play,
  Pause,
  Refresh
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface AutomationSettings {
  id: string
  name: string
  description: string
  category: 'notification' | 'workflow' | 'escalation' | 'monitoring' | 'reporting'
  enabled: boolean
  config: Record<string, any>
  lastModified: string
}

interface GlobalAutomationConfig {
  autoWorkflowCreation: boolean
  smartAssignment: boolean
  deadlineMonitoring: boolean
  escalationRules: boolean
  performanceTracking: boolean
  riskBasedPrioritization: boolean
  complianceScoring: boolean
  aiRecommendations: boolean
}

interface NotificationRule {
  id: string
  name: string
  trigger: string
  conditions: NotificationCondition[]
  recipients: string[]
  channels: string[]
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
  active: boolean
}

interface NotificationCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

interface EscalationRule {
  id: string
  name: string
  triggerEvent: string
  escalationLevels: EscalationLevel[]
  active: boolean
}

interface EscalationLevel {
  level: number
  delay: number // minutes
  recipients: string[]
  actions: string[]
}

export function AutomatedWorkflowConfiguration() {
  const [globalConfig, setGlobalConfig] = useKV<GlobalAutomationConfig>('workflow-automation-config', {
    autoWorkflowCreation: true,
    smartAssignment: true,
    deadlineMonitoring: true,
    escalationRules: true,
    performanceTracking: true,
    riskBasedPrioritization: true,
    complianceScoring: true,
    aiRecommendations: true
  })

  const [automationSettings, setAutomationSettings] = useKV<AutomationSettings[]>('automation-settings', [
    {
      id: 'auto-workflow-creation',
      name: 'Automatic Workflow Creation',
      description: 'Automatically create CAPA workflows from identified compliance gaps',
      category: 'workflow',
      enabled: true,
      config: {
        minSeverity: 'medium',
        requireApproval: true,
        autoAssign: true,
        defaultDuration: 30
      },
      lastModified: new Date().toISOString()
    },
    {
      id: 'smart-assignment',
      name: 'Smart Task Assignment',
      description: 'AI-powered assignment of tasks based on expertise and workload',
      category: 'workflow',
      enabled: true,
      config: {
        considerWorkload: true,
        expertiseMatching: true,
        balanceTeams: true,
        preferredAssignees: []
      },
      lastModified: new Date().toISOString()
    },
    {
      id: 'deadline-monitoring',
      name: 'Deadline Monitoring & Alerts',
      description: 'Automated monitoring of task and workflow deadlines with escalation',
      category: 'monitoring',
      enabled: true,
      config: {
        warningDays: [7, 3, 1],
        escalateOverdue: true,
        weekendReminders: false,
        holidayAdjustment: true
      },
      lastModified: new Date().toISOString()
    },
    {
      id: 'risk-prioritization',
      name: 'Risk-Based Prioritization',
      description: 'Automatically adjust workflow priorities based on risk assessment',
      category: 'workflow',
      enabled: true,
      config: {
        riskFactors: ['severity', 'impact', 'likelihood', 'detectability'],
        autoEscalate: true,
        thresholds: { low: 10, medium: 25, high: 50, critical: 75 }
      },
      lastModified: new Date().toISOString()
    },
    {
      id: 'performance-tracking',
      name: 'Performance Analytics',
      description: 'Continuous tracking of workflow performance and effectiveness metrics',
      category: 'monitoring',
      enabled: true,
      config: {
        trackMetrics: ['completion_time', 'effectiveness', 'resource_usage'],
        reportingFrequency: 'weekly',
        benchmarking: true,
        predictiveAnalytics: true
      },
      lastModified: new Date().toISOString()
    },
    {
      id: 'compliance-scoring',
      name: 'Compliance Scoring Engine',
      description: 'Real-time compliance scoring with automated recommendations',
      category: 'monitoring',
      enabled: true,
      config: {
        scoringModel: 'weighted',
        updateFrequency: 'daily',
        alertThreshold: 85,
        includePredictive: true
      },
      lastModified: new Date().toISOString()
    }
  ])

  const [notificationRules, setNotificationRules] = useKV<NotificationRule[]>('notification-rules', [
    {
      id: 'workflow-overdue',
      name: 'Workflow Overdue Alert',
      trigger: 'workflow_overdue',
      conditions: [],
      recipients: ['quality-manager', 'process-owner'],
      channels: ['email', 'ui'],
      frequency: 'immediate',
      active: true
    },
    {
      id: 'high-risk-finding',
      name: 'High Risk Finding Notification',
      trigger: 'finding_created',
      conditions: [
        { field: 'risk_level', operator: 'greater_than', value: 'medium' }
      ],
      recipients: ['executive-team', 'quality-manager'],
      channels: ['email', 'webhook'],
      frequency: 'immediate',
      active: true
    }
  ])

  const [escalationRules, setEscalationRules] = useKV<EscalationRule[]>('escalation-rules', [
    {
      id: 'overdue-escalation',
      name: 'Overdue Task Escalation',
      triggerEvent: 'task_overdue',
      escalationLevels: [
        {
          level: 1,
          delay: 60, // 1 hour
          recipients: ['task-owner', 'supervisor'],
          actions: ['send_reminder', 'update_status']
        },
        {
          level: 2,
          delay: 1440, // 24 hours
          recipients: ['department-head', 'quality-manager'],
          actions: ['send_escalation', 'require_explanation']
        },
        {
          level: 3,
          delay: 4320, // 72 hours
          recipients: ['executive-team'],
          actions: ['executive_notification', 'schedule_review']
        }
      ],
      active: true
    }
  ])

  const [activeTab, setActiveTab] = useState('global-settings')
  const [selectedSetting, setSelectedSetting] = useState<AutomationSettings | null>(null)

  const toggleGlobalSetting = (setting: keyof GlobalAutomationConfig) => {
    setGlobalConfig(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
    toast.success(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${globalConfig[setting] ? 'disabled' : 'enabled'}`)
  }

  const updateAutomationSetting = (settingId: string, updates: Partial<AutomationSettings>) => {
    setAutomationSettings(current => 
      current.map(setting => 
        setting.id === settingId 
          ? { ...setting, ...updates, lastModified: new Date().toISOString() }
          : setting
      )
    )
    toast.success('Automation setting updated')
  }

  const toggleAutomationSetting = (settingId: string) => {
    setAutomationSettings(current => 
      current.map(setting => 
        setting.id === settingId 
          ? { ...setting, enabled: !setting.enabled, lastModified: new Date().toISOString() }
          : setting
      )
    )
  }

  const addNotificationRule = () => {
    const newRule: NotificationRule = {
      id: `rule-${Date.now()}`,
      name: 'New Notification Rule',
      trigger: 'workflow_created',
      conditions: [],
      recipients: [],
      channels: ['email'],
      frequency: 'immediate',
      active: true
    }
    setNotificationRules(current => [...current, newRule])
    toast.success('Notification rule added')
  }

  const runSystemHealthCheck = async () => {
    toast.info('Running system health check...')
    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('System health check completed - All automation systems operational')
  }

  const categoryIcons = {
    notification: Bell,
    workflow: Target,
    escalation: Warning,
    monitoring: Activity,
    reporting: Database
  }

  const categoryColors = {
    notification: 'text-blue-500',
    workflow: 'text-green-500',
    escalation: 'text-orange-500',
    monitoring: 'text-purple-500',
    reporting: 'text-cyan-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Automated Workflow Configuration
          </h2>
          <p className="text-muted-foreground">
            Configure automated rules, notifications, and system behaviors for CAPA workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runSystemHealthCheck}>
            <Activity className="h-4 w-4 mr-2" />
            Health Check
          </Button>
          <Button>
            <Refresh className="h-4 w-4 mr-2" />
            Refresh Config
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="global-settings">Global Settings</TabsTrigger>
          <TabsTrigger value="automation-rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="escalations">Escalations</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="global-settings" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  Global Automation Settings
                </CardTitle>
                <CardDescription>
                  Master controls for system-wide automation features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Auto Workflow Creation</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically create CAPA workflows from gaps
                        </p>
                      </div>
                      <Switch 
                        checked={globalConfig.autoWorkflowCreation}
                        onCheckedChange={() => toggleGlobalSetting('autoWorkflowCreation')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Smart Assignment</Label>
                        <p className="text-sm text-muted-foreground">
                          AI-powered task assignment optimization
                        </p>
                      </div>
                      <Switch 
                        checked={globalConfig.smartAssignment}
                        onCheckedChange={() => toggleGlobalSetting('smartAssignment')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Deadline Monitoring</Label>
                        <p className="text-sm text-muted-foreground">
                          Automated deadline tracking and alerts
                        </p>
                      </div>
                      <Switch 
                        checked={globalConfig.deadlineMonitoring}
                        onCheckedChange={() => toggleGlobalSetting('deadlineMonitoring')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Escalation Rules</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatic escalation of overdue items
                        </p>
                      </div>
                      <Switch 
                        checked={globalConfig.escalationRules}
                        onCheckedChange={() => toggleGlobalSetting('escalationRules')}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Performance Tracking</Label>
                        <p className="text-sm text-muted-foreground">
                          Continuous performance analytics
                        </p>
                      </div>
                      <Switch 
                        checked={globalConfig.performanceTracking}
                        onCheckedChange={() => toggleGlobalSetting('performanceTracking')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Risk-Based Prioritization</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatic priority adjustment based on risk
                        </p>
                      </div>
                      <Switch 
                        checked={globalConfig.riskBasedPrioritization}
                        onCheckedChange={() => toggleGlobalSetting('riskBasedPrioritization')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Compliance Scoring</Label>
                        <p className="text-sm text-muted-foreground">
                          Real-time compliance score calculation
                        </p>
                      </div>
                      <Switch 
                        checked={globalConfig.complianceScoring}
                        onCheckedChange={() => toggleGlobalSetting('complianceScoring')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">AI Recommendations</Label>
                        <p className="text-sm text-muted-foreground">
                          AI-powered improvement recommendations
                        </p>
                      </div>
                      <Switch 
                        checked={globalConfig.aiRecommendations}
                        onCheckedChange={() => toggleGlobalSetting('aiRecommendations')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">98%</p>
                      <p className="text-xs text-muted-foreground">System Health</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{automationSettings.filter(s => s.enabled).length}</p>
                      <p className="text-xs text-muted-foreground">Active Rules</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{notificationRules.filter(r => r.active).length}</p>
                      <p className="text-xs text-muted-foreground">Notifications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Warning className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{escalationRules.filter(r => r.active).length}</p>
                      <p className="text-xs text-muted-foreground">Escalations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="automation-rules" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Automation Rules</h3>
                <p className="text-sm text-muted-foreground">
                  Configure specific automation behaviors and triggers
                </p>
              </div>
              <Button>
                <Zap className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>

            <div className="grid gap-4">
              {automationSettings.map((setting) => {
                const IconComponent = categoryIcons[setting.category]
                const iconColor = categoryColors[setting.category]
                
                return (
                  <Card key={setting.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{setting.name}</CardTitle>
                            <CardDescription>{setting.description}</CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="capitalize">
                                {setting.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Modified {new Date(setting.lastModified).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={setting.enabled}
                            onCheckedChange={() => toggleAutomationSetting(setting.id)}
                          />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedSetting(setting)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {setting.enabled && (
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Status: <span className="text-green-600 font-medium">Active</span>
                          {setting.category === 'workflow' && (
                            <span className="ml-4">
                              • Auto-creates workflows for {setting.config.minSeverity}+ severity gaps
                            </span>
                          )}
                          {setting.category === 'monitoring' && (
                            <span className="ml-4">
                              • Monitoring {Object.keys(setting.config).length} parameters
                            </span>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Notification Rules</h3>
                <p className="text-sm text-muted-foreground">
                  Configure when and how notifications are sent
                </p>
              </div>
              <Button onClick={addNotificationRule}>
                <Bell className="h-4 w-4 mr-2" />
                Add Notification Rule
              </Button>
            </div>

            <div className="grid gap-4">
              {notificationRules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          {rule.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {rule.trigger.replace('_', ' ')}
                          </Badge>
                          <Badge variant="secondary">
                            {rule.frequency}
                          </Badge>
                          {rule.channels.map(channel => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={rule.active} />
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Recipients:</span> {rule.recipients.join(', ')}
                      </div>
                      {rule.conditions.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Conditions:</span> {rule.conditions.length} condition(s)
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="escalations" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Escalation Rules</h3>
                <p className="text-sm text-muted-foreground">
                  Configure automatic escalation procedures for overdue items
                </p>
              </div>
              <Button>
                <Warning className="h-4 w-4 mr-2" />
                Add Escalation Rule
              </Button>
            </div>

            <div className="grid gap-4">
              {escalationRules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Warning className="h-4 w-4" />
                          {rule.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {rule.triggerEvent.replace('_', ' ')}
                          </Badge>
                          <Badge variant="secondary">
                            {rule.escalationLevels.length} levels
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={rule.active} />
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rule.escalationLevels.map((level) => (
                        <div key={level.level} className="flex items-center justify-between p-3 bg-muted rounded">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">Level {level.level}</Badge>
                            <span className="text-sm">
                              After {level.delay} minutes → {level.recipients.join(', ')}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {level.actions.length} action(s)
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Workflow Processing</span>
                      <span className="text-sm font-medium">98.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Notification Delivery</span>
                      <span className="text-sm font-medium">99.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">API Response Time</span>
                      <span className="text-sm font-medium">142ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Accuracy Score</span>
                      <span className="text-sm font-medium">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Recommendations</span>
                      <span className="text-sm font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Processing Time</span>
                      <span className="text-sm font-medium">2.3s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Data Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Data Quality</span>
                      <span className="text-sm font-medium">96.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Storage Usage</span>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Backup Status</span>
                      <span className="text-sm font-medium text-green-600">Current</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Logs & Events</CardTitle>
                <CardDescription>
                  Recent automation events and system activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">12:34 PM</span>
                    <span>Automatic workflow created for compliance gap #CG-2024-0156</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 text-sm">
                    <Bell className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">12:28 PM</span>
                    <span>Deadline reminder sent for CAPA workflow #CW-2024-0089</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 text-sm">
                    <Warning className="h-4 w-4 text-orange-500" />
                    <span className="text-muted-foreground">12:15 PM</span>
                    <span>Escalation triggered: Task overdue by 48 hours</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 text-sm">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-muted-foreground">12:05 PM</span>
                    <span>AI recommendation generated: Process improvement opportunity identified</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}