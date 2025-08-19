import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  Warning,
  Zap,
  Target,
  FileText,
  TrendUp,
  Settings,
  Play,
  Pause,
  Refresh
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: 'document_upload' | 'schedule' | 'compliance_change' | 'manual'
  actions: string[]
  isActive: boolean
  lastRun?: string
  successRate: number
  framework: string[]
}

interface AutomationTask {
  id: string
  ruleId: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startTime: string
  estimatedCompletion?: string
  results?: {
    documentsAnalyzed: number
    gapsIdentified: number
    recommendationsGenerated: number
  }
}

const automationRules: AutomationRule[] = [
  {
    id: '1',
    name: 'New Document Compliance Check',
    description: 'Automatically analyze uploaded documents for compliance gaps and generate remediation recommendations',
    trigger: 'document_upload',
    actions: [
      'Extract regulatory requirements',
      'Identify missing elements',
      'Generate compliance score',
      'Create action items',
      'Update gap analysis'
    ],
    isActive: true,
    lastRun: '2024-01-15T14:30:00Z',
    successRate: 94,
    framework: ['ISO 13485', 'FDA 21 CFR 820']
  },
  {
    id: '2',
    name: 'Weekly Gap Detection Sweep',
    description: 'Comprehensive analysis of all documents to detect emerging compliance gaps and regulatory changes',
    trigger: 'schedule',
    actions: [
      'Scan all documents for changes',
      'Check regulatory updates',
      'Cross-reference requirements',
      'Update risk assessments',
      'Generate executive summary'
    ],
    isActive: true,
    lastRun: '2024-01-14T09:00:00Z',
    successRate: 89,
    framework: ['All Frameworks']
  },
  {
    id: '3',
    name: 'Regulatory Change Impact Analysis',
    description: 'Monitor regulatory updates and automatically assess impact on existing documentation',
    trigger: 'compliance_change',
    actions: [
      'Detect regulatory changes',
      'Map to existing documents',
      'Assess impact severity',
      'Generate update requirements',
      'Notify stakeholders'
    ],
    isActive: true,
    lastRun: '2024-01-12T16:45:00Z',
    successRate: 97,
    framework: ['EU MDR', 'ISO 13485']
  },
  {
    id: '4',
    name: 'Document Expiry Prevention',
    description: 'Proactively identify documents approaching expiry and initiate renewal processes',
    trigger: 'schedule',
    actions: [
      'Check expiry dates',
      'Calculate renewal timelines',
      'Generate renewal tasks',
      'Notify document owners',
      'Track renewal progress'
    ],
    isActive: false,
    lastRun: '2024-01-10T08:00:00Z',
    successRate: 78,
    framework: ['All Frameworks']
  }
]

