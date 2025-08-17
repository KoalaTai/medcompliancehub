import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Brain, 
  Target, 
  TrendingUp, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2,
  PlayCircle,
  Clock,
  Users,
  Award,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Eye,
  Calendar,
  Route,
  Zap,
  Settings,
  ArrowRight,
  Star,
  Timer,
  ListBullets
} from "@phosphor-icons/react"
import { toast } from 'sonner'

interface SkillAssessment {
  id: string
  skill: string
  currentLevel: number
  targetLevel: number
  confidenceScore: number
  lastAssessed: string
  trend: 'improving' | 'declining' | 'stable'
  criticalForCompliance: boolean
}

interface TrainingRecommendation {
  id: string
  title: string
  description: string
  skillsAddressed: string[]
  estimatedHours: number
  priority: 'high' | 'medium' | 'low'
  format: 'online' | 'workshop' | 'certification' | 'mentoring'
  provider: string
  cost?: number
  completionRate: number
}

interface SkillGap {
  skill: string
  currentLevel: number
  targetLevel: number
  gap: number
  impact: 'critical' | 'high' | 'medium' | 'low'
  recommendations: string[]
}

interface AuditSchedule {
  id: string
  auditType: string
  scheduledDate: string
  requiredSkills: string[]
  criticality: 'high' | 'medium' | 'low'
  preparationWeeks: number
}

interface RegulatoryChange {
  id: string
  regulation: string
  changeDescription: string
  effectiveDate: string
  impactedSkills: string[]
  urgency: 'immediate' | 'high' | 'medium' | 'low'
  complianceDeadline: string
}

interface OptimizedLearningPath {
  id: string
  title: string
  description: string
  totalDuration: number
  priority: 'urgent' | 'high' | 'medium' | 'low'
  modules: LearningModule[]
  auditAlignment?: AuditSchedule
  regulatoryAlignment?: RegulatoryChange
  completionDeadline: string
  estimatedCost: number
  skillsGained: string[]
  pathType: 'audit-driven' | 'regulation-driven' | 'gap-driven' | 'mixed'
}

interface LearningModule {
  id: string
  title: string
  duration: number
  priority: number
  prerequisites: string[]
  skills: string[]
  format: 'online' | 'workshop' | 'certification' | 'mentoring'
  provider: string
  scheduledStartDate?: string
  completionStatus: 'not-started' | 'in-progress' | 'completed'
}

