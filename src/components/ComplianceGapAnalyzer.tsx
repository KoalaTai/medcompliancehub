import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Warning, 
  CheckCircle, 
  Clock, 
  TrendUp,
  AlertTriangle,
  FileX,
  Target,
  Brain,
  ArrowRight,
  Refresh,
  Robot,
  Lightning
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { AutomatedGapDetection } from './AutomatedGapDetection'

interface ComplianceGap {
  id: string
  regulation: string
  framework: string
  requirement: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved'
  missingDocuments: string[]
  recommendedActions: string[]
  dueDate: string
  estimatedEffort: string
  aiInsight: string
}

interface ComplianceFramework {
  name: string
  completionRate: number
  criticalGaps: number
  totalRequirements: number
  lastAssessment: string
}

const mockGaps: ComplianceGap[] = [
  {
    id: '1',
    regulation: 'ISO 13485',
    framework: 'Quality Management',
    requirement: 'Design History File completeness verification',
    severity: 'critical',
    status: 'open',
    missingDocuments: ['Design Review Records', 'Verification Test Results', 'Validation Protocol'],
    recommendedActions: [
      'Create missing design review documentation',
      'Execute verification testing',
      'Develop validation protocols'
    ],
    dueDate: '2024-02-15',
    estimatedEffort: '40 hours',
    aiInsight: 'Based on similar DHF implementations, focus first on design review records as they unlock other dependencies.'
  },
  {
    id: '2',
    regulation: 'FDA 21 CFR 820',
    framework: 'Design Controls',
    requirement: 'Risk management process documentation',
    severity: 'high',
    status: 'in-progress',
    missingDocuments: ['Risk Control Measures', 'Residual Risk Assessment'],
    recommendedActions: [
      'Complete risk control implementation',
      'Document residual risk acceptability'
    ],
    dueDate: '2024-02-28',
    estimatedEffort: '24 hours',
    aiInsight: 'Current risk analysis is 70% complete. Priority should be on control measure effectiveness verification.'
  },
  {
    id: '3',
    regulation: 'EU MDR',
    framework: 'Clinical Evidence',
    requirement: 'Post-market clinical follow-up plan',
    severity: 'high',
    status: 'open',
    missingDocuments: ['PMCF Plan', 'Clinical Evaluation Update Schedule'],
    recommendedActions: [
      'Develop PMCF methodology',
      'Define clinical data collection triggers'
    ],
    dueDate: '2024-03-10',
    estimatedEffort: '32 hours',
    aiInsight: 'PMCF requirements vary by device class. Consider leveraging real-world evidence strategies.'
  }
]

const frameworkStatus: ComplianceFramework[] = [
  {
    name: 'ISO 13485',
    completionRate: 85,
    criticalGaps: 1,
    totalRequirements: 47,
    lastAssessment: '2024-01-15'
  },
  {
    name: 'FDA 21 CFR 820',
    completionRate: 78,
    criticalGaps: 0,
    totalRequirements: 52,
    lastAssessment: '2024-01-12'
  },
  {
    name: 'EU MDR',
    completionRate: 65,
    criticalGaps: 2,
    totalRequirements: 73,
    lastAssessment: '2024-01-10'
  }
]

function getSeverityBadge(severity: string) {
  switch (severity) {
    case 'critical':
      return <Badge className="bg-destructive text-destructive-foreground">Critical</Badge>
    case 'high':
      return <Badge className="bg-orange-500 text-white">High</Badge>
    case 'medium':
      return <Badge className="bg-accent text-accent-foreground">Medium</Badge>
    case 'low':
      return <Badge variant="outline">Low</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'resolved':
      return <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
    case 'in-progress':
      return <Clock className="h-4 w-4 text-primary" weight="fill" />
    case 'open':
      return <AlertTriangle className="h-4 w-4 text-destructive" weight="fill" />
    default:
      return <Warning className="h-4 w-4 text-muted-foreground" />
  }
}

