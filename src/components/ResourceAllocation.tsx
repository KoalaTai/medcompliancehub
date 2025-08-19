import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, 
  TrendUp, 
  Clock, 
  Target, 
  Warning,
  CheckCircle,
  ArrowRight,
  ChartBar,
  Brain,
  Calendar,
  Settings,
  Zap,
  Medal,
  Activity,
  Shuffle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { TemplateOptimizationEngine } from '@/components/TemplateOptimizationEngine'

interface TeamMember {
  id: string
  name: string
  role: string
  expertise: string[]
  efficiency: number
  workload: number
  availability: number
  performanceScore: number
  completedAudits: number
  averageTime: number
  qualityRating: number
}

interface Project {
  id: string
  name: string
  framework: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  complexity: number
  estimatedHours: number
  deadline: string
  requiredExpertise: string[]
  status: 'pending' | 'assigned' | 'in-progress' | 'completed'
  riskLevel: number
}

interface ResourceAllocationData {
  projectId: string
  teamMembers: string[]
  allocatedHours: number
  startDate: string
  estimatedCompletion: string
  confidenceScore: number
  recommendations: string[]
  riskFactors: string[]
}

interface PerformanceMetric {
  period: string
  efficiency: number
  quality: number
  onTimeDelivery: number
  utilization: number
  satisfaction: number
}

interface PredictiveInsight {
  type: 'opportunity' | 'risk' | 'optimization'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  timeframe: string
  actionable: boolean
}

interface AllocationAnalytics {
  totalAllocations: number
  successRate: number
  avgConfidenceScore: number
  resourceUtilization: number
  bottlenecks: string[]
  trends: {
    efficiency: number
    quality: number
    satisfaction: number
  }
}

interface TeamCapacityForecast {
  memberId: string
  currentCapacity: number
  projectedCapacity: number[]  // Next 4 weeks
  skillGaps: string[]
  developmentNeeds: string[]
}

interface WorkloadBalance {
  memberId: string
  currentLoad: number
  optimalLoad: number
  utilizationGap: number
  burnoutRisk: 'low' | 'medium' | 'high'
  efficiency: number
  utilizationTrend: number[]
  frameworkDistribution: Record<string, number>
  rebalanceRecommendations: string[]
}

interface FrameworkWorkload {
  name: string
  activeProjects: number
  totalProjects: number
  teamUtilization: number
  expertiseGap: number
  demandTrend: number
  criticalPath: boolean
}

interface AllocationRule {
  id: string
  name: string
  condition: string
  action: string
  priority: number
  enabled: boolean
  successRate: number
}

interface GeneratedAllocation {
  projectName: string
  framework: string
  teamMembers: string[]
  allocatedHours: number
  startDate: string
  estimatedCompletion: string
  confidenceScore: number
  reasoning: string
}

