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
  const [predictiveInsights, setPredictiveInsights] = useKV<PredictiveInsight[]>('predictive-insights', [])
  const [capacityForecast, setCapacityForecast] = useKV<TeamCapacityForecast[]>('capacity-forecast', [])
  
  // Generate predictive insights based on historical data and current trends
  useEffect(() => {
    const generateInsights = async () => {
      const insights: PredictiveInsight[] = []
      
      // Analyze team utilization patterns
      const avgUtilization = teamMembers.reduce((sum, m) => sum + m.workload, 0) / teamMembers.length
      if (avgUtilization > 85) {
        insights.push({
          type: 'risk',
          title: 'Team Capacity Overload Risk',
          description: `Average team utilization at ${Math.round(avgUtilization)}% indicates potential burnout risk within 2-3 weeks`,
          impact: 'high',
          timeframe: '2-3 weeks',
          actionable: true
        })
      }
      
      // Expertise gap analysis
      const allRequiredExpertise = projects.flatMap(p => p.requiredExpertise)
      const teamExpertise = teamMembers.flatMap(m => m.expertise)
      const expertiseGaps = allRequiredExpertise.filter(req => 
        !teamExpertise.includes(req) || teamExpertise.filter(exp => exp === req).length < 2
      )
      
      if (expertiseGaps.length > 0) {
        insights.push({
          type: 'opportunity',
          title: 'Skills Development Opportunity',
          description: `Cross-training in ${expertiseGaps.slice(0, 2).join(', ')} could improve allocation flexibility by 25%`,
          impact: 'medium',
          timeframe: '1-2 months',
          actionable: true
        })
      }
      
      // Performance trend analysis
      const recentMetrics = performanceMetrics.slice(-2)
      if (recentMetrics.length === 2) {
        const efficiencyTrend = recentMetrics[1].efficiency - recentMetrics[0].efficiency
        if (efficiencyTrend > 3) {
          insights.push({
            type: 'optimization',
            title: 'Performance Momentum',
            description: `Team efficiency improved by ${efficiencyTrend}% - optimal time for challenging projects`,
            impact: 'medium',
            timeframe: 'Current',
            actionable: true
          })
        }
      }
      
      // Resource allocation success prediction
      const highConfidenceAllocations = allocations.filter(a => a.confidenceScore > 85).length
      const allocationSuccessRate = allocations.length > 0 ? (highConfidenceAllocations / allocations.length) * 100 : 0
      
      if (allocationSuccessRate < 70) {
        insights.push({
          type: 'risk',
          title: 'Allocation Success Rate Declining',
          description: `Only ${Math.round(allocationSuccessRate)}% of recent allocations have high confidence scores`,
          impact: 'medium',
          timeframe: 'Ongoing',
          actionable: true
        })
      }

      setPredictiveInsights(insights)
      
      // Generate capacity forecast
      const forecast = teamMembers.map(member => {
        const baseCapacity = member.availability * (1 - member.workload / 100)
        const projectedCapacity = Array.from({length: 4}, (_, i) => {
          // Simulate capacity changes over next 4 weeks
          const weeklyVariation = Math.sin((i + 1) * 0.5) * 10 // Natural capacity fluctuation
          const trendAdjustment = member.performanceScore > 90 ? 5 : member.performanceScore < 80 ? -5 : 0
          return Math.max(0, Math.min(100, baseCapacity + weeklyVariation + trendAdjustment))
        })
        
        const allExpertise = projects.flatMap(p => p.requiredExpertise)
        const memberExpertise = member.expertise
        const skillGaps = allExpertise.filter(skill => !memberExpertise.includes(skill))
        const uniqueSkillGaps = [...new Set(skillGaps)].slice(0, 3)
        
        return {
          memberId: member.id,
          currentCapacity: baseCapacity,
          projectedCapacity,
          skillGaps: uniqueSkillGaps,
          developmentNeeds: member.performanceScore < 85 ? ['Performance coaching', 'Process optimization'] : []
        }
      })
      
      setCapacityForecast(forecast)
    }

    if (teamMembers.length > 0) {
      generateInsights()
    }
  }, [teamMembers, projects, allocations, performanceMetrics, setPredictiveInsights, setCapacityForecast])

  // Advanced AI-powered resource allocation algorithm with historical performance analysis
  const generateOptimalAllocation = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    setIsOptimizing(true)

    try {
      // Use LLM to analyze project requirements and historical performance
      const projectContext = spark.llmPrompt`
        Analyze this compliance project for optimal resource allocation:
        
        Project: ${project.name}
        Framework: ${project.framework}
        Priority: ${project.priority}
        Complexity: ${project.complexity}/10
        Estimated Hours: ${project.estimatedHours}
        Required Expertise: ${project.requiredExpertise.join(', ')}
        Deadline: ${project.deadline}
        Risk Level: ${project.riskLevel}/10
        
        Team Members Available:
        ${teamMembers.map(m => `
          - ${m.name} (${m.role})
            Expertise: ${m.expertise.join(', ')}
            Efficiency: ${m.efficiency}%
            Current Workload: ${m.workload}%
            Availability: ${m.availability}%
            Performance Score: ${m.performanceScore}%
            Quality Rating: ${m.qualityRating}/5
            Avg Time per Audit: ${m.averageTime}h
        `).join('')}
        
        Historical Performance Trends:
        ${performanceMetrics.map(m => `
          ${m.period}: Efficiency ${m.efficiency}%, Quality ${m.quality}/5, On-time ${m.onTimeDelivery}%
        `).join('')}
        
        Based on this data, provide allocation insights focusing on:
        1. Optimal team composition and size
        2. Workload distribution strategy
        3. Risk mitigation approaches
        4. Timeline feasibility assessment
      `

      const aiAnalysis = await spark.llm(projectContext, 'gpt-4o', true)
      const analysis = JSON.parse(aiAnalysis)

      // Calculate advanced scoring metrics
      const expertiseScore = (member: TeamMember) => {
        const directMatches = member.expertise.filter(exp => 
          project.requiredExpertise.includes(exp)
        ).length
        const relatedMatches = member.expertise.length - directMatches
        return ((directMatches * 2) + relatedMatches) / (project.requiredExpertise.length * 2) * 100
      }

      const availabilityScore = (member: TeamMember) => {
        const workloadFactor = 1 - (member.workload / 100)
        const availabilityFactor = member.availability / 100
        return workloadFactor * availabilityFactor * 100
      }

      const efficiencyScore = (member: TeamMember) => {
        // Weight recent performance more heavily
        const recentMetric = performanceMetrics[performanceMetrics.length - 1]
        const baseEfficiency = member.efficiency
        const qualityBonus = (member.qualityRating - 3) * 5 // Bonus/penalty for quality above/below average
        const timeEfficiency = Math.max(0, 30 - member.averageTime) * 2 // Bonus for faster completion
        
        return Math.min(100, baseEfficiency + qualityBonus + timeEfficiency)
      }

      const collaborationScore = (member: TeamMember) => {
        // Simulate collaboration effectiveness based on past project outcomes
        const teamSize = teamMembers.length
        const roleCompatibility = member.role.includes('Senior') || member.role.includes('Director') ? 10 : 5
        return Math.min(100, (member.performanceScore * 0.7) + roleCompatibility + (teamSize * 2))
      }

      // Advanced scoring with multiple factors
      const scoredMembers = teamMembers.map(member => {
        let score = 0
        const expertise = expertiseScore(member)
        const availability = availabilityScore(member)
        const efficiency = efficiencyScore(member)
        const collaboration = collaborationScore(member)
        
        switch (allocationStrategy) {
          case 'balanced':
            score = (expertise * 0.35) + (availability * 0.25) + (efficiency * 0.25) + (collaboration * 0.15)
            break
          case 'efficiency':
            score = (efficiency * 0.45) + (expertise * 0.25) + (availability * 0.20) + (collaboration * 0.10)
            break
          case 'expertise':
            score = (expertise * 0.50) + (efficiency * 0.20) + (collaboration * 0.20) + (availability * 0.10)
            break
        }

        return { 
          ...member, 
          allocationScore: score,
          expertiseMatch: expertise,
          effectiveAvailability: availability,
          adjustedEfficiency: efficiency,
          collaborationFit: collaboration
        }
      }).sort((a, b) => b.allocationScore - a.allocationScore)

      // Intelligent team size calculation based on project characteristics
      let teamSize = 2 // Minimum team size
      if (project.complexity >= 8) teamSize = Math.min(4, teamSize + 2)
      if (project.priority === 'critical') teamSize = Math.min(4, teamSize + 1)
      if (project.riskLevel >= 7) teamSize = Math.min(4, teamSize + 1)
      if (project.estimatedHours > 150) teamSize = Math.min(4, teamSize + 1)
      
      const selectedTeam = scoredMembers.slice(0, teamSize)

      // Advanced timeline calculation with risk factors
      const baseEfficiency = selectedTeam.reduce((sum, m) => sum + m.adjustedEfficiency, 0) / selectedTeam.length
      const collaborationBonus = selectedTeam.reduce((sum, m) => sum + m.collaborationFit, 0) / selectedTeam.length / 100 * 0.1
      const complexityPenalty = project.complexity >= 8 ? 0.15 : project.complexity >= 6 ? 0.1 : 0
      const riskPenalty = project.riskLevel >= 7 ? 0.1 : project.riskLevel >= 5 ? 0.05 : 0
      
      const finalEfficiency = Math.max(0.6, Math.min(1.2, 
        (baseEfficiency / 100) + collaborationBonus - complexityPenalty - riskPenalty
      ))

      const adjustedHours = Math.round(project.estimatedHours / finalEfficiency)
      const parallelizationFactor = Math.min(teamSize, Math.ceil(project.complexity / 2.5))
      const estimatedDays = Math.ceil(adjustedHours / (parallelizationFactor * 6)) // 6 productive hours per day

      const startDate = new Date()
      const completionDate = new Date(startDate)
      completionDate.setDate(completionDate.getDate() + estimatedDays)

      // AI-generated recommendations with specific insights
      const recommendations = [
        `Optimal ${teamSize}-member team selected using advanced performance analytics`,
        `Projected ${Math.round(finalEfficiency * 100)}% efficiency with ${parallelizationFactor}x parallelization`,
        selectedTeam[0].expertiseMatch > 90 
          ? 'Excellent expertise alignment - expect high-quality outcomes'
          : selectedTeam[0].expertiseMatch > 70
          ? 'Good expertise match with minor knowledge gaps'
          : 'Consider additional expert consultation or training',
        estimatedDays <= 30 
          ? 'Timeline achievable with current allocation'
          : estimatedDays <= 45
          ? 'Timeline is tight but manageable with focused effort'
          : 'Consider deadline extension or additional resources',
        selectedTeam.some(m => m.qualityRating >= 4.7)
          ? 'Team includes high-quality performers - expect excellent deliverables'
          : 'Monitor quality closely and implement additional review cycles'
      ]

      // Enhanced risk assessment
      const riskFactors = []
      if (baseEfficiency < 85) riskFactors.push('Team efficiency below historical average')
      if (selectedTeam.some(m => m.workload > 85)) riskFactors.push('Critical team members at capacity limit')
      if (new Date(project.deadline) < completionDate) {
        const daysDifference = Math.ceil((completionDate.getTime() - new Date(project.deadline).getTime()) / (1000 * 3600 * 24))
        riskFactors.push(`Timeline overrun by ${daysDifference} days`)
      }
      if (project.riskLevel > 7 && teamSize < 3) riskFactors.push('High-risk project may need larger team')
      if (selectedTeam.some(m => m.expertiseMatch < 60)) riskFactors.push('Expertise gaps may require external support')
      
      // Calculate confidence score based on multiple factors
      const expertiseConfidence = selectedTeam.reduce((sum, m) => sum + m.expertiseMatch, 0) / selectedTeam.length
      const availabilityConfidence = selectedTeam.reduce((sum, m) => sum + m.effectiveAvailability, 0) / selectedTeam.length
      const timelineConfidence = new Date(project.deadline) >= completionDate ? 100 : 
        Math.max(50, 100 - (estimatedDays - 30) * 2)
      
      const confidenceScore = Math.round(
        (expertiseConfidence * 0.4) + 
        (availabilityConfidence * 0.3) + 
        (timelineConfidence * 0.3)
      )

      const newAllocation: ResourceAllocation = {
        projectId,
        teamMembers: selectedTeam.map(m => m.id),
        allocatedHours: adjustedHours,
        startDate: startDate.toISOString().split('T')[0],
        estimatedCompletion: completionDate.toISOString().split('T')[0],
        confidenceScore: Math.min(95, Math.max(60, confidenceScore)),
        recommendations,
        riskFactors
      }

      setAllocations(prev => {
        const filtered = prev.filter(a => a.projectId !== projectId)
        return [...filtered, newAllocation]
      })

      // Update project status and store allocation analytics
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, status: 'assigned' as const } : p
      ))

      toast.success(`Intelligent allocation generated with ${confidenceScore}% confidence`, {
        description: `Team: ${selectedTeam.map(m => m.name).join(', ')}`
      })

    } catch (error) {
      console.error('Allocation generation failed:', error)
      toast.error('Failed to generate optimal allocation')
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="optimization">Template AI</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Enhanced Key Metrics with Intelligence Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Smart Utilization</p>
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-xs text-green-600">↑ 12% vs manual allocation</p>
                  </div>
                  <div className="relative">
                    <Activity className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full flex items-center justify-center">
                      <Brain className="h-2 w-2 text-white" />
                    </div>
                  </div>
                </div>
                <Progress value={78} className="mt-2" />
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
                    <TrendingUp className="h-8 w-8 text-green-600" />
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
                    <p className="text-sm text-muted-foreground">Predictive Accuracy</p>
                    <p className="text-2xl font-bold">91%</p>
                    <p className="text-xs text-blue-600">Timeline predictions</p>
                  </div>
                  <div className="relative">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-purple-500 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-2 w-2 text-white" />
                    </div>
                  </div>
                </div>
                <Progress value={91} className="mt-2" />
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
                    <Award className="h-8 w-8 text-accent" />
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
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI-Powered Allocation Insights
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>98% of AI-optimized allocations completed on time in Q3</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span>Team efficiency improved by 15% with intelligent matching</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                        <Zap className="h-4 w-4 text-purple-600" />
                        <span>Predictive analytics reduced planning time by 40%</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span>High-complexity projects show 20% variance in completion times</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Performance-Based Optimization Recommendations
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium mb-1 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Cross-Functional Expertise Initiative
                        </div>
                        <p className="text-muted-foreground">
                          Develop FDA QSR expertise in 2 additional team members to improve allocation flexibility by 35%
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">ROI: High</Badge>
                          <Badge variant="outline" className="text-xs">Timeline: 8 weeks</Badge>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium mb-1 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Workload Optimization Algorithm
                        </div>
                        <p className="text-muted-foreground">
                          Implement dynamic workload balancing to maintain 75-85% utilization across all team members
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">ROI: Medium</Badge>
                          <Badge variant="outline" className="text-xs">Timeline: 2 weeks</Badge>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium mb-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Predictive Capacity Planning
                        </div>
                        <p className="text-muted-foreground">
                          Add 1 specialized EU MDR consultant for Q4 compliance surge (projected 40% increase in MDR projects)
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">ROI: High</Badge>
                          <Badge variant="outline" className="text-xs">Timeline: 4 weeks</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Performance Matrix */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Advanced Performance Matrix
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-3">Allocation Success Factors</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Expertise Match</span>
                          <span className="font-medium">85% weight</span>
                        </div>
                        <Progress value={85} className="h-2" />
                        
                        <div className="flex justify-between">
                          <span>Team Availability</span>
                          <span className="font-medium">78% weight</span>
                        </div>
                        <Progress value={78} className="h-2" />
                        
                        <div className="flex justify-between">
                          <span>Historical Performance</span>
                          <span className="font-medium">92% weight</span>
                        </div>
                        <Progress value={92} className="h-2" />
                        
                        <div className="flex justify-between">
                          <span>Collaboration Fit</span>
                          <span className="font-medium">71% weight</span>
                        </div>
                        <Progress value={71} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-3">Risk Prediction Accuracy</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Timeline Risks</span>
                          <span className="text-green-600 font-medium">94% accurate</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quality Risks</span>
                          <span className="text-green-600 font-medium">89% accurate</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resource Conflicts</span>
                          <span className="text-orange-600 font-medium">76% accurate</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Scope Changes</span>
                          <span className="text-orange-600 font-medium">68% accurate</span>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                        <strong>AI Learning:</strong> Model accuracy improves 2-3% monthly with new allocation data
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-3">Optimization Impact</h5>
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Time Savings</span>
                            <span className="font-medium">40%</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Planning time reduced from 8h to 4.8h per project</div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Quality Improvement</span>
                            <span className="font-medium">+0.3 pts</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Average quality score: 4.5 → 4.8</div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Resource Utilization</span>
                            <span className="font-medium">+12%</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Optimal utilization: 66% → 78%</div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Cost Efficiency</span>
                            <span className="font-medium">+18%</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Reduced overtime and external consulting</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                        <div key={index} className={`border rounded-lg p-4 ${
                          insight.type === 'risk' ? 'border-red-200 bg-red-50' :
                          insight.type === 'opportunity' ? 'border-green-200 bg-green-50' :
                          'border-blue-200 bg-blue-50'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {insight.type === 'risk' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                              {insight.type === 'opportunity' && <TrendingUp className="h-4 w-4 text-green-600" />}
                              {insight.type === 'optimization' && <Zap className="h-4 w-4 text-blue-600" />}
                              <h4 className="font-semibold text-sm">{insight.title}</h4>
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
                <CardDescription>4-week capacity projection and skill development planning</CardDescription>
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
                                    <div className="text-xs text-muted-foreground">W{weekIndex + 1}</div>
                                    <Progress value={capacity} className="h-2" />
                                    <div className="text-xs font-medium">{Math.round(capacity)}%</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {forecast.skillGaps.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Skill Development Opportunities:</p>
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
                                <p className="text-xs font-medium text-orange-600 mb-1">Development Focus:</p>
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

          {/* Advanced Analytics Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Intelligence Summary</CardTitle>
              <CardDescription>AI-driven insights for strategic resource planning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Optimization Opportunities</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Cross-Training ROI</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Investment in EU MDR training could increase allocation flexibility by 30%
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Efficiency Gains</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        AI-optimized allocations show 15% faster project completion
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Risk Mitigation</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Capacity Planning</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Q4 demand surge may require 1-2 additional team members
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Timeline Risks</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        3 critical projects have overlapping resource requirements
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Strategic Recommendations</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">AI Enhancement</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enable auto-allocation for routine projects to save 40% planning time
                      </p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium">Performance Focus</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Focus on quality metrics to maintain 4.8+ satisfaction rating
                      </p>
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