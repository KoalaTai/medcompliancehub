import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  ChartBar, 
  TrendUp, 
  Trophy, 
  Warning,
  Target,
  Medal,
  User,
  Star,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Scale,
  BookOpen,
  PlayCircle,
  Settings,
  Filter,
  Download,
  Share,
  MessageSquare
} from "@phosphor-icons/react"
import { toast } from 'sonner'

interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  hireDate: string
  skillAssessments: SkillAssessment[]
  overallScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  certifications: string[]
  activeTrainings: number
}

interface SkillAssessment {
  skill: string
  currentLevel: number
  targetLevel: number
  confidenceScore: number
  lastAssessed: string
  trend: 'improving' | 'declining' | 'stable'
  criticalForCompliance: boolean
}

interface TeamSkillMetrics {
  skill: string
  teamAverage: number
  targetLevel: number
  topPerformer: string
  bottomPerformer: string
  gapSpread: number
  improvementTrend: 'up' | 'down' | 'stable'
  urgencyScore: number
}

interface ComplianceRiskAssessment {
  skill: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  vulnerableMembers: string[]
  impactedAudits: string[]
  mitigation: string[]
  estimatedCost: number
}

interface TeamBenchmark {
  category: string
  ourScore: number
  industryAverage: number
  topPercentile: number
  percentileRank: number
  trend: 'improving' | 'declining' | 'stable'
}

interface SkillDevelopmentPlan {
  memberId: string
  memberName: string
  prioritySkills: string[]
  recommendedActions: string[]
  estimatedDuration: number
  cost: number
  deadline: string
  mentorMatch?: string
}

