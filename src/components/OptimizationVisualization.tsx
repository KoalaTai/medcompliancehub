import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  TrendUp,
  TrendDown,
  Target,
  Clock,
  DollarSign,
  Activity,
  Zap,
  CheckCircle
} from '@phosphor-icons/react'

interface OptimizationImpact {
  templateName: string
  framework: string
  optimizationDate: string
  beforeMetrics: {
    completionTime: number
    effectiveness: number
    resourceHours: number
    costEfficiency: number
  }
  afterMetrics: {
    completionTime: number
    effectiveness: number
    resourceHours: number
    costEfficiency: number
  }
  improvements: {
    timeReduction: number
    effectivenessGain: number
    resourceSavings: number
    costImprovement: number
  }
  validationStatus: 'validated' | 'in-progress' | 'pending'
  confidence: number
}

interface OptimizationVisualizationProps {
  impacts: OptimizationImpact[]
  className?: string
}

// Mock optimization impact data
const mockOptimizationImpacts: OptimizationImpact[] = [
  {
    templateName: 'ISO 13485 Design Control CAPA',
    framework: 'ISO 13485',
    optimizationDate: '2024-01-15',
    beforeMetrics: {
      completionTime: 42,
      effectiveness: 89,
      resourceHours: 120,
      costEfficiency: 85
    },
    afterMetrics: {
      completionTime: 30,
      effectiveness: 94,
      resourceHours: 92,
      costEfficiency: 108
    },
    improvements: {
      timeReduction: 28,
      effectivenessGain: 6,
      resourceSavings: 23,
      costImprovement: 27
    },
    validationStatus: 'validated',
    confidence: 94
  },
  {
    templateName: 'FDA QSR Risk Management CAPA',
    framework: 'FDA 21 CFR 820',
    optimizationDate: '2024-01-10',
    beforeMetrics: {
      completionTime: 68,
      effectiveness: 94,
      resourceHours: 180,
      costEfficiency: 76
    },
    afterMetrics: {
      completionTime: 53,
      effectiveness: 97,
      resourceHours: 142,
      costEfficiency: 95
    },
    improvements: {
      timeReduction: 22,
      effectivenessGain: 3,
      resourceSavings: 21,
      costImprovement: 25
    },
    validationStatus: 'validated',
    confidence: 91
  },
  {
    templateName: 'EU MDR Validation CAPA',
    framework: 'EU MDR',
    optimizationDate: '2024-01-18',
    beforeMetrics: {
      completionTime: 95,
      effectiveness: 86,
      resourceHours: 240,
      costEfficiency: 68
    },
    afterMetrics: {
      completionTime: 71,
      effectiveness: 92,
      resourceHours: 186,
      costEfficiency: 89
    },
    improvements: {
      timeReduction: 25,
      effectivenessGain: 7,
      resourceSavings: 23,
      costImprovement: 31
    },
    validationStatus: 'in-progress',
    confidence: 87
  }
]

