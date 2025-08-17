import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Workflow,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  Target,
  Brain,
  ArrowRight,
  FileText,
  Lightbulb,
  GitBranch,
  Repeat,
  Shield,
  TrendUp,
  Eye,
  Play,
  Pause,
  Settings,
  Download,
  Filter
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface CAPAWorkflow {
  id: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  sourceGapId?: string
  sourceType: 'gap-analysis' | 'manual' | 'audit-finding' | 'incident' | 'risk-assessment'
  
  // CAPA Details
  rootCause: string
  correctiveActions: CAPAAction[]
  preventiveActions: CAPAAction[]
  
  // Workflow Management
  assignedTo: string
  reviewerIds: string[]
  dueDate: string
  startDate: string
  completionDate?: string
  
  // Progress Tracking
  totalSteps: number
  completedSteps: number
  
  // Compliance
  regulatoryFrameworks: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  
  // Dependencies
  dependsOn: string[]
  blocks: string[]
  
  // Automation
  automatedChecks: AutomatedCheck[]
  notifications: NotificationRule[]
  
  metadata: {
    createdAt: string
    createdBy: string
    lastUpdated: string
    estimatedEffort: string
    actualEffort?: string
    tags: string[]
  }
}

interface CAPAAction {
  id: string
  type: 'corrective' | 'preventive'
  title: string
  description: string
  assignedTo: string
  dueDate: string
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue'
  evidence: Evidence[]
  dependencies: string[]
  verificationCriteria: string[]
  estimatedHours: number
  actualHours?: number
}

interface Evidence {
  id: string
  type: 'document' | 'test-result' | 'photo' | 'report' | 'training-record'
  title: string
  description: string
  filePath?: string
  uploadedAt: string
  uploadedBy: string
  verified: boolean
}

interface AutomatedCheck {
  id: string
  name: string
  description: string
  type: 'document-review' | 'deadline-monitor' | 'effectiveness-check' | 'risk-assessment'
  frequency: 'daily' | 'weekly' | 'monthly'
  lastRun?: string
  nextRun: string
  status: 'active' | 'paused' | 'failed'
  parameters: Record<string, any>
}

interface NotificationRule {
  id: string
  trigger: 'deadline-approaching' | 'overdue' | 'milestone-reached' | 'approval-needed'
  recipients: string[]
  advanceNotice?: number // days before
  message: string
  active: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Quality Manager', department: 'Quality' },
  { id: '2', name: 'Mike Chen', email: 'mike@company.com', role: 'Regulatory Affairs', department: 'Regulatory' },
  { id: '3', name: 'Lisa Rodriguez', email: 'lisa@company.com', role: 'Process Engineer', department: 'Engineering' },
  { id: '4', name: 'David Kim', email: 'david@company.com', role: 'QA Specialist', department: 'Quality' }
]

const priorityColors = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-orange-500 text-white',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-muted text-muted-foreground'
}

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-primary text-primary-foreground',
  completed: 'bg-secondary text-secondary-foreground',
  cancelled: 'bg-destructive/20 text-destructive'
}