export function ResourceAllocation() {
  const [teamMembers] = useKV<TeamMember[]>('team-members', [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Senior QA Engineer',
      expertise: ['ISO 13485', 'FDA QSR', 'Risk Management'],
      efficiency: 92,
      workload: 75,
      availability: 85,
      performanceScore: 94,
      completedAudits: 28,
      averageTime: 18,
      qualityRating: 4.8
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      role: 'Regulatory Affairs Manager',
      expertise: ['EU MDR', 'ISO 13485', 'Clinical Data'],
      efficiency: 88,
      workload: 65,
      availability: 90,
      performanceScore: 91,
      completedAudits: 22,
      averageTime: 22,
      qualityRating: 4.6
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Compliance Specialist',
      expertise: ['FDA QSR', 'HIPAA', 'Quality Systems'],
      efficiency: 85,
      workload: 80,
      availability: 70,
      performanceScore: 87,
      completedAudits: 31,
      averageTime: 16,
      qualityRating: 4.7
    }
  ])

  const [projects, setProjects] = useKV<Project[]>('allocation-projects', [
    {
      id: '1',
      name: 'MedDevice Pro Certification',
      framework: 'ISO 13485',
      priority: 'high',
      complexity: 8,
      estimatedHours: 120,
      deadline: '2024-02-15',
      requiredExpertise: ['ISO 13485', 'Risk Management', 'Quality Systems'],
      status: 'pending',
      riskLevel: 6
    },
    {
      id: '2',
      name: 'FDA 510(k) Submission Review',
      framework: 'FDA QSR',
      priority: 'critical',
      complexity: 9,
      estimatedHours: 180,
      deadline: '2024-01-30',
      requiredExpertise: ['FDA QSR', 'Clinical Data', 'Risk Management'],
      status: 'pending',
      riskLevel: 8
    }
  ])

  const [allocations, setAllocations] = useKV<ResourceAllocationData[]>('resource-allocations', [])
  const [performanceMetrics] = useKV<PerformanceMetric[]>('performance-metrics', [
    { period: 'Q3 2023', efficiency: 88, quality: 92, onTimeDelivery: 94, utilization: 82, satisfaction: 4.6 },
    { period: 'Q4 2023', efficiency: 91, quality: 94, onTimeDelivery: 96, utilization: 85, satisfaction: 4.7 }
  ])
  
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [allocationStrategy, setAllocationStrategy] = useState<'balanced' | 'efficiency' | 'expertise'>('balanced')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [autoAllocation, setAutoAllocation] = useKV('auto-allocation-enabled', true)
  const [predictiveInsights, setPredictiveInsights] = useKV<PredictiveInsight[]>('predictive-insights', [])
  const [capacityForecast, setCapacityForecast] = useKV<TeamCapacityForecast[]>('capacity-forecast', [])
  const [workloadBalance, setWorkloadBalance] = useKV<WorkloadBalance[]>('workload-balance', [])
  const [frameworkWorkloads, setFrameworkWorkloads] = useKV<FrameworkWorkload[]>('framework-workloads', [])
  const [allocationRules, setAllocationRules] = useKV<AllocationRule[]>('allocation-rules', [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRebalancing, setIsRebalancing] = useState(false)
  const [generatedAllocation, setGeneratedAllocation] = useState<GeneratedAllocation | null>(null)

  useEffect(() => {
    const generateInsightsAndBalance = () => {
      // Generate predictive insights
      const insights: PredictiveInsight[] = [
        {
          type: 'optimization',
          title: 'Cross-Training Opportunity',
          description: 'Training 2 team members in EU MDR would improve allocation flexibility by 35%',
          impact: 'high',
          timeframe: '6-8 weeks',
          actionable: true
        },
        {
          type: 'risk',
          title: 'Capacity Constraint Q1',
          description: 'High-priority projects may overlap in January, requiring additional resources',
          impact: 'medium',
          timeframe: '4-6 weeks',
          actionable: true
        }
      ]
      setPredictiveInsights(insights)

      // Generate workload balance data
      const balance: WorkloadBalance[] = teamMembers.map(member => ({
        memberId: member.id,
        currentLoad: member.workload,
        optimalLoad: 75,
        utilizationGap: member.workload - 75,
        burnoutRisk: member.workload > 85 ? 'high' : member.workload > 75 ? 'medium' : 'low',
        efficiency: member.efficiency,
        utilizationTrend: [70, 75, member.workload - 10, member.workload],
        frameworkDistribution: {
          'ISO 13485': Math.floor(Math.random() * 3),
          'FDA QSR': Math.floor(Math.random() * 2),
          'EU MDR': Math.floor(Math.random() * 2)
        },
        rebalanceRecommendations: member.workload > 80 
          ? [`Reduce workload by ${member.workload - 75}%`]
          : []
      }))
      setWorkloadBalance(balance)

      // Generate framework workload data
      const frameworks: FrameworkWorkload[] = [
        {
          name: 'ISO 13485',
          activeProjects: 8,
          totalProjects: 12,
          teamUtilization: 78,
          expertiseGap: 25,
          demandTrend: 15,
          criticalPath: false
        },
        {
          name: 'FDA QSR',
          activeProjects: 6,
          totalProjects: 8,
          teamUtilization: 92,
          expertiseGap: 40,
          demandTrend: 8,
          criticalPath: true
        },
        {
          name: 'EU MDR',
          activeProjects: 4,
          totalProjects: 6,
          teamUtilization: 85,
          expertiseGap: 60,
          demandTrend: 25,
          criticalPath: false
        }
      ]
      setFrameworkWorkloads(frameworks)

      // Generate capacity forecast
      const forecast: TeamCapacityForecast[] = teamMembers.map(member => ({
        memberId: member.id,
        currentCapacity: member.availability,
        projectedCapacity: [member.availability, member.availability - 5, member.availability - 10, member.availability + 5],
        skillGaps: member.expertise.length < 3 ? ['EU MDR', 'Clinical Data'] : [],
        developmentNeeds: member.efficiency < 90 ? ['Advanced Risk Management'] : []
      }))
      setCapacityForecast(forecast)
    }

    if (teamMembers.length > 0) {
      generateInsightsAndBalance()
    }
  }, [teamMembers, projects, allocations, performanceMetrics, setPredictiveInsights, setCapacityForecast, setWorkloadBalance, setFrameworkWorkloads])

  const generateOptimalAllocation = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    setIsGenerating(true)

    try {
      const prompt = spark.llmPrompt`
        Generate an optimal team allocation for this compliance project:
        
        Project: ${project.name}
        Framework: ${project.framework}
        Priority: ${project.priority}
        Complexity: ${project.complexity}/10
        Estimated Hours: ${project.estimatedHours}
        Required Expertise: ${project.requiredExpertise.join(', ')}
        Deadline: ${project.deadline}
        Risk Level: ${project.riskLevel}/10
        
        Available Team Members:
        ${teamMembers.map(m => `
          - ${m.name} (${m.role})
            Expertise: ${m.expertise.join(', ')}
            Efficiency: ${m.efficiency}%
            Current Workload: ${m.workload}%
            Availability: ${m.availability}%
            Performance Score: ${m.performanceScore}%
            Quality Rating: ${m.qualityRating}/5
        `).join('')}
        
        Strategy: ${allocationStrategy}
        
        Generate an optimal allocation including:
        - Team members to assign (names)
        - Allocated hours
        - Start date
        - Estimated completion date
        - Confidence score (0-100)
        - Brief reasoning
        
        Respond in JSON format:
        {
          "projectName": "string",
          "framework": "string", 
          "teamMembers": ["string"],
          "allocatedHours": number,
          "startDate": "YYYY-MM-DD",
          "estimatedCompletion": "YYYY-MM-DD",
          "confidenceScore": number,
          "reasoning": "string"
        }
      `

      const result = await spark.llm(prompt, 'gpt-4o', true)
      const allocation = JSON.parse(result)
      
      setGeneratedAllocation(allocation)
      
      toast.success('Optimal allocation generated', {
        description: `${allocation.confidenceScore}% confidence with ${allocation.teamMembers.length} team members`
      })
      
    } catch (error) {
      console.error('Allocation generation failed:', error)
      toast.error('Failed to generate optimal allocation')
    } finally {
      setIsGenerating(false)
    }
  }

  const performSmartRebalancing = async () => {
    setIsRebalancing(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing
      
      // Update workload balance to show improvement
      const improvedBalance = workloadBalance.map(wb => ({
        ...wb,
        currentLoad: Math.max(60, Math.min(85, wb.currentLoad * 0.85)),
        burnoutRisk: wb.currentLoad > 85 ? 'medium' : 'low' as const
      }))
      
      setWorkloadBalance(improvedBalance)
      
      toast.success('Smart workload rebalancing completed', {
        description: 'Applied optimization actions across regulatory frameworks'
      })
      
    } catch (error) {
      console.error('Smart rebalancing failed:', error)
      toast.error('Failed to perform smart workload rebalancing')
    } finally {
      setIsRebalancing(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-accent text-accent-foreground'
      case 'low': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'in-progress': return 'text-blue-600'
      case 'assigned': return 'text-orange-600'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Resource Allocation</h1>
          <p className="text-muted-foreground">AI-powered team assignment and workload optimization</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={autoAllocation} onCheckedChange={setAutoAllocation} />
            <Label>Auto-allocation</Label>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="balancing">Balancing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team Utilization</p>
                    <p className="text-2xl font-bold">73%</p>
                    <p className="text-xs text-green-600">↑ 8% this month</p>
                  </div>
                  <div className="relative">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-2 w-2 text-white" />
                    </div>
                  </div>
                </div>
                <Progress value={73} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-blue-600">3 pending allocation</p>
                  </div>
                  <div className="relative">
                    <Activity className="h-8 w-8 text-green-600" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <Clock className="h-2 w-2 text-white" />
                    </div>
                  </div>
                </div>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI Efficiency Score</p>
                    <p className="text-2xl font-bold">94%</p>
                    <p className="text-xs text-green-600">↑ 15% with ML optimization</p>
                  </div>
                  <div className="relative">
                    <TrendUp className="h-8 w-8 text-green-600" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <Zap className="h-2 w-2 text-white" />
                    </div>
                  </div>
                </div>
                <Progress value={94} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Quality Rating</p>
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-xs text-accent">⭐ AI-matched teams</p>
                  </div>
                  <div className="relative">
                    <Medal className="h-8 w-8 text-accent" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-2 w-2 text-white" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex text-sm text-muted-foreground">
                  <span>+0.3 improvement with intelligent allocation</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Allocations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Current Resource Allocations
                  </CardTitle>
                  <CardDescription>Active project assignments and team distribution</CardDescription>
                </div>
                <Button
                  onClick={performSmartRebalancing}
                  disabled={isRebalancing}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isRebalancing ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      Rebalancing...
                    </>
                  ) : (
                    <>
                      <Shuffle className="h-4 w-4 mr-2" />
                      Smart Rebalance
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {allocations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active allocations</p>
                    <p className="text-sm">Create optimal assignments using AI-powered analysis</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allocations.map(allocation => {
                      const project = projects.find(p => p.id === allocation.projectId)
                      const assignedMembers = teamMembers.filter(m => allocation.teamMembers.includes(m.id))
                      
                      return (
                        <div key={allocation.projectId} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{project?.name}</h4>
                              <p className="text-sm text-muted-foreground">{project?.framework}</p>
                            </div>
                            <Badge variant="outline">
                              {allocation.confidenceScore}% confidence
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Team:</span> {assignedMembers.map(m => m.name).join(', ')}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Hours:</span> {allocation.allocatedHours}h
                            </div>
                            <div>
                              <span className="text-muted-foreground">Start:</span> {allocation.startDate}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Est. Completion:</span> {allocation.estimatedCompletion}
                            </div>
                          </div>

                          {allocation.riskFactors.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                              <Warning className="h-4 w-4" />
                              <span>{allocation.riskFactors.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Resource Allocation</CardTitle>
              <CardDescription>Generate optimal team assignments using AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="project-select">Select Project</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.filter(p => p.status === 'pending').map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="strategy-select">Allocation Strategy</Label>
                  <Select value={allocationStrategy} onValueChange={(value: any) => setAllocationStrategy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced Approach</SelectItem>
                      <SelectItem value="efficiency">Efficiency Focused</SelectItem>
                      <SelectItem value="expertise">Expertise Focused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={() => selectedProject && generateOptimalAllocation(selectedProject)}
                    disabled={isGenerating || !selectedProject}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate Allocation
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Generated Allocation Results */}
              {generatedAllocation && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Generated Allocation</h4>
                  <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-semibold">{generatedAllocation.projectName}</h5>
                        <p className="text-sm text-muted-foreground">{generatedAllocation.framework}</p>
                      </div>
                      <Badge variant="secondary">
                        {generatedAllocation.confidenceScore}% confidence
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Team:</span> {generatedAllocation.teamMembers.join(', ')}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hours:</span> {generatedAllocation.allocatedHours}h
                      </div>
                      <div>
                        <span className="text-muted-foreground">Start:</span> {generatedAllocation.startDate}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completion:</span> {generatedAllocation.estimatedCompletion}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        AI Recommendation: {generatedAllocation.reasoning}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setGeneratedAllocation(null)}
                        >
                          Regenerate
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            // Apply the allocation
                            setAllocations(prev => [...prev, {
                              projectId: selectedProject!,
                              teamMembers: teamMembers.filter(m => 
                                generatedAllocation.teamMembers.includes(m.name)
                              ).map(m => m.id),
                              allocatedHours: generatedAllocation.allocatedHours,
                              startDate: generatedAllocation.startDate,
                              estimatedCompletion: generatedAllocation.estimatedCompletion,
                              confidenceScore: generatedAllocation.confidenceScore,
                              recommendations: [],
                              riskFactors: []
                            }])
                            setGeneratedAllocation(null)
                            setSelectedProject('')
                          }}
                        >
                          Apply Allocation
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Projects Overview */}
              <div className="space-y-4">
                <h4 className="font-semibold">Pending Projects</h4>
                {projects.filter(p => p.status === 'pending').map(project => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-semibold">{project.name}</h5>
                        <p className="text-sm text-muted-foreground">{project.framework}</p>
                      </div>
                      <Badge variant="outline" className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Complexity:</span> {project.complexity}/10
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hours:</span> {project.estimatedHours}h
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deadline:</span> {project.deadline}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk:</span> {project.riskLevel}/10
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.requiredExpertise.map(expertise => (
                          <Badge key={expertise} variant="secondary" className="text-xs">
                            {expertise}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balancing" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Smart Workload Balancing</h2>
              <p className="text-muted-foreground">Intelligent framework-based workload distribution and optimization</p>
            </div>
            <Button
              onClick={performSmartRebalancing}
              disabled={isRebalancing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isRebalancing ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Rebalancing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Smart Rebalance
                </>
              )}
            </Button>
          </div>

          {/* Framework Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar className="h-5 w-5" />
                Regulatory Framework Distribution
              </CardTitle>
              <CardDescription>Current workload distribution across compliance frameworks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {frameworkWorkloads.map(framework => (
                  <div
                    key={framework.name}
                    className={`border rounded-lg p-4 ${
                      framework.criticalPath ? 'border-red-200 bg-red-50' :
                      framework.teamUtilization > 80 ? 'border-orange-200 bg-orange-50' :
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{framework.name}</h4>
                      <div className="flex items-center gap-2">
                        {framework.criticalPath && (
                          <Badge variant="destructive" className="text-xs">
                            Critical Path
                          </Badge>
                        )}
                        <Badge variant={framework.teamUtilization > 85 ? 'destructive' : 
                          framework.teamUtilization > 70 ? 'secondary' : 'outline'
                        }>
                          {framework.teamUtilization}% utilized
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Active Projects:</span>
                        <span className="font-medium">{framework.activeProjects}/{framework.totalProjects}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Expertise Gap:</span>
                        <span className={`font-medium ${
                          framework.expertiseGap > 60 ? 'text-red-600' :
                          framework.expertiseGap > 30 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {framework.expertiseGap}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Demand Trend:</span>
                        <span className={`font-medium flex items-center gap-1 ${
                          framework.demandTrend > 0 ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                          {framework.demandTrend > 0 ? '↗' : '→'} {framework.demandTrend}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Workload Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Workload Overview
              </CardTitle>
              <CardDescription>Individual team member utilization and capacity analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workloadBalance.map(balance => {
                  const member = teamMembers.find(m => m.id === balance.memberId)
                  if (!member) return null
                  
                  return (
                    <div
                      key={balance.memberId}
                      className={`border rounded-lg p-4 ${
                        balance.burnoutRisk === 'high' ? 'border-red-200 bg-red-50' :
                        balance.burnoutRisk === 'medium' ? 'border-orange-200 bg-orange-50' :
                        'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            balance.burnoutRisk === 'high' ? 'destructive' : 
                            balance.burnoutRisk === 'medium' ? 'default' : 'secondary'
                          }>
                            {balance.burnoutRisk} risk
                          </Badge>
                          <Badge variant="outline">
                            {balance.efficiency}% efficiency
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Current Load:</span>
                          <span className="font-medium">{balance.currentLoad}%</span>
                        </div>
                        <Progress value={balance.currentLoad} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Optimal Load:</span>
                          <span className="font-medium text-green-600">{balance.optimalLoad}%</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Utilization Gap:</span>
                          <span className={`font-medium ${
                            balance.utilizationGap > 20 ? 'text-red-600' :
                            balance.utilizationGap > 10 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {balance.utilizationGap > 0 ? '+' : ''}{balance.utilizationGap}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Optimization Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Optimization Recommendations
              </CardTitle>
              <CardDescription>AI-powered suggestions for improving team efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveInsights.slice(0, 3).map((insight, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      insight.impact === 'high' ? 'border-blue-200 bg-blue-50' :
                      insight.impact === 'medium' ? 'border-orange-200 bg-orange-50' :
                      'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Timeframe: {insight.timeframe}
                      </span>
                      {insight.actionable && (
                        <Button size="sm" variant="outline">
                          Apply Suggestion
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Individual and collective performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{metric.period}</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Efficiency</span>
                            <span>{metric.efficiency}%</span>
                          </div>
                          <Progress value={metric.efficiency} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Quality</span>
                            <span>{metric.quality}%</span>
                          </div>
                          <Progress value={metric.quality} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>On-Time Delivery</span>
                            <span>{metric.onTimeDelivery}%</span>
                          </div>
                          <Progress value={metric.onTimeDelivery} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {teamMembers.map(member => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge variant="outline">
                        {member.performanceScore}% performance
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Efficiency</p>
                        <div className="flex items-center gap-2">
                          <Progress value={member.efficiency} className="flex-1" />
                          <span className="text-sm font-medium">{member.efficiency}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Current Workload</p>
                        <div className="flex items-center gap-2">
                          <Progress value={member.workload} className="flex-1" />
                          <span className="text-sm font-medium">{member.workload}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Availability</p>
                        <div className="flex items-center gap-2">
                          <Progress value={member.availability} className="flex-1" />
                          <span className="text-sm font-medium">{member.availability}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Quality Rating</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⭐</span>
                          <span className="text-sm font-medium">{member.qualityRating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Completed Audits:</span> {member.completedAudits}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg. Time:</span> {member.averageTime}h
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expertise:</span> {member.expertise.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Predictive Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Predictive Insights
                </CardTitle>
                <CardDescription>AI-powered predictions and recommendations based on historical data</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {predictiveInsights.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Generating insights...</p>
                      <p className="text-sm">AI is analyzing team performance patterns</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {predictiveInsights.map((insight, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 ${
                            insight.impact === 'high' ? 'border-red-200 bg-red-50' :
                            insight.impact === 'medium' ? 'border-orange-200 bg-orange-50' :
                            'border-blue-200 bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {insight.type === 'risk' && <Warning className="h-4 w-4 text-red-600" />}
                              {insight.type === 'opportunity' && <TrendUp className="h-4 w-4 text-green-600" />}
                              {insight.type === 'optimization' && <Zap className="h-4 w-4 text-blue-600" />}
                              <h4 className="font-semibold">{insight.title}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                                {insight.impact}
                              </Badge>
                              {insight.actionable && (
                                <Badge variant="outline" className="text-xs">
                                  Actionable
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {insight.timeframe}
                            </span>
                            {insight.actionable && (
                              <Button size="sm" variant="outline" className="h-6 text-xs">
                                Take Action
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Capacity Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Capacity Forecast
                </CardTitle>
                <CardDescription>4-week capacity planning and skill development tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {capacityForecast.map(forecast => {
                      const member = teamMembers.find(m => m.id === forecast.memberId)
                      if (!member) return null
                      
                      return (
                        <div key={forecast.memberId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-sm">{member.name}</h4>
                              <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                            <Badge variant="outline">
                              {Math.round(forecast.currentCapacity)}% available
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Projected Capacity (4 weeks)</span>
                              </div>
                              <div className="grid grid-cols-4 gap-1">
                                {forecast.projectedCapacity.map((capacity, weekIndex) => (
                                  <div key={weekIndex} className="text-center">
                                    <div className="text-xs font-medium">{Math.round(capacity)}%</div>
                                    <Progress value={capacity} className="h-1" />
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {forecast.skillGaps.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Skill Gaps:</p>
                                <div className="flex flex-wrap gap-1">
                                  {forecast.skillGaps.map(skill => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {forecast.developmentNeeds.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Development Needs:</p>
                                <div className="flex flex-wrap gap-1">
                                  {forecast.developmentNeeds.map(need => (
                                    <Badge key={need} variant="outline" className="text-xs border-orange-300">
                                      {need}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <TemplateOptimizationEngine />
        </TabsContent>
      </Tabs>
    </div>
  )
}