export function SkillGapAnalyzer() {
  const [skillAssessments, setSkillAssessments] = useKV<SkillAssessment[]>('skill-assessments', [])
  const [trainingRecommendations, setTrainingRecommendations] = useKV<TrainingRecommendation[]>('training-recommendations', [])
  const [skillGaps, setSkillGaps] = useKV<SkillGap[]>('skill-gaps', [])
  const [auditSchedules, setAuditSchedules] = useKV<AuditSchedule[]>('audit-schedules', [])
  const [regulatoryChanges, setRegulatoryChanges] = useKV<RegulatoryChange[]>('regulatory-changes', [])
  const [optimizedPaths, setOptimizedPaths] = useKV<OptimizedLearningPath[]>('optimized-learning-paths', [])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedUser, setSelectedUser] = useState('current-user')

  // Initialize audit schedules and regulatory changes
  useEffect(() => {
    if (auditSchedules.length === 0) {
      const initialAudits: AuditSchedule[] = [
        {
          id: '1',
          auditType: 'SOX 404 Internal Controls',
          scheduledDate: '2024-03-15',
          requiredSkills: ['SOX Compliance Framework', 'Internal Audit Procedures', 'Risk Assessment Methodologies'],
          criticality: 'high',
          preparationWeeks: 8
        },
        {
          id: '2',
          auditType: 'Data Privacy Compliance Review',
          scheduledDate: '2024-04-20',
          requiredSkills: ['Data Privacy Regulations', 'Regulatory Reporting'],
          criticality: 'high',
          preparationWeeks: 6
        },
        {
          id: '3',
          auditType: 'Quarterly Risk Assessment',
          scheduledDate: '2024-02-28',
          requiredSkills: ['Risk Assessment Methodologies', 'Regulatory Reporting'],
          criticality: 'medium',
          preparationWeeks: 4
        }
      ]
      setAuditSchedules(initialAudits)
    }

    if (regulatoryChanges.length === 0) {
      const initialChanges: RegulatoryChange[] = [
        {
          id: '1',
          regulation: 'EU AI Act',
          changeDescription: 'New requirements for AI system compliance and risk management',
          effectiveDate: '2024-08-01',
          impactedSkills: ['Risk Assessment Methodologies', 'Data Privacy Regulations'],
          urgency: 'high',
          complianceDeadline: '2024-07-15'
        },
        {
          id: '2',
          regulation: 'SEC Cybersecurity Disclosure Rules',
          changeDescription: 'Enhanced cybersecurity incident disclosure requirements',
          effectiveDate: '2024-06-01',
          impactedSkills: ['Regulatory Reporting', 'Risk Assessment Methodologies'],
          urgency: 'high',
          complianceDeadline: '2024-05-15'
        },
        {
          id: '3',
          regulation: 'Updated GDPR Guidelines',
          changeDescription: 'Revised consent management and data processing guidelines',
          effectiveDate: '2024-05-01',
          impactedSkills: ['Data Privacy Regulations'],
          urgency: 'medium',
          complianceDeadline: '2024-04-15'
        }
      ]
      setRegulatoryChanges(initialChanges)
    }
  }, [auditSchedules, regulatoryChanges, setAuditSchedules, setRegulatoryChanges])

  // Initialize with sample data if empty
  useEffect(() => {
    if (skillAssessments.length === 0) {
      const initialAssessments: SkillAssessment[] = [
        {
          id: '1',
          skill: 'SOX Compliance Framework',
          currentLevel: 6,
          targetLevel: 9,
          confidenceScore: 78,
          lastAssessed: new Date().toISOString(),
          trend: 'improving',
          criticalForCompliance: true
        },
        {
          id: '2',
          skill: 'Risk Assessment Methodologies',
          currentLevel: 7,
          targetLevel: 8,
          confidenceScore: 85,
          lastAssessed: new Date().toISOString(),
          trend: 'stable',
          criticalForCompliance: true
        },
        {
          id: '3',
          skill: 'Data Privacy Regulations',
          currentLevel: 4,
          targetLevel: 8,
          confidenceScore: 62,
          lastAssessed: new Date().toISOString(),
          trend: 'declining',
          criticalForCompliance: true
        },
        {
          id: '4',
          skill: 'Internal Audit Procedures',
          currentLevel: 8,
          targetLevel: 9,
          confidenceScore: 92,
          lastAssessed: new Date().toISOString(),
          trend: 'improving',
          criticalForCompliance: true
        },
        {
          id: '5',
          skill: 'Regulatory Reporting',
          currentLevel: 5,
          targetLevel: 9,
          confidenceScore: 58,
          lastAssessed: new Date().toISOString(),
          trend: 'stable',
          criticalForCompliance: true
        }
      ]
      setSkillAssessments(initialAssessments)
    }
  }, [skillAssessments, setSkillAssessments])

  const optimizeLearningPaths = async () => {
    setIsOptimizing(true)
    toast.info("Optimizing learning paths based on audit schedules and regulatory changes...")

    try {
      // Simulate AI-powered optimization
      await new Promise(resolve => setTimeout(resolve, 3000))

      const optimizedLearningPaths: OptimizedLearningPath[] = [
        {
          id: '1',
          title: 'SOX 404 Audit Preparation Track',
          description: 'Accelerated learning path to prepare for upcoming SOX 404 audit with focus on internal controls',
          totalDuration: 24,
          priority: 'urgent',
          pathType: 'audit-driven',
          auditAlignment: auditSchedules.find(a => a.auditType.includes('SOX')),
          completionDeadline: '2024-02-15',
          estimatedCost: 2400,
          skillsGained: ['SOX Compliance Framework', 'Internal Audit Procedures', 'Risk Assessment Methodologies'],
          modules: [
            {
              id: 'm1',
              title: 'SOX Controls Fundamentals',
              duration: 8,
              priority: 1,
              prerequisites: [],
              skills: ['SOX Compliance Framework'],
              format: 'online',
              provider: 'Compliance Academy',
              scheduledStartDate: '2024-01-15',
              completionStatus: 'not-started'
            },
            {
              id: 'm2',
              title: 'Advanced Internal Controls Design',
              duration: 12,
              priority: 2,
              prerequisites: ['SOX Controls Fundamentals'],
              skills: ['SOX Compliance Framework', 'Internal Audit Procedures'],
              format: 'workshop',
              provider: 'Audit Excellence Institute',
              scheduledStartDate: '2024-01-23',
              completionStatus: 'not-started'
            },
            {
              id: 'm3',
              title: 'Risk Assessment Integration',
              duration: 4,
              priority: 3,
              prerequisites: ['SOX Controls Fundamentals'],
              skills: ['Risk Assessment Methodologies'],
              format: 'online',
              provider: 'Risk Institute',
              scheduledStartDate: '2024-02-05',
              completionStatus: 'not-started'
            }
          ]
        },
        {
          id: '2',
          title: 'EU AI Act Compliance Readiness',
          description: 'Comprehensive preparation for EU AI Act requirements with focus on risk management and privacy',
          totalDuration: 18,
          priority: 'high',
          pathType: 'regulation-driven',
          regulatoryAlignment: regulatoryChanges.find(r => r.regulation.includes('AI Act')),
          completionDeadline: '2024-06-15',
          estimatedCost: 1800,
          skillsGained: ['Risk Assessment Methodologies', 'Data Privacy Regulations'],
          modules: [
            {
              id: 'm4',
              title: 'AI Act Fundamentals',
              duration: 6,
              priority: 1,
              prerequisites: [],
              skills: ['Data Privacy Regulations'],
              format: 'online',
              provider: 'EU Compliance Institute',
              scheduledStartDate: '2024-03-01',
              completionStatus: 'not-started'
            },
            {
              id: 'm5',
              title: 'AI Risk Management Systems',
              duration: 8,
              priority: 2,
              prerequisites: ['AI Act Fundamentals'],
              skills: ['Risk Assessment Methodologies'],
              format: 'certification',
              provider: 'AI Risk Institute',
              scheduledStartDate: '2024-03-15',
              completionStatus: 'not-started'
            },
            {
              id: 'm6',
              title: 'Data Protection in AI Systems',
              duration: 4,
              priority: 3,
              prerequisites: ['AI Act Fundamentals'],
              skills: ['Data Privacy Regulations'],
              format: 'workshop',
              provider: 'Privacy Institute',
              scheduledStartDate: '2024-04-01',
              completionStatus: 'not-started'
            }
          ]
        },
        {
          id: '3',
          title: 'Regulatory Reporting Mastery Path',
          description: 'Comprehensive skill development for regulatory reporting excellence across multiple frameworks',
          totalDuration: 16,
          priority: 'high',
          pathType: 'gap-driven',
          completionDeadline: '2024-04-30',
          estimatedCost: 1600,
          skillsGained: ['Regulatory Reporting', 'Risk Assessment Methodologies'],
          modules: [
            {
              id: 'm7',
              title: 'Advanced Regulatory Reporting',
              duration: 10,
              priority: 1,
              prerequisites: [],
              skills: ['Regulatory Reporting'],
              format: 'certification',
              provider: 'RegTech Solutions',
              scheduledStartDate: '2024-02-01',
              completionStatus: 'not-started'
            },
            {
              id: 'm8',
              title: 'Data Analytics for Compliance',
              duration: 6,
              priority: 2,
              prerequisites: ['Advanced Regulatory Reporting'],
              skills: ['Regulatory Reporting', 'Risk Assessment Methodologies'],
              format: 'online',
              provider: 'Analytics Institute',
              scheduledStartDate: '2024-03-01',
              completionStatus: 'not-started'
            }
          ]
        }
      ]

      setOptimizedPaths(optimizedLearningPaths)
      toast.success("Learning paths optimized! Personalized tracks created based on your audit schedule and regulatory requirements.")
    } catch (error) {
      toast.error("Optimization failed. Please try again.")
    } finally {
      setIsOptimizing(false)
    }
  }

  const runAIAnalysis = async () => {
    setIsAnalyzing(true)
    toast.info("Analyzing skill gaps with AI...")

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate skill gaps
      const gaps: SkillGap[] = skillAssessments
        .map(assessment => ({
          skill: assessment.skill,
          currentLevel: assessment.currentLevel,
          targetLevel: assessment.targetLevel,
          gap: assessment.targetLevel - assessment.currentLevel,
          impact: assessment.criticalForCompliance 
            ? (assessment.targetLevel - assessment.currentLevel > 3 ? 'critical' : 'high')
            : 'medium' as const,
          recommendations: generateRecommendations(assessment)
        }))
        .filter(gap => gap.gap > 0)
        .sort((a, b) => b.gap - a.gap)

      setSkillGaps(gaps)

      // Generate training recommendations
      const recommendations: TrainingRecommendation[] = [
        {
          id: '1',
          title: 'Advanced Data Privacy & GDPR Compliance',
          description: 'Comprehensive course covering GDPR, CCPA, and emerging privacy regulations with practical implementation strategies.',
          skillsAddressed: ['Data Privacy Regulations', 'Regulatory Reporting'],
          estimatedHours: 16,
          priority: 'high',
          format: 'certification',
          provider: 'Privacy Institute',
          cost: 1200,
          completionRate: 89
        },
        {
          id: '2',
          title: 'SOX Controls Design Workshop',
          description: 'Interactive workshop on designing and implementing effective SOX controls for financial reporting.',
          skillsAddressed: ['SOX Compliance Framework', 'Internal Audit Procedures'],
          estimatedHours: 8,
          priority: 'high',
          format: 'workshop',
          provider: 'Compliance Academy',
          cost: 800,
          completionRate: 94
        },
        {
          id: '3',
          title: 'Risk Assessment Mastery Program',
          description: 'Advanced techniques for conducting thorough risk assessments and developing mitigation strategies.',
          skillsAddressed: ['Risk Assessment Methodologies'],
          estimatedHours: 12,
          priority: 'medium',
          format: 'online',
          provider: 'Risk Management Institute',
          cost: 600,
          completionRate: 87
        },
        {
          id: '4',
          title: 'Regulatory Reporting Excellence',
          description: 'Best practices for accurate and timely regulatory reporting across multiple jurisdictions.',
          skillsAddressed: ['Regulatory Reporting', 'SOX Compliance Framework'],
          estimatedHours: 6,
          priority: 'high',
          format: 'online',
          provider: 'RegTech Solutions',
          cost: 450,
          completionRate: 91
        }
      ]

      setTrainingRecommendations(recommendations)
      toast.success("AI analysis complete! Skill gaps and recommendations updated.")
    } catch (error) {
      toast.error("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateRecommendations = (assessment: SkillAssessment): string[] => {
    const gap = assessment.targetLevel - assessment.currentLevel
    const recommendations = []

    if (gap > 3) {
      recommendations.push("Consider comprehensive certification program")
      recommendations.push("Schedule mentoring sessions with subject matter experts")
    }
    if (gap > 1) {
      recommendations.push("Complete relevant online training modules")
      recommendations.push("Attend industry workshops and conferences")
    }
    if (assessment.trend === 'declining') {
      recommendations.push("Immediate refresher training required")
    }

    return recommendations
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground'
      case 'high': return 'bg-destructive text-destructive-foreground'
      case 'medium': return 'bg-accent text-accent-foreground'
      case 'low': return 'bg-secondary text-secondary-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getPathTypeColor = (type: string) => {
    switch (type) {
      case 'audit-driven': return 'bg-destructive text-destructive-foreground'
      case 'regulation-driven': return 'bg-accent text-accent-foreground'
      case 'gap-driven': return 'bg-secondary text-secondary-foreground'
      case 'mixed': return 'bg-primary text-primary-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-destructive'
      case 'high': return 'text-accent'
      case 'medium': return 'text-secondary'
      case 'low': return 'text-muted-foreground'
      default: return 'text-muted-foreground'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-accent" />
      case 'declining': return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'stable': return <Target className="h-4 w-4 text-muted-foreground" />
      default: return null
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'text-destructive'
      case 'high': return 'text-destructive'
      case 'medium': return 'text-accent'
      case 'low': return 'text-secondary'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Skill Gap Analyzer
          </h2>
          <p className="text-muted-foreground">
            AI-powered skill gap identification with automated learning path optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runAIAnalysis} 
            disabled={isAnalyzing}
            variant="outline"
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
          <Button 
            onClick={optimizeLearningPaths} 
            disabled={isOptimizing}
            className="flex items-center gap-2"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Route className="h-4 w-4" />
                Optimize Paths
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Gaps</p>
                <p className="text-2xl font-bold text-destructive">
                  {skillGaps.filter(gap => gap.impact === 'critical').length}
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
                <p className="text-sm font-medium text-muted-foreground">Upcoming Audits</p>
                <p className="text-2xl font-bold">
                  {auditSchedules.filter(audit => new Date(audit.scheduledDate) > new Date()).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Learning Paths</p>
                <p className="text-2xl font-bold">
                  {optimizedPaths.length}
                </p>
              </div>
              <Route className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reg Changes</p>
                <p className="text-2xl font-bold">{regulatoryChanges.length}</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="paths" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="assessments">Current Skills</TabsTrigger>
          <TabsTrigger value="audits">Audit Schedule</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="paths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Optimized Learning Paths
              </CardTitle>
              <CardDescription>
                AI-generated learning paths optimized for audit schedules and regulatory changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {optimizedPaths.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Route className="h-12 w-12 mx-auto mb-4" />
                      <p>Click "Optimize Paths" to generate AI-powered learning paths</p>
                      <p className="text-sm">Paths will be tailored to your audit schedule and regulatory requirements</p>
                    </div>
                  ) : (
                    optimizedPaths.map((path) => (
                      <Card key={path.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                {path.title}
                                <Star className="h-4 w-4 text-accent" />
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {path.description}
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                <Badge className={getPriorityColor(path.priority)}>
                                  {path.priority.toUpperCase()} PRIORITY
                                </Badge>
                                <Badge className={getPathTypeColor(path.pathType)}>
                                  {path.pathType.replace('-', ' ').toUpperCase()}
                                </Badge>
                                <Badge variant="outline">
                                  <Timer className="h-3 w-3 mr-1" />
                                  {path.totalDuration}h
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">
                                ${path.estimatedCost}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Due: {new Date(path.completionDeadline).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {path.auditAlignment && (
                            <Alert className="mb-4">
                              <Calendar className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Audit Alignment:</strong> {path.auditAlignment.auditType} 
                                scheduled for {new Date(path.auditAlignment.scheduledDate).toLocaleDateString()}
                              </AlertDescription>
                            </Alert>
                          )}

                          {path.regulatoryAlignment && (
                            <Alert className="mb-4">
                              <Zap className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Regulatory Alignment:</strong> {path.regulatoryAlignment.regulation} 
                                effective {new Date(path.regulatoryAlignment.effectiveDate).toLocaleDateString()}
                              </AlertDescription>
                            </Alert>
                          )}

                          <Separator className="my-4" />

                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium mb-2">Learning Modules:</p>
                              <div className="space-y-2">
                                {path.modules.map((module, idx) => (
                                  <div key={module.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                        {idx + 1}
                                      </div>
                                      <div>
                                        <p className="font-medium">{module.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {module.format} • {module.provider} • {module.duration}h
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {module.scheduledStartDate && (
                                        <Badge variant="outline" className="text-xs">
                                          Start: {new Date(module.scheduledStartDate).toLocaleDateString()}
                                        </Badge>
                                      )}
                                      <CheckCircle2 
                                        className={`h-4 w-4 ${
                                          module.completionStatus === 'completed' 
                                            ? 'text-accent' 
                                            : 'text-muted-foreground'
                                        }`} 
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-2">Skills Gained:</p>
                              <div className="flex flex-wrap gap-1">
                                {path.skillsGained.map((skill, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <ListBullets className="h-4 w-4" />
                                  {path.modules.length} modules
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {path.totalDuration} hours
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Settings className="h-4 w-4 mr-1" />
                                  Customize
                                </Button>
                                <Button size="sm">
                                  <PlayCircle className="h-4 w-4 mr-1" />
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

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Audit Schedule
              </CardTitle>
              <CardDescription>
                Scheduled audits and their skill requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {auditSchedules.map((audit) => (
                    <Card key={audit.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{audit.auditType}</h4>
                            <p className="text-sm text-muted-foreground">
                              Scheduled: {new Date(audit.scheduledDate).toLocaleDateString()}
                            </p>
                            <Badge 
                              className={audit.criticality === 'high' ? 'bg-destructive text-destructive-foreground' : 'bg-accent text-accent-foreground'}
                            >
                              {audit.criticality.toUpperCase()} PRIORITY
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {Math.ceil((new Date(audit.scheduledDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks
                            </p>
                            <p className="text-sm text-muted-foreground">until audit</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {audit.requiredSkills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
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

        <TabsContent value="regulations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Regulatory Changes
              </CardTitle>
              <CardDescription>
                Upcoming regulatory changes and their skill impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {regulatoryChanges.map((change) => (
                    <Card key={change.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{change.regulation}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {change.changeDescription}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={`${getUrgencyColor(change.urgency)}`} variant="outline">
                                {change.urgency.toUpperCase()} URGENCY
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              Effective: {new Date(change.effectiveDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-destructive">
                              Deadline: {new Date(change.complianceDeadline).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Impacted Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {change.impactedSkills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
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

        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Identified Skill Gaps
              </CardTitle>
              <CardDescription>
                AI-identified gaps between current and target skill levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {skillGaps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4" />
                      <p>Run AI analysis to identify skill gaps</p>
                    </div>
                  ) : (
                    skillGaps.map((gap) => (
                      <Card key={gap.skill} className="border-l-4 border-l-destructive">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold">{gap.skill}</h4>
                              <Badge className={`mt-2 ${getImpactColor(gap.impact)}`} variant="outline">
                                {gap.impact.toUpperCase()} IMPACT
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-destructive">
                                -{gap.gap}
                              </p>
                              <p className="text-sm text-muted-foreground">skill points</p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span>Current: {gap.currentLevel}/10</span>
                              <span>Target: {gap.targetLevel}/10</span>
                            </div>
                            <Progress value={(gap.currentLevel / gap.targetLevel) * 100} className="h-2" />
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-2">AI Recommendations:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {gap.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <Lightbulb className="h-3 w-3" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
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

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Current Skill Assessment
              </CardTitle>
              <CardDescription>
                Overview of current skill levels and confidence scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {skillAssessments.map((assessment) => (
                    <Card key={assessment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold flex items-center gap-2">
                              {assessment.skill}
                              {getTrendIcon(assessment.trend)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Last assessed: {new Date(assessment.lastAssessed).toLocaleDateString()}
                            </p>
                            {assessment.criticalForCompliance && (
                              <Badge variant="destructive" className="mt-1">
                                Critical for Compliance
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {assessment.currentLevel}/10
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {assessment.confidenceScore}% confidence
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current Level</span>
                            <span>{assessment.currentLevel}/10</span>
                          </div>
                          <Progress value={assessment.currentLevel * 10} className="h-2" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Target Level</span>
                            <span>{assessment.targetLevel}/10</span>
                          </div>
                          <Progress value={assessment.targetLevel * 10} className="h-2 opacity-50" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Confidence</span>
                            <span>{assessment.confidenceScore}%</span>
                          </div>
                          <Progress value={assessment.confidenceScore} className="h-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Learning Progress Tracking
              </CardTitle>
              <CardDescription>
                Monitor training completion and skill development over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-sm text-muted-foreground">Active Trainings</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-accent" />
                      <p className="text-2xl font-bold">7</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-secondary" />
                      <p className="text-2xl font-bold">2</p>
                      <p className="text-sm text-muted-foreground">Certifications</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Detailed progress tracking coming soon</p>
                  <p className="text-sm">Track learning paths, completion rates, and skill improvements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}