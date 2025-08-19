import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Code,
  Zap,
  Target,
  TrendingUp,
  Bug,
  Wrench,
  Lightbulb,
  ArrowRight,
  PlayCircle,
  PauseCircle,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  XCircle,
  GitBranch,
  FileText,
  Database,
  Cpu,
  Shield
} from '@phosphor-icons/react'

interface FeatureAssessment {
  id: string
  componentName: string
  category: 'core' | 'automation' | 'integration' | 'ui' | 'data' | 'security'
  status: 'functional' | 'partial' | 'placeholder' | 'missing'
  functionalityScore: number // 0-100
  placeholderElements: string[]
  functionalElements: string[]
  criticalGaps: string[]
  recommendedActions: string[]
  priority: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  dependencies: string[]
  lastAssessed: string
  notes: string
}

interface GapAnalysisReport {
  id: string
  createdAt: string
  totalFeatures: number
  functionalFeatures: number
  partialFeatures: number
  placeholderFeatures: number
  missingFeatures: number
  overallScore: number
  categoryBreakdown: Record<string, { score: number; count: number }>
  priorityBreakdown: Record<string, number>
  recommendations: string[]
}

// Initial feature assessments based on the codebase analysis
const defaultAssessments: FeatureAssessment[] = [
  {
    id: 'email-templates',
    componentName: 'EmailTemplateManager',
    category: 'core',
    status: 'functional',
    functionalityScore: 95,
    placeholderElements: [
      'Test email sending (shows toast only)',
      'Import validation could be more robust'
    ],
    functionalElements: [
      'Template creation and editing',
      'Variable system with placeholders',
      'Branding configuration',
      'HTML and text versions',
      'Preview functionality',
      'Export/import capabilities',
      'Category-based organization',
      'Usage tracking'
    ],
    criticalGaps: [],
    recommendedActions: [
      'Implement actual email sending service integration',
      'Add template testing with real data',
      'Enhance import validation and error handling'
    ],
    priority: 'medium',
    effort: 'medium',
    dependencies: ['email-service-integration'],
    lastAssessed: new Date().toISOString(),
    notes: 'Highly functional with comprehensive templating system'
  },
  {
    id: 'webhook-integrations',
    componentName: 'WebhookIntegrations',
    category: 'integration',
    status: 'functional',
    functionalityScore: 85,
    placeholderElements: [
      'Actual webhook endpoint calls',
      'Real-time webhook testing',
      'Advanced retry mechanisms'
    ],
    functionalElements: [
      'Webhook configuration management',
      'Event type selection',
      'Header and payload customization',
      'Status monitoring',
      'Test webhook functionality',
      'Activity logging'
    ],
    criticalGaps: [
      'No actual HTTP calls to webhook endpoints',
      'Mock testing instead of real integration testing'
    ],
    recommendedActions: [
      'Implement actual webhook HTTP client',
      'Add webhook endpoint validation',
      'Create real-time webhook testing',
      'Add webhook signature verification'
    ],
    priority: 'high',
    effort: 'high',
    dependencies: ['http-client-service'],
    lastAssessed: new Date().toISOString(),
    notes: 'Good UI but needs backend integration for full functionality'
  },
  {
    id: 'compliance-dashboard',
    componentName: 'ComplianceDashboard',
    category: 'core',
    status: 'functional',
    functionalityScore: 90,
    placeholderElements: [
      'Real-time data updates',
      'Some metrics are static examples'
    ],
    functionalElements: [
      'Widget-based layout',
      'Navigation integration',
      'Multiple metric displays',
      'Status indicators',
      'Interactive elements'
    ],
    criticalGaps: [],
    recommendedActions: [
      'Connect to real data sources',
      'Add real-time data refresh',
      'Implement data filtering and date ranges'
    ],
    priority: 'medium',
    effort: 'medium',
    dependencies: ['data-service'],
    lastAssessed: new Date().toISOString(),
    notes: 'Good foundation with room for data integration'
  },
  {
    id: 'audit-simulations',
    componentName: 'AuditSimulations',
    category: 'core',
    status: 'partial',
    functionalityScore: 70,
    placeholderElements: [
      'AI-powered scenario generation',
      'Real audit simulation logic',
      'Progress tracking algorithms'
    ],
    functionalElements: [
      'Simulation configuration UI',
      'Scenario selection',
      'Basic progress display',
      'Results formatting'
    ],
    criticalGaps: [
      'No actual simulation engine',
      'Static scenario data',
      'No real progress calculation'
    ],
    recommendedActions: [
      'Implement simulation engine',
      'Add AI scenario generation',
      'Create progress tracking system',
      'Add detailed reporting'
    ],
    priority: 'high',
    effort: 'high',
    dependencies: ['ai-service', 'simulation-engine'],
    lastAssessed: new Date().toISOString(),
    notes: 'UI framework ready but needs core simulation logic'
  },
  {
    id: 'resource-allocation',
    componentName: 'ResourceAllocation',
    category: 'automation',
    status: 'partial',
    functionalityScore: 65,
    placeholderElements: [
      'AI-powered resource optimization',
      'Real workload analysis',
      'Dynamic allocation algorithms'
    ],
    functionalElements: [
      'Resource management UI',
      'Team assignment interface',
      'Resource visualization',
      'Status tracking'
    ],
    criticalGaps: [
      'No optimization algorithms',
      'Static resource data',
      'No workload analysis'
    ],
    recommendedActions: [
      'Implement resource optimization AI',
      'Add workload analysis engine',
      'Create dynamic allocation system',
      'Add capacity planning'
    ],
    priority: 'high',
    effort: 'high',
    dependencies: ['ai-service', 'analytics-engine'],
    lastAssessed: new Date().toISOString(),
    notes: 'Strong UI foundation but needs intelligent backend'
  },
  {
    id: 'skill-gap-analyzer',
    componentName: 'SkillGapAnalyzer',
    category: 'automation',
    status: 'partial',
    functionalityScore: 60,
    placeholderElements: [
      'AI skill assessment',
      'Gap analysis algorithms',
      'Personalized recommendations'
    ],
    functionalElements: [
      'Skill tracking UI',
      'Gap visualization',
      'Progress monitoring',
      'Recommendation display'
    ],
    criticalGaps: [
      'No AI-powered analysis',
      'Static skill data',
      'No personalization engine'
    ],
    recommendedActions: [
      'Implement AI skill assessment',
      'Add gap analysis algorithms',
      'Create recommendation engine',
      'Add learning path generation'
    ],
    priority: 'high',
    effort: 'high',
    dependencies: ['ai-service', 'learning-analytics'],
    lastAssessed: new Date().toISOString(),
    notes: 'Good tracking interface but needs intelligent analysis'
  },
  {
    id: 'regulatory-intelligence',
    componentName: 'RegulatoryIntelligence',
    category: 'automation',
    status: 'placeholder',
    functionalityScore: 30,
    placeholderElements: [
      'AI regulatory monitoring',
      'Real-time updates',
      'Impact assessment',
      'Compliance mapping'
    ],
    functionalElements: [
      'Basic UI framework',
      'Navigation structure',
      'Status displays'
    ],
    criticalGaps: [
      'No regulatory data feeds',
      'No AI analysis engine',
      'No real-time monitoring',
      'No impact assessment'
    ],
    recommendedActions: [
      'Integrate regulatory data sources',
      'Implement AI analysis engine',
      'Add real-time monitoring',
      'Create impact assessment system'
    ],
    priority: 'high',
    effort: 'high',
    dependencies: ['regulatory-data-api', 'ai-service'],
    lastAssessed: new Date().toISOString(),
    notes: 'Mostly placeholder with significant development needed'
  },
  {
    id: 'capa-workflow',
    componentName: 'CAPAWorkflowGenerator',
    category: 'automation',
    status: 'placeholder',
    functionalityScore: 35,
    placeholderElements: [
      'AI workflow generation',
      'Dynamic workflow templates',
      'Process optimization',
      'Integration with systems'
    ],
    functionalElements: [
      'Basic workflow UI',
      'Template selection',
      'Status tracking display'
    ],
    criticalGaps: [
      'No AI workflow generation',
      'Static templates only',
      'No process engine',
      'No system integrations'
    ],
    recommendedActions: [
      'Implement AI workflow generator',
      'Add dynamic template system',
      'Create workflow process engine',
      'Add system integrations'
    ],
    priority: 'high',
    effort: 'high',
    dependencies: ['ai-service', 'workflow-engine'],
    lastAssessed: new Date().toISOString(),
    notes: 'Basic UI only, needs core workflow functionality'
  },
  {
    id: 'evidence-manager',
    componentName: 'EvidenceManager',
    category: 'data',
    status: 'partial',
    functionalityScore: 55,
    placeholderElements: [
      'File storage integration',
      'OCR and content analysis',
      'Version control system'
    ],
    functionalElements: [
      'File upload interface',
      'Evidence categorization',
      'Search functionality',
      'Metadata management'
    ],
    criticalGaps: [
      'No actual file storage',
      'No OCR capabilities',
      'No version tracking'
    ],
    recommendedActions: [
      'Implement cloud file storage',
      'Add OCR and content analysis',
      'Create version control system',
      'Add advanced search capabilities'
    ],
    priority: 'medium',
    effort: 'high',
    dependencies: ['file-storage-service', 'ocr-service'],
    lastAssessed: new Date().toISOString(),
    notes: 'Good interface design but needs backend services'
  },
  {
    id: 'team-settings',
    componentName: 'Team Management',
    category: 'core',
    status: 'missing',
    functionalityScore: 0,
    placeholderElements: [
      'User management system',
      'Role-based access control',
      'Team collaboration features',
      'Permission management'
    ],
    functionalElements: [],
    criticalGaps: [
      'No user management system',
      'No authentication/authorization',
      'No team features',
      'No permission system'
    ],
    recommendedActions: [
      'Implement user management system',
      'Add authentication and authorization',
      'Create team collaboration features',
      'Add role-based permissions'
    ],
    priority: 'medium',
    effort: 'high',
    dependencies: ['auth-service', 'user-management'],
    lastAssessed: new Date().toISOString(),
    notes: 'Completely missing - placeholder in navigation only'
  }
]

