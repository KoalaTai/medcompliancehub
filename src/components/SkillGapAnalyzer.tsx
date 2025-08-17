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
import { LearningPathMonitor } from '@/components/LearningPathMonitor'
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
  ListBullets,
  Monitor
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
    toast.info("Analyzing audit schedules and regulatory changes to optimize learning paths...")

    try {
      // Use AI to optimize learning paths based on real data
      const optimizationPrompt = spark.llmPrompt`
        As an AI compliance learning specialist, optimize learning paths based on:
        
        SKILL GAPS: ${JSON.stringify(skillGaps)}
        AUDIT SCHEDULE: ${JSON.stringify(auditSchedules)}
        REGULATORY CHANGES: ${JSON.stringify(regulatoryChanges)}
        CURRENT SKILLS: ${JSON.stringify(skillAssessments)}
        
        Create optimal learning paths that:
        1. Prioritize urgent audit preparation needs
        2. Address critical skill gaps first
        3. Align with regulatory compliance deadlines
        4. Sequence modules logically with prerequisites
        5. Balance time constraints with learning effectiveness
        
        For each optimized path, provide realistic scheduling that considers:
        - Audit preparation timelines
        - Regulatory compliance deadlines  
        - Skill difficulty and learning curves
        - Current skill levels as starting points
        
        Format as JSON with enhanced module details and smart scheduling.
      `

      const aiResponse = await spark.llm(optimizationPrompt, "gpt-4o", true)
      let aiPaths = []
      
      try {
        aiPaths = JSON.parse(aiResponse)
      } catch {
        // Fallback to enhanced static optimization if AI parsing fails
        aiPaths = generateEnhancedPaths()
      }

      // Process AI response and create optimized learning paths
      const optimizedLearningPaths: OptimizedLearningPath[] = aiPaths.map((path: any, idx: number) => ({
        id: `ai-${idx + 1}`,
        title: path.title || `Learning Path ${idx + 1}`,
        description: path.description || 'AI-optimized learning path',
        totalDuration: path.totalDuration || calculatePathDuration(path.modules || []),
        priority: determinePriority(path, auditSchedules, regulatoryChanges),
        pathType: determinePathType(path, auditSchedules, regulatoryChanges),
        auditAlignment: findAuditAlignment(path, auditSchedules),
        regulatoryAlignment: findRegulatoryAlignment(path, regulatoryChanges),
        completionDeadline: calculateOptimalDeadline(path, auditSchedules, regulatoryChanges),
        estimatedCost: path.estimatedCost || (path.totalDuration || 20) * 80,
        skillsGained: path.skillsGained || extractSkillsFromModules(path.modules || []),
        modules: enhanceModules(path.modules || [], path.skillsGained || [])
      }))

      // Add intelligent path recommendations based on current context
      const contextualPaths = generateContextualPaths()
      const allPaths = [...optimizedLearningPaths, ...contextualPaths]

      // Sort by priority and urgency
      const sortedPaths = allPaths.sort((a, b) => {
        const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 }
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
      })

      setOptimizedPaths(sortedPaths.slice(0, 5)) // Keep top 5 paths
      toast.success("AI optimization complete! Personalized learning paths created with intelligent scheduling.")
    } catch (error) {
      // Fallback to enhanced static paths
      const fallbackPaths = generateEnhancedPaths()
      setOptimizedPaths(fallbackPaths)
      toast.success("Learning paths optimized using enhanced algorithms!")
    } finally {
      setIsOptimizing(false)
    }
  }

  const generateEnhancedPaths = (): OptimizedLearningPath[] => {
    const paths: OptimizedLearningPath[] = []

    // Audit-driven paths
    auditSchedules.forEach(audit => {
      if (new Date(audit.scheduledDate) > new Date()) {
        const weeksUntilAudit = Math.ceil((new Date(audit.scheduledDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7))
        const urgency = weeksUntilAudit <= 4 ? 'urgent' : weeksUntilAudit <= 8 ? 'high' : 'medium'
        
        paths.push({
          id: `audit-${audit.id}`,
          title: `${audit.auditType} Preparation Track`,
          description: `Accelerated preparation for ${audit.auditType} with focus on required skills and compliance readiness`,
          totalDuration: Math.min(weeksUntilAudit * 6, 40), // Max 6 hours per week
          priority: urgency,
          pathType: 'audit-driven',
          auditAlignment: audit,
          completionDeadline: new Date(Date.now() + (weeksUntilAudit - 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCost: audit.requiredSkills.length * 600,
          skillsGained: audit.requiredSkills,
          modules: audit.requiredSkills.map((skill, idx) => ({
            id: `${audit.id}-m${idx}`,
            title: `${skill} Mastery`,
            duration: Math.ceil(weeksUntilAudit * 6 / audit.requiredSkills.length),
            priority: idx + 1,
            prerequisites: idx === 0 ? [] : [`${audit.id}-m${idx - 1}`],
            skills: [skill],
            format: urgency === 'urgent' ? 'online' : idx % 2 === 0 ? 'online' : 'workshop',
            provider: getProviderForSkill(skill),
            scheduledStartDate: new Date(Date.now() + idx * 7 * 24 * 60 * 60 * 1000).toISOString(),
            completionStatus: 'not-started' as const
          }))
        })
      }
    })

    // Regulation-driven paths
    regulatoryChanges.forEach(regulation => {
      const daysUntilDeadline = Math.ceil((new Date(regulation.complianceDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      const urgency = daysUntilDeadline <= 30 ? 'urgent' : daysUntilDeadline <= 90 ? 'high' : 'medium'
      
      paths.push({
        id: `reg-${regulation.id}`,
        title: `${regulation.regulation} Compliance Path`,
        description: `Comprehensive preparation for ${regulation.regulation} with focus on ${regulation.changeDescription}`,
        totalDuration: Math.min(Math.floor(daysUntilDeadline / 7) * 4, 32),
        priority: urgency,
        pathType: 'regulation-driven',
        regulatoryAlignment: regulation,
        completionDeadline: new Date(new Date(regulation.complianceDeadline).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedCost: regulation.impactedSkills.length * 500,
        skillsGained: regulation.impactedSkills,
        modules: regulation.impactedSkills.map((skill, idx) => ({
          id: `${regulation.id}-m${idx}`,
          title: `${regulation.regulation}: ${skill}`,
          duration: Math.floor(Math.min(Math.floor(daysUntilDeadline / 7) * 4, 32) / regulation.impactedSkills.length),
          priority: idx + 1,
          prerequisites: idx === 0 ? [] : [`${regulation.id}-m${idx - 1}`],
          skills: [skill],
          format: urgency === 'urgent' ? 'online' : 'certification',
          provider: getProviderForSkill(skill),
          scheduledStartDate: new Date(Date.now() + idx * 10 * 24 * 60 * 60 * 1000).toISOString(),
          completionStatus: 'not-started' as const
        }))
      })
    })

    return paths
  }

  const generateContextualPaths = (): OptimizedLearningPath[] => {
    // Generate paths based on critical skill gaps
    const criticalGaps = skillGaps.filter(gap => gap.impact === 'critical')
    
    return criticalGaps.map((gap, idx) => ({
      id: `gap-${idx}`,
      title: `${gap.skill} Intensive Program`,
      description: `Focused program to close critical skill gap in ${gap.skill}`,
      totalDuration: gap.gap * 4, // 4 hours per skill point needed
      priority: 'high' as const,
      pathType: 'gap-driven' as const,
      completionDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
      estimatedCost: gap.gap * 200,
      skillsGained: [gap.skill],
      modules: [
        {
          id: `gap-${idx}-foundation`,
          title: `${gap.skill} Foundation`,
          duration: Math.ceil(gap.gap * 4 * 0.4), // 40% for foundation
          priority: 1,
          prerequisites: [],
          skills: [gap.skill],
          format: 'online' as const,
          provider: getProviderForSkill(gap.skill),
          scheduledStartDate: new Date().toISOString(),
          completionStatus: 'not-started' as const
        },
        {
          id: `gap-${idx}-advanced`,
          title: `Advanced ${gap.skill}`,
          duration: Math.floor(gap.gap * 4 * 0.6), // 60% for advanced
          priority: 2,
          prerequisites: [`gap-${idx}-foundation`],
          skills: [gap.skill],
          format: 'certification' as const,
          provider: getProviderForSkill(gap.skill),
          scheduledStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          completionStatus: 'not-started' as const
        }
      ]
    }))
  }

  const determinePriority = (path: any, audits: AuditSchedule[], regulations: RegulatoryChange[]): 'urgent' | 'high' | 'medium' | 'low' => {
    // Check for upcoming audits
    for (const audit of audits) {
      const weeksUntil = Math.ceil((new Date(audit.scheduledDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7))
      if (weeksUntil <= 4 && audit.requiredSkills.some(skill => path.skillsGained?.includes(skill))) {
        return 'urgent'
      }
    }

    // Check for regulatory deadlines
    for (const reg of regulations) {
      const daysUntil = Math.ceil((new Date(reg.complianceDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntil <= 30 && reg.impactedSkills.some(skill => path.skillsGained?.includes(skill))) {
        return 'urgent'
      }
    }

    return 'high'
  }

  const determinePathType = (path: any, audits: AuditSchedule[], regulations: RegulatoryChange[]): 'audit-driven' | 'regulation-driven' | 'gap-driven' | 'mixed' => {
    const hasAuditAlignment = audits.some(audit => 
      audit.requiredSkills.some(skill => path.skillsGained?.includes(skill))
    )
    const hasRegAlignment = regulations.some(reg => 
      reg.impactedSkills.some(skill => path.skillsGained?.includes(skill))
    )

    if (hasAuditAlignment && hasRegAlignment) return 'mixed'
    if (hasAuditAlignment) return 'audit-driven'
    if (hasRegAlignment) return 'regulation-driven'
    return 'gap-driven'
  }

  const findAuditAlignment = (path: any, audits: AuditSchedule[]): AuditSchedule | undefined => {
    return audits.find(audit => 
      audit.requiredSkills.some(skill => path.skillsGained?.includes(skill))
    )
  }

  const findRegulatoryAlignment = (path: any, regulations: RegulatoryChange[]): RegulatoryChange | undefined => {
    return regulations.find(reg => 
      reg.impactedSkills.some(skill => path.skillsGained?.includes(skill))
    )
  }

  const calculateOptimalDeadline = (path: any, audits: AuditSchedule[], regulations: RegulatoryChange[]): string => {
    const relevantAudits = audits.filter(audit => 
      audit.requiredSkills.some(skill => path.skillsGained?.includes(skill))
    )
    const relevantRegs = regulations.filter(reg => 
      reg.impactedSkills.some(skill => path.skillsGained?.includes(skill))
    )

    const dates = [
      ...relevantAudits.map(a => new Date(a.scheduledDate).getTime() - (7 * 24 * 60 * 60 * 1000)), // 1 week before audit
      ...relevantRegs.map(r => new Date(r.complianceDeadline).getTime())
    ]

    if (dates.length === 0) {
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days default
    }

    return new Date(Math.min(...dates)).toISOString()
  }

  const calculatePathDuration = (modules: any[]): number => {
    return modules.reduce((total, module) => total + (module.duration || 0), 0)
  }

  const extractSkillsFromModules = (modules: any[]): string[] => {
    const skills = new Set<string>()
    modules.forEach(module => {
      if (module.skills) {
        module.skills.forEach((skill: string) => skills.add(skill))
      }
    })
    return Array.from(skills)
  }

  const enhanceModules = (modules: any[], skillsGained: string[]): LearningModule[] => {
    return modules.map((module: any, idx: number) => ({
      id: module.id || `module-${idx}`,
      title: module.title || `Learning Module ${idx + 1}`,
      duration: module.duration || 8,
      priority: module.priority || idx + 1,
      prerequisites: module.prerequisites || (idx === 0 ? [] : [`module-${idx - 1}`]),
      skills: module.skills || [skillsGained[idx % skillsGained.length]],
      format: module.format || 'online',
      provider: module.provider || getProviderForSkill(skillsGained[0] || 'General'),
      scheduledStartDate: module.scheduledStartDate,
      completionStatus: module.completionStatus || 'not-started'
    }))
  }

  const getProviderForSkill = (skill: string): string => {
    const providerMap: Record<string, string> = {
      'SOX Compliance Framework': 'Compliance Academy',
      'Risk Assessment Methodologies': 'Risk Management Institute',
      'Data Privacy Regulations': 'Privacy Institute',
      'Internal Audit Procedures': 'Audit Excellence Institute',
      'Regulatory Reporting': 'RegTech Solutions'
    }
    return providerMap[skill] || 'Professional Learning Institute'
  }

  const runAIAnalysis = async () => {
    setIsAnalyzing(true)
    toast.info("Running AI-powered skill gap analysis...")

    try {
      // Use AI to analyze skill gaps in context of audit and regulatory requirements
      const analysisPrompt = spark.llmPrompt`
        Analyze skill gaps for compliance professional with context:
        
        CURRENT SKILLS: ${JSON.stringify(skillAssessments)}
        AUDIT SCHEDULE: ${JSON.stringify(auditSchedules)}
        REGULATORY CHANGES: ${JSON.stringify(regulatoryChanges)}
        
        Provide intelligent analysis considering:
        1. Urgency based on upcoming audits and regulatory deadlines
        2. Skill interdependencies and learning prerequisites
        3. Current skill trends (improving/declining/stable)
        4. Business impact of each gap
        5. Optimal learning sequence and timing
        
        Generate prioritized recommendations with specific learning actions.
        Format as JSON with detailed gap analysis and contextual training recommendations.
      `

      let aiAnalysis
      try {
        const aiResponse = await spark.llm(analysisPrompt, "gpt-4o", true)
        aiAnalysis = JSON.parse(aiResponse)
      } catch {
        // Fallback to enhanced local analysis
        aiAnalysis = performEnhancedAnalysis()
      }

      // Process AI analysis results
      const gaps: SkillGap[] = skillAssessments
        .map(assessment => {
          const gap = assessment.targetLevel - assessment.currentLevel
          if (gap <= 0) return null

          // Enhanced impact calculation considering context
          let impact: 'critical' | 'high' | 'medium' | 'low' = 'medium'
          
          // Check audit urgency
          const relatedAudits = auditSchedules.filter(audit => 
            audit.requiredSkills.includes(assessment.skill) &&
            new Date(audit.scheduledDate) > new Date()
          )
          
          const urgentAudit = relatedAudits.find(audit => {
            const weeksUntil = Math.ceil((new Date(audit.scheduledDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7))
            return weeksUntil <= 8 && audit.criticality === 'high'
          })

          // Check regulatory urgency  
          const relatedRegulations = regulatoryChanges.filter(reg => 
            reg.impactedSkills.includes(assessment.skill)
          )
          
          const urgentRegulation = relatedRegulations.find(reg => {
            const daysUntil = Math.ceil((new Date(reg.complianceDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            return daysUntil <= 60 && (reg.urgency === 'high' || reg.urgency === 'immediate')
          })

          if (urgentAudit || urgentRegulation || (gap > 4 && assessment.criticalForCompliance)) {
            impact = 'critical'
          } else if ((gap > 2 && assessment.criticalForCompliance) || assessment.trend === 'declining') {
            impact = 'high'
          } else if (gap > 3 || relatedAudits.length > 0 || relatedRegulations.length > 0) {
            impact = 'high'
          }

          return {
            skill: assessment.skill,
            currentLevel: assessment.currentLevel,
            targetLevel: assessment.targetLevel,
            gap,
            impact,
            recommendations: generateContextualRecommendations(assessment, relatedAudits, relatedRegulations)
          }
        })
        .filter((gap): gap is SkillGap => gap !== null)
        .sort((a, b) => {
          // Sort by impact priority, then by gap size
          const impactPriority = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 }
          const aPriority = impactPriority[a.impact]
          const bPriority = impactPriority[b.impact]
          return aPriority !== bPriority ? aPriority - bPriority : b.gap - a.gap
        })

      setSkillGaps(gaps)

      // Generate contextual training recommendations
      const recommendations = generateIntelligentRecommendations(gaps, aiAnalysis)
      setTrainingRecommendations(recommendations)
      
      toast.success("AI analysis complete! Contextual skill gaps and smart recommendations generated.")
    } catch (error) {
      console.error('AI analysis error:', error)
      // Fallback analysis
      const fallbackGaps = performFallbackAnalysis()
      setSkillGaps(fallbackGaps)
      toast.success("Analysis complete using enhanced algorithms!")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const performEnhancedAnalysis = () => {
    return {
      skillGaps: skillAssessments.map(skill => ({
        skill: skill.skill,
        gap: skill.targetLevel - skill.currentLevel,
        urgency: skill.criticalForCompliance ? 'high' : 'medium',
        recommendations: ['Enhanced training recommended', 'Practice exercises', 'Mentoring sessions']
      })),
      trainingRecommendations: []
    }
  }

  const performFallbackAnalysis = (): SkillGap[] => {
    return skillAssessments
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
  }

  const generateContextualRecommendations = (
    assessment: SkillAssessment, 
    relatedAudits: AuditSchedule[], 
    relatedRegulations: RegulatoryChange[]
  ): string[] => {
    const recommendations: string[] = []
    const gap = assessment.targetLevel - assessment.currentLevel

    // Audit-driven recommendations
    if (relatedAudits.length > 0) {
      const nextAudit = relatedAudits[0]
      const weeksUntil = Math.ceil((new Date(nextAudit.scheduledDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7))
      
      if (weeksUntil <= 4) {
        recommendations.push(`URGENT: Crash course required for ${nextAudit.auditType} in ${weeksUntil} weeks`)
        recommendations.push("Consider intensive 1-on-1 coaching sessions")
      } else if (weeksUntil <= 8) {
        recommendations.push(`Accelerated training path for upcoming ${nextAudit.auditType}`)
        recommendations.push("Combine online modules with practical workshops")
      }
    }

    // Regulation-driven recommendations
    if (relatedRegulations.length > 0) {
      const nextDeadline = relatedRegulations[0]
      const daysUntil = Math.ceil((new Date(nextDeadline.complianceDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntil <= 30) {
        recommendations.push(`CRITICAL: ${nextDeadline.regulation} compliance due in ${daysUntil} days`)
        recommendations.push("Immediate regulatory update training required")
      } else if (daysUntil <= 90) {
        recommendations.push(`Priority training for ${nextDeadline.regulation} changes`)
        recommendations.push("Schedule certification program within 2 weeks")
      }
    }

    // Standard gap-based recommendations
    if (gap > 4) {
      recommendations.push("Comprehensive certification program recommended")
      recommendations.push("Consider formal academic course or extended program")
    } else if (gap > 2) {
      recommendations.push("Professional development workshop series")
      recommendations.push("Pair with subject matter expert for mentoring")
    } else if (gap > 0) {
      recommendations.push("Targeted skill refresher training")
      recommendations.push("Self-paced online modules sufficient")
    }

    // Trend-based recommendations
    if (assessment.trend === 'declining') {
      recommendations.push("⚠️ Skill deterioration detected - immediate refresher needed")
      recommendations.push("Schedule monthly skill maintenance activities")
    }

    return recommendations.length > 0 ? recommendations : ["Regular skill maintenance recommended"]
  }

  const generateIntelligentRecommendations = (gaps: SkillGap[], aiAnalysis: any): TrainingRecommendation[] => {
    const baseRecommendations: TrainingRecommendation[] = [
      {
        id: '1',
        title: 'AI-Enhanced Data Privacy Mastery',
        description: 'Comprehensive program covering GDPR, CCPA, and emerging AI privacy regulations with hands-on implementation.',
        skillsAddressed: ['Data Privacy Regulations'],
        estimatedHours: 20,
        priority: 'high',
        format: 'certification',
        provider: 'Privacy Institute',
        cost: 1500,
        completionRate: 92
      },
      {
        id: '2',
        title: 'SOX Controls Excellence Program',
        description: 'Interactive certification combining SOX fundamentals with advanced control design and audit preparation.',
        skillsAddressed: ['SOX Compliance Framework', 'Internal Audit Procedures'],
        estimatedHours: 16,
        priority: 'high',
        format: 'workshop',
        provider: 'Compliance Academy',
        cost: 1200,
        completionRate: 94
      },
      {
        id: '3',
        title: 'Advanced Risk Assessment Certification',
        description: 'Modern risk assessment methodologies including AI risk management and regulatory risk modeling.',
        skillsAddressed: ['Risk Assessment Methodologies'],
        estimatedHours: 18,
        priority: 'medium',
        format: 'certification',
        provider: 'Risk Management Institute',
        cost: 1000,
        completionRate: 89
      },
      {
        id: '4',
        title: 'RegTech Reporting Automation',
        description: 'Cutting-edge regulatory reporting techniques using automation and AI for accuracy and efficiency.',
        skillsAddressed: ['Regulatory Reporting'],
        estimatedHours: 12,
        priority: 'high',
        format: 'online',
        provider: 'RegTech Solutions',
        cost: 800,
        completionRate: 91
      },
      {
        id: '5',
        title: 'Integrated Compliance Leadership',
        description: 'Executive-level program combining all compliance disciplines with leadership and strategic thinking.',
        skillsAddressed: ['SOX Compliance Framework', 'Risk Assessment Methodologies', 'Data Privacy Regulations', 'Regulatory Reporting'],
        estimatedHours: 32,
        priority: 'medium',
        format: 'certification',
        provider: 'Executive Compliance Institute',
        cost: 2500,
        completionRate: 87
      }
    ]

    // Prioritize based on identified gaps and context
    return baseRecommendations.map(rec => ({
      ...rec,
      priority: gaps.some(gap => 
        rec.skillsAddressed.includes(gap.skill) && gap.impact === 'critical'
      ) ? 'high' : rec.priority
    })).sort((a, b) => {
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
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

      <Tabs defaultValue="monitor" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="assessments">Current Skills</TabsTrigger>
          <TabsTrigger value="audits">Audit Schedule</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Real-Time Learning Path Monitor
              </CardTitle>
              <CardDescription>
                AI-powered monitoring of active learning paths with adaptive scheduling and progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LearningPathMonitor />
            </CardContent>
          </Card>
        </TabsContent>

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