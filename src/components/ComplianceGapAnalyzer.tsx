import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Warning, 
  CheckCircle, 
  Clock, 
  TrendUp,
  FileX,
  Target,
  Brain,
  ArrowRight,
  Refresh,
  Robot,
  Lightning,
  Network,
  GitBranch,
  GitBranch as Workflow,
  Hierarchy,
  Graph,
  Eye,
  Link,
  MapPin,
  FlowArrow
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { AutomatedGapDetection } from './AutomatedGapDetection'
import { ComplianceArchitectureDiagram } from './ComplianceArchitectureDiagram'
import { GapToCAPAIntegration } from './GapToCAPAIntegration'

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
  dependencies: string[]
  knowledgeGraphNodes: string[]
  impactedProcesses: string[]
  upstream: string[]
  downstream: string[]
}

interface ComplianceFramework {
  name: string
  completionRate: number
  criticalGaps: number
  totalRequirements: number
  lastAssessment: string
}

interface KnowledgeGraphNode {
  id: string
  type: 'requirement' | 'document' | 'process' | 'control' | 'evidence' | 'risk'
  label: string
  framework: string
  status: 'complete' | 'partial' | 'missing' | 'critical'
  connections: string[]
  metadata: {
    regulation?: string
    section?: string
    criticality?: 'high' | 'medium' | 'low'
    lastUpdated?: string
  }
}

interface ProcessFlow {
  id: string
  name: string
  stage: 'URS' | 'MQ' | 'PQ' | 'Governance' | 'Evidence'
  status: 'complete' | 'in-progress' | 'blocked' | 'not-started'
  dependencies: string[]
  outputs: string[]
  gapCount: number
}

const processFlows: ProcessFlow[] = [
  {
    id: 'urs',
    name: 'User Requirements Specification',
    stage: 'URS',
    status: 'in-progress',
    dependencies: [],
    outputs: ['design-controls', 'verification-protocols'],
    gapCount: 2
  },
  {
    id: 'mq',
    name: 'Model Qualification',
    stage: 'MQ',
    status: 'blocked',
    dependencies: ['urs'],
    outputs: ['performance-metrics', 'validation-data'],
    gapCount: 3
  },
  {
    id: 'pq',
    name: 'Performance Qualification',
    stage: 'PQ',
    status: 'not-started',
    dependencies: ['mq'],
    outputs: ['clinical-evidence', 'safety-profile'],
    gapCount: 4
  },
  {
    id: 'governance',
    name: 'Continuous Governance',
    stage: 'Governance',
    status: 'not-started',
    dependencies: ['pq'],
    outputs: ['monitoring-reports', 'capa-tracking'],
    gapCount: 1
  },
  {
    id: 'evidence',
    name: 'Evidence & Traceability',
    stage: 'Evidence',
    status: 'in-progress',
    dependencies: ['urs', 'mq', 'pq'],
    outputs: ['audit-trail', 'compliance-package'],
    gapCount: 2
  }
]