export function ComplianceGapAnalyzer() {
  const [selectedFramework, setSelectedFramework] = useKV('selected-compliance-framework', 'all')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useKV('last-gap-analysis', new Date().toISOString())

  const filteredGaps = selectedFramework === 'all' 
    ? mockGaps 
    : mockGaps.filter(gap => gap.regulation === selectedFramework)

  const runGapAnalysis = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      setLastAnalysis(new Date().toISOString())
    }, 3000)
  }

  const criticalGapsCount = filteredGaps.filter(gap => gap.severity === 'critical').length
  const openGapsCount = filteredGaps.filter(gap => gap.status === 'open').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Compliance Gap Analysis
          </h2>
          <p className="text-muted-foreground">
            AI-powered gap detection with automated regulatory change monitoring
          </p>
        </div>
      </div>

      <Tabs defaultValue="automated" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="automated" className="flex items-center gap-2">
            <Robot className="h-4 w-4" />
            Automated Detection
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Lightning className="h-4 w-4" />
            Manual Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="mt-6">
          <AutomatedGapDetection />
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Manual Gap Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  Last analysis: {new Date(lastAnalysis).toLocaleDateString()}
                </p>
              </div>
              <Button 
                onClick={runGapAnalysis} 
                disabled={isAnalyzing}
                className="gap-2"
              >
                <Refresh className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </div>

            {/* Framework Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              {frameworkStatus.map((framework) => (
                <Card key={framework.name} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{framework.name}</CardTitle>
                      {framework.criticalGaps > 0 && (
                        <Badge className="bg-destructive text-destructive-foreground text-xs">
                          {framework.criticalGaps} Critical
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compliance Rate</span>
                        <span className="font-medium">{framework.completionRate}%</span>
                      </div>
                      <Progress value={framework.completionRate} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(framework.completionRate * framework.totalRequirements / 100)} of {framework.totalRequirements} requirements met</span>
                        <span>{framework.lastAssessment}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Gap Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-2xl font-bold">{criticalGapsCount}</p>
                      <p className="text-xs text-muted-foreground">Critical Gaps</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileX className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{openGapsCount}</p>
                      <p className="text-xs text-muted-foreground">Open Gaps</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{filteredGaps.filter(g => g.status === 'in-progress').length}</p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendUp className="h-4 w-4 text-secondary" />
                    <div>
                      <p className="text-2xl font-bold">96h</p>
                      <p className="text-xs text-muted-foreground">Est. Effort</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Gap List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Identified Gaps</h4>
                <div className="flex gap-2">
                  <Button 
                    variant={selectedFramework === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFramework('all')}
                  >
                    All Frameworks
                  </Button>
                  {frameworkStatus.map((framework) => (
                    <Button 
                      key={framework.name}
                      variant={selectedFramework === framework.name ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setSelectedFramework(framework.name)}
                    >
                      {framework.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredGaps.map((gap) => (
                  <Card key={gap.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(gap.status)}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{gap.requirement}</CardTitle>
                              {getSeverityBadge(gap.severity)}
                            </div>
                            <CardDescription className="flex items-center gap-2">
                              <span>{gap.regulation}</span>
                              <span>•</span>
                              <span>{gap.framework}</span>
                              <span>•</span>
                              <span>Due: {gap.dueDate}</span>
                              <span>•</span>
                              <span>{gap.estimatedEffort}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Target className="h-3 w-3 mr-1" />
                          Create Action Plan
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-start gap-2">
                            <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-primary mb-1">AI Insight</p>
                              <p className="text-sm text-muted-foreground">{gap.aiInsight}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Missing Documents</h5>
                            <ul className="space-y-1">
                              {gap.missingDocuments.map((doc, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <FileX className="h-3 w-3 text-destructive" />
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-2">Recommended Actions</h5>
                            <ul className="space-y-1">
                              {gap.recommendedActions.map((action, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <ArrowRight className="h-3 w-3 text-primary" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}