export function TeamSkillComparison() {
  const [teamMembers, setTeamMembers] = useKV<TeamMember[]>('team-members', [])
  const [skillMetrics, setSkillMetrics] = useKV<TeamSkillMetrics[]>('team-skill-metrics', [])
  const [riskAssessments, setRiskAssessments] = useKV<ComplianceRiskAssessment[]>('compliance-risks', [])
  const [benchmarks, setBenchmarks] = useKV<TeamBenchmark[]>('team-benchmarks', [])
  const [developmentPlans, setDevelopmentPlans] = useKV<SkillDevelopmentPlan[]>('development-plans', [])
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedSkill, setSelectedSkill] = useState<string>('all')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'matrix'>('overview')

  // Initialize team data if empty
  useEffect(() => {
    if (teamMembers.length === 0) {
      const initialTeam: TeamMember[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          role: 'Senior Compliance Analyst',
          department: 'Risk Management',
          hireDate: '2021-03-15',
          overallScore: 8.2,
          riskLevel: 'low',
          certifications: ['CISA', 'SOX Specialist'],
          activeTrainings: 2,
          skillAssessments: [
            { skill: 'SOX Compliance Framework', currentLevel: 9, targetLevel: 9, confidenceScore: 95, lastAssessed: '2024-01-15', trend: 'stable', criticalForCompliance: true },
            { skill: 'Risk Assessment Methodologies', currentLevel: 8, targetLevel: 9, confidenceScore: 88, lastAssessed: '2024-01-10', trend: 'improving', criticalForCompliance: true },
            { skill: 'Data Privacy Regulations', currentLevel: 7, targetLevel: 8, confidenceScore: 82, lastAssessed: '2024-01-12', trend: 'improving', criticalForCompliance: true },
            { skill: 'Internal Audit Procedures', currentLevel: 9, targetLevel: 9, confidenceScore: 93, lastAssessed: '2024-01-08', trend: 'stable', criticalForCompliance: true },
            { skill: 'Regulatory Reporting', currentLevel: 8, targetLevel: 9, confidenceScore: 85, lastAssessed: '2024-01-14', trend: 'improving', criticalForCompliance: true }
          ]
        },
        {
          id: '2',
          name: 'Marcus Rodriguez',
          role: 'Compliance Specialist',
          department: 'Legal',
          hireDate: '2022-09-01',
          overallScore: 6.8,
          riskLevel: 'medium',
          certifications: ['CGEIT'],
          activeTrainings: 3,
          skillAssessments: [
            { skill: 'SOX Compliance Framework', currentLevel: 6, targetLevel: 8, confidenceScore: 72, lastAssessed: '2024-01-15', trend: 'improving', criticalForCompliance: true },
            { skill: 'Risk Assessment Methodologies', currentLevel: 7, targetLevel: 8, confidenceScore: 78, lastAssessed: '2024-01-10', trend: 'stable', criticalForCompliance: true },
            { skill: 'Data Privacy Regulations', currentLevel: 8, targetLevel: 9, confidenceScore: 86, lastAssessed: '2024-01-12', trend: 'improving', criticalForCompliance: true },
            { skill: 'Internal Audit Procedures', currentLevel: 5, targetLevel: 8, confidenceScore: 62, lastAssessed: '2024-01-08', trend: 'declining', criticalForCompliance: true },
            { skill: 'Regulatory Reporting', currentLevel: 7, targetLevel: 8, confidenceScore: 74, lastAssessed: '2024-01-14', trend: 'stable', criticalForCompliance: true }
          ]
        },
        {
          id: '3',
          name: 'Emily Johnson',
          role: 'Junior Compliance Analyst',
          department: 'Risk Management',
          hireDate: '2023-06-12',
          overallScore: 5.4,
          riskLevel: 'high',
          certifications: [],
          activeTrainings: 4,
          skillAssessments: [
            { skill: 'SOX Compliance Framework', currentLevel: 4, targetLevel: 7, confidenceScore: 58, lastAssessed: '2024-01-15', trend: 'improving', criticalForCompliance: true },
            { skill: 'Risk Assessment Methodologies', currentLevel: 6, targetLevel: 8, confidenceScore: 65, lastAssessed: '2024-01-10', trend: 'improving', criticalForCompliance: true },
            { skill: 'Data Privacy Regulations', currentLevel: 5, targetLevel: 8, confidenceScore: 55, lastAssessed: '2024-01-12', trend: 'stable', criticalForCompliance: true },
            { skill: 'Internal Audit Procedures', currentLevel: 6, targetLevel: 8, confidenceScore: 68, lastAssessed: '2024-01-08', trend: 'improving', criticalForCompliance: true },
            { skill: 'Regulatory Reporting', currentLevel: 6, targetLevel: 8, confidenceScore: 62, lastAssessed: '2024-01-14', trend: 'improving', criticalForCompliance: true }
          ]
        },
        {
          id: '4',
          name: 'David Kim',
          role: 'Risk Analyst',
          department: 'Risk Management',
          hireDate: '2020-11-08',
          overallScore: 7.6,
          riskLevel: 'low',
          certifications: ['FRM', 'CRM'],
          activeTrainings: 1,
          skillAssessments: [
            { skill: 'SOX Compliance Framework', currentLevel: 7, targetLevel: 8, confidenceScore: 82, lastAssessed: '2024-01-15', trend: 'stable', criticalForCompliance: true },
            { skill: 'Risk Assessment Methodologies', currentLevel: 9, targetLevel: 9, confidenceScore: 94, lastAssessed: '2024-01-10', trend: 'stable', criticalForCompliance: true },
            { skill: 'Data Privacy Regulations', currentLevel: 6, targetLevel: 8, confidenceScore: 71, lastAssessed: '2024-01-12', trend: 'improving', criticalForCompliance: true },
            { skill: 'Internal Audit Procedures', currentLevel: 8, targetLevel: 8, confidenceScore: 87, lastAssessed: '2024-01-08', trend: 'stable', criticalForCompliance: true },
            { skill: 'Regulatory Reporting', currentLevel: 8, targetLevel: 9, confidenceScore: 83, lastAssessed: '2024-01-14', trend: 'improving', criticalForCompliance: true }
          ]
        },
        {
          id: '5',
          name: 'Jennifer Liu',
          role: 'Compliance Manager',
          department: 'Legal',
          hireDate: '2019-04-22',
          overallScore: 8.7,
          riskLevel: 'low',
          certifications: ['CCEP', 'CGEIT', 'CISA'],
          activeTrainings: 1,
          skillAssessments: [
            { skill: 'SOX Compliance Framework', currentLevel: 9, targetLevel: 9, confidenceScore: 96, lastAssessed: '2024-01-15', trend: 'stable', criticalForCompliance: true },
            { skill: 'Risk Assessment Methodologies', currentLevel: 8, targetLevel: 9, confidenceScore: 89, lastAssessed: '2024-01-10', trend: 'improving', criticalForCompliance: true },
            { skill: 'Data Privacy Regulations', currentLevel: 9, targetLevel: 9, confidenceScore: 92, lastAssessed: '2024-01-12', trend: 'stable', criticalForCompliance: true },
            { skill: 'Internal Audit Procedures', currentLevel: 8, targetLevel: 9, confidenceScore: 88, lastAssessed: '2024-01-08', trend: 'improving', criticalForCompliance: true },
            { skill: 'Regulatory Reporting', currentLevel: 9, targetLevel: 9, confidenceScore: 94, lastAssessed: '2024-01-14', trend: 'stable', criticalForCompliance: true }
          ]
        }
      ]
      setTeamMembers(initialTeam)
    }
  }, [teamMembers, setTeamMembers])

  // Initialize benchmarks
  useEffect(() => {
    if (benchmarks.length === 0) {
      const initialBenchmarks: TeamBenchmark[] = [
        { category: 'SOX Compliance', ourScore: 7.2, industryAverage: 6.8, topPercentile: 8.9, percentileRank: 68, trend: 'improving' },
        { category: 'Data Privacy', ourScore: 7.0, industryAverage: 7.2, topPercentile: 9.1, percentileRank: 62, trend: 'stable' },
        { category: 'Risk Assessment', ourScore: 7.6, industryAverage: 7.0, topPercentile: 8.7, percentileRank: 74, trend: 'improving' },
        { category: 'Audit Procedures', ourScore: 7.4, industryAverage: 7.1, topPercentile: 8.8, percentileRank: 71, trend: 'improving' },
        { category: 'Regulatory Reporting', ourScore: 7.7, industryAverage: 7.3, topPercentile: 8.9, percentileRank: 73, trend: 'improving' }
      ]
      setBenchmarks(initialBenchmarks)
    }
  }, [benchmarks, setBenchmarks])

  const runComprehensiveAnalysis = async () => {
    setIsAnalyzing(true)
    toast.info("Running comprehensive team skill analysis...")

    try {
      // Calculate team metrics
      const skillsSet = new Set<string>()
      teamMembers.forEach(member => {
        member.skillAssessments.forEach(skill => skillsSet.add(skill.skill))
      })

      const metrics: TeamSkillMetrics[] = Array.from(skillsSet).map(skillName => {
        const skillData = teamMembers.map(member => 
          member.skillAssessments.find(s => s.skill === skillName)
        ).filter(Boolean)

        const currentLevels = skillData.map(s => s!.currentLevel)
        const teamAverage = currentLevels.reduce((a, b) => a + b, 0) / currentLevels.length
        const targetLevel = skillData[0]?.targetLevel || 8

        const sortedMembers = teamMembers
          .map(member => ({
            name: member.name,
            level: member.skillAssessments.find(s => s.skill === skillName)?.currentLevel || 0
          }))
          .sort((a, b) => b.level - a.level)

        const gapSpread = Math.max(...currentLevels) - Math.min(...currentLevels)
        
        // Calculate urgency based on gaps and upcoming audits
        const averageGap = targetLevel - teamAverage
        const urgencyScore = Math.min(100, (averageGap * 20) + (gapSpread * 10))

        return {
          skill: skillName,
          teamAverage: Math.round(teamAverage * 10) / 10,
          targetLevel,
          topPerformer: sortedMembers[0]?.name || 'N/A',
          bottomPerformer: sortedMembers[sortedMembers.length - 1]?.name || 'N/A',
          gapSpread: Math.round(gapSpread * 10) / 10,
          improvementTrend: calculateImprovementTrend(skillData),
          urgencyScore: Math.round(urgencyScore)
        }
      })

      setSkillMetrics(metrics)

      // Generate risk assessments using AI
      const riskPrompt = spark.llmPrompt`
        Analyze compliance risks for our team based on skill data:
        
        TEAM DATA: ${JSON.stringify(teamMembers)}
        SKILL METRICS: ${JSON.stringify(metrics)}
        
        Identify:
        1. Skills with highest risk levels
        2. Team members who are vulnerable
        3. Potential audit impacts
        4. Mitigation strategies
        
        Focus on critical compliance skills and upcoming audit requirements.
        Format as JSON with risk levels and specific recommendations.
      `

      let riskData = []
      try {
        const riskResponse = await spark.llm(riskPrompt, "gpt-4o", true)
        riskData = JSON.parse(riskResponse)
      } catch {
        // Fallback risk calculation
        riskData = generateRiskAssessments(metrics, teamMembers)
      }

      setRiskAssessments(riskData)

      // Generate development plans
      const planPrompt = spark.llmPrompt`
        Create personalized development plans for team members:
        
        TEAM DATA: ${JSON.stringify(teamMembers)}
        RISK ASSESSMENTS: ${JSON.stringify(riskData)}
        
        For each team member, provide:
        1. Priority skills to develop
        2. Specific recommended actions
        3. Realistic timelines
        4. Cost estimates
        5. Potential mentor matches within the team
        
        Consider individual experience levels and current workload.
      `

      let planData = []
      try {
        const planResponse = await spark.llm(planPrompt, "gpt-4o", true)
        planData = JSON.parse(planResponse)
      } catch {
        // Fallback development plans
        planData = generateDevelopmentPlans(teamMembers, metrics)
      }

      setDevelopmentPlans(planData)

      toast.success("Comprehensive team analysis complete!")
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error("Analysis failed, using fallback calculations")
      
      // Fallback calculations
      const fallbackMetrics = generateFallbackMetrics(teamMembers)
      setSkillMetrics(fallbackMetrics)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateImprovementTrend = (skillData: any[]): 'up' | 'down' | 'stable' => {
    const improvingCount = skillData.filter(s => s.trend === 'improving').length
    const decliningCount = skillData.filter(s => s.trend === 'declining').length
    
    if (improvingCount > decliningCount) return 'up'
    if (decliningCount > improvingCount) return 'down'
    return 'stable'
  }

  const generateRiskAssessments = (metrics: TeamSkillMetrics[], members: TeamMember[]): ComplianceRiskAssessment[] => {
    return metrics.map(metric => {
      const gap = metric.targetLevel - metric.teamAverage
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
      
      if (gap >= 3 || metric.gapSpread >= 4) riskLevel = 'critical'
      else if (gap >= 2 || metric.gapSpread >= 3) riskLevel = 'high'
      else if (gap >= 1 || metric.gapSpread >= 2) riskLevel = 'medium'

      const vulnerableMembers = members
        .filter(member => {
          const skill = member.skillAssessments.find(s => s.skill === metric.skill)
          return skill && skill.currentLevel < metric.targetLevel - 1
        })
        .map(m => m.name)

      return {
        skill: metric.skill,
        riskLevel,
        vulnerableMembers,
        impactedAudits: ['SOX 404 Review', 'Annual Compliance Audit'],
        mitigation: [
          `Accelerated training for ${vulnerableMembers.length} team members`,
          'Cross-training initiatives',
          'External expert consultation if needed'
        ],
        estimatedCost: vulnerableMembers.length * 1500 + (riskLevel === 'critical' ? 5000 : 0)
      }
    })
  }

  const generateDevelopmentPlans = (members: TeamMember[], metrics: TeamSkillMetrics[]): SkillDevelopmentPlan[] => {
    return members.map(member => {
      const skillGaps = member.skillAssessments
        .map(skill => ({
          skill: skill.skill,
          gap: skill.targetLevel - skill.currentLevel
        }))
        .filter(gap => gap.gap > 0)
        .sort((a, b) => b.gap - a.gap)

      const prioritySkills = skillGaps.slice(0, 3).map(g => g.skill)
      const totalGap = skillGaps.reduce((sum, gap) => sum + gap.gap, 0)

      return {
        memberId: member.id,
        memberName: member.name,
        prioritySkills,
        recommendedActions: [
          `Focus on ${prioritySkills[0]} - highest impact skill`,
          'Complete certification program within 6 months',
          'Participate in monthly skill assessments'
        ],
        estimatedDuration: totalGap * 3, // 3 weeks per skill point
        cost: totalGap * 800, // $800 per skill point
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        mentorMatch: findMentorMatch(member, members, prioritySkills[0])
      }
    })
  }

  const findMentorMatch = (member: TeamMember, allMembers: TeamMember[], skill: string): string | undefined => {
    const potentialMentors = allMembers
      .filter(m => m.id !== member.id)
      .filter(m => {
        const mentorSkill = m.skillAssessments.find(s => s.skill === skill)
        const memberSkill = member.skillAssessments.find(s => s.skill === skill)
        return mentorSkill && memberSkill && mentorSkill.currentLevel > memberSkill.currentLevel + 1
      })
      .sort((a, b) => {
        const aSkill = a.skillAssessments.find(s => s.skill === skill)!
        const bSkill = b.skillAssessments.find(s => s.skill === skill)!
        return bSkill.currentLevel - aSkill.currentLevel
      })

    return potentialMentors[0]?.name
  }

  const generateFallbackMetrics = (members: TeamMember[]): TeamSkillMetrics[] => {
    const skillsSet = new Set<string>()
    members.forEach(member => {
      member.skillAssessments.forEach(skill => skillsSet.add(skill.skill))
    })

    return Array.from(skillsSet).map(skillName => ({
      skill: skillName,
      teamAverage: 7.2,
      targetLevel: 8,
      topPerformer: members[0]?.name || 'N/A',
      bottomPerformer: members[members.length - 1]?.name || 'N/A',
      gapSpread: 2.5,
      improvementTrend: 'up' as const,
      urgencyScore: 65
    }))
  }

  const filteredMembers = teamMembers.filter(member => {
    const deptMatch = selectedDepartment === 'all' || member.department === selectedDepartment
    return deptMatch
  })

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-destructive text-destructive-foreground'
      case 'high': return 'bg-destructive/80 text-destructive-foreground'
      case 'medium': return 'bg-accent text-accent-foreground'
      case 'low': return 'bg-secondary text-secondary-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': case 'improving': return <ArrowUp className="h-4 w-4 text-accent" />
      case 'down': case 'declining': return <ArrowDown className="h-4 w-4 text-destructive" />
      case 'stable': return <Minus className="h-4 w-4 text-muted-foreground" />
      default: return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Team Skill Comparison Dashboard
          </h2>
          <p className="text-muted-foreground">
            Comprehensive team performance benchmarking and skill gap analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Risk Management">Risk Management</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="Audit">Internal Audit</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={runComprehensiveAnalysis} 
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{filteredMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Team Score</p>
                <p className="text-2xl font-bold">
                  {filteredMembers.length > 0 
                    ? (filteredMembers.reduce((sum, m) => sum + m.overallScore, 0) / filteredMembers.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
              <ChartBar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-destructive">
                  {filteredMembers.filter(m => m.riskLevel === 'high' || m.riskLevel === 'critical').length}
                </p>
              </div>
              <Warning className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Training</p>
                <p className="text-2xl font-bold">
                  {filteredMembers.reduce((sum, m) => sum + m.activeTrainings, 0)}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="comparison">Skill Matrix</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="development">Development Plans</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Performance Overview
              </CardTitle>
              <CardDescription>
                Individual team member skills and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredMembers.map((member) => (
                    <Card key={member.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                              <p className="text-xs text-muted-foreground">{member.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-2xl font-bold">{member.overallScore.toFixed(1)}</p>
                              <Badge className={getRiskColor(member.riskLevel)}>
                                {member.riskLevel.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {member.activeTrainings} active trainings
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {member.skillAssessments.map((skill) => (
                            <div key={skill.skill} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium flex items-center gap-2">
                                  {skill.skill}
                                  {getTrendIcon(skill.trend)}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {skill.currentLevel}/{skill.targetLevel}
                                </span>
                              </div>
                              <Progress 
                                value={(skill.currentLevel / skill.targetLevel) * 100} 
                                className="h-2" 
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{skill.confidenceScore}% confidence</span>
                                <span>Gap: -{skill.targetLevel - skill.currentLevel}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="flex flex-wrap gap-1">
                            {member.certifications.map((cert, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            <Button size="sm">
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Assign Training
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Team Skill Comparison Matrix
              </CardTitle>
              <CardDescription>
                Side-by-side comparison of skill levels across all team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {skillMetrics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4" />
                  <p>Run analysis to generate skill comparison matrix</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    {skillMetrics.map((metric) => (
                      <Card key={metric.skill}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                {metric.skill}
                                {getTrendIcon(metric.improvementTrend)}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Team Average: {metric.teamAverage} | Target: {metric.targetLevel}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="mb-2">
                                Gap Spread: {metric.gapSpread}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                Urgency: {metric.urgencyScore}%
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {filteredMembers.map((member) => {
                              const skill = member.skillAssessments.find(s => s.skill === metric.skill)
                              if (!skill) return null

                              return (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <span className="text-xs font-bold">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium">{member.name}</p>
                                      <p className="text-xs text-muted-foreground">{member.role}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-center">
                                      <p className="font-bold text-lg">{skill.currentLevel}</p>
                                      <p className="text-xs text-muted-foreground">Current</p>
                                    </div>
                                    <div className="w-24">
                                      <Progress 
                                        value={(skill.currentLevel / metric.targetLevel) * 100} 
                                        className="h-3" 
                                      />
                                    </div>
                                    <div className="text-center">
                                      <p className="font-bold text-lg">{metric.targetLevel}</p>
                                      <p className="text-xs text-muted-foreground">Target</p>
                                    </div>
                                    <Badge 
                                      variant={skill.currentLevel >= metric.targetLevel ? "default" : "destructive"}
                                      className="ml-2"
                                    >
                                      {skill.currentLevel >= metric.targetLevel ? "✓" : `−${metric.targetLevel - skill.currentLevel}`}
                                    </Badge>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                              <span>Top Performer: <strong>{metric.topPerformer}</strong></span>
                              <span>Needs Support: <strong>{metric.bottomPerformer}</strong></span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Industry Benchmarks
              </CardTitle>
              <CardDescription>
                Compare team performance against industry standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benchmarks.map((benchmark) => (
                  <Card key={benchmark.category}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">{benchmark.category}</h4>
                        {getTrendIcon(benchmark.trend)}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Our Score</span>
                            <span className="font-bold">{benchmark.ourScore}</span>
                          </div>
                          <Progress value={benchmark.ourScore * 10} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Industry Average</span>
                            <span>{benchmark.industryAverage}</span>
                          </div>
                          <Progress value={benchmark.industryAverage * 10} className="h-2 opacity-60" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Top 10%</span>
                            <span>{benchmark.topPercentile}</span>
                          </div>
                          <Progress value={benchmark.topPercentile * 10} className="h-2 opacity-40" />
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              {benchmark.percentileRank}th Percentile
                            </Badge>
                            <Badge 
                              className={
                                benchmark.ourScore > benchmark.industryAverage 
                                  ? 'bg-accent text-accent-foreground' 
                                  : 'bg-destructive text-destructive-foreground'
                              }
                            >
                              {benchmark.ourScore > benchmark.industryAverage 
                                ? `+${(benchmark.ourScore - benchmark.industryAverage).toFixed(1)} Above Avg` 
                                : `${(benchmark.ourScore - benchmark.industryAverage).toFixed(1)} Below Avg`}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warning className="h-5 w-5" />
                Compliance Risk Analysis
              </CardTitle>
              <CardDescription>
                Identify and prioritize compliance risks across the team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {riskAssessments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Warning className="h-12 w-12 mx-auto mb-4" />
                      <p>Run analysis to generate risk assessments</p>
                    </div>
                  ) : (
                    riskAssessments.map((risk) => (
                      <Card key={risk.skill} className={`border-l-4 ${
                        risk.riskLevel === 'critical' ? 'border-l-destructive' :
                        risk.riskLevel === 'high' ? 'border-l-destructive/60' :
                        risk.riskLevel === 'medium' ? 'border-l-accent' :
                        'border-l-secondary'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-lg">{risk.skill}</h4>
                              <Badge className={getRiskColor(risk.riskLevel)}>
                                {risk.riskLevel.toUpperCase()} RISK
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">${risk.estimatedCost.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">Est. mitigation cost</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium mb-2">Vulnerable Team Members:</p>
                              <div className="flex flex-wrap gap-1">
                                {risk.vulnerableMembers.map((name, idx) => (
                                  <Badge key={idx} variant="destructive" className="text-xs">
                                    {name}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-2">Impacted Audits:</p>
                              <div className="flex flex-wrap gap-1">
                                {risk.impactedAudits.map((audit, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {audit}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-2">Mitigation Actions:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {risk.mitigation.map((action, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Individual Development Plans
              </CardTitle>
              <CardDescription>
                Personalized skill development recommendations for each team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {developmentPlans.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4" />
                      <p>Run analysis to generate development plans</p>
                    </div>
                  ) : (
                    developmentPlans.map((plan) => (
                      <Card key={plan.memberId} className="border-l-4 border-l-accent">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-lg">{plan.memberName}</h4>
                              <p className="text-sm text-muted-foreground">
                                Development Timeline: {plan.estimatedDuration} weeks
                              </p>
                              {plan.mentorMatch && (
                                <p className="text-sm text-accent">
                                  Suggested Mentor: {plan.mentorMatch}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">${plan.cost.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">Est. cost</p>
                              <p className="text-sm text-muted-foreground">
                                Due: {new Date(plan.deadline).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium mb-2">Priority Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {plan.prioritySkills.map((skill, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {plan.recommendedActions.map((action, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{plan.estimatedDuration} weeks</span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Settings className="h-4 w-4 mr-1" />
                                Customize
                              </Button>
                              <Button size="sm">
                                <PlayCircle className="h-4 w-4 mr-1" />
                                Start Plan
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Team Insights
              </CardTitle>
              <CardDescription>
                Advanced analytics and predictive insights for team development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Key Finding:</strong> Your team scores 15% above industry average in Risk Assessment 
                    but falls 8% below average in Data Privacy Regulations. Focus development efforts on privacy 
                    compliance to maximize audit readiness.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Skill Velocity Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">SOX Compliance</span>
                          <div className="flex items-center gap-2">
                            <Progress value={78} className="w-16 h-2" />
                            <TrendUp className="h-4 w-4 text-accent" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Data Privacy</span>
                          <div className="flex items-center gap-2">
                            <Progress value={45} className="w-16 h-2" />
                            <ArrowUp className="h-4 w-4 text-accent" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Risk Assessment</span>
                          <div className="flex items-center gap-2">
                            <Progress value={82} className="w-16 h-2" />
                            <Minus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Predictive Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-destructive mb-2">72%</div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Medium risk of audit findings in next 6 months
                        </p>
                        <Badge variant="destructive">Action Required</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Optimization Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                        <Trophy className="h-5 w-5 text-accent mt-1" />
                        <div>
                          <h5 className="font-medium">Cross-Training Initiative</h5>
                          <p className="text-sm text-muted-foreground">
                            Pair Jennifer Liu with Emily Johnson for Data Privacy mentoring. 
                            Expected 40% improvement in 8 weeks.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg">
                        <Star className="h-5 w-5 text-secondary mt-1" />
                        <div>
                          <h5 className="font-medium">Skills Consolidation</h5>
                          <p className="text-sm text-muted-foreground">
                            Focus team training on SOX and Internal Audit integration. 
                            This addresses 3 upcoming audits simultaneously.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h5 className="font-medium">Resource Optimization</h5>
                          <p className="text-sm text-muted-foreground">
                            Reallocate 25% of training budget from Risk Assessment (team strength) 
                            to Data Privacy (team weakness) for maximum ROI.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}