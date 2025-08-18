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
  TrendingUp, 
  Target, 
  User, 
  Star,
  RefreshCw,
  Brain,
  BookOpen,
  Award,
  Clock,
  Zap,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Users,
  DollarSign,
  Calendar,
  TrendingDown,
  Eye,
  Share,
  Download,
  Lightbulb,
  Settings,
  Books,
  Certificate,
  Play,
  FileText,
  Calendar as CalendarIcon,
  CheckSquare,
  Rocket,
  ChartLine
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
  yearsExperience: number
  currentSalaryBand: string
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

interface CareerPath {
  id: string
  title: string
  description: string
  targetMember: string
  currentRole: string
  timeline: number // months
  probabilityOfSuccess: number
  salaryIncrease: number
  requiredSkills: CareerPathSkill[]
  milestones: CareerMilestone[]
  riskFactors: string[]
  benefits: string[]
  alternativePaths: string[]
  industryDemand: 'high' | 'medium' | 'low'
  certificationsPaath: string[]
  mentorRecommendations: string[]
}

interface CareerPathSkill {
  skill: string
  currentLevel: number
  requiredLevel: number
  priority: 'critical' | 'important' | 'beneficial'
  estimatedTime: number // weeks
  suggestedResources: string[]
}

interface CareerMilestone {
  title: string
  description: string
  targetMonth: number
  dependencies: string[]
  success_criteria: string[]
  estimatedEffort: number // hours
}

interface CareerAnalytics {
  memberName: string
  currentTrajectory: 'upward' | 'stable' | 'at-risk'
  skillGapScore: number
  marketAlignment: number
  promotionReadiness: number
  retentionRisk: number
  strengths: string[]
  developmentAreas: string[]
  careerVelocity: number // months to next level
}

interface SkillDevelopmentPlan {
  id: string
  memberName: string
  careerGoal: string
  targetRole: string
  timeline: number // months
  prioritySkills: PrioritySkill[]
  learningPath: LearningResource[]
  progress: SkillProgress
  recommendations: PersonalizedRecommendation[]
  nextMilestone: string
  estimatedCost: number
}

interface PrioritySkill {
  skill: string
  currentLevel: number
  targetLevel: number
  urgency: 'critical' | 'high' | 'medium' | 'low'
  businessImpact: number // 1-10
  marketDemand: number // 1-10
  personalInterest: number // 1-10
  estimatedHours: number
  prerequisiteSkills: string[]
}

interface LearningResource {
  type: 'course' | 'certification' | 'workshop' | 'mentoring' | 'project' | 'book'
  title: string
  provider: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  cost: number
  rating: number
  skills: string[]
  priority: number
  completionDate?: string
  status: 'not-started' | 'in-progress' | 'completed'
  url?: string
}

interface SkillProgress {
  overallProgress: number
  skillsCompleted: number
  skillsInProgress: number
  skillsNotStarted: number
  hoursInvested: number
  certificationsEarned: number
  lastUpdated: string
}

interface PersonalizedRecommendation {
  type: 'immediate' | 'short-term' | 'long-term'
  category: 'skill' | 'networking' | 'certification' | 'project' | 'mentoring'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: number // 1-10
  deadline?: string
  resources: string[]
}