export function CAPAWorkflowGenerator() {
  const [workflows, setWorkflows] = useKV<CAPAWorkflow[]>('capa-workflows', [])
  const [selectedWorkflow, setSelectedWorkflow] = useState<CAPAWorkflow | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  // Sample data - would be populated from gap analysis
  const sampleGaps = [
    {
      id: '1',
      title: 'Design History File completeness verification',
      description: 'Missing critical documentation for DHF compliance',
      severity: 'critical',
      framework: 'ISO 13485',
      estimatedEffort: '40 hours'
    },
    {
      id: '2',
      title: 'Risk management process documentation',
      description: 'Incomplete risk control measures documentation',
      severity: 'high',
      framework: 'FDA 21 CFR 820',
      estimatedEffort: '24 hours'
    }
  ]

  const filteredWorkflows = workflows.filter(workflow => {
    const statusMatch = filterStatus === 'all' || workflow.status === filterStatus
    const priorityMatch = filterPriority === 'all' || workflow.priority === filterPriority
    return statusMatch && priorityMatch
  })

  const generateWorkflowFromGap = async (gapId: string) => {
    setIsGenerating(true)
    const gap = sampleGaps.find(g => g.id === gapId)
    
    if (!gap) {
      toast.error('Gap not found')
      setIsGenerating(false)
      return
    }

    try {
      // Simulate AI-powered workflow generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newWorkflow: CAPAWorkflow = {
        id: `capa-${Date.now()}`,
        title: `CAPA: ${gap.title}`,
        description: `Corrective and Preventive Action plan for ${gap.description}`,
        priority: gap.severity as 'critical' | 'high' | 'medium' | 'low',
        status: 'draft',
        sourceGapId: gapId,
        sourceType: 'gap-analysis',
        
        rootCause: `Root cause analysis pending - initial assessment suggests gaps in ${gap.framework} compliance processes`,
        
        correctiveActions: [
          {
            id: `ca-${Date.now()}-1`,
            type: 'corrective',
            title: 'Address immediate compliance gap',
            description: `Create missing documentation for ${gap.title}`,
            assignedTo: 'sarah-johnson',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'not-started',
            evidence: [],
            dependencies: [],
            verificationCriteria: [
              'Documentation completed and reviewed',
              'Compliance verified by QA team',
              'Gap closure approved by regulatory'
            ],
            estimatedHours: parseInt(gap.estimatedEffort) * 0.6
          }
        ],
        
        preventiveActions: [
          {
            id: `pa-${Date.now()}-1`,
            type: 'preventive',
            title: 'Implement systematic controls',
            description: `Establish ongoing monitoring for ${gap.framework} requirements`,
            assignedTo: 'mike-chen',
            dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'not-started',
            evidence: [],
            dependencies: [`ca-${Date.now()}-1`],
            verificationCriteria: [
              'Monitoring process documented',
              'Automated checks implemented',
              'Training completed for relevant staff'
            ],
            estimatedHours: parseInt(gap.estimatedEffort) * 0.4
          }
        ],
        
        assignedTo: 'sarah-johnson',
        reviewerIds: ['mike-chen', 'lisa-rodriguez'],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        
        totalSteps: 6,
        completedSteps: 0,
        
        regulatoryFrameworks: [gap.framework],
        riskLevel: gap.severity === 'critical' ? 'critical' : gap.severity === 'high' ? 'high' : 'medium',
        
        dependsOn: [],
        blocks: [],
        
        automatedChecks: [
          {
            id: `check-${Date.now()}-1`,
            name: 'Deadline Monitor',
            description: 'Monitor action item deadlines and send alerts',
            type: 'deadline-monitor',
            frequency: 'daily',
            nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            parameters: { advanceNotice: 3 }
          },
          {
            id: `check-${Date.now()}-2`,
            name: 'Document Completeness',
            description: 'Verify required documentation is complete',
            type: 'document-review',
            frequency: 'weekly',
            nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            parameters: { requiredDocuments: ['DHF', 'Design Reviews', 'Test Results'] }
          }
        ],
        
        notifications: [
          {
            id: `notif-${Date.now()}-1`,
            trigger: 'deadline-approaching',
            recipients: ['sarah-johnson', 'mike-chen'],
            advanceNotice: 3,
            message: 'CAPA action deadline approaching in {days} days',
            active: true
          }
        ],
        
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastUpdated: new Date().toISOString(),
          estimatedEffort: gap.estimatedEffort,
          tags: ['auto-generated', gap.framework.toLowerCase(), gap.severity]
        }
      }

      setWorkflows(current => [...current, newWorkflow])
      setSelectedWorkflow(newWorkflow)
      toast.success('CAPA workflow generated successfully')
      
    } catch (error) {
      toast.error('Failed to generate CAPA workflow')
    } finally {
      setIsGenerating(false)
    }
  }

  const updateWorkflowStatus = (workflowId: string, newStatus: CAPAWorkflow['status']) => {
    setWorkflows(current => 
      current.map(workflow => 
        workflow.id === workflowId 
          ? { ...workflow, status: newStatus, metadata: { ...workflow.metadata, lastUpdated: new Date().toISOString() }}
          : workflow
      )
    )
    toast.success(`Workflow ${newStatus}`)
  }

  const updateActionStatus = (workflowId: string, actionId: string, newStatus: CAPAAction['status']) => {
    setWorkflows(current => 
      current.map(workflow => {
        if (workflow.id === workflowId) {
          const updatedCorrectiveActions = workflow.correctiveActions.map(action =>
            action.id === actionId ? { ...action, status: newStatus } : action
          )
          const updatedPreventiveActions = workflow.preventiveActions.map(action =>
            action.id === actionId ? { ...action, status: newStatus } : action
          )
          
          // Recalculate progress
          const allActions = [...updatedCorrectiveActions, ...updatedPreventiveActions]
          const completedActions = allActions.filter(action => action.status === 'completed').length
          
          return {
            ...workflow,
            correctiveActions: updatedCorrectiveActions,
            preventiveActions: updatedPreventiveActions,
            completedSteps: completedActions,
            totalSteps: allActions.length,
            metadata: { ...workflow.metadata, lastUpdated: new Date().toISOString() }
          }
        }
        return workflow
      })
    )
    toast.success('Action status updated')
  }

  const generateEffectivenessReport = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) return

    // Simulate AI-powered effectiveness analysis
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const effectiveness = Math.random() * 40 + 60 // 60-100%
    const report = {
      workflowId,
      effectivenessScore: effectiveness,
      findings: [
        'Corrective actions successfully addressed the root cause',
        'Preventive measures show positive early indicators',
        effectiveness > 80 ? 'Workflow exceeded effectiveness targets' : 'Additional monitoring recommended'
      ],
      recommendations: effectiveness < 80 ? [
        'Extend monitoring period',
        'Consider additional preventive controls',
        'Schedule follow-up assessment'
      ] : [
        'Workflow can be considered for closure',
        'Document lessons learned',
        'Apply best practices to similar processes'
      ]
    }

    toast.success(`Effectiveness report generated: ${effectiveness.toFixed(1)}% effective`)
    return report
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            CAPA Workflow Generator
          </h2>
          <p className="text-muted-foreground">
            Automated Corrective and Preventive Action workflows from compliance gaps
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generateEffectivenessReport(workflows[0]?.id)}>
            <TrendUp className="h-4 w-4 mr-2" />
            Effectiveness Report
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create CAPA
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generator">Auto-Generate</TabsTrigger>
          <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Dashboard Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{workflows.length}</p>
                      <p className="text-xs text-muted-foreground">Total CAPAs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {workflows.filter(w => w.status === 'active').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-2xl font-bold">
                        {workflows.filter(w => new Date(w.dueDate) < new Date() && w.status !== 'completed').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Overdue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {workflows.filter(w => w.status === 'completed').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Workflows */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent CAPA Workflows</h3>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredWorkflows.slice(0, 5).map((workflow) => (
                  <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedWorkflow(workflow)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{workflow.title}</CardTitle>
                            <Badge className={priorityColors[workflow.priority]}>
                              {workflow.priority}
                            </Badge>
                            <Badge className={statusColors[workflow.status]}>
                              {workflow.status}
                            </Badge>
                          </div>
                          <CardDescription>{workflow.description}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          {workflow.status === 'draft' && (
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); updateWorkflowStatus(workflow.id, 'active') }}>
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          {workflow.status === 'active' && (
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); updateWorkflowStatus(workflow.id, 'completed') }}>
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{workflow.completedSteps} of {workflow.totalSteps} steps</span>
                        </div>
                        <Progress value={(workflow.completedSteps / workflow.totalSteps) * 100} />
                        
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Assigned:</span> {mockUsers.find(u => u.id === workflow.assignedTo)?.name || workflow.assignedTo}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Due:</span> {new Date(workflow.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="generator" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI-Powered CAPA Generator
                </h3>
                <p className="text-sm text-muted-foreground">
                  Generate comprehensive CAPA workflows from identified compliance gaps
                </p>
              </div>
            </div>

            {/* Available Gaps */}
            <div className="space-y-4">
              <h4 className="font-medium">Compliance Gaps Available for CAPA Generation</h4>
              <div className="grid gap-4">
                {sampleGaps.map((gap) => (
                  <Card key={gap.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{gap.title}</CardTitle>
                            <Badge className={priorityColors[gap.severity as keyof typeof priorityColors]}>
                              {gap.severity}
                            </Badge>
                            <Badge variant="outline">{gap.framework}</Badge>
                          </div>
                          <CardDescription>{gap.description}</CardDescription>
                        </div>
                        <Button 
                          onClick={() => generateWorkflowFromGap(gap.id)}
                          disabled={isGenerating}
                          className="gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <Brain className="h-4 w-4 animate-pulse" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Lightbulb className="h-4 w-4" />
                              Generate CAPA
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">Estimated Effort:</span> {gap.estimatedEffort}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">Framework:</span> {gap.framework}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Generation Preview */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  CAPA Generation Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span>Analyze compliance gap and root causes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span>Generate corrective actions to address immediate issues</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span>Create preventive actions to avoid recurrence</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span>Assign responsibilities and timelines</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span>Set up automated monitoring and notifications</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span>Define verification criteria and success metrics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="mt-6">
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{workflow.title}</CardTitle>
                        <Badge className={priorityColors[workflow.priority]}>
                          {workflow.priority}
                        </Badge>
                        <Badge className={statusColors[workflow.status]}>
                          {workflow.status}
                        </Badge>
                      </div>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => setSelectedWorkflow(workflow)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{workflow.completedSteps} of {workflow.totalSteps} steps</span>
                    </div>
                    <Progress value={(workflow.completedSteps / workflow.totalSteps) * 100} />

                    {/* Actions Summary */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Target className="h-3 w-3 text-destructive" />
                          Corrective Actions ({workflow.correctiveActions.length})
                        </h5>
                        <div className="space-y-1">
                          {workflow.correctiveActions.map((action) => (
                            <div key={action.id} className="flex items-center justify-between text-xs">
                              <span className="truncate">{action.title}</span>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {action.status}
                                </Badge>
                                {action.status !== 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0"
                                    onClick={() => updateActionStatus(workflow.id, action.id, 'completed')}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Shield className="h-3 w-3 text-secondary" />
                          Preventive Actions ({workflow.preventiveActions.length})
                        </h5>
                        <div className="space-y-1">
                          {workflow.preventiveActions.map((action) => (
                            <div key={action.id} className="flex items-center justify-between text-xs">
                              <span className="truncate">{action.title}</span>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {action.status}
                                </Badge>
                                {action.status !== 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0"
                                    onClick={() => updateActionStatus(workflow.id, action.id, 'completed')}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Resolution Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18.5 days</div>
                  <p className="text-xs text-muted-foreground">-2.3 days from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Effectiveness Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">+5% improvement</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">On-Time Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-muted-foreground">Above target (85%)</p>
                </CardContent>
              </Card>
            </div>

            {/* Framework Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>CAPA by Regulatory Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['ISO 13485', 'FDA 21 CFR 820', 'EU MDR'].map((framework, index) => (
                    <div key={framework} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{framework}</span>
                        <span>{[3, 2, 1][index]} CAPAs</span>
                      </div>
                      <Progress value={[60, 40, 20][index]} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ISO 13485 Design Control CAPA</CardTitle>
                  <CardDescription>Template for design control related CAPAs</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Risk Management CAPA</CardTitle>
                  <CardDescription>Template for risk management process gaps</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                {selectedWorkflow.title}
              </DialogTitle>
              <DialogDescription>
                {selectedWorkflow.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={priorityColors[selectedWorkflow.priority]}>
                    {selectedWorkflow.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={statusColors[selectedWorkflow.status]}>
                    {selectedWorkflow.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Root Cause Analysis</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {selectedWorkflow.rootCause}
                </div>
              </div>

              <Tabs defaultValue="corrective">
                <TabsList>
                  <TabsTrigger value="corrective">Corrective Actions</TabsTrigger>
                  <TabsTrigger value="preventive">Preventive Actions</TabsTrigger>
                  <TabsTrigger value="automation">Automation</TabsTrigger>
                </TabsList>

                <TabsContent value="corrective" className="mt-4">
                  <div className="space-y-3">
                    {selectedWorkflow.correctiveActions.map((action) => (
                      <Card key={action.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{action.title}</h4>
                              <p className="text-sm text-muted-foreground">{action.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>Due: {action.dueDate}</span>
                                <span>•</span>
                                <span>Assigned: {mockUsers.find(u => u.id === action.assignedTo)?.name}</span>
                              </div>
                            </div>
                            <Badge variant="outline">{action.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="preventive" className="mt-4">
                  <div className="space-y-3">
                    {selectedWorkflow.preventiveActions.map((action) => (
                      <Card key={action.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{action.title}</h4>
                              <p className="text-sm text-muted-foreground">{action.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>Due: {action.dueDate}</span>
                                <span>•</span>
                                <span>Assigned: {mockUsers.find(u => u.id === action.assignedTo)?.name}</span>
                              </div>
                            </div>
                            <Badge variant="outline">{action.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="automation" className="mt-4">
                  <div className="space-y-3">
                    {selectedWorkflow.automatedChecks.map((check) => (
                      <Card key={check.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{check.name}</h4>
                              <p className="text-sm text-muted-foreground">{check.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>Frequency: {check.frequency}</span>
                                <span>•</span>
                                <span>Next run: {new Date(check.nextRun).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Badge variant={check.status === 'active' ? 'default' : 'outline'}>
                              {check.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedWorkflow(null)}>
                Close
              </Button>
              <Button onClick={() => generateEffectivenessReport(selectedWorkflow.id)}>
                <TrendUp className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}