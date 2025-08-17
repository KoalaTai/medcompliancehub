import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight,
  Brain,
  Target,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  GitBranch,
  GitBranch as Workflow,
  Lightbulb,
  Network,
  Eye,
  Play,
  Settings
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface GapToCAPAMapping {
  gapId: string
  gapTitle: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  framework: string
  capaWorkflowId?: string
  status: 'no-capa' | 'capa-generated' | 'capa-active' | 'capa-completed'
  estimatedEffort: string
  priority: number
  dependencies: string[]
  impactedProcesses: string[]
}

interface CAPARecommendation {
  id: string
  gapId: string
  type: 'corrective' | 'preventive' | 'monitoring'
  action: string
  rationale: string
  estimatedHours: number
  priority: 'high' | 'medium' | 'low'
  assignedRole: string
  dependencies: string[]
}

const mockGapMappings: GapToCAPAMapping[] = [
  {
    gapId: '1',
    gapTitle: 'Design History File completeness verification',
    severity: 'critical',
    framework: 'ISO 13485',
    capaWorkflowId: undefined,
    status: 'no-capa',
    estimatedEffort: '40 hours',
    priority: 1,
    dependencies: ['Design Controls Framework', 'Risk Management Process'],
    impactedProcesses: ['URS', 'MQ', 'Evidence']
  },
  {
    gapId: '2',
    gapTitle: 'Risk management process documentation',
    severity: 'high',
    framework: 'FDA 21 CFR 820',
    capaWorkflowId: 'capa-1',
    status: 'capa-active',
    estimatedEffort: '24 hours',
    priority: 2,
    dependencies: ['Risk Analysis', 'Hazard Identification'],
    impactedProcesses: ['URS', 'PQ']
  },
  {
    gapId: '3',
    gapTitle: 'Post-market clinical follow-up plan',
    severity: 'high',
    framework: 'EU MDR',
    capaWorkflowId: undefined,
    status: 'no-capa',
    estimatedEffort: '32 hours',
    priority: 3,
    dependencies: ['Clinical Evaluation', 'Post-Market Surveillance'],
    impactedProcesses: ['PQ', 'Governance']
  },
  {
    gapId: '4',
    gapTitle: 'Algorithm validation and bias assessment',
    severity: 'critical',
    framework: 'Custom Framework',
    capaWorkflowId: undefined,
    status: 'no-capa',
    estimatedEffort: '56 hours',
    priority: 1,
    dependencies: ['Data Quality Framework', 'Model Performance Metrics'],
    impactedProcesses: ['MQ', 'PQ', 'Governance']
  }
]

const severityColors = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-orange-500 text-white',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-muted text-muted-foreground'
}

const statusColors = {
  'no-capa': 'bg-muted text-muted-foreground',
  'capa-generated': 'bg-accent text-accent-foreground',
  'capa-active': 'bg-primary text-primary-foreground',
  'capa-completed': 'bg-secondary text-secondary-foreground'
}

const statusLabels = {
  'no-capa': 'No CAPA',
  'capa-generated': 'CAPA Generated',
  'capa-active': 'CAPA Active',
  'capa-completed': 'CAPA Completed'
}

