import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Brain,
  TrendUp,
  Target,
  Lightbulb,
  BarChart,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Zap,
  Eye,
  RefreshCw,
  Download,
  GitBranch,
  Activity,
  Award,
  Users
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { OptimizationVisualization } from '@/components/OptimizationVisualization'
import { toast } from 'sonner'

// Performance Analytics Data Interfaces
interface TemplatePerformance {
  templateId: string
  templateName: string
  framework: string
  category: string
  
  // Usage Statistics
  totalUsages: number
  recentUsages: number // last 30 days
  
  // Completion Metrics
  averageCompletionTime: number // days
  onTimeCompletionRate: number // percentage
  effectivenessScore: number // percentage
  
  // Quality Metrics
  reworkRate: number // percentage of workflows requiring rework
  stakeholderSatisfaction: number // 1-5 rating
  auditPassRate: number // percentage
  
  // Resource Utilization
  averageResourceHours: number
  costEfficiency: number // cost per successful outcome
  
  // Improvement Opportunities
  identifiedBottlenecks: string[]
  commonFailurePoints: string[]
  optimizationSuggestions: OptimizationSuggestion[]
  
  // Trend Data
  performanceTrend: 'improving' | 'stable' | 'declining'
  lastOptimized: string
  version: number
  
  metadata: {
    lastAnalyzed: string
    dataConfidence: number // 0-100%
    sampleSize: number
  }
}

interface OptimizationSuggestion {
  id: string
  type: 'timeline' | 'resource' | 'quality' | 'process' | 'automation'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImpact: string
  implementationEffort: 'low' | 'medium' | 'high'
  confidenceScore: number // 0-100%
  supportingData: string[]
  estimatedROI: number // percentage improvement
}

interface OptimizedTemplate {
  originalTemplateId: string
  optimizedVersion: number
  changes: TemplateChange[]
  expectedImprovements: {
    completionTime: number // percentage reduction
    effectiveness: number // percentage increase
    resourceEfficiency: number // percentage improvement
  }
  validationResults?: ValidationResult
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'testing'
  createdAt: string
  optimizedBy: 'ai-system'
}

interface TemplateChange {
  changeType: 'add' | 'modify' | 'remove' | 'reorder'
  section: 'actions' | 'timeline' | 'resources' | 'automation' | 'notifications'
  description: string
  rationale: string
  riskLevel: 'low' | 'medium' | 'high'
  validationRequired: boolean
}

interface ValidationResult {
  testRunId: string
  completionTime: number
  effectivenessScore: number
  issues: string[]
  recommendations: string[]
  validatedBy: string
  validatedAt: string
}

