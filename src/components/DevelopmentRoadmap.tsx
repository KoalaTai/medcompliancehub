import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Calendar,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Code,
  Zap,
  Shield,
  BarChart3,
  Wrench,
  Sparkles,
  ArrowRight,
  PlayCircle,
  PauseCircle,
  GitBranch,
  Lightbulb,
  Database,
  Cpu,
  Settings,
  MapPin,
  Flag,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  DollarSign
} from '@phosphor-icons/react'

interface RoadmapPhase {
  id: string
  name: string
  description: string
  duration: string
  status: 'planning' | 'in-progress' | 'completed' | 'blocked'
  priority: 'high' | 'medium' | 'low'
  features: RoadmapFeature[]
  dependencies: string[]
  resources: string[]
  budget: number
  startDate: string
  endDate: string
}

interface RoadmapFeature {
  id: string
  name: string
  description: string
  category: 'core' | 'enhancement' | 'integration' | 'optimization'
  complexity: 'simple' | 'moderate' | 'complex'
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked'
  assignee?: string
  estimatedHours: number
  actualHours?: number
  blockers: string[]
  dependencies: string[]
}

interface ResourceAllocation {
  role: string
  allocation: number // percentage
  cost: number // per hour
}

export function DevelopmentRoadmap() {
  const [phases, setPhases] = useKV<RoadmapPhase[]>('roadmap-phases', [])
  const [resources, setResources] = useKV<ResourceAllocation[]>('roadmap-resources', [])
  const [activePhase, setActivePhase] = useState<string>('')
  const [selectedFeature, setSelectedFeature] = useState<RoadmapFeature | null>(null)
  const [showPhaseDialog, setShowPhaseDialog] = useState(false)
  const [showFeatureDialog, setShowFeatureDialog] = useState(false)
  const [editingPhase, setEditingPhase] = useState<RoadmapPhase | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Initialize with sample roadmap if empty
  useEffect(() => {
    if (phases.length === 0) {
      generateInitialRoadmap()
    }
  }, [])

  const generateInitialRoadmap = async () => {
    setIsGenerating(true)
    try {
      const prompt = spark.llmPrompt`
        Based on the VirtualBackroom compliance platform, generate a comprehensive 4-phase development roadmap.
        Each phase should be 2-3 months with specific features, dependencies, and resource requirements.
        
        Focus on:
        1. Foundation & Core Features (MVP)
        2. AI Integration & Intelligence
        3. Advanced Analytics & Automation
        4. Enterprise & Scale Features
        
        Return as JSON with phases containing features, timelines, and resource needs.
      `
      
      const roadmapData = await spark.llm(prompt, 'gpt-4o', true)
      const parsedRoadmap = JSON.parse(roadmapData)
      
      setPhases(parsedRoadmap.phases || defaultPhases)
      setResources(parsedRoadmap.resources || defaultResources)
      
      toast.success('Development roadmap generated successfully')
    } catch (error) {
      console.error('Error generating roadmap:', error)
      setPhases(defaultPhases)
      setResources(defaultResources)
      toast.error('Using default roadmap template')
    }
    setIsGenerating(false)
  }

  const defaultPhases: RoadmapPhase[] = [
    {
      id: 'phase-1',
      name: 'Foundation & MVP',
      description: 'Core platform infrastructure and essential compliance features',
      duration: '10 weeks',
      status: 'in-progress',
      priority: 'high',
      startDate: '2024-01-15',
      endDate: '2024-03-25',
      budget: 125000,
      resources: ['Frontend Developer', 'Backend Developer', 'UX Designer'],
      dependencies: [],
      features: [
        {
          id: 'f1-1',
          name: 'Core Dashboard & Navigation',
          description: 'Main dashboard with sidebar navigation and basic metrics',
          category: 'core',
          complexity: 'moderate',
          status: 'completed',
          estimatedHours: 40,
          actualHours: 45,
          blockers: [],
          dependencies: []
        },
        {
          id: 'f1-2',
          name: 'User Authentication & Roles',
          description: 'Secure login system with role-based access control',
          category: 'core',
          complexity: 'complex',
          status: 'in-progress',
          estimatedHours: 60,
          blockers: [],
          dependencies: []
        },
        {
          id: 'f1-3',
          name: 'Evidence Management System',
          description: 'Document upload, organization, and compliance tracking',
          category: 'core',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 80,
          blockers: ['Authentication system'],
          dependencies: ['f1-2']
        },
        {
          id: 'f1-4',
          name: 'Basic Audit Simulations',
          description: 'Simple audit scenario execution and results tracking',
          category: 'core',
          complexity: 'moderate',
          status: 'not-started',
          estimatedHours: 50,
          blockers: [],
          dependencies: ['f1-3']
        }
      ]
    },
    {
      id: 'phase-2',
      name: 'AI Intelligence & Automation',
      description: 'Advanced AI features for gap analysis and intelligent recommendations',
      duration: '12 weeks',
      status: 'planning',
      priority: 'high',
      startDate: '2024-03-25',
      endDate: '2024-06-17',
      budget: 180000,
      resources: ['AI/ML Engineer', 'Backend Developer', 'Data Engineer'],
      dependencies: ['phase-1'],
      features: [
        {
          id: 'f2-1',
          name: 'AI-Powered Gap Analysis',
          description: 'Machine learning models for compliance gap identification',
          category: 'core',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 120,
          blockers: [],
          dependencies: ['f1-3']
        },
        {
          id: 'f2-2',
          name: 'CAPA Workflow Generator',
          description: 'Automated corrective action plan generation',
          category: 'core',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 100,
          blockers: [],
          dependencies: ['f2-1']
        },
        {
          id: 'f2-3',
          name: 'Skill Gap Analyzer',
          description: 'AI assessment of individual and team skill deficiencies',
          category: 'core',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 90,
          blockers: [],
          dependencies: ['f2-1']
        },
        {
          id: 'f2-4',
          name: 'Regulatory Intelligence Engine',
          description: 'Real-time monitoring and analysis of regulatory changes',
          category: 'integration',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 110,
          blockers: [],
          dependencies: []
        }
      ]
    },
    {
      id: 'phase-3',
      name: 'Advanced Analytics & Learning',
      description: 'Comprehensive analytics, learning path optimization, and team insights',
      duration: '10 weeks',
      status: 'planning',
      priority: 'medium',
      startDate: '2024-06-17',
      endDate: '2024-08-26',
      budget: 145000,
      resources: ['Data Scientist', 'Frontend Developer', 'UX Designer'],
      dependencies: ['phase-2'],
      features: [
        {
          id: 'f3-1',
          name: 'Learning Path Optimization',
          description: 'AI-driven personalized learning recommendations with scheduling',
          category: 'enhancement',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 80,
          blockers: [],
          dependencies: ['f2-3']
        },
        {
          id: 'f3-2',
          name: 'Team Skill Comparison Dashboard',
          description: 'Comprehensive team analytics and benchmarking',
          category: 'enhancement',
          complexity: 'moderate',
          status: 'not-started',
          estimatedHours: 60,
          blockers: [],
          dependencies: ['f2-3']
        },
        {
          id: 'f3-3',
          name: 'Career Path Recommendations',
          description: 'AI-powered career guidance and development planning',
          category: 'enhancement',
          complexity: 'moderate',
          status: 'not-started',
          estimatedHours: 70,
          blockers: [],
          dependencies: ['f3-1']
        },
        {
          id: 'f3-4',
          name: 'Advanced Reporting & Analytics',
          description: 'Comprehensive reporting suite with predictive analytics',
          category: 'enhancement',
          complexity: 'moderate',
          status: 'not-started',
          estimatedHours: 55,
          blockers: [],
          dependencies: ['f3-2']
        }
      ]
    },
    {
      id: 'phase-4',
      name: 'Enterprise & Integration',
      description: 'Enterprise features, external integrations, and scalability optimizations',
      duration: '8 weeks',
      status: 'planning',
      priority: 'medium',
      startDate: '2024-08-26',
      endDate: '2024-10-21',
      budget: 120000,
      resources: ['DevOps Engineer', 'Backend Developer', 'Integration Specialist'],
      dependencies: ['phase-3'],
      features: [
        {
          id: 'f4-1',
          name: 'Learning Platform Integrations',
          description: 'API connections to external learning platforms with webhook support',
          category: 'integration',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 90,
          blockers: [],
          dependencies: []
        },
        {
          id: 'f4-2',
          name: 'Email Notification System',
          description: 'Comprehensive email templates and automated notifications',
          category: 'integration',
          complexity: 'moderate',
          status: 'not-started',
          estimatedHours: 45,
          blockers: [],
          dependencies: ['f4-1']
        },
        {
          id: 'f4-3',
          name: 'Enterprise Security & Compliance',
          description: 'Advanced security features, audit trails, and compliance controls',
          category: 'core',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 75,
          blockers: [],
          dependencies: []
        },
        {
          id: 'f4-4',
          name: 'Performance Optimization & Scale',
          description: 'System optimization for enterprise-scale deployments',
          category: 'optimization',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 65,
          blockers: [],
          dependencies: []
        }
      ]
    }
  ]

  const defaultResources: ResourceAllocation[] = [
    { role: 'Senior Frontend Developer', allocation: 80, cost: 85 },
    { role: 'Senior Backend Developer', allocation: 100, cost: 90 },
    { role: 'AI/ML Engineer', allocation: 60, cost: 110 },
    { role: 'UX/UI Designer', allocation: 40, cost: 70 },
    { role: 'Data Engineer', allocation: 50, cost: 95 },
    { role: 'DevOps Engineer', allocation: 30, cost: 80 },
    { role: 'Product Manager', allocation: 50, cost: 85 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-blue-500'
      case 'blocked': return 'bg-red-500'
      case 'planning': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'complex': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Cpu className="h-4 w-4" />
      case 'enhancement': return <Sparkles className="h-4 w-4" />
      case 'integration': return <GitBranch className="h-4 w-4" />
      case 'optimization': return <Zap className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const calculatePhaseProgress = (phase: RoadmapPhase) => {
    const completed = phase.features.filter(f => f.status === 'completed').length
    return phase.features.length > 0 ? (completed / phase.features.length) * 100 : 0
  }

  const calculateTotalBudget = () => {
    return phases.reduce((sum, phase) => sum + phase.budget, 0)
  }

  const calculateResourceUtilization = () => {
    return resources.reduce((sum, resource) => sum + (resource.allocation * resource.cost), 0)
  }

  const getCurrentPhase = () => {
    return phases.find(p => p.status === 'in-progress') || phases[0]
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Development Roadmap</h2>
          <p className="text-muted-foreground">
            Comprehensive implementation plan with phased delivery
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={generateInitialRoadmap}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Regenerate Roadmap
          </Button>
          <Button onClick={() => setShowPhaseDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Phase
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Phases</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{phases.length}</div>
            <p className="text-xs text-muted-foreground">
              {phases.filter(p => p.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Features</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {phases.reduce((sum, p) => sum + p.features.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {phases.reduce((sum, p) => sum + p.features.filter(f => f.status === 'completed').length, 0)} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateTotalBudget().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Resource cost: ${calculateResourceUtilization().toLocaleString()}/week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38 weeks</div>
            <p className="text-xs text-muted-foreground">
              Estimated completion: Oct 2024
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="features">Feature Details</TabsTrigger>
          <TabsTrigger value="resources">Resource Planning</TabsTrigger>
          <TabsTrigger value="analytics">Progress Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <div className="space-y-4">
            {phases.map((phase, index) => (
              <Card key={phase.id} className={`${phase.status === 'in-progress' ? 'border-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(phase.status)}`} />
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Phase {index + 1}: {phase.name}
                          <Badge variant={phase.priority === 'high' ? 'destructive' : phase.priority === 'medium' ? 'default' : 'secondary'}>
                            {phase.priority}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{phase.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{phase.duration}</div>
                      <div>${phase.budget.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(calculatePhaseProgress(phase))}%</span>
                      </div>
                      <Progress value={calculatePhaseProgress(phase)} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {phase.features.filter(f => f.status === 'completed').length}/{phase.features.length} features
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Key Features
                      </h4>
                      <div className="space-y-2">
                        {phase.features.slice(0, 3).map(feature => (
                          <div key={feature.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(feature.category)}
                              <span className="text-sm">{feature.name}</span>
                            </div>
                            <Badge 
                              variant="outline"
                              className={feature.status === 'completed' ? 'border-green-500 text-green-700' :
                                feature.status === 'in-progress' ? 'border-blue-500 text-blue-700' :
                                feature.status === 'blocked' ? 'border-red-500 text-red-700' : ''}
                            >
                              {feature.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        ))}
                        {phase.features.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            +{phase.features.length - 3} more features
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Resources & Dependencies
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Team:</p>
                          <div className="flex flex-wrap gap-1">
                            {phase.resources.map(resource => (
                              <Badge key={resource} variant="secondary" className="text-xs">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {phase.dependencies.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Dependencies:</p>
                            <div className="flex flex-wrap gap-1">
                              {phase.dependencies.map(dep => (
                                <Badge key={dep} variant="outline" className="text-xs">
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4">
            {phases.map(phase => (
              <Card key={phase.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {phase.name}
                    <Badge>{phase.features.length} features</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {phase.features.map(feature => (
                      <div 
                        key={feature.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedFeature(feature)}
                      >
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(feature.category)}
                          <div>
                            <h4 className="font-medium">{feature.name}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getComplexityColor(feature.complexity)}>
                            {feature.complexity}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={feature.status === 'completed' ? 'border-green-500 text-green-700' :
                              feature.status === 'in-progress' ? 'border-blue-500 text-blue-700' :
                              feature.status === 'blocked' ? 'border-red-500 text-red-700' : ''}
                          >
                            {feature.status.replace('-', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{feature.estimatedHours}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
              <CardDescription>Team allocation and cost planning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{resource.role}</h4>
                      <p className="text-sm text-muted-foreground">${resource.cost}/hour</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{resource.allocation}% allocated</p>
                      <p className="text-sm text-muted-foreground">
                        ${(resource.allocation * resource.cost * 40 / 100).toLocaleString()}/week
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Weekly Cost:</span>
                <span className="font-bold text-lg">${calculateResourceUtilization().toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Phase Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phases.map((phase, index) => (
                    <div key={phase.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Phase {index + 1}: {phase.name}</span>
                        <span>{Math.round(calculatePhaseProgress(phase))}%</span>
                      </div>
                      <Progress value={calculatePhaseProgress(phase)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Feature Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'completed', label: 'Completed', color: 'bg-green-500' },
                    { status: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
                    { status: 'not-started', label: 'Not Started', color: 'bg-gray-500' },
                    { status: 'blocked', label: 'Blocked', color: 'bg-red-500' }
                  ].map(({ status, label, color }) => {
                    const count = phases.reduce((sum, p) => 
                      sum + p.features.filter(f => f.status === status).length, 0
                    )
                    const total = phases.reduce((sum, p) => sum + p.features.length, 0)
                    const percentage = total > 0 ? (count / total) * 100 : 0
                    
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${color}`} />
                            {label}
                          </span>
                          <span>{count} ({Math.round(percentage)}%)</span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Feature Detail Dialog */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFeature && getCategoryIcon(selectedFeature.category)}
              {selectedFeature?.name}
            </DialogTitle>
            <DialogDescription>{selectedFeature?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedFeature && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge 
                    className={`mt-1 ${selectedFeature.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedFeature.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      selectedFeature.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {selectedFeature.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Complexity</Label>
                  <Badge className={`mt-1 ${getComplexityColor(selectedFeature.complexity)}`}>
                    {selectedFeature.complexity}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estimated Hours</Label>
                  <p className="mt-1">{selectedFeature.estimatedHours}h</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Actual Hours</Label>
                  <p className="mt-1">{selectedFeature.actualHours || 'TBD'}h</p>
                </div>
              </div>
              
              {selectedFeature.blockers.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Blockers</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFeature.blockers.map(blocker => (
                      <Badge key={blocker} variant="destructive">{blocker}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedFeature.dependencies.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Dependencies</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFeature.dependencies.map(dep => (
                      <Badge key={dep} variant="outline">{dep}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFeature(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}