const knowledgeGraph: KnowledgeGraphNode[] = [
  {
    id: 'iso-13485-design-controls',
    type: 'requirement',
    label: 'Design Controls (ISO 13485)',
    framework: 'ISO 13485',
    status: 'partial',
    connections: ['design-history-file', 'verification-protocols', 'validation-protocols'],
    metadata: {
      regulation: 'ISO 13485',
      section: '7.3',
      criticality: 'high',
      lastUpdated: '2024-01-15'
    }
  },
  {
    id: 'design-history-file',
    type: 'document',
    label: 'Design History File',
    framework: 'ISO 13485',
    status: 'missing',
    connections: ['design-reviews', 'test-results', 'validation-data'],
    metadata: {
      criticality: 'high'
    }
  },
  {
    id: 'risk-management-process',
    type: 'process',
    label: 'Risk Management Process',
    framework: 'ISO 14971',
    status: 'partial',
    connections: ['risk-analysis', 'risk-controls', 'residual-risk'],
    metadata: {
      regulation: 'ISO 14971',
      criticality: 'high'
    }
  },
  {
    id: 'pmcf-plan',
    type: 'document',
    label: 'Post-Market Clinical Follow-up Plan',
    framework: 'EU MDR',
    status: 'critical',
    connections: ['clinical-evaluation', 'real-world-evidence', 'safety-monitoring'],
    metadata: {
      regulation: 'EU MDR',
      section: 'Annex XIV',
      criticality: 'high'
    }
  },
  {
    id: 'ai-validation-framework',
    type: 'process',
    label: 'AI/ML Validation Framework',
    framework: 'Custom',
    status: 'missing',
    connections: ['algorithm-validation', 'data-quality', 'model-performance'],
    metadata: {
      criticality: 'high'
    }
  }
]

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
    aiInsight: 'Based on similar DHF implementations, focus first on design review records as they unlock other dependencies.',
    dependencies: ['Design Controls Framework', 'Risk Management Process'],
    knowledgeGraphNodes: ['iso-13485-design-controls', 'design-history-file'],
    impactedProcesses: ['URS', 'MQ', 'Evidence'],
    upstream: ['User Requirements'],
    downstream: ['Verification Testing', 'Clinical Validation']
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
    aiInsight: 'Current risk analysis is 70% complete. Priority should be on control measure effectiveness verification.',
    dependencies: ['Risk Analysis', 'Hazard Identification'],
    knowledgeGraphNodes: ['risk-management-process'],
    impactedProcesses: ['URS', 'PQ'],
    upstream: ['Hazard Analysis'],
    downstream: ['Clinical Risk Assessment', 'Post-Market Surveillance']
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
    aiInsight: 'PMCF requirements vary by device class. Consider leveraging real-world evidence strategies.',
    dependencies: ['Clinical Evaluation', 'Post-Market Surveillance'],
    knowledgeGraphNodes: ['pmcf-plan'],
    impactedProcesses: ['PQ', 'Governance'],
    upstream: ['Clinical Investigation'],
    downstream: ['Safety Monitoring', 'Periodic Safety Update']
  },
  {
    id: '4',
    regulation: 'Custom Framework',
    framework: 'AI/ML Validation',
    requirement: 'Algorithm validation and bias assessment',
    severity: 'critical',
    status: 'open',
    missingDocuments: ['Algorithm Validation Plan', 'Bias Assessment Report', 'Training Data Lineage'],
    recommendedActions: [
      'Establish ML validation framework',
      'Implement bias detection protocols',
      'Create training data documentation'
    ],
    dueDate: '2024-02-20',
    estimatedEffort: '56 hours',
    aiInsight: 'AI/ML validation requires specialized approaches. Consider FDA Software as Medical Device guidance integration.',
    dependencies: ['Data Quality Framework', 'Model Performance Metrics'],
    knowledgeGraphNodes: ['ai-validation-framework'],
    impactedProcesses: ['MQ', 'PQ', 'Governance'],
    upstream: ['Data Collection', 'Feature Engineering'],
    downstream: ['Performance Monitoring', 'Model Drift Detection']
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
      return <Warning className="h-4 w-4 text-destructive" weight="fill" />
    default:
      return <Warning className="h-4 w-4 text-muted-foreground" />
  }
}

