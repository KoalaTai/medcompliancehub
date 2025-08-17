import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  Eye
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

export function SkillGapAnalyzer() {
  const [skillAssessments, setSkillAssessments] = useKV<SkillAssessment[]>('skill-assessments', [])
  const [trainingRecommendations, setTrainingRecommendations] = useKV<TrainingRecommendation[]>('training-recommendations', [])
  const [skillGaps, setSkillGaps] = useKV<SkillGap[]>('skill-gaps', [])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedUser, setSelectedUser] = useState('current-user')

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
      case 'high': return 'bg-destructive text-destructive-foreground'
      case 'medium': return 'bg-accent text-accent-foreground'
      case 'low': return 'bg-secondary text-secondary-foreground'
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Skill Gap Analyzer
          </h2>
          <p className="text-muted-foreground">
            Identify skill gaps and get personalized training recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runAIAnalysis} 
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
                Run AI Analysis
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
                <p className="text-sm font-medium text-muted-foreground">Training Hours</p>
                <p className="text-2xl font-bold">
                  {trainingRecommendations.reduce((sum, rec) => sum + rec.estimatedHours, 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Confidence</p>
                <p className="text-2xl font-bold">
                  {Math.round(skillAssessments.reduce((sum, s) => sum + s.confidenceScore, 0) / skillAssessments.length)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Skills Tracked</p>
                <p className="text-2xl font-bold">{skillAssessments.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gaps" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="assessments">Current Skills</TabsTrigger>
          <TabsTrigger value="recommendations">Training Plans</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

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

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                AI Training Recommendations
              </CardTitle>
              <CardDescription>
                Personalized training programs based on your skill gaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {trainingRecommendations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-4" />
                      <p>Run AI analysis to get training recommendations</p>
                    </div>
                  ) : (
                    trainingRecommendations.map((recommendation) => (
                      <Card key={recommendation.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold">{recommendation.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {recommendation.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getPriorityColor(recommendation.priority)}>
                                  {recommendation.priority.toUpperCase()} PRIORITY
                                </Badge>
                                <Badge variant="outline">
                                  {recommendation.format}
                                </Badge>
                                <Badge variant="outline">
                                  {recommendation.estimatedHours}h
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              {recommendation.cost && (
                                <p className="text-lg font-bold">
                                  ${recommendation.cost}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {recommendation.completionRate}% completion rate
                              </p>
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium mb-2">Skills Addressed:</p>
                              <div className="flex flex-wrap gap-1">
                                {recommendation.skillsAddressed.map((skill, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">
                                Provider: {recommendation.provider}
                              </p>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                                <Button size="sm">
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Enroll
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