export function OptimizationVisualization({ 
  impacts = mockOptimizationImpacts,
  className 
}: OptimizationVisualizationProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="h-3 w-3" />
      case 'in-progress':
        return <Activity className="h-3 w-3" />
      case 'pending':
        return <Clock className="h-3 w-3" />
      default:
        return <Target className="h-3 w-3" />
    }
  }

  const averageImprovements = impacts.reduce(
    (acc, impact) => ({
      timeReduction: acc.timeReduction + impact.improvements.timeReduction,
      effectivenessGain: acc.effectivenessGain + impact.improvements.effectivenessGain,
      resourceSavings: acc.resourceSavings + impact.improvements.resourceSavings,
      costImprovement: acc.costImprovement + impact.improvements.costImprovement
    }),
    { timeReduction: 0, effectivenessGain: 0, resourceSavings: 0, costImprovement: 0 }
  )

  Object.keys(averageImprovements).forEach(key => {
    averageImprovements[key as keyof typeof averageImprovements] /= impacts.length
  })

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  -{Math.round(averageImprovements.timeReduction)}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Time Reduction</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  +{Math.round(averageImprovements.effectivenessGain)}%
                </p>
                <p className="text-xs text-muted-foreground">Effectiveness Gain</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  -{Math.round(averageImprovements.resourceSavings)}%
                </p>
                <p className="text-xs text-muted-foreground">Resource Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  +{Math.round(averageImprovements.costImprovement)}%
                </p>
                <p className="text-xs text-muted-foreground">Cost Efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Impact Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Template Optimization Impact Analysis
          </CardTitle>
          <CardDescription>
            Validated improvements from AI-powered template optimizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {impacts.map((impact, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{impact.templateName}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{impact.framework}</Badge>
                      <Badge className={getStatusColor(impact.validationStatus)}>
                        {getStatusIcon(impact.validationStatus)}
                        <span className="ml-1 capitalize">{impact.validationStatus}</span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Optimized {new Date(impact.optimizationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Confidence: {impact.confidence}%</div>
                    <Progress value={impact.confidence} className="w-20 h-2 mt-1" />
                  </div>
                </div>

                {/* Before/After Comparison */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Completion Time
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Before:</span>
                        <span>{impact.beforeMetrics.completionTime}d</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">After:</span>
                        <span className="text-green-600 font-medium">{impact.afterMetrics.completionTime}d</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>Improvement:</span>
                        <span className="text-green-600 flex items-center gap-1">
                          <TrendDown className="h-3 w-3" />
                          -{impact.improvements.timeReduction}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Effectiveness
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Before:</span>
                        <span>{impact.beforeMetrics.effectiveness}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">After:</span>
                        <span className="text-green-600 font-medium">{impact.afterMetrics.effectiveness}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>Improvement:</span>
                        <span className="text-green-600 flex items-center gap-1">
                          <TrendUp className="h-3 w-3" />
                          +{impact.improvements.effectivenessGain}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Resource Hours
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Before:</span>
                        <span>{impact.beforeMetrics.resourceHours}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">After:</span>
                        <span className="text-green-600 font-medium">{impact.afterMetrics.resourceHours}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>Savings:</span>
                        <span className="text-green-600 flex items-center gap-1">
                          <TrendDown className="h-3 w-3" />
                          -{impact.improvements.resourceSavings}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Cost Efficiency
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Before:</span>
                        <span>{impact.beforeMetrics.costEfficiency}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">After:</span>
                        <span className="text-green-600 font-medium">{impact.afterMetrics.costEfficiency}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>Improvement:</span>
                        <span className="text-green-600 flex items-center gap-1">
                          <TrendUp className="h-3 w-3" />
                          +{impact.improvements.costImprovement}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROI Summary */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Optimization ROI Summary</CardTitle>
          <CardDescription className="text-green-700">
            Cumulative impact of AI-powered template optimizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-green-800">Time Savings</h4>
              <div className="text-2xl font-bold text-green-600">
                {impacts.reduce((sum, impact) => 
                  sum + (impact.beforeMetrics.completionTime - impact.afterMetrics.completionTime), 0
                )} days saved
              </div>
              <p className="text-sm text-green-700">
                Across {impacts.length} optimized templates
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-green-800">Resource Efficiency</h4>
              <div className="text-2xl font-bold text-green-600">
                {impacts.reduce((sum, impact) => 
                  sum + (impact.beforeMetrics.resourceHours - impact.afterMetrics.resourceHours), 0
                )} hours saved
              </div>
              <p className="text-sm text-green-700">
                Equivalent to {Math.round(impacts.reduce((sum, impact) => 
                  sum + (impact.beforeMetrics.resourceHours - impact.afterMetrics.resourceHours), 0
                ) / 40)} work weeks
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                Overall Performance Improvement:
              </span>
              <span className="text-lg font-bold text-green-600">
                +{Math.round((averageImprovements.effectivenessGain + averageImprovements.costImprovement) / 2)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}