function getNodeStatusColor(status: string) {
  switch (status) {
    case 'complete':
      return 'bg-secondary text-secondary-foreground'
    case 'partial':
      return 'bg-accent text-accent-foreground'
    case 'missing':
      return 'bg-orange-500 text-white'
    case 'critical':
      return 'bg-destructive text-destructive-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function getProcessStatusColor(status: string) {
  switch (status) {
    case 'complete':
      return 'border-secondary bg-secondary/10'
    case 'in-progress':
      return 'border-primary bg-primary/10'
    case 'blocked':
      return 'border-destructive bg-destructive/10'
    case 'not-started':
      return 'border-muted bg-muted/10'
    default:
      return 'border-muted bg-muted/10'
  }
}

function getProcessStatusIcon(status: string) {
  switch (status) {
    case 'complete':
      return <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
    case 'in-progress':
      return <Clock className="h-4 w-4 text-primary" weight="fill" />
    case 'blocked':
      return <Warning className="h-4 w-4 text-destructive" weight="fill" />
    case 'not-started':
      return <Warning className="h-4 w-4 text-muted-foreground" />
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

      <Tabs defaultValue="knowledge-graph" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="knowledge-graph" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Knowledge Graph
          </TabsTrigger>
          <TabsTrigger value="capa-integration" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            CAPA Integration
          </TabsTrigger>
          <TabsTrigger value="architecture" className="flex items-center gap-2">
            <Hierarchy className="h-4 w-4" />
            Architecture
          </TabsTrigger>
          <TabsTrigger value="process-flow" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Process Flow
          </TabsTrigger>
          <TabsTrigger value="automated" className="flex items-center gap-2">
            <Robot className="h-4 w-4" />
            Automated
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Lightning className="h-4 w-4" />
            Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge-graph" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  Compliance Knowledge Graph
                </h3>
                <p className="text-sm text-muted-foreground">
                  Interactive visualization of compliance relationships and dependencies
                </p>
              </div>
              <Button className="gap-2">
                <Eye className="h-4 w-4" />
                Interactive View
              </Button>
            </div>

            {/* Knowledge Graph Nodes */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {knowledgeGraph.map((node) => (
                <Card key={node.id} className={`cursor-pointer hover:shadow-md transition-all ${getNodeStatusColor(node.status)} border-l-4`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {node.type === 'requirement' && <Hierarchy className="h-4 w-4" />}
                        {node.type === 'document' && <FileX className="h-4 w-4" />}
                        {node.type === 'process' && <GitBranch className="h-4 w-4" />}
                        {node.type === 'control' && <Target className="h-4 w-4" />}
                        {node.type === 'evidence' && <Graph className="h-4 w-4" />}
                        <CardTitle className="text-sm font-medium">{node.label}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {node.framework}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Status</span>
                        <Badge className={getNodeStatusColor(node.status)}>{node.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span>{node.connections.length} connections</span>
                        {node.metadata.regulation && (
                          <>
                            <span> • </span>
                            <span>{node.metadata.regulation}</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {node.connections.slice(0, 3).map((connection, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Link className="h-2 w-2 mr-1" />
                            {connection.split('-').pop()}
                          </Badge>
                        ))}
                        {node.connections.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{node.connections.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Gap Relationships */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Gap Dependencies & Impact Analysis
              </h4>
              <div className="grid gap-4">
                {filteredGaps.map((gap) => (
                  <Card key={gap.id} className="overflow-hidden">
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
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <FlowArrow className="h-3 w-3 mr-1" />
                          View Flow
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <ArrowRight className="h-3 w-3 rotate-180" />
                            Upstream Dependencies
                          </h5>
                          <div className="space-y-1">
                            {gap.upstream.map((dep, index) => (
                              <Badge key={index} variant="outline" className="text-xs block w-fit">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            Impacted Processes
                          </h5>
                          <div className="space-y-1">
                            {gap.impactedProcesses.map((process, index) => (
                              <Badge key={index} variant="secondary" className="text-xs block w-fit">
                                {process}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            Downstream Impact
                          </h5>
                          <div className="space-y-1">
                            {gap.downstream.map((impact, index) => (
                              <Badge key={index} variant="outline" className="text-xs block w-fit">
                                {impact}
                              </Badge>
                            ))}
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

        <TabsContent value="capa-integration" className="mt-6">
          <GapToCAPAIntegration />
        </TabsContent>

        <TabsContent value="architecture" className="mt-6">
          <ComplianceArchitectureDiagram />
        </TabsContent>

        <TabsContent value="process-flow" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" />
                  AI Validation Workflow (URS → MQ → PQ → Governance)
                </h3>
                <p className="text-sm text-muted-foreground">
                  End-to-end compliance process flow with gap identification
                </p>
              </div>
            </div>

            {/* Process Flow Visualization */}
            <div className="space-y-4">
              {processFlows.map((process, index) => (
                <div key={process.id} className="relative">
                  <Card className={`p-4 ${getProcessStatusColor(process.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getProcessStatusIcon(process.status)}
                        <div>
                          <h4 className="font-medium">{process.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{process.stage}</Badge>
                            <span>•</span>
                            <span>{process.gapCount} gaps identified</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-destructive text-destructive-foreground">
                          {process.gapCount} Gaps
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Dependencies</h5>
                        <div className="space-y-1">
                          {process.dependencies.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No dependencies</span>
                          ) : (
                            process.dependencies.map((dep, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs mr-1">
                                {processFlows.find(p => p.id === dep)?.name || dep}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Outputs</h5>
                        <div className="space-y-1">
                          {process.outputs.map((output, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs mr-1">
                              {output.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Flow Arrow */}
                  {index < processFlows.length - 1 && (
                    <div className="flex justify-center py-2">
                      <FlowArrow className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Architecture Diagram Reference */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Hierarchy className="h-5 w-5" />
                  System Architecture Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="font-medium mb-2">Platform Components</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Flask API & Blueprints (audit, simulation, regulatory)</li>
                      <li>• AI Providers (OpenAI, Anthropic, Gemini, Perplexity)</li>
                      <li>• Knowledge Base (ISO 13485, FDA QSR, EU MDR)</li>
                      <li>• Evidence & Traceability Layer</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Validation Workflow</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• URS from Intended Use & Context</li>
                      <li>• Model Qualification (MQ) - Classical metrics</li>
                      <li>• Performance Qualification (PQ) - Grounded factuality</li>
                      <li>• Continuous Governance - Drift detection</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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
                    <Warning className="h-4 w-4 text-destructive" />
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

                        {/* Knowledge Graph Integration */}
                        <div className="mt-4 p-3 rounded-lg bg-muted/50">
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Network className="h-3 w-3 text-primary" />
                            Knowledge Graph Connections
                          </h5>
                          <div className="grid gap-3 md:grid-cols-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Dependencies</p>
                              <div className="space-y-1">
                                {gap.dependencies.map((dep, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    <Link className="h-2 w-2 mr-1" />
                                    {dep}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Graph Nodes</p>
                              <div className="space-y-1">
                                {gap.knowledgeGraphNodes.map((node, index) => {
                                  const graphNode = knowledgeGraph.find(n => n.id === node)
                                  return (
                                    <Badge key={index} className={graphNode ? getNodeStatusColor(graphNode.status) : 'bg-muted'}>
                                      <Graph className="h-2 w-2 mr-1" />
                                      {graphNode?.label.split(' ')[0] || node}
                                    </Badge>
                                  )
                                })}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Process Impact</p>
                              <div className="space-y-1">
                                {gap.impactedProcesses.map((process, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <GitBranch className="h-2 w-2 mr-1" />
                                    {process}
                                  </Badge>
                                ))}
                              </div>
                            </div>
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