// Mock performance data - in real implementation, this would come from analytics
const mockPerformanceData: TemplatePerformance[] = [
  {
    templateId: 'iso13485-design-control',
    templateName: 'ISO 13485 Design Control CAPA',
    framework: 'ISO 13485',
    category: 'design-control',
    totalUsages: 23,
    recentUsages: 8,
    averageCompletionTime: 42,
    onTimeCompletionRate: 78,
    effectivenessScore: 89,
    reworkRate: 15,
    stakeholderSatisfaction: 4.2,
    auditPassRate: 94,
    averageResourceHours: 120,
    costEfficiency: 85,
    identifiedBottlenecks: [
      'DHF compilation taking longer than expected',
      'Design review scheduling delays',
      'Resource availability conflicts'
    ],
    commonFailurePoints: [
      'Incomplete design verification documentation',
      'Missing traceability matrices',
      'Delayed stakeholder approvals'
    ],
    optimizationSuggestions: [
      {
        id: 'opt-1',
        type: 'timeline',
        priority: 'high',
        title: 'Parallelize DHF Documentation Tasks',
        description: 'Execute DHF compilation tasks in parallel rather than sequential order',
        expectedImpact: '12-15 day reduction in completion time',
        implementationEffort: 'medium',
        confidenceScore: 87,
        supportingData: [
          '68% of DHF tasks have no dependencies',
          'Historical data shows 14-day average reduction with parallel execution',
          'Resource utilization improves by 23%'
        ],
        estimatedROI: 28
      },
      {
        id: 'opt-2',
        type: 'automation',
        priority: 'medium',
        title: 'Automated Design Review Scheduling',
        description: 'Implement intelligent scheduling system for design reviews based on participant availability',
        expectedImpact: '5-8 day reduction in scheduling delays',
        implementationEffort: 'low',
        confidenceScore: 92,
        supportingData: [
          'Current manual scheduling causes 7.3 day average delay',
          'Calendar integration shows 89% successful auto-scheduling',
          'Stakeholder satisfaction increases by 18%'
        ],
        estimatedROI: 15
      },
      {
        id: 'opt-3',
        type: 'quality',
        priority: 'high',
        title: 'Enhanced Verification Checklists',
        description: 'Deploy AI-powered verification checklists that adapt based on device complexity',
        expectedImpact: '25% reduction in rework rate',
        implementationEffort: 'medium',
        confidenceScore: 81,
        supportingData: [
          'Adaptive checklists reduce missing items by 34%',
          'Similar implementations show 22% rework reduction',
          'Audit pass rates improve to 97%'
        ],
        estimatedROI: 35
      }
    ],
    performanceTrend: 'stable',
    lastOptimized: '2023-11-15',
    version: 2,
    metadata: {
      lastAnalyzed: '2024-01-20',
      dataConfidence: 91,
      sampleSize: 23
    }
  },
  {
    templateId: 'fda-qsr-risk-management',
    templateName: 'FDA QSR Risk Management CAPA',
    framework: 'FDA 21 CFR 820',
    category: 'risk-management',
    totalUsages: 15,
    recentUsages: 6,
    averageCompletionTime: 68,
    onTimeCompletionRate: 67,
    effectivenessScore: 94,
    reworkRate: 8,
    stakeholderSatisfaction: 4.5,
    auditPassRate: 98,
    averageResourceHours: 180,
    costEfficiency: 76,
    identifiedBottlenecks: [
      'Risk analysis documentation complexity',
      'Cross-functional team coordination',
      'Regulatory review cycles'
    ],
    commonFailurePoints: [
      'Incomplete hazard identification',
      'Insufficient risk control validation',
      'Delayed regulatory feedback integration'
    ],
    optimizationSuggestions: [
      {
        id: 'opt-4',
        type: 'process',
        priority: 'high',
        title: 'Structured Risk Workshop Approach',
        description: 'Implement guided workshop methodology for more efficient risk analysis',
        expectedImpact: '20% reduction in analysis time',
        implementationEffort: 'low',
        confidenceScore: 94,
        supportingData: [
          'Workshop approach reduces analysis time by 22%',
          'Team coordination improves by 31%',
          'Hazard identification completeness increases to 96%'
        ],
        estimatedROI: 42
      },
      {
        id: 'opt-5',
        type: 'automation',
        priority: 'medium',
        title: 'Regulatory Feedback Integration System',
        description: 'Automated system to track and integrate regulatory feedback into risk files',
        expectedImpact: '10-day reduction in review cycles',
        implementationEffort: 'high',
        confidenceScore: 78,
        supportingData: [
          'Manual feedback integration averages 12 days',
          'Automated systems show 83% faster integration',
          'Compliance accuracy improves by 19%'
        ],
        estimatedROI: 25
      }
    ],
    performanceTrend: 'improving',
    lastOptimized: '2024-01-05',
    version: 3,
    metadata: {
      lastAnalyzed: '2024-01-20',
      dataConfidence: 89,
      sampleSize: 15
    }
  },
  {
    templateId: 'eu-mdr-validation',
    templateName: 'EU MDR Validation CAPA',
    framework: 'EU MDR',
    category: 'validation',
    totalUsages: 8,
    recentUsages: 3,
    averageCompletionTime: 95,
    onTimeCompletionRate: 55,
    effectivenessScore: 86,
    reworkRate: 25,
    stakeholderSatisfaction: 3.8,
    auditPassRate: 89,
    averageResourceHours: 240,
    costEfficiency: 68,
    identifiedBottlenecks: [
      'Clinical evaluation complexity',
      'Notified body coordination',
      'Technical documentation alignment'
    ],
    commonFailurePoints: [
      'Insufficient clinical evidence',
      'Missing MDR-specific requirements',
      'Poor post-market surveillance planning'
    ],
    optimizationSuggestions: [
      {
        id: 'opt-6',
        type: 'quality',
        priority: 'high',
        title: 'MDR Compliance Validation Framework',
        description: 'Implement comprehensive validation framework specifically for MDR requirements',
        expectedImpact: '35% improvement in first-time compliance',
        implementationEffort: 'high',
        confidenceScore: 82,
        supportingData: [
          'Current rework rate of 25% mainly due to MDR gaps',
          'Specialized framework reduces gaps by 38%',
          'Notified body approval rates improve to 94%'
        ],
        estimatedROI: 48
      },
      {
        id: 'opt-7',
        type: 'timeline',
        priority: 'medium',
        title: 'Clinical Evidence Collection Optimization',
        description: 'Streamline clinical evidence collection and evaluation processes',
        expectedImpact: '25-day reduction in clinical evaluation time',
        implementationEffort: 'medium',
        confidenceScore: 85,
        supportingData: [
          'Clinical evaluation averages 45 days',
          'Optimized process shows 28-day average',
          'Evidence quality scores improve by 22%'
        ],
        estimatedROI: 33
      }
    ],
    performanceTrend: 'declining',
    lastOptimized: '2023-09-20',
    version: 1,
    metadata: {
      lastAnalyzed: '2024-01-20',
      dataConfidence: 76,
      sampleSize: 8
    }
  }
]

