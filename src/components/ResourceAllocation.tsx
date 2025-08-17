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
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Brain,
  Calendar,
  Settings,
  Zap,
  Award,
  Activity
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

interface ResourceAllocation {
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
      completedAudits: 24,
      averageTime: 18.5,
      qualityRating: 4.8
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      role: 'Compliance Manager',
      expertise: ['EU MDR', 'CAPA', 'Document Control'],
      efficiency: 88,
      workload: 60,
      availability: 95,
      performanceScore: 91,
      completedAudits: 31,
      averageTime: 22.1,
      qualityRating: 4.6
    },
    {
      id: '3',
      name: 'Dr. Lisa Wang',
      role: 'Regulatory Affairs Director',
      expertise: ['ISO 14971', 'Clinical Evaluation', 'Post-Market Surveillance'],
      efficiency: 95,
      workload: 85,
      availability: 70,
      performanceScore: 96,
      completedAudits: 19,
      averageTime: 15.3,
      qualityRating: 4.9
    },
    {
      id: '4',
      name: 'James Thompson',
      role: 'Quality Analyst',
      expertise: ['Process Validation', 'Supplier Management', 'CAPA'],
      efficiency: 85,
      workload: 45,
      availability: 90,
      performanceScore: 87,
      completedAudits: 28,
      averageTime: 25.7,
      qualityRating: 4.4
    }
  ])

  const [projects, setProjects] = useKV<Project[]>('allocation-projects', [
    {
      id: '1',
      name: 'Q3 ISO 13485 Internal Audit',
      framework: 'ISO 13485',
      priority: 'high',
      complexity: 8,
      estimatedHours: 120,
      deadline: '2024-09-30',
      requiredExpertise: ['ISO 13485', 'Risk Management'],
      status: 'pending',
      riskLevel: 6
    },
    {
      id: '2',
      name: 'FDA Pre-Submission Review',
      framework: 'FDA QSR',
      priority: 'critical',
      complexity: 9,
      estimatedHours: 200,
      deadline: '2024-08-15',
      requiredExpertise: ['FDA QSR', 'Clinical Evaluation'],
      status: 'pending',
      riskLevel: 8
    },
    {
      id: '3',
      name: 'CAPA Effectiveness Review',
      framework: 'CAPA',
      priority: 'medium',
      complexity: 6,
      estimatedHours: 80,
      deadline: '2024-10-15',
      requiredExpertise: ['CAPA', 'Process Validation'],
      status: 'pending',
      riskLevel: 4
    }
  ])

  const [allocations, setAllocations] = useKV<ResourceAllocation[]>('resource-allocations', [])
  const [performanceMetrics] = useKV<PerformanceMetric[]>('performance-metrics', [
    { period: 'Q1 2024', efficiency: 89, quality: 4.6, onTimeDelivery: 94, utilization: 82, satisfaction: 4.4 },
    { period: 'Q2 2024', efficiency: 92, quality: 4.7, onTimeDelivery: 96, utilization: 85, satisfaction: 4.6 },
    { period: 'Q3 2024', efficiency: 94, quality: 4.8, onTimeDelivery: 98, utilization: 88, satisfaction: 4.7 }
  ])

  const [selectedProject, setSelectedProject] = useState<string>('')
  const [allocationStrategy, setAllocationStrategy] = useState<'balanced' | 'efficiency' | 'expertise'>('balanced')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [autoAllocation, setAutoAllocation] = useKV('auto-allocation-enabled', true)

  // AI-powered resource allocation algorithm
  const generateOptimalAllocation = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    setIsOptimizing(true)

    try {
      // Simulate AI analysis of historical performance and current workloads
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Calculate optimal team composition based on expertise match and availability
      const expertiseScore = (member: TeamMember) => {
        const matchingExpertise = member.expertise.filter(exp => 
          project.requiredExpertise.includes(exp)
        ).length
        return (matchingExpertise / project.requiredExpertise.length) * 100
      }

      const availabilityScore = (member: TeamMember) => {
        return member.availability * (1 - member.workload / 100)
      }

      const efficiencyScore = (member: TeamMember) => {
        return member.efficiency * member.performanceScore / 100
      }

      // Score each team member based on strategy
      const scoredMembers = teamMembers.map(member => {
        let score = 0
        
        switch (allocationStrategy) {
          case 'balanced':
            score = (expertiseScore(member) * 0.4) + 
                   (availabilityScore(member) * 0.3) + 
                   (efficiencyScore(member) * 0.3)
            break
          case 'efficiency':
            score = (efficiencyScore(member) * 0.5) + 
                   (expertiseScore(member) * 0.3) + 
                   (availabilityScore(member) * 0.2)
            break
          case 'expertise':
            score = (expertiseScore(member) * 0.6) + 
                   (efficiencyScore(member) * 0.2) + 
                   (availabilityScore(member) * 0.2)
            break
        }

        return { ...member, allocationScore: score }
      }).sort((a, b) => b.allocationScore - a.allocationScore)

      // Select optimal team size based on project complexity
      const teamSize = Math.max(2, Math.min(4, Math.ceil(project.complexity / 3)))
      const selectedTeam = scoredMembers.slice(0, teamSize)

      // Calculate estimated completion based on team efficiency
      const avgEfficiency = selectedTeam.reduce((sum, m) => sum + m.efficiency, 0) / selectedTeam.length
      const adjustedHours = project.estimatedHours * (100 / avgEfficiency)
      const workingDaysPerWeek = 5
      const hoursPerDay = 8
      const estimatedDays = Math.ceil(adjustedHours / (teamSize * hoursPerDay))
      
      const startDate = new Date()
      const completionDate = new Date(startDate)
      completionDate.setDate(completionDate.getDate() + estimatedDays)

      // Generate AI recommendations
      const recommendations = [
        `Optimal team size of ${teamSize} members based on project complexity`,
        `Estimated ${Math.round(avgEfficiency)}% team efficiency based on historical performance`,
        selectedTeam.length > 0 && selectedTeam[0].allocationScore > 80 
          ? 'High confidence allocation - strong expertise match' 
          : 'Consider additional training or external consultation',
        estimatedDays <= 30 
          ? 'Timeline is achievable with current resource allocation'
          : 'Consider extending deadline or adding resources'
      ].filter(Boolean) as string[]

      // Identify risk factors
      const riskFactors = []
      if (avgEfficiency < 85) riskFactors.push('Below-average team efficiency')
      if (selectedTeam.some(m => m.workload > 80)) riskFactors.push('High workload on key team members')
      if (new Date(project.deadline) < completionDate) riskFactors.push('Tight deadline may impact quality')
      if (project.riskLevel > 7) riskFactors.push('High-risk project requires additional oversight')

      const newAllocation: ResourceAllocation = {
        projectId,
        teamMembers: selectedTeam.map(m => m.id),
        allocatedHours: Math.round(adjustedHours),
        startDate: startDate.toISOString().split('T')[0],
        estimatedCompletion: completionDate.toISOString().split('T')[0],
        confidenceScore: Math.min(95, Math.round(avgEfficiency * selectedTeam.length * 0.1)),
        recommendations,
        riskFactors
      }

      setAllocations(prev => {
        const filtered = prev.filter(a => a.projectId !== projectId)
        return [...filtered, newAllocation]
      })

      // Update project status
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, status: 'assigned' as const } : p
      ))

      toast.success('Optimal resource allocation generated successfully')

    } catch (error) {
      toast.error('Failed to generate allocation')
    } finally {
      setIsOptimizing(false)
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
          <h1 className="text-3xl font-bold">Resource Allocation</h1>
          <p className="text-muted-foreground">AI-powered intelligent resource optimization based on historical performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-allocation" className="text-sm">Auto-allocation</Label>
          <Switch
            id="auto-allocation"
            checked={autoAllocation}
            onCheckedChange={setAutoAllocation}
          />
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Template AI</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team Utilization</p>
                    <p className="text-2xl font-bold">78%</p>
                  </div>
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <Progress value={78} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Efficiency Score</p>
                    <p className="text-2xl font-bold">94%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <Progress value={94} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                    <p className="text-2xl font-bold">98%</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <Progress value={98} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Quality Rating</p>
                    <p className="text-2xl font-bold">4.8</p>
                  </div>
                  <Award className="h-8 w-8 text-accent" />
                </div>
                <div className="mt-2 flex text-sm text-muted-foreground">
                  <span>⭐ Average team rating</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Allocations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Current Resource Allocations
              </CardTitle>
              <CardDescription>Active project assignments and team distribution</CardDescription>
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
                              <AlertTriangle className="h-4 w-4" />
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
                    disabled={!selectedProject || isOptimizing}
                    className="w-full"
                  >
                    {isOptimizing ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Optimizing...
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

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Pending Projects</h4>
                {projects.filter(p => p.status === 'pending').map(project => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium">{project.name}</h5>
                        <p className="text-sm text-muted-foreground">{project.framework}</p>
                      </div>
                      <Badge className={getPriorityColor(project.priority)}>
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
                      <p className="text-sm text-muted-foreground">Required Expertise:</p>
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

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Overview</CardTitle>
              <CardDescription>Individual and collective performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamMembers.map(member => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge variant="outline">
                        {member.performanceScore}% performance score
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

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>Historical performance trends and predictive insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {performanceMetrics.map((metric, index) => (
                    <div key={metric.period} className="border rounded-lg p-4">
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
                            <span>On-Time Delivery</span>
                            <span>{metric.onTimeDelivery}%</span>
                          </div>
                          <Progress value={metric.onTimeDelivery} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Utilization</span>
                            <span>{metric.utilization}%</span>
                          </div>
                          <Progress value={metric.utilization} />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span>Quality Rating</span>
                          <div className="flex items-center gap-1">
                            <span>⭐</span>
                            <span>{metric.quality}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Allocation Insights</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>98% of allocations completed on time in Q3</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span>Team efficiency improved by 5% with AI optimization</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span>High-complexity projects show 15% longer completion times</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Optimization Recommendations</h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium mb-1">Cross-training Initiative</div>
                        <p className="text-muted-foreground">
                          Expand FDA QSR expertise across team to improve allocation flexibility
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium mb-1">Workload Balancing</div>
                        <p className="text-muted-foreground">
                          Redistribute high-priority projects to optimize team utilization
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium mb-1">Capacity Planning</div>
                        <p className="text-muted-foreground">
                          Consider adding specialized resource for EU MDR compliance surge
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <TemplateOptimizationEngine />
        </TabsContent>
      </Tabs>
    </div>
  )
}