const activeTasks: AutomationTask[] = [
  {
    id: '1',
    ruleId: '2',
    name: 'Weekly Gap Detection - ISO 13485',
    status: 'running',
    progress: 65,
    startTime: '2024-01-15T15:00:00Z',
    estimatedCompletion: '2024-01-15T15:45:00Z',
    results: {
      documentsAnalyzed: 23,
      gapsIdentified: 4,
      recommendationsGenerated: 12
    }
  },
  {
    id: '2',
    ruleId: '1',
    name: 'Document Analysis - Risk Management Plan',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-15T14:30:00Z',
    results: {
      documentsAnalyzed: 1,
      gapsIdentified: 2,
      recommendationsGenerated: 5
    }
  }
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
    case 'running':
      return <Clock className="h-4 w-4 text-primary animate-pulse" weight="fill" />
    case 'failed':
      return <Warning className="h-4 w-4 text-destructive" weight="fill" />
    case 'pending':
      return <Clock className="h-4 w-4 text-muted-foreground" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-secondary text-secondary-foreground">Completed</Badge>
    case 'running':
      return <Badge className="bg-primary text-primary-foreground">Running</Badge>
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>
    case 'pending':
      return <Badge variant="outline">Pending</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function ComplianceAutomation() {
  const [rules, setRules] = useKV('automation-rules', automationRules)
  const [tasks, setTasks] = useKV('automation-tasks', activeTasks)
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)

  const toggleRule = (ruleId: string) => {
    setRules(current => current.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ))
  }

  const runManualAnalysis = async () => {
    setIsRunningAnalysis(true)
    
    // Create new automation task
    const newTask: AutomationTask = {
      id: Date.now().toString(),
      ruleId: 'manual',
      name: 'Manual Compliance Analysis',
      status: 'running',
      progress: 0,
      startTime: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    }
    
    setTasks(current => [newTask, ...current])

    // Simulate progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        // Update task with completion
        setTasks(current => current.map(task => 
          task.id === newTask.id 
            ? {
                ...task,
                status: 'completed' as const,
                progress: 100,
                results: {
                  documentsAnalyzed: Math.floor(Math.random() * 50) + 20,
                  gapsIdentified: Math.floor(Math.random() * 10) + 3,
                  recommendationsGenerated: Math.floor(Math.random() * 20) + 8
                }
              }
            : task
        ))
        setIsRunningAnalysis(false)
      } else {
        setTasks(current => current.map(task => 
          task.id === newTask.id 
            ? { ...task, progress: Math.round(progress) }
            : task
        ))
      }
    }, 500)
  }

  const activeRulesCount = rules.filter(rule => rule.isActive).length
  const runningTasksCount = tasks.filter(task => task.status === 'running').length
  const avgSuccessRate = Math.round(rules.reduce((sum, rule) => sum + rule.successRate, 0) / rules.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Compliance Automation Engine
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-powered automated compliance monitoring and gap detection
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </Button>
          <Button onClick={runManualAnalysis} disabled={isRunningAnalysis}>
            <Play className="h-4 w-4 mr-1" />
            Run Analysis
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activeRulesCount}</p>
                <p className="text-xs text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{runningTasksCount}</p>
                <p className="text-xs text-muted-foreground">Running Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendUp className="h-4 w-4 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{avgSuccessRate}%</p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              <div>
                <p className="text-2xl font-bold">147</p>
                <p className="text-xs text-muted-foreground">Tasks Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Tasks */}
      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active Tasks
            </CardTitle>
            <CardDescription>Current automation processes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-3 rounded border">
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate">{task.name}</p>
                      {getStatusBadge(task.status)}
                    </div>
                    {task.status === 'running' && (
                      <div className="space-y-1">
                        <Progress value={task.progress} className="h-1" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{task.progress}% complete</span>
                          {task.estimatedCompletion && (
                            <span>ETA: {new Date(task.estimatedCompletion).toLocaleTimeString()}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {task.results && (
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span>{task.results.documentsAnalyzed} docs analyzed</span>
                        <span>{task.results.gapsIdentified} gaps found</span>
                        <span>{task.results.recommendationsGenerated} recommendations</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Rules</CardTitle>
          <CardDescription>Configure automated compliance monitoring and analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-start gap-4 p-4 rounded border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium">{rule.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="outline" className="text-xs">
                        {rule.trigger.replace('_', ' ')}
                      </Badge>
                      <Badge 
                        className={`text-xs ${
                          rule.successRate >= 90 
                            ? 'bg-secondary text-secondary-foreground'
                            : rule.successRate >= 75
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-destructive text-destructive-foreground'
                        }`}
                      >
                        {rule.successRate}% success
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Actions:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {rule.actions.map((action, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span>Frameworks: {rule.framework.join(', ')}</span>
                        {rule.lastRun && (
                          <span>Last run: {new Date(rule.lastRun).toLocaleDateString()}</span>
                        )}
                      </div>
                      <Button
                        variant={rule.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleRule(rule.id)}
                        className="h-7"
                      >
                        {rule.isActive ? (
                          <>
                            <Pause className="h-3 w-3 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Enable
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            AI Automation Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-primary mb-1">Optimization Opportunity</p>
              <p className="text-sm text-muted-foreground">
                Document expiry prevention rule could be enhanced with machine learning to predict optimal renewal timing based on historical patterns.
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/20">
              <p className="text-sm font-medium text-secondary mb-1">Performance Insight</p>
              <p className="text-sm text-muted-foreground">
                Gap detection accuracy has improved 23% over the last month through automated learning from user feedback.
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
              <p className="text-sm font-medium text-accent mb-1">Trend Analysis</p>
              <p className="text-sm text-muted-foreground">
                Most common compliance gaps are in risk management documentation (34%) and post-market surveillance procedures (28%).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}