export function AITemplateOptimizer() {
  const [performanceData, setPerformanceData] = useKV<TemplatePerformance[]>('template-performance', mockPerformanceData)
  const [optimizedTemplates, setOptimizedTemplates] = useKV<OptimizedTemplate[]>('optimized-templates', [])
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePerformance | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sortBy, setSortBy] = useState<'usage' | 'effectiveness' | 'trend'>('effectiveness')
  const [filterStatus, setFilterStatus] = useState<'all' | 'optimizable' | 'optimized'>('all')

  // Filter and sort performance data
  const filteredData = performanceData
    .filter(template => {
      if (filterStatus === 'all') return true
      if (filterStatus === 'optimizable') return template.optimizationSuggestions.length > 0
      if (filterStatus === 'optimized') return template.version > 1
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.recentUsages - a.recentUsages
        case 'effectiveness':
          return b.effectivenessScore - a.effectivenessScore
        case 'trend':
          const trendWeight = { improving: 3, stable: 2, declining: 1 }
          return trendWeight[b.performanceTrend] - trendWeight[a.performanceTrend]
        default:
          return 0
      }
    })

  const runPerformanceAnalysis = async (templateId?: string) => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI-powered performance analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const prompt = spark.llmPrompt`Analyze CAPA template performance data and identify optimization opportunities. 
      
      Performance metrics for ${templateId ? 'specific template' : 'all templates'}:
      - Completion rates, timeline adherence, effectiveness scores
      - Common bottlenecks and failure points
      - Resource utilization patterns
      - Stakeholder feedback and satisfaction
      
      Generate actionable optimization suggestions with:
      - Priority ranking based on ROI and impact
      - Implementation complexity assessment  
      - Confidence scores based on data quality
      - Expected improvements with supporting rationale
      
      Focus on improvements that enhance efficiency, quality, and compliance outcomes.`
      
      const analysisResult = await spark.llm(prompt, 'gpt-4o')
      
      // Update performance data with fresh analysis
      setPerformanceData(current => 
        current.map(template => ({
          ...template,
          metadata: {
            ...template.metadata,
            lastAnalyzed: new Date().toISOString(),
            dataConfidence: Math.min(100, template.metadata.dataConfidence + 5)
          }
        }))
      )
      
      toast.success('Performance analysis completed successfully')
      
    } catch (error) {
      toast.error('Failed to complete performance analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const optimizeTemplate = async (template: TemplatePerformance) => {
    setIsOptimizing(true)
    
    try {
      // Simulate AI-powered template optimization
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const prompt = spark.llmPrompt`Generate optimized CAPA template based on performance analytics:
      
      Template: ${template.templateName}
      Framework: ${template.framework}
      
      Current Performance:
      - Completion Time: ${template.averageCompletionTime} days
      - Effectiveness Score: ${template.effectivenessScore}%
      - Rework Rate: ${template.reworkRate}%
      - On-Time Rate: ${template.onTimeCompletionRate}%
      
      Identified Issues:
      ${template.identifiedBottlenecks.join(', ')}
      
      Optimization Suggestions:
      ${template.optimizationSuggestions.map(s => `${s.title}: ${s.description}`).join('\n')}
      
      Generate specific template changes that address these issues:
      - Timeline optimizations
      - Process improvements
      - Automation enhancements
      - Quality improvements
      - Resource allocation optimization
      
      Provide detailed rationale and expected impact for each change.`
      
      const optimizationResult = await spark.llm(prompt, 'gpt-4o')
      
      // Create optimized template entry
      const optimizedTemplate: OptimizedTemplate = {
        originalTemplateId: template.templateId,
        optimizedVersion: template.version + 1,
        changes: [
          {
            changeType: 'modify',
            section: 'timeline',
            description: 'Implement parallel execution for independent DHF tasks',
            rationale: 'Analytics show 68% of DHF tasks have no dependencies, enabling parallel processing',
            riskLevel: 'low',
            validationRequired: true
          },
          {
            changeType: 'add',
            section: 'automation',
            description: 'Add automated design review scheduling system',
            rationale: 'Manual scheduling causes average 7.3-day delays based on historical data',
            riskLevel: 'low',
            validationRequired: false
          },
          {
            changeType: 'modify',
            section: 'actions',
            description: 'Enhance verification checklists with adaptive AI-powered validation',
            rationale: 'Current 15% rework rate primarily due to incomplete verification items',
            riskLevel: 'medium',
            validationRequired: true
          }
        ],
        expectedImprovements: {
          completionTime: 28, // 28% reduction
          effectiveness: 12, // 12% increase  
          resourceEfficiency: 23 // 23% improvement
        },
        approvalStatus: 'pending',
        createdAt: new Date().toISOString(),
        optimizedBy: 'ai-system'
      }
      
      setOptimizedTemplates(current => [...current, optimizedTemplate])
      
      // Update template version and reset optimization date
      setPerformanceData(current =>
        current.map(t => 
          t.templateId === template.templateId
            ? { ...t, lastOptimized: new Date().toISOString() }
            : t
        )
      )
      
      toast.success(`Template optimization completed - expected ${optimizedTemplate.expectedImprovements.completionTime}% improvement in completion time`)
      
    } catch (error) {
      toast.error('Failed to optimize template')
    } finally {
      setIsOptimizing(false)
    }
  }

  const approveOptimization = (optimizedTemplateId: string) => {
    setOptimizedTemplates(current =>
      current.map(opt =>
        opt.originalTemplateId === optimizedTemplateId
          ? { ...opt, approvalStatus: 'approved' as const }
          : opt
      )
    )
    toast.success('Template optimization approved and deployed')
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendUp className="h-4 w-4 text-green-500" />
      case 'declining':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Template Optimizer
          </h2>
          <p className="text-muted-foreground">
            AI-powered template optimization based on performance analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => runPerformanceAnalysis()}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart className="h-4 w-4 mr-2" />
                Analyze Performance
              </>
            )}
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {performanceData.reduce((sum, t) => sum + t.effectivenessScore, 0) / performanceData.length}%
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Effectiveness</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {Math.round(performanceData.reduce((sum, t) => sum + t.averageCompletionTime, 0) / performanceData.length)}
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {Math.round(performanceData.reduce((sum, t) => sum + t.onTimeCompletionRate, 0) / performanceData.length)}%
                      </p>
                      <p className="text-xs text-muted-foreground">On-Time Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {performanceData.reduce((sum, t) => sum + t.optimizationSuggestions.length, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Opportunities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex gap-4">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="effectiveness">Sort by Effectiveness</SelectItem>
                  <SelectItem value="usage">Sort by Usage</SelectItem>
                  <SelectItem value="trend">Sort by Trend</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  <SelectItem value="optimizable">Needs Optimization</SelectItem>
                  <SelectItem value="optimized">Recently Optimized</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Template Performance Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredData.map((template) => (
                <Card key={template.templateId} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{template.templateName}</CardTitle>
                          {getTrendIcon(template.performanceTrend)}
                          <Badge variant="outline">{template.framework}</Badge>
                        </div>
                        <CardDescription>v{template.version} • {template.category}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {template.optimizationSuggestions.length > 0 && (
                          <Button 
                            size="sm"
                            onClick={() => optimizeTemplate(template)}
                            disabled={isOptimizing}
                          >
                            <Zap className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Effectiveness</span>
                          <span className={getPerformanceColor(template.effectivenessScore)}>
                            {template.effectivenessScore}%
                          </span>
                        </div>
                        <Progress value={template.effectivenessScore} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>On-Time Rate</span>
                          <span className={getPerformanceColor(template.onTimeCompletionRate)}>
                            {template.onTimeCompletionRate}%
                          </span>
                        </div>
                        <Progress value={template.onTimeCompletionRate} />
                      </div>
                    </div>

                    {/* Usage and Timeline */}
                    <div className="grid gap-2 md:grid-cols-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Usage:</span>
                        <div className="font-medium">{template.recentUsages} recent</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Time:</span>
                        <div className="font-medium">{template.averageCompletionTime}d</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rework:</span>
                        <div className="font-medium">{template.reworkRate}%</div>
                      </div>
                    </div>

                    {/* Optimization Opportunities */}
                    {template.optimizationSuggestions.length > 0 && (
                      <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            {template.optimizationSuggestions.length} Optimization Opportunities
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {template.optimizationSuggestions
                            .filter(s => s.priority === 'high')
                            .slice(0, 2)
                            .map(s => s.title)
                            .join(', ')}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Template Optimizations
              </h3>
            </div>

            {/* Pending Optimizations */}
            <div className="space-y-4">
              {optimizedTemplates
                .filter(opt => opt.approvalStatus === 'pending')
                .map((optimization) => {
                  const originalTemplate = performanceData.find(t => t.templateId === optimization.originalTemplateId)
                  return (
                    <Card key={optimization.originalTemplateId} className="border-primary/20">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              <GitBranch className="h-4 w-4 text-primary" />
                              {originalTemplate?.templateName} Optimization
                            </CardTitle>
                            <CardDescription>
                              v{optimization.optimizedVersion} • Created {new Date(optimization.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => approveOptimization(optimization.originalTemplateId)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Expected Improvements */}
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              -{optimization.expectedImprovements.completionTime}%
                            </div>
                            <div className="text-sm text-muted-foreground">Completion Time</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              +{optimization.expectedImprovements.effectiveness}%
                            </div>
                            <div className="text-sm text-muted-foreground">Effectiveness</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              +{optimization.expectedImprovements.resourceEfficiency}%
                            </div>
                            <div className="text-sm text-muted-foreground">Resource Efficiency</div>
                          </div>
                        </div>

                        {/* Key Changes */}
                        <div>
                          <h5 className="font-medium mb-2">Key Changes ({optimization.changes.length})</h5>
                          <div className="space-y-2">
                            {optimization.changes.slice(0, 3).map((change, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {change.changeType}
                                </Badge>
                                <div className="flex-1">
                                  <div className="font-medium">{change.description}</div>
                                  <div className="text-muted-foreground text-xs">{change.rationale}</div>
                                </div>
                                <Badge variant={change.riskLevel === 'high' ? 'destructive' : change.riskLevel === 'medium' ? 'default' : 'secondary'}>
                                  {change.riskLevel}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>

            {/* Approved Optimizations */}
            <div className="space-y-4">
              <h4 className="font-medium text-muted-foreground">Recently Approved</h4>
              {optimizedTemplates
                .filter(opt => opt.approvalStatus === 'approved')
                .slice(0, 3)
                .map((optimization) => {
                  const originalTemplate = performanceData.find(t => t.templateId === optimization.originalTemplateId)
                  return (
                    <Card key={optimization.originalTemplateId}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="font-medium">{originalTemplate?.templateName}</div>
                            <div className="text-sm text-muted-foreground">
                              Optimized {new Date(optimization.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium text-green-600">
                                -{optimization.expectedImprovements.completionTime}% time
                              </div>
                              <div className="text-xs text-muted-foreground">
                                +{optimization.expectedImprovements.effectiveness}% effective
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              <Award className="h-3 w-3 mr-1" />
                              Live
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            {/* Optimization Impact Visualization */}
            <OptimizationVisualization />
            
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  Template performance metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h5 className="font-medium">Effectiveness by Framework</h5>
                    {['ISO 13485', 'FDA 21 CFR 820', 'EU MDR'].map((framework, index) => {
                      const avg = [89, 94, 86][index]
                      return (
                        <div key={framework} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{framework}</span>
                            <span className={getPerformanceColor(avg)}>{avg}%</span>
                          </div>
                          <Progress value={avg} />
                        </div>
                      )
                    })}
                  </div>
                  <div className="space-y-4">
                    <h5 className="font-medium">Completion Time Distribution</h5>
                    {['< 30 days', '30-60 days', '> 60 days'].map((range, index) => {
                      const percentage = [15, 50, 35][index]
                      return (
                        <div key={range} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{range}</span>
                            <span>{percentage}%</span>
                          </div>
                          <Progress value={percentage} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottleneck Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Common Bottlenecks</CardTitle>
                <CardDescription>
                  Most frequent delays and issues across templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { issue: 'Documentation review cycles', frequency: 78, impact: 'High' },
                    { issue: 'Stakeholder availability', frequency: 65, impact: 'Medium' },
                    { issue: 'Regulatory feedback integration', frequency: 52, impact: 'High' },
                    { issue: 'Resource allocation conflicts', frequency: 43, impact: 'Medium' },
                    { issue: 'Technical validation delays', frequency: 38, impact: 'High' }
                  ].map((bottleneck, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{bottleneck.issue}</div>
                        <div className="text-xs text-muted-foreground">
                          {bottleneck.frequency}% of workflows affected
                        </div>
                      </div>
                      <Badge variant={bottleneck.impact === 'High' ? 'destructive' : 'default'}>
                        {bottleneck.impact} Impact
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <div className="space-y-6">
            {/* High Priority Recommendations */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                High Priority Recommendations
              </h3>
              
              {performanceData
                .flatMap(template => 
                  template.optimizationSuggestions
                    .filter(s => s.priority === 'high')
                    .map(s => ({ ...s, templateName: template.templateName, templateId: template.templateId }))
                )
                .sort((a, b) => b.estimatedROI - a.estimatedROI)
                .slice(0, 5)
                .map((suggestion, index) => (
                  <Card key={suggestion.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Badge className="bg-red-100 text-red-800 text-xs">HIGH</Badge>
                            {suggestion.title}
                          </CardTitle>
                          <CardDescription>
                            {suggestion.templateName} • Expected ROI: {suggestion.estimatedROI}%
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">
                            <Zap className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <span className="text-sm font-medium">Expected Impact:</span>
                          <div className="text-sm text-muted-foreground">{suggestion.expectedImpact}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Implementation:</span>
                          <div className="text-sm text-muted-foreground capitalize">{suggestion.implementationEffort} effort</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Confidence:</span>
                          <div className="text-sm text-muted-foreground">{suggestion.confidenceScore}%</div>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Supporting Data:</span>
                        <ul className="mt-1 text-sm text-muted-foreground list-disc list-inside">
                          {suggestion.supportingData.slice(0, 2).map((data, i) => (
                            <li key={i}>{data}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Implementation Roadmap */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Roadmap</CardTitle>
                <CardDescription>
                  Recommended implementation sequence for maximum impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { phase: 'Phase 1', duration: '2-4 weeks', focus: 'Quick wins and automation', impact: 'High' },
                    { phase: 'Phase 2', duration: '1-2 months', focus: 'Process optimization', impact: 'Medium' },
                    { phase: 'Phase 3', duration: '2-3 months', focus: 'Advanced AI integration', impact: 'High' }
                  ].map((phase, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Badge>{phase.phase}</Badge>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{phase.focus}</div>
                        <div className="text-xs text-muted-foreground">{phase.duration}</div>
                      </div>
                      <Badge variant={phase.impact === 'High' ? 'default' : 'secondary'}>
                        {phase.impact} Impact
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                {selectedTemplate.templateName} Performance
              </DialogTitle>
              <DialogDescription>
                Detailed analytics and optimization opportunities
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Performance Metrics Grid */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedTemplate.effectivenessScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Effectiveness Score</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedTemplate.averageCompletionTime}d
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Completion</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedTemplate.stakeholderSatisfaction}/5
                    </div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </CardContent>
                </Card>
              </div>

              {/* Optimization Suggestions */}
              <div>
                <h4 className="font-medium mb-3">Optimization Opportunities</h4>
                <div className="space-y-3">
                  {selectedTemplate.optimizationSuggestions.map((suggestion) => (
                    <Card key={suggestion.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={
                                suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                                suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {suggestion.priority.toUpperCase()}
                              </Badge>
                              <h5 className="font-medium">{suggestion.title}</h5>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                            <div className="text-sm">
                              <span className="font-medium">Expected Impact:</span> {suggestion.expectedImpact}
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium text-green-600">+{suggestion.estimatedROI}% ROI</div>
                            <div className="text-muted-foreground">{suggestion.confidenceScore}% confidence</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
              <Button onClick={() => optimizeTemplate(selectedTemplate)}>
                <Zap className="h-4 w-4 mr-2" />
                Optimize Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}