export function CareerPathRecommendations() {
  const [teamMembers] = useKV<TeamMember[]>('team-members', [])
  const [careerPaths, setCareerPaths] = useKV<CareerPath[]>('career-paths', [])
  const [careerAnalytics, setCareerAnalytics] = useKV<CareerAnalytics[]>('career-analytics', [])
  const [skillDevelopmentPlans, setSkillDevelopmentPlans] = useKV<SkillDevelopmentPlan[]>('skill-development-plans', [])
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [viewMode, setViewMode] = useState<'paths' | 'analytics' | 'market' | 'development'>('paths')

  const generateCareerRecommendations = async () => {
    setIsGenerating(true)
    toast.info("Generating AI-powered career path recommendations...")

    try {
      // Generate career analytics for each team member
      const analyticsPrompt = spark.llmPrompt`
        Analyze career trajectories for compliance team members:
        
        TEAM DATA: ${JSON.stringify(teamMembers)}
        
        For each team member, analyze:
        1. Current trajectory (upward/stable/at-risk) based on skills, experience, and performance
        2. Skill gap score (0-100, higher = more gaps)
        3. Market alignment (how well their skills match market demands)
        4. Promotion readiness (0-100)
        5. Retention risk (0-100, higher = more likely to leave)
        6. Key strengths and development areas
        7. Career velocity (estimated months to next role)
        
        Consider compliance industry standards, typical career progressions, and current market demands.
        Return as JSON array of analytics objects.
      `

      let analytics = []
      try {
        const analyticsResponse = await spark.llm(analyticsPrompt, "gpt-4o", true)
        analytics = JSON.parse(analyticsResponse)
      } catch {
        analytics = generateFallbackAnalytics()
      }

      setCareerAnalytics(analytics)

      // Generate specific career path recommendations
      const pathsPrompt = spark.llmPrompt`
        Create detailed career path recommendations for compliance professionals:
        
        TEAM DATA: ${JSON.stringify(teamMembers)}
        ANALYTICS: ${JSON.stringify(analytics)}
        
        For each team member, suggest 1-2 realistic career paths including:
        1. Target role title and description
        2. Timeline in months
        3. Success probability (0-100)
        4. Expected salary increase percentage
        5. Required skills with current vs required levels
        6. Specific milestones with timelines
        7. Risk factors and mitigation strategies
        8. Industry certifications needed
        9. Internal mentor recommendations
        
        Focus on compliance career ladders: Analyst → Senior Analyst → Manager → Director → VP
        Consider lateral moves: Risk, Audit, Legal, Privacy Officer roles
        Include emerging roles: AI Governance, ESG Compliance, Cyber Compliance
        
        Return as JSON array of career path objects.
      `

      let paths = []
      try {
        const pathsResponse = await spark.llm(pathsPrompt, "gpt-4o", true)
        paths = JSON.parse(pathsResponse)
      } catch {
        paths = generateFallbackCareerPaths()
      }

      setCareerPaths(paths)

      // Generate personalized skill development plans
      const developmentPrompt = spark.llmPrompt`
        Create personalized skill development plans based on career goals:
        
        TEAM DATA: ${JSON.stringify(teamMembers)}
        CAREER PATHS: ${JSON.stringify(paths)}
        ANALYTICS: ${JSON.stringify(analytics)}
        
        For each team member, create a detailed skill development plan including:
        1. Career goal alignment with market opportunities
        2. Priority skills ranked by urgency, business impact, and market demand
        3. Personalized learning path with specific resources (courses, certifications, projects)
        4. Timeline and cost estimates
        5. Progress tracking milestones
        6. Immediate, short-term, and long-term recommendations
        
        Consider:
        - Individual learning preferences and current skill levels
        - Market demand for specific compliance skills
        - Certification requirements for target roles
        - Budget constraints and resource availability
        - Personal interests and strengths
        
        Return as JSON array of skill development plan objects.
      `

      let developmentPlans = []
      try {
        const developmentResponse = await spark.llm(developmentPrompt, "gpt-4o", true)
        developmentPlans = JSON.parse(developmentResponse)
      } catch {
        developmentPlans = generateFallbackDevelopmentPlans()
      }

      setSkillDevelopmentPlans(developmentPlans)
      toast.success("Career recommendations and skill development plans generated successfully!")
    } catch (error) {
      console.error('Career generation error:', error)
      toast.error("Generation failed, using fallback recommendations")
      
      setCareerAnalytics(generateFallbackAnalytics())
      setCareerPaths(generateFallbackCareerPaths())
      setSkillDevelopmentPlans(generateFallbackDevelopmentPlans())
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFallbackAnalytics = (): CareerAnalytics[] => {
    return teamMembers.map(member => ({
      memberName: member.name,
      currentTrajectory: member.overallScore > 7.5 ? 'upward' : member.overallScore > 6 ? 'stable' : 'at-risk',
      skillGapScore: Math.max(0, Math.round((8 - member.overallScore) * 15)),
      marketAlignment: Math.round(member.overallScore * 12),
      promotionReadiness: Math.round(member.overallScore * 11),
      retentionRisk: member.overallScore < 6 ? 75 : member.overallScore < 7 ? 45 : 25,
      strengths: member.skillAssessments
        .filter(skill => skill.currentLevel >= skill.targetLevel)
        .slice(0, 3)
        .map(skill => skill.skill),
      developmentAreas: member.skillAssessments
        .filter(skill => skill.currentLevel < skill.targetLevel)
        .slice(0, 2)
        .map(skill => skill.skill),
      careerVelocity: member.overallScore > 8 ? 18 : member.overallScore > 7 ? 24 : 36
    }))
  }

  const generateFallbackCareerPaths = (): CareerPath[] => {
    const paths: CareerPath[] = []
    
    teamMembers.forEach(member => {
      // Determine next logical role
      let nextRole = "Senior Compliance Analyst"
      let timeline = 18
      let salaryIncrease = 15
      
      if (member.role.includes("Senior")) {
        nextRole = "Compliance Manager"
        timeline = 24
        salaryIncrease = 25
      } else if (member.role.includes("Manager")) {
        nextRole = "Director of Compliance"
        timeline = 36
        salaryIncrease = 35
      }

      paths.push({
        id: `${member.id}-primary`,
        title: nextRole,
        description: `Natural progression path for ${member.name} based on current role and performance`,
        targetMember: member.name,
        currentRole: member.role,
        timeline,
        probabilityOfSuccess: Math.round(member.overallScore * 12),
        salaryIncrease,
        requiredSkills: member.skillAssessments
          .filter(skill => skill.currentLevel < skill.targetLevel)
          .slice(0, 4)
          .map(skill => ({
            skill: skill.skill,
            currentLevel: skill.currentLevel,
            requiredLevel: skill.targetLevel + 1,
            priority: skill.criticalForCompliance ? 'critical' : 'important' as const,
            estimatedTime: (skill.targetLevel - skill.currentLevel + 1) * 6,
            suggestedResources: [`${skill.skill} Certification`, `Advanced ${skill.skill} Training`]
          })),
        milestones: [
          {
            title: "Skills Assessment Complete",
            description: "Complete comprehensive skills evaluation",
            targetMonth: 3,
            dependencies: [],
            success_criteria: ["All skills assessed", "Development plan approved"],
            estimatedEffort: 20
          },
          {
            title: "Certification Achieved",
            description: "Obtain required industry certification",
            targetMonth: Math.round(timeline / 2),
            dependencies: ["Skills Assessment Complete"],
            success_criteria: ["Certification earned", "Competency demonstrated"],
            estimatedEffort: 60
          }
        ],
        riskFactors: [
          member.overallScore < 7 ? "Current skill gaps need addressing" : "Market competition for role",
          "Budget constraints for training",
          "Organizational restructuring risk"
        ],
        benefits: [
          `${salaryIncrease}% salary increase potential`,
          "Expanded leadership responsibilities",
          "Enhanced career marketability"
        ],
        alternativePaths: ["Risk Management", "Internal Audit", "Legal Compliance"],
        industryDemand: member.overallScore > 7.5 ? 'high' : 'medium',
        certificationsPaath: ["CCEP", "CISA", member.role.includes("Risk") ? "FRM" : "CGEIT"],
        mentorRecommendations: teamMembers
          .filter(m => m.overallScore > member.overallScore && m.id !== member.id)
          .slice(0, 2)
          .map(m => m.name)
      })
    })
    
    return paths
  }

  const generateFallbackDevelopmentPlans = (): SkillDevelopmentPlan[] => {
    return teamMembers.map((member, index) => {
      const careerGoals = [
        "Senior Compliance Analyst",
        "Compliance Manager", 
        "ESG Compliance Officer",
        "AI Governance Specialist",
        "Director of Compliance"
      ]
      
      const targetRole = careerGoals[index % careerGoals.length]
      const prioritySkills = member.skillAssessments
        .filter(skill => skill.currentLevel < skill.targetLevel)
        .slice(0, 5)
        .map((skill, idx) => ({
          skill: skill.skill,
          currentLevel: skill.currentLevel,
          targetLevel: skill.targetLevel + 1,
          urgency: idx < 2 ? 'critical' as const : idx < 4 ? 'high' as const : 'medium' as const,
          businessImpact: Math.max(7, 10 - idx),
          marketDemand: Math.max(6, 9 - idx),
          personalInterest: Math.floor(Math.random() * 4) + 7,
          estimatedHours: (skill.targetLevel - skill.currentLevel + 1) * 15,
          prerequisiteSkills: idx > 0 ? [member.skillAssessments[0]?.skill || 'Basic Compliance'] : []
        }))

      const learningResources: LearningResource[] = [
        {
          type: 'certification',
          title: `${targetRole} Professional Certificate`,
          provider: 'Compliance Institute',
          duration: '3 months',
          difficulty: 'intermediate',
          cost: 2500,
          rating: 4.8,
          skills: prioritySkills.slice(0, 2).map(s => s.skill),
          priority: 1,
          status: 'not-started'
        },
        {
          type: 'course',
          title: 'Advanced Regulatory Framework Analysis',
          provider: 'ComplianceEd',
          duration: '6 weeks',
          difficulty: 'advanced',
          cost: 899,
          rating: 4.6,
          skills: [prioritySkills[0]?.skill || 'Regulatory Analysis'],
          priority: 2,
          status: 'not-started'
        },
        {
          type: 'workshop',
          title: 'Leadership in Compliance Teams',
          provider: 'Leadership Academy',
          duration: '2 days',
          difficulty: 'intermediate',
          cost: 1200,
          rating: 4.7,
          skills: ['Leadership', 'Team Management'],
          priority: 3,
          status: 'not-started'
        },
        {
          type: 'mentoring',
          title: 'Executive Mentorship Program',
          provider: 'Internal',
          duration: '6 months',
          difficulty: 'advanced',
          cost: 0,
          rating: 4.9,
          skills: ['Strategic Thinking', 'Executive Presence'],
          priority: 2,
          status: 'not-started'
        }
      ]

      const recommendations: PersonalizedRecommendation[] = [
        {
          type: 'immediate',
          category: 'skill',
          title: `Start ${prioritySkills[0]?.skill || 'Priority Skills'} Development`,
          description: 'Begin with highest-impact skill to accelerate career progression',
          impact: 'high',
          effort: 7,
          deadline: '2 weeks',
          resources: [`${prioritySkills[0]?.skill} Training Materials`]
        },
        {
          type: 'short-term',
          category: 'certification',
          title: 'Pursue Industry Certification',
          description: `Obtain ${targetRole} certification to validate expertise`,
          impact: 'high',
          effort: 8,
          deadline: '4 months',
          resources: ['Professional Study Guide', 'Practice Exams']
        },
        {
          type: 'long-term',
          category: 'networking',
          title: 'Build Professional Network',
          description: 'Establish connections in target role domain',
          impact: 'medium',
          effort: 5,
          resources: ['Industry Events', 'LinkedIn Professional Groups']
        }
      ]

      return {
        id: `dev-plan-${member.id}`,
        memberName: member.name,
        careerGoal: `Advance to ${targetRole} within 18-24 months`,
        targetRole,
        timeline: 18,
        prioritySkills,
        learningPath: learningResources,
        progress: {
          overallProgress: Math.floor(Math.random() * 30),
          skillsCompleted: 0,
          skillsInProgress: 1,
          skillsNotStarted: prioritySkills.length - 1,
          hoursInvested: Math.floor(Math.random() * 50),
          certificationsEarned: 0,
          lastUpdated: new Date().toISOString().split('T')[0]
        },
        recommendations,
        nextMilestone: recommendations[0]?.title || 'Complete Skills Assessment',
        estimatedCost: learningResources.reduce((sum, resource) => sum + resource.cost, 0)
      }
    })
  }

  const filteredPaths = selectedMember === 'all' 
    ? careerPaths 
    : careerPaths.filter(path => path.targetMember === selectedMember)

  const filteredAnalytics = selectedMember === 'all'
    ? careerAnalytics
    : careerAnalytics.filter(analytics => analytics.memberName === selectedMember)

  const filteredDevelopmentPlans = selectedMember === 'all'
    ? skillDevelopmentPlans
    : skillDevelopmentPlans.filter(plan => plan.memberName === selectedMember)

  const getTrajectoryColor = (trajectory: string) => {
    switch (trajectory) {
      case 'upward': return 'bg-accent text-accent-foreground'
      case 'stable': return 'bg-secondary text-secondary-foreground'
      case 'at-risk': return 'bg-destructive text-destructive-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-destructive'
    if (risk >= 40) return 'text-accent'
    return 'text-secondary'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-destructive text-destructive-foreground'
      case 'high': return 'bg-accent text-accent-foreground'
      case 'medium': return 'bg-secondary text-secondary-foreground'
      case 'low': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'certification': return Certificate
      case 'course': return Books
      case 'workshop': return Users
      case 'mentoring': return User
      case 'project': return Briefcase
      case 'book': return BookOpen
      default: return FileText
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            AI Career Path Recommendations
          </h2>
          <p className="text-muted-foreground">
            Personalized career progression guidance powered by AI analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Team Members</SelectItem>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.name}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={generateCareerRecommendations} 
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Generate Recommendations
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
                <p className="text-sm font-medium text-muted-foreground">Ready for Promotion</p>
                <p className="text-2xl font-bold">
                  {careerAnalytics.filter(a => a.promotionReadiness >= 80).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-destructive">
                  {careerAnalytics.filter(a => a.retentionRisk >= 60).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Career Velocity</p>
                <p className="text-2xl font-bold">
                  {careerAnalytics.length > 0 
                    ? Math.round(careerAnalytics.reduce((sum, a) => sum + a.careerVelocity, 0) / careerAnalytics.length)
                    : 0} mo
                </p>
              </div>
              <Clock className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Development Plans</p>
                <p className="text-2xl font-bold">
                  {skillDevelopmentPlans.length}
                </p>
              </div>
              <Rocket className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="development" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="development">Skill Development</TabsTrigger>
          <TabsTrigger value="paths">Career Paths</TabsTrigger>
          <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
          <TabsTrigger value="market">Market Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Action Items</TabsTrigger>
        </TabsList>

        <TabsContent value="development" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Personalized Skill Development Plans
              </CardTitle>
              <CardDescription>
                AI-generated learning paths tailored to individual career goals and market demands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[700px]">
                <div className="space-y-6">
                  {filteredDevelopmentPlans.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Rocket className="h-12 w-12 mx-auto mb-4" />
                      <p>Generate recommendations to see personalized development plans</p>
                    </div>
                  ) : (
                    filteredDevelopmentPlans.map((plan) => (
                      <Card key={plan.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-lg">{plan.memberName}</h4>
                                <Badge className="bg-primary text-primary-foreground">
                                  {plan.targetRole}
                                </Badge>
                                <Badge variant="outline">
                                  {plan.timeline} months
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Career Goal: {plan.careerGoal}
                              </p>
                              <p className="text-sm mb-4">
                                Next Milestone: {plan.nextMilestone}
                              </p>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Progress</p>
                                  <div className="flex items-center gap-2">
                                    <Progress value={plan.progress.overallProgress} className="flex-1 h-2" />
                                    <span className="text-sm font-bold">{plan.progress.overallProgress}%</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Investment</p>
                                  <p className="font-bold text-accent">${plan.estimatedCost.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ml-4">
                              <ChartLine className="h-8 w-8 text-primary" />
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Priority Skills */}
                            <div>
                              <h5 className="font-medium mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Priority Skills Development
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {plan.prioritySkills.slice(0, 6).map((skill, idx) => (
                                  <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">{skill.skill}</span>
                                      <Badge className={getUrgencyColor(skill.urgency)}>
                                        {skill.urgency}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs">{skill.currentLevel}</span>
                                      <Progress 
                                        value={(skill.currentLevel / skill.targetLevel) * 100} 
                                        className="flex-1 h-2" 
                                      />
                                      <span className="text-xs">{skill.targetLevel}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>{skill.estimatedHours}h training</span>
                                      <span>Market: {skill.marketDemand}/10</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Learning Path */}
                            <div>
                              <h5 className="font-medium mb-3 flex items-center gap-2">
                                <Books className="h-4 w-4" />
                                Recommended Learning Path
                              </h5>
                              <div className="space-y-3">
                                {plan.learningPath.slice(0, 4).map((resource, idx) => {
                                  const IconComponent = getResourceTypeIcon(resource.type)
                                  return (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg">
                                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                        <IconComponent className="h-5 w-5 text-accent" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="font-medium text-sm">{resource.title}</p>
                                          <Badge variant="secondary" className="text-xs">
                                            {resource.type}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                          {resource.provider} • {resource.duration} • {resource.difficulty}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs">
                                          <span>${resource.cost}</span>
                                          <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 text-accent" />
                                            <span>{resource.rating}</span>
                                          </div>
                                          <Badge 
                                            variant={
                                              resource.status === 'completed' ? 'default' :
                                              resource.status === 'in-progress' ? 'secondary' : 'outline'
                                            }
                                            className="text-xs"
                                          >
                                            {resource.status.replace('-', ' ')}
                                          </Badge>
                                        </div>
                                      </div>
                                      <Button size="sm" variant="outline">
                                        <Play className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Immediate Recommendations */}
                            <div>
                              <h5 className="font-medium mb-3 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                Immediate Action Items
                              </h5>
                              <div className="space-y-2">
                                {plan.recommendations.filter(rec => rec.type === 'immediate').map((rec, idx) => (
                                  <div key={idx} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-destructive mt-1" />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium text-sm">{rec.title}</p>
                                        <Badge 
                                          variant={rec.impact === 'high' ? 'destructive' : 'secondary'}
                                          className="text-xs"
                                        >
                                          {rec.impact} impact
                                        </Badge>
                                        {rec.deadline && (
                                          <Badge variant="outline" className="text-xs">
                                            Due: {rec.deadline}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                                    </div>
                                    <Button size="sm" variant="outline">
                                      <CheckSquare className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Progress Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
                              <div className="text-center">
                                <div className="text-lg font-bold text-accent">{plan.progress.skillsCompleted}</div>
                                <div className="text-xs text-muted-foreground">Skills Mastered</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-secondary">{plan.progress.skillsInProgress}</div>
                                <div className="text-xs text-muted-foreground">In Progress</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-primary">{plan.progress.hoursInvested}</div>
                                <div className="text-xs text-muted-foreground">Hours Invested</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-accent">{plan.progress.certificationsEarned}</div>
                                <div className="text-xs text-muted-foreground">Certs Earned</div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="text-xs text-muted-foreground">
                                Last updated: {plan.progress.lastUpdated}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  Schedule
                                </Button>
                                <Button size="sm">
                                  <ArrowRight className="h-4 w-4 mr-1" />
                                  Start Learning
                                </Button>
                              </div>
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

        <TabsContent value="paths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Personalized Career Paths
              </CardTitle>
              <CardDescription>
                AI-generated career progression recommendations with detailed roadmaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[700px]">
                <div className="space-y-6">
                  {filteredPaths.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4" />
                      <p>Generate recommendations to see career paths</p>
                    </div>
                  ) : (
                    filteredPaths.map((path) => (
                      <Card key={path.id} className="border-l-4 border-l-accent">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-lg">{path.title}</h4>
                                <Badge className="bg-primary text-primary-foreground">
                                  {path.probabilityOfSuccess}% Success Rate
                                </Badge>
                                <Badge variant="outline">
                                  {path.industryDemand.toUpperCase()} Demand
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {path.targetMember} → {path.currentRole} to {path.title}
                              </p>
                              <p className="text-sm mb-4">{path.description}</p>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                                  <p className="font-bold">{path.timeline} months</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Salary Increase</p>
                                  <p className="font-bold text-accent">+{path.salaryIncrease}%</p>
                                </div>
                              </div>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center ml-4">
                              <Briefcase className="h-8 w-8 text-accent" />
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Required Skills */}
                            <div>
                              <h5 className="font-medium mb-2 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                Required Skills Development
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {path.requiredSkills.slice(0, 4).map((skill, idx) => (
                                  <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">{skill.skill}</span>
                                      <Badge variant={
                                        skill.priority === 'critical' ? 'destructive' : 
                                        skill.priority === 'important' ? 'default' : 'secondary'
                                      }>
                                        {skill.priority}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs">{skill.currentLevel}</span>
                                      <Progress 
                                        value={(skill.currentLevel / skill.requiredLevel) * 100} 
                                        className="flex-1 h-2" 
                                      />
                                      <span className="text-xs">{skill.requiredLevel}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {skill.estimatedTime} weeks training
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Milestones */}
                            <div>
                              <h5 className="font-medium mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Key Milestones
                              </h5>
                              <div className="space-y-2">
                                {path.milestones.map((milestone, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-2 bg-accent/5 rounded">
                                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                                      <span className="text-xs font-bold">{milestone.targetMonth}m</span>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{milestone.title}</p>
                                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-muted-foreground">{milestone.estimatedEffort}h</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Benefits & Risks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h6 className="font-medium text-sm mb-2 text-accent">Benefits</h6>
                                <ul className="space-y-1">
                                  {path.benefits.slice(0, 3).map((benefit, idx) => (
                                    <li key={idx} className="text-xs flex items-start gap-2">
                                      <Star className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />
                                      {benefit}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h6 className="font-medium text-sm mb-2 text-destructive">Risk Factors</h6>
                                <ul className="space-y-1">
                                  {path.riskFactors.slice(0, 3).map((risk, idx) => (
                                    <li key={idx} className="text-xs flex items-start gap-2">
                                      <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                                      {risk}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex flex-wrap gap-1">
                                {path.mentorRecommendations.slice(0, 2).map((mentor, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    Mentor: {mentor}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                                <Button size="sm">
                                  <ArrowRight className="h-4 w-4 mr-1" />
                                  Start Path
                                </Button>
                              </div>
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

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Individual Career Analytics
              </CardTitle>
              <CardDescription>
                Deep dive analysis of each team member's career trajectory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredAnalytics.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4" />
                      <p>Generate analytics to see career insights</p>
                    </div>
                  ) : (
                    filteredAnalytics.map((analytics, idx) => (
                      <Card key={idx} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-lg">{analytics.memberName}</h4>
                              <Badge className={getTrajectoryColor(analytics.currentTrajectory)}>
                                {analytics.currentTrajectory.toUpperCase()} TRAJECTORY
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{analytics.careerVelocity}mo</p>
                              <p className="text-sm text-muted-foreground">Next level ETA</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-muted/30 rounded">
                              <div className="text-lg font-bold">{analytics.skillGapScore}</div>
                              <div className="text-xs text-muted-foreground">Skill Gap</div>
                              <Progress value={100 - analytics.skillGapScore} className="h-1 mt-1" />
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded">
                              <div className="text-lg font-bold">{analytics.marketAlignment}</div>
                              <div className="text-xs text-muted-foreground">Market Fit</div>
                              <Progress value={analytics.marketAlignment} className="h-1 mt-1" />
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded">
                              <div className="text-lg font-bold">{analytics.promotionReadiness}</div>
                              <div className="text-xs text-muted-foreground">Promotion Ready</div>
                              <Progress value={analytics.promotionReadiness} className="h-1 mt-1" />
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded">
                              <div className={`text-lg font-bold ${getRiskColor(analytics.retentionRisk)}`}>
                                {analytics.retentionRisk}%
                              </div>
                              <div className="text-xs text-muted-foreground">Retention Risk</div>
                              <Progress value={analytics.retentionRisk} className="h-1 mt-1" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="font-medium text-sm mb-2 text-accent">Key Strengths</h6>
                              <div className="flex flex-wrap gap-1">
                                {analytics.strengths.map((strength, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {strength}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h6 className="font-medium text-sm mb-2 text-destructive">Development Areas</h6>
                              <div className="flex flex-wrap gap-1">
                                {analytics.developmentAreas.map((area, idx) => (
                                  <Badge key={idx} variant="destructive" className="text-xs">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
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

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Intelligence & Trends
              </CardTitle>
              <CardDescription>
                Compliance industry trends and career market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Market Alert:</strong> Demand for ESG Compliance Officers has increased 150% year-over-year. 
                    Consider developing ESG competencies for high-growth career opportunities.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Hot Roles in Compliance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">AI/ML Compliance Officer</p>
                            <p className="text-sm text-muted-foreground">Emerging role</p>
                          </div>
                          <Badge className="bg-accent text-accent-foreground">+180%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">ESG Director</p>
                            <p className="text-sm text-muted-foreground">High demand</p>
                          </div>
                          <Badge className="bg-accent text-accent-foreground">+150%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Privacy Officer</p>
                            <p className="text-sm text-muted-foreground">Steady growth</p>
                          </div>
                          <Badge className="bg-secondary text-secondary-foreground">+45%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Cyber Risk Manager</p>
                            <p className="text-sm text-muted-foreground">Strong demand</p>
                          </div>
                          <Badge className="bg-secondary text-secondary-foreground">+60%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Salary Benchmarks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Compliance Analyst</span>
                          <div className="text-right">
                            <p className="font-bold">$65-85K</p>
                            <p className="text-xs text-accent">+8% YoY</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Senior Analyst</span>
                          <div className="text-right">
                            <p className="font-bold">$85-110K</p>
                            <p className="text-xs text-accent">+12% YoY</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Compliance Manager</span>
                          <div className="text-right">
                            <p className="font-bold">$110-140K</p>
                            <p className="text-xs text-accent">+15% YoY</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Director</span>
                          <div className="text-right">
                            <p className="font-bold">$140-200K</p>
                            <p className="text-xs text-accent">+18% YoY</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Skills in Demand</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-accent/10 rounded-lg">
                        <div className="font-bold text-lg">92%</div>
                        <div className="text-sm">AI/ML Governance</div>
                        <TrendingUp className="h-4 w-4 mx-auto mt-2 text-accent" />
                      </div>
                      <div className="text-center p-3 bg-accent/10 rounded-lg">
                        <div className="font-bold text-lg">88%</div>
                        <div className="text-sm">ESG Reporting</div>
                        <TrendingUp className="h-4 w-4 mx-auto mt-2 text-accent" />
                      </div>
                      <div className="text-center p-3 bg-secondary/10 rounded-lg">
                        <div className="font-bold text-lg">76%</div>
                        <div className="text-sm">Cloud Compliance</div>
                        <TrendingUp className="h-4 w-4 mx-auto mt-2 text-secondary" />
                      </div>
                      <div className="text-center p-3 bg-secondary/10 rounded-lg">
                        <div className="font-bold text-lg">71%</div>
                        <div className="text-sm">RegTech</div>
                        <TrendingUp className="h-4 w-4 mx-auto mt-2 text-secondary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Immediate Action Items
              </CardTitle>
              <CardDescription>
                Priority recommendations for team career development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    <strong>High Priority:</strong> 2 team members are promotion-ready but lack ESG knowledge. 
                    Recommend immediate ESG training to capitalize on market opportunity.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-destructive">Urgent Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-destructive mt-1" />
                          <div>
                            <h5 className="font-medium">Retention Risk Mitigation</h5>
                            <p className="text-sm text-muted-foreground">
                              Emily Johnson shows 75% retention risk. Schedule career discussion within 2 weeks.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                          <Clock className="h-5 w-5 text-destructive mt-1" />
                          <div>
                            <h5 className="font-medium">Skills Gap Closure</h5>
                            <p className="text-sm text-muted-foreground">
                              3 members need Data Privacy training before Q2 audit season.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-accent">Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                          <Star className="h-5 w-5 text-accent mt-1" />
                          <div>
                            <h5 className="font-medium">Promotion Pipeline</h5>
                            <p className="text-sm text-muted-foreground">
                              Sarah Chen and Jennifer Liu are ready for senior roles. Initiate promotion process.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-accent mt-1" />
                          <div>
                            <h5 className="font-medium">Market Positioning</h5>
                            <p className="text-sm text-muted-foreground">
                              Team well-positioned for AI governance roles. Consider specialized training.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommended Actions by Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h6 className="font-medium mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          This Month
                        </h6>
                        <ul className="space-y-2 ml-6">
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                            Schedule career development meetings with high-risk retention members
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                            Initiate ESG training program for promotion-ready candidates
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h6 className="font-medium mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Next Quarter
                        </h6>
                        <ul className="space-y-2 ml-6">
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                            Complete comprehensive skills assessments for all team members
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                            Establish mentoring program pairing senior and junior staff
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h6 className="font-medium mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          This Year
                        </h6>
                        <ul className="space-y-2 ml-6">
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            Execute promotion pathway for top performers
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            Develop specialized tracks: AI Governance, ESG, Cyber Compliance
                          </li>
                        </ul>
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