export function FeatureGapAnalyzer() {
  const [assessments, setAssessments] = useKV<FeatureAssessment[]>('feature-assessments', defaultAssessments)
  const [reports, setReports] = useKV<GapAnalysisReport[]>('gap-analysis-reports', [])
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [currentReport, setCurrentReport] = useState<GapAnalysisReport | null>(null)
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<FeatureAssessment | null>(null)

  // Calculate overall metrics
  const metrics = useMemo(() => {
    const total = assessments.length
    const functional = assessments.filter(a => a.status === 'functional').length
    const partial = assessments.filter(a => a.status === 'partial').length
    const placeholder = assessments.filter(a => a.status === 'placeholder').length
    const missing = assessments.filter(a => a.status === 'missing').length
    
    const overallScore = assessments.reduce((sum, a) => sum + a.functionalityScore, 0) / total
    
    const categoryBreakdown = assessments.reduce((acc, assessment) => {
      if (!acc[assessment.category]) {
        acc[assessment.category] = { score: 0, count: 0 }
      }
      acc[assessment.category].score += assessment.functionalityScore
      acc[assessment.category].count += 1
      return acc
    }, {} as Record<string, { score: number; count: number }>)
    
    Object.keys(categoryBreakdown).forEach(category => {
      categoryBreakdown[category].score = categoryBreakdown[category].score / categoryBreakdown[category].count
    })
    
    const priorityBreakdown = assessments.reduce((acc, assessment) => {
      acc[assessment.priority] = (acc[assessment.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      total,
      functional,
      partial,
      placeholder,
      missing,
      overallScore,
      categoryBreakdown,
      priorityBreakdown
    }
  }, [assessments])

  // Filter assessments based on selected filters
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const matchesCategory = selectedCategory === 'all' || assessment.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || assessment.status === selectedStatus
      const matchesSearch = searchTerm === '' || 
        assessment.componentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.notes.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [assessments, selectedCategory, selectedStatus, searchTerm])

  const generateReport = () => {
    const report: GapAnalysisReport = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalFeatures: metrics.total,
      functionalFeatures: metrics.functional,
      partialFeatures: metrics.partial,
      placeholderFeatures: metrics.placeholder,
      missingFeatures: metrics.missing,
      overallScore: metrics.overallScore,
      categoryBreakdown: metrics.categoryBreakdown,
      priorityBreakdown: metrics.priorityBreakdown,
      recommendations: generateRecommendations()
    }
    
    setReports(current => [report, ...current])
    setCurrentReport(report)
    setIsReportDialogOpen(true)
    
    toast.success('Gap analysis report generated')
  }

  const generateRecommendations = (): string[] => {
    const recommendations: string[] = []
    
    // High-priority gaps
    const highPriorityGaps = assessments.filter(a => a.priority === 'high' && a.functionalityScore < 80)
    if (highPriorityGaps.length > 0) {
      recommendations.push(`Address ${highPriorityGaps.length} high-priority feature gaps to improve core functionality`)
    }
    
    // Missing features
    const missingFeatures = assessments.filter(a => a.status === 'missing')
    if (missingFeatures.length > 0) {
      recommendations.push(`Implement ${missingFeatures.length} missing features to complete the platform`)
    }
    
    // Placeholder features with high impact
    const criticalPlaceholders = assessments.filter(a => 
      a.status === 'placeholder' && 
      (a.category === 'core' || a.category === 'automation')
    )
    if (criticalPlaceholders.length > 0) {
      recommendations.push(`Convert ${criticalPlaceholders.length} critical placeholder features to functional implementations`)
    }
    
    // AI service dependencies
    const aiDependentFeatures = assessments.filter(a => 
      a.dependencies.includes('ai-service') && a.functionalityScore < 70
    )
    if (aiDependentFeatures.length > 0) {
      recommendations.push(`Prioritize AI service integration to unlock ${aiDependentFeatures.length} intelligent features`)
    }
    
    // Category-specific recommendations
    Object.entries(metrics.categoryBreakdown).forEach(([category, { score }]) => {
      if (score < 60) {
        recommendations.push(`Focus development efforts on ${category} features (current score: ${score.toFixed(0)}%)`)
      }
    })
    
    return recommendations
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'functional': return 'text-green-600'
      case 'partial': return 'text-yellow-600'
      case 'placeholder': return 'text-orange-600'
      case 'missing': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'functional': return CheckCircle
      case 'partial': return Clock
      case 'placeholder': return AlertTriangle
      case 'missing': return XCircle
      default: return AlertCircle
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return Target
      case 'automation': return Zap
      case 'integration': return GitBranch
      case 'ui': return Sparkles
      case 'data': return Database
      case 'security': return Shield
      default: return Settings
    }
  }

  const handleReassessFeature = (assessment: FeatureAssessment) => {
    setSelectedAssessment(assessment)
    setIsAssessmentDialogOpen(true)
  }

  const handleRunAnalysis = async () => {
    toast.success('Running comprehensive feature analysis...')
    
    // Simulate analysis
    setTimeout(() => {
      // Update last assessed timestamps
      setAssessments(current => 
        current.map(a => ({
          ...a,
          lastAssessed: new Date().toISOString()
        }))
      )
      generateReport()
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feature Gap Analysis</h2>
          <p className="text-muted-foreground">
            Analyze placeholder features vs functional implementations across the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsReportDialogOpen(true)} disabled={!currentReport}>
            <FileText className="w-4 h-4 mr-2" />
            View Report
          </Button>
          <Button onClick={handleRunAnalysis}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overallScore.toFixed(0)}%</div>
            <Progress value={metrics.overallScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Platform functionality
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Functional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.functional}</div>
            <p className="text-xs text-muted-foreground">
              Fully implemented features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              Partial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.partial}</div>
            <p className="text-xs text-muted-foreground">
              Partially implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Placeholder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.placeholder}</div>
            <p className="text-xs text-muted-foreground">
              Mock implementations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              Missing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.missing}</div>
            <p className="text-xs text-muted-foreground">
              Not implemented
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Category Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(metrics.categoryBreakdown).map(([category, { score, count }]) => {
              const Icon = getCategoryIcon(category)
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">{category}</span>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold">{score.toFixed(0)}%</span>
                  </div>
                  <Progress value={score} />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Feature Assessment Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="category-filter">Category:</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="ui">UI</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter">Status:</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="functional">Functional</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="placeholder">Placeholder</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Assessments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Feature Assessments
          </CardTitle>
          <CardDescription>
            Showing {filteredAssessments.length} of {assessments.length} features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAssessments.length > 0 ? (
              filteredAssessments.map(assessment => {
                const StatusIcon = getStatusIcon(assessment.status)
                const CategoryIcon = getCategoryIcon(assessment.category)
                
                return (
                  <div key={assessment.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-5 h-5" />
                          <h4 className="font-semibold">{assessment.componentName}</h4>
                          <Badge variant="outline" className="capitalize">
                            {assessment.category}
                          </Badge>
                          <Badge variant={assessment.priority === 'high' ? 'destructive' : assessment.priority === 'medium' ? 'default' : 'secondary'}>
                            {assessment.priority} priority
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${getStatusColor(assessment.status)}`} />
                            <span className={`text-sm font-medium capitalize ${getStatusColor(assessment.status)}`}>
                              {assessment.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            <span className="text-sm">{assessment.functionalityScore}% functional</span>
                            <Progress value={assessment.functionalityScore} className="w-20" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            <span className="text-xs text-muted-foreground">
                              {assessment.effort} effort
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReassessFeature(assessment)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {assessment.notes && (
                      <p className="text-sm text-muted-foreground">
                        {assessment.notes}
                      </p>
                    )}

                    <Tabs defaultValue="gaps" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="gaps">Gaps</TabsTrigger>
                        <TabsTrigger value="functional">Functional</TabsTrigger>
                        <TabsTrigger value="actions">Actions</TabsTrigger>
                        <TabsTrigger value="deps">Dependencies</TabsTrigger>
                      </TabsList>

                      <TabsContent value="gaps" className="space-y-2 mt-4">
                        {assessment.placeholderElements.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-orange-600 mb-2">Placeholder Elements:</h5>
                            <ul className="space-y-1">
                              {assessment.placeholderElements.map((item, index) => (
                                <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {assessment.criticalGaps.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-red-600 mb-2">Critical Gaps:</h5>
                            <ul className="space-y-1">
                              {assessment.criticalGaps.map((gap, index) => (
                                <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                                  <XCircle className="w-3 h-3 text-red-500" />
                                  {gap}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="functional" className="space-y-2 mt-4">
                        {assessment.functionalElements.length > 0 ? (
                          <ul className="space-y-1">
                            {assessment.functionalElements.map((item, index) => (
                              <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground">No functional elements identified</p>
                        )}
                      </TabsContent>

                      <TabsContent value="actions" className="space-y-2 mt-4">
                        {assessment.recommendedActions.length > 0 ? (
                          <ul className="space-y-1">
                            {assessment.recommendedActions.map((action, index) => (
                              <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                                <ArrowRight className="w-3 h-3 text-blue-500" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground">No specific actions recommended</p>
                        )}
                      </TabsContent>

                      <TabsContent value="deps" className="space-y-2 mt-4">
                        {assessment.dependencies.length > 0 ? (
                          <ul className="space-y-1">
                            {assessment.dependencies.map((dep, index) => (
                              <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                                <GitBranch className="w-3 h-3 text-purple-500" />
                                {dep}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground">No dependencies identified</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-semibold mb-2">No Features Found</h4>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Gap Analysis Report
            </DialogTitle>
            <DialogDescription>
              Comprehensive analysis of feature implementation status
            </DialogDescription>
          </DialogHeader>
          
          {currentReport && (
            <div className="space-y-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentReport.functionalFeatures}</div>
                  <div className="text-xs text-muted-foreground">Functional</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{currentReport.partialFeatures}</div>
                  <div className="text-xs text-muted-foreground">Partial</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{currentReport.placeholderFeatures}</div>
                  <div className="text-xs text-muted-foreground">Placeholder</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{currentReport.missingFeatures}</div>
                  <div className="text-xs text-muted-foreground">Missing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentReport.overallScore.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Overall Score</div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Key Recommendations</h4>
                <ul className="space-y-2">
                  {currentReport.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Category Breakdown</h4>
                <div className="space-y-3">
                  {Object.entries(currentReport.categoryBreakdown).map(([category, { score, count }]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm capitalize font-medium">{category}</span>
                        <Badge variant="outline" className="text-xs">{count} features</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={score} className="w-24" />
                        <span className="text-sm font-semibold w-12 text-right">{score.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <TrendingUp className="w-4 h-4" />
                <AlertDescription>
                  Report generated on {new Date(currentReport.createdAt).toLocaleString()}. 
                  Focus on high-priority gaps and missing core functionality to improve overall platform maturity.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
              Close Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}