export function GapToCAPAIntegration() {
  const [gapMappings, setGapMappings] = useKV<GapToCAPAMapping[]>('gap-capa-mappings', mockGapMappings)
  const [selectedMapping, setSelectedMapping] = useState<GapToCAPAMapping | null>(null)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [aiRecommendations, setAiRecommendations] = useKV<CAPARecommendation[]>('capa-recommendations', [])

  const generateCAPARecommendations = async (gapId: string) => {
    setIsGenerating(gapId)
    
    const gap = gapMappings.find(g => g.gapId === gapId)
    if (!gap) return

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000))

    const recommendations: CAPARecommendation[] = [
      {
        id: `rec-${Date.now()}-1`,
        gapId,
        type: 'corrective',
        action: `Immediate documentation creation for ${gap.gapTitle}`,
        rationale: 'Directly addresses the identified compliance gap with concrete deliverables',
        estimatedHours: Math.floor(parseInt(gap.estimatedEffort) * 0.6),
        priority: 'high',
        assignedRole: 'Quality Manager',
        dependencies: []
      },
      {
        id: `rec-${Date.now()}-2`,
        gapId,
        type: 'preventive',
        action: `Implement systematic controls for ${gap.framework} monitoring`,
        rationale: 'Prevents similar gaps from occurring in future iterations',
        estimatedHours: Math.floor(parseInt(gap.estimatedEffort) * 0.3),
        priority: 'medium',
        assignedRole: 'Process Engineer',
        dependencies: [`rec-${Date.now()}-1`]
      },
      {
        id: `rec-${Date.now()}-3`,
        gapId,
        type: 'monitoring',
        action: `Set up automated compliance monitoring for affected processes`,
        rationale: 'Provides ongoing assurance and early warning of potential issues',
        estimatedHours: Math.floor(parseInt(gap.estimatedEffort) * 0.1),
        priority: 'low',
        assignedRole: 'QA Specialist',
        dependencies: [`rec-${Date.now()}-2`]
      }
    ]

    setAiRecommendations(current => [
      ...current.filter(rec => rec.gapId !== gapId),
      ...recommendations
    ])

    setIsGenerating(null)
  }

  const createCAPAWorkflow = async (gapId: string) => {
    const mapping = gapMappings.find(m => m.gapId === gapId)
    if (!mapping) return

    // Update status to indicate CAPA is being generated
    setGapMappings(current => 
      current.map(m => 
        m.gapId === gapId 
          ? { ...m, status: 'capa-generated', capaWorkflowId: `capa-${Date.now()}` }
          : m
      )
    )

    // Simulate CAPA workflow creation
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Update status to active
    setGapMappings(current => 
      current.map(m => 
        m.gapId === gapId 
          ? { ...m, status: 'capa-active' }
          : m
      )
    )

    // Trigger navigation to workflows section
    window.dispatchEvent(new CustomEvent('navigate-to-workflows'))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'no-capa':
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      case 'capa-generated':
        return <Lightbulb className="h-4 w-4 text-accent" />
      case 'capa-active':
        return <Clock className="h-4 w-4 text-primary" />
      case 'capa-completed':
        return <CheckCircle className="h-4 w-4 text-secondary" />
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityBadge = (priority: number) => {
    const colors = ['bg-destructive text-destructive-foreground', 'bg-orange-500 text-white', 'bg-accent text-accent-foreground']
    const labels = ['P1 - Critical', 'P2 - High', 'P3 - Medium']
    return (
      <Badge className={colors[priority - 1] || 'bg-muted text-muted-foreground'}>
        {labels[priority - 1] || `P${priority}`}
      </Badge>
    )
  }

  const highPriorityGaps = gapMappings.filter(m => m.priority <= 2 && m.status === 'no-capa').length
  const activeCAPAs = gapMappings.filter(m => m.status === 'capa-active').length
  const completedCAPAs = gapMappings.filter(m => m.status === 'capa-completed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            Gap-to-CAPA Integration
          </h2>
          <p className="text-muted-foreground">
            Automated CAPA workflow generation from identified compliance gaps
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Configure Integration
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{highPriorityGaps}</p>
                <p className="text-xs text-muted-foreground">High Priority Gaps</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-accent" />
              <div>
                <p className="text-2xl font-bold">{aiRecommendations.length}</p>
                <p className="text-xs text-muted-foreground">AI Recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activeCAPAs}</p>
                <p className="text-xs text-muted-foreground">Active CAPAs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{completedCAPAs}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Workflow */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Gap-to-CAPA Workflow
          </CardTitle>
          <CardDescription>
            Automated analysis and workflow generation process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium text-sm mb-1">Identify Gaps</h4>
              <p className="text-xs text-muted-foreground">Automated compliance gap detection</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium text-sm mb-1">Analyze Impact</h4>
              <p className="text-xs text-muted-foreground">AI assessment of dependencies and risk</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <Workflow className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium text-sm mb-1">Generate CAPA</h4>
              <p className="text-xs text-muted-foreground">Automated workflow creation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium text-sm mb-1">Execute & Monitor</h4>
              <p className="text-xs text-muted-foreground">Track progress and effectiveness</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gap Mappings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Compliance Gap Analysis</h3>
        <div className="grid gap-4">
          {gapMappings.map((mapping) => {
            const recommendations = aiRecommendations.filter(rec => rec.gapId === mapping.gapId)
            
            return (
              <Card key={mapping.gapId} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{mapping.gapTitle}</CardTitle>
                        <Badge className={severityColors[mapping.severity]}>
                          {mapping.severity}
                        </Badge>
                        {getPriorityBadge(mapping.priority)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{mapping.framework}</Badge>
                        <span>•</span>
                        <span>Effort: {mapping.estimatedEffort}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(mapping.status)}
                      <Badge className={statusColors[mapping.status]}>
                        {statusLabels[mapping.status]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Process Impact */}
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        Impacted Processes
                      </h5>
                      <div className="flex gap-1">
                        {mapping.impactedProcesses.map((process, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {process}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Dependencies */}
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Network className="h-3 w-3" />
                        Dependencies
                      </h5>
                      <div className="flex gap-1">
                        {mapping.dependencies.map((dep, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    {recommendations.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Brain className="h-3 w-3 text-primary" />
                          AI Recommendations ({recommendations.length})
                        </h5>
                        <div className="space-y-2">
                          {recommendations.slice(0, 2).map((rec) => (
                            <div key={rec.id} className="flex items-start gap-2 p-2 rounded bg-primary/5">
                              {rec.type === 'corrective' && <Target className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />}
                              {rec.type === 'preventive' && <Shield className="h-3 w-3 text-secondary mt-0.5 flex-shrink-0" />}
                              {rec.type === 'monitoring' && <Eye className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />}
                              <div className="flex-1">
                                <p className="text-xs font-medium">{rec.action}</p>
                                <p className="text-xs text-muted-foreground">{rec.rationale}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {rec.estimatedHours}h
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {rec.assignedRole}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                          {recommendations.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{recommendations.length - 2} more recommendations
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex gap-2">
                        {recommendations.length === 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateCAPARecommendations(mapping.gapId)}
                            disabled={isGenerating === mapping.gapId}
                            className="gap-2"
                          >
                            {isGenerating === mapping.gapId ? (
                              <>
                                <Brain className="h-3 w-3 animate-pulse" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Brain className="h-3 w-3" />
                                Generate Recommendations
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => setSelectedMapping(mapping)} className="gap-2">
                            <Eye className="h-3 w-3" />
                            View All ({recommendations.length})
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {mapping.status === 'no-capa' && recommendations.length > 0 && (
                          <Button
                            size="sm"
                            onClick={() => createCAPAWorkflow(mapping.gapId)}
                            className="gap-2"
                          >
                            <Workflow className="h-3 w-3" />
                            Create CAPA
                          </Button>
                        )}
                        
                        {mapping.status === 'capa-active' && (
                          <Button size="sm" variant="outline" className="gap-2">
                            <Play className="h-3 w-3" />
                            View CAPA
                          </Button>
                        )}
                        
                        {mapping.status === 'capa-completed' && (
                          <Button size="sm" variant="outline" className="gap-2">
                            <CheckCircle className="h-3 w-3" />
                            View Results
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}