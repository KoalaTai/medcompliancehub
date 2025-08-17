import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  Pause,
  BookOpen,
  Target,
  Zap,
  Bell,
  Settings2,
  BarChart3,
  Route,
  Timer,
  Award,
  ArrowRight,
  RefreshCw
} from "@phosphor-icons/react"
import { toast } from 'sonner'

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
  actualStartDate?: string
  completionStatus: 'not-started' | 'in-progress' | 'completed' | 'paused'
  progressPercentage: number
  estimatedCompletionDate?: string
}

interface OptimizedLearningPath {
  id: string
  title: string
  description: string
  totalDuration: number
  priority: 'urgent' | 'high' | 'medium' | 'low'
  modules: LearningModule[]
  overallProgress: number
  isActive: boolean
  pathType: 'audit-driven' | 'regulation-driven' | 'gap-driven' | 'mixed'
  completionDeadline: string
  estimatedCost: number
  actualCost: number
  skillsGained: string[]
}

interface LearningAlert {
  id: string
  type: 'deadline' | 'prerequisite' | 'recommendation' | 'milestone'
  message: string
  severity: 'high' | 'medium' | 'low'
  actionRequired: boolean
  pathId?: string
  moduleId?: string
  dueDate?: string
}

export function LearningPathMonitor() {
  const [activePaths, setActivePaths] = useKV<OptimizedLearningPath[]>('active-learning-paths', [])
  const [learningAlerts, setLearningAlerts] = useKV<LearningAlert[]>('learning-alerts', [])
  const [isMonitoring, setIsMonitoring] = useKV('learning-monitoring-enabled', true)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [lastOptimization, setLastOptimization] = useKV('last-path-optimization', '')

  // Initialize with sample active paths
  useEffect(() => {
    if (activePaths.length === 0) {
      const samplePaths: OptimizedLearningPath[] = [
        {
          id: 'path-1',
          title: 'SOX 404 Audit Preparation Track',
          description: 'Accelerated preparation for upcoming SOX audit with intelligent scheduling',
          totalDuration: 24,
          priority: 'urgent',
          pathType: 'audit-driven',
          completionDeadline: '2024-03-15',
          estimatedCost: 2400,
          actualCost: 800,
          skillsGained: ['SOX Compliance Framework', 'Internal Audit Procedures', 'Risk Assessment Methodologies'],
          overallProgress: 45,
          isActive: true,
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
              actualStartDate: '2024-01-15',
              completionStatus: 'completed',
              progressPercentage: 100,
              estimatedCompletionDate: '2024-01-22'
            },
            {
              id: 'm2',
              title: 'Advanced Internal Controls Design',
              duration: 12,
              priority: 2,
              prerequisites: ['m1'],
              skills: ['SOX Compliance Framework', 'Internal Audit Procedures'],
              format: 'workshop',
              provider: 'Audit Excellence Institute',
              scheduledStartDate: '2024-01-23',
              actualStartDate: '2024-01-24',
              completionStatus: 'in-progress',
              progressPercentage: 65,
              estimatedCompletionDate: '2024-02-05'
            },
            {
              id: 'm3',
              title: 'Risk Assessment Integration',
              duration: 4,
              priority: 3,
              prerequisites: ['m1'],
              skills: ['Risk Assessment Methodologies'],
              format: 'online',
              provider: 'Risk Institute',
              scheduledStartDate: '2024-02-05',
              completionStatus: 'not-started',
              progressPercentage: 0,
              estimatedCompletionDate: '2024-02-09'
            }
          ]
        },
        {
          id: 'path-2',
          title: 'EU AI Act Compliance Readiness',
          description: 'Comprehensive preparation for AI Act with adaptive learning schedule',
          totalDuration: 18,
          priority: 'high',
          pathType: 'regulation-driven',
          completionDeadline: '2024-06-15',
          estimatedCost: 1800,
          actualCost: 0,
          skillsGained: ['Risk Assessment Methodologies', 'Data Privacy Regulations'],
          overallProgress: 0,
          isActive: false,
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
              completionStatus: 'not-started',
              progressPercentage: 0
            },
            {
              id: 'm5',
              title: 'AI Risk Management Systems',
              duration: 8,
              priority: 2,
              prerequisites: ['m4'],
              skills: ['Risk Assessment Methodologies'],
              format: 'certification',
              provider: 'AI Risk Institute',
              scheduledStartDate: '2024-03-15',
              completionStatus: 'not-started',
              progressPercentage: 0
            },
            {
              id: 'm6',
              title: 'Data Protection in AI Systems',
              duration: 4,
              priority: 3,
              prerequisites: ['m4'],
              skills: ['Data Privacy Regulations'],
              format: 'workshop',
              provider: 'Privacy Institute',
              scheduledStartDate: '2024-04-01',
              completionStatus: 'not-started',
              progressPercentage: 0
            }
          ]
        }
      ]
      setActivePaths(samplePaths)
    }
  }, [activePaths, setActivePaths])

  // Generate learning alerts based on current state
  useEffect(() => {
    if (activePaths.length > 0) {
      const alerts = generateLearningAlerts(activePaths)
      setLearningAlerts(alerts)
    }
  }, [activePaths, setLearningAlerts])

  const generateLearningAlerts = (paths: OptimizedLearningPath[]): LearningAlert[] => {
    const alerts: LearningAlert[] = []
    const now = new Date()

    paths.forEach(path => {
      // Check for approaching deadlines
      const deadline = new Date(path.completionDeadline)
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDeadline <= 14 && path.overallProgress < 75) {
        alerts.push({
          id: `deadline-${path.id}`,
          type: 'deadline',
          message: `${path.title} deadline approaching in ${daysUntilDeadline} days. Current progress: ${path.overallProgress}%`,
          severity: daysUntilDeadline <= 7 ? 'high' : 'medium',
          actionRequired: true,
          pathId: path.id,
          dueDate: path.completionDeadline
        })
      }

      // Check for prerequisite blockers
      path.modules.forEach(module => {
        if (module.completionStatus === 'not-started' && module.prerequisites.length > 0) {
          const missingPrereqs = module.prerequisites.filter(prereqId => {
            const prereq = path.modules.find(m => m.id === prereqId)
            return prereq?.completionStatus !== 'completed'
          })
          
          if (missingPrereqs.length > 0 && module.scheduledStartDate) {
            const startDate = new Date(module.scheduledStartDate)
            const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            
            if (daysUntilStart <= 3) {
              alerts.push({
                id: `prereq-${module.id}`,
                type: 'prerequisite',
                message: `Prerequisites for "${module.title}" not completed. Module starts in ${daysUntilStart} days.`,
                severity: 'high',
                actionRequired: true,
                pathId: path.id,
                moduleId: module.id
              })
            }
          }
        }
      })

      // Check for milestone achievements
      if (path.overallProgress >= 50 && path.overallProgress < 60) {
        alerts.push({
          id: `milestone-${path.id}`,
          type: 'milestone',
          message: `Great progress! You're halfway through ${path.title}`,
          severity: 'low',
          actionRequired: false,
          pathId: path.id
        })
      }

      // Adaptive scheduling recommendations
      if (path.isActive) {
        const behindSchedule = path.modules.some(module => {
          if (module.actualStartDate && module.scheduledStartDate) {
            const scheduled = new Date(module.scheduledStartDate)
            const actual = new Date(module.actualStartDate)
            return actual > scheduled
          }
          return false
        })

        if (behindSchedule) {
          alerts.push({
            id: `schedule-${path.id}`,
            type: 'recommendation',
            message: `Consider adjusting schedule for ${path.title} to meet deadline`,
            severity: 'medium',
            actionRequired: false,
            pathId: path.id
          })
        }
      }
    })

    return alerts.sort((a, b) => {
      const severityOrder = { 'high': 0, 'medium': 1, 'low': 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  }

  const optimizeActivePaths = async () => {
    setIsOptimizing(true)
    toast.info("AI is re-optimizing your active learning paths...")

    try {
      // Simulate AI optimization
      const optimizationPrompt = spark.llmPrompt`
        Re-optimize active learning paths based on current progress and constraints:
        
        ACTIVE PATHS: ${JSON.stringify(activePaths)}
        CURRENT DATE: ${new Date().toISOString()}
        
        Provide intelligent scheduling adjustments considering:
        1. Current progress and completion rates
        2. Deadline pressures and priority changes
        3. Module dependencies and prerequisites
        4. Learning velocity and capacity
        5. Cost optimization opportunities
        
        Suggest specific schedule adjustments, module reordering, or resource reallocation.
      `

      await spark.llm(optimizationPrompt)
      
      // Simulate optimization results
      const optimizedPaths = activePaths.map(path => {
        // Smart scheduling adjustments
        const adjustedModules = path.modules.map(module => {
          if (module.completionStatus === 'in-progress' && module.progressPercentage < 50) {
            // Suggest acceleration if behind schedule
            return {
              ...module,
              estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          }
          return module
        })

        return {
          ...path,
          modules: adjustedModules
        }
      })

      setActivePaths(optimizedPaths)
      setLastOptimization(new Date().toISOString())
      toast.success("Learning paths optimized! Schedules adjusted for better outcomes.")
    } catch (error) {
      toast.error("Optimization failed. Please try again.")
    } finally {
      setIsOptimizing(false)
    }
  }

  const togglePathStatus = (pathId: string) => {
    setActivePaths(paths => 
      paths.map(path => 
        path.id === pathId 
          ? { ...path, isActive: !path.isActive }
          : path
      )
    )
  }

  const updateModuleProgress = (pathId: string, moduleId: string, progress: number) => {
    setActivePaths(paths => 
      paths.map(path => {
        if (path.id === pathId) {
          const updatedModules = path.modules.map(module => 
            module.id === moduleId 
              ? { 
                  ...module, 
                  progressPercentage: progress,
                  completionStatus: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started'
                }
              : module
          )
          
          const overallProgress = updatedModules.reduce((sum, m) => sum + m.progressPercentage, 0) / updatedModules.length
          
          return {
            ...path,
            modules: updatedModules,
            overallProgress: Math.round(overallProgress)
          }
        }
        return path
      })
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground'
      case 'high': return 'bg-destructive/80 text-destructive-foreground'
      case 'medium': return 'bg-accent text-accent-foreground'
      case 'low': return 'bg-secondary text-secondary-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-destructive bg-destructive/10'
      case 'medium': return 'border-accent bg-accent/10'
      case 'low': return 'border-secondary bg-secondary/10'
      default: return 'border-muted bg-muted/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-accent" />
      case 'in-progress': return <PlayCircle className="h-4 w-4 text-primary" />
      case 'paused': return <Pause className="h-4 w-4 text-muted-foreground" />
      default: return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Route className="h-5 w-5" />
            Learning Path Monitor
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-powered progress tracking and adaptive scheduling
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isMonitoring ? "default" : "secondary"}>
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </Badge>
          <Button 
            size="sm" 
            variant="outline"
            onClick={optimizeActivePaths}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-1" />
                Optimize
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Learning Alerts */}
      {learningAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Learning Alerts ({learningAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {learningAlerts.slice(0, 5).map(alert => (
                  <Alert key={alert.id} className={getAlertColor(alert.severity)}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span className="text-sm">{alert.message}</span>
                      {alert.actionRequired && (
                        <Badge variant="outline" className="text-xs">
                          Action Required
                        </Badge>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Active Learning Paths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activePaths.map(path => (
          <Card key={path.id} className={`border-l-4 ${path.isActive ? 'border-l-primary' : 'border-l-muted'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {path.title}
                    {path.isActive && <Badge variant="outline" className="text-xs">Active</Badge>}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {path.description}
                  </CardDescription>
                </div>
                <Badge className={getPriorityColor(path.priority)} variant="secondary">
                  {path.priority.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span className="font-medium">{path.overallProgress}%</span>
                </div>
                <Progress value={path.overallProgress} className="h-2" />
              </div>

              {/* Path Stats */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <p className="font-medium">{path.modules.length}</p>
                  <p className="text-muted-foreground">Modules</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">{path.totalDuration}h</p>
                  <p className="text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">
                    ${path.actualCost}/${path.estimatedCost}
                  </p>
                  <p className="text-muted-foreground">Cost</p>
                </div>
              </div>

              <Separator />

              {/* Modules */}
              <div>
                <p className="text-sm font-medium mb-2">Modules:</p>
                <div className="space-y-2">
                  {path.modules.slice(0, 3).map(module => (
                    <div key={module.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2 flex-1">
                        {getStatusIcon(module.completionStatus)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{module.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress 
                              value={module.progressPercentage} 
                              className="h-1 flex-1" 
                            />
                            <span className="text-xs text-muted-foreground">
                              {module.progressPercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {module.duration}h
                      </div>
                    </div>
                  ))}
                  {path.modules.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{path.modules.length - 3} more modules
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => togglePathStatus(path.id)}
                  className="flex-1"
                >
                  {path.isActive ? (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Resume
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline">
                  <Settings2 className="h-3 w-3 mr-1" />
                  Adjust
                </Button>
                <Button size="sm">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning Analytics Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Learning Analytics
          </CardTitle>
          <CardDescription>
            AI-powered insights into your learning patterns and optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">78%</div>
              <div className="text-xs text-muted-foreground">Avg Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2.3x</div>
              <div className="text-xs text-muted-foreground">Learning Velocity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">92%</div>
              <div className="text-xs text-muted-foreground">Schedule Adherence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">$1,200</div>
              <div className="text-xs text-muted-foreground">Cost Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {lastOptimization && (
        <div className="text-xs text-muted-foreground text-center">
          Last optimization: {new Date(lastOptimization).toLocaleString()}
        </div>
      )}
    </div>
  )
}