import { useIntelligentCompliance } from '@/lib/services/intelligent-compliance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Brain,
  Shield,
  Activity,
  Clock,
  Target,
  BarChart3,
  AlertCircle,
  Lightbulb,
  Zap,
  FileCheck,
  X,
  Check
} from '@phosphor-icons/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export function IntelligentComplianceMonitor() {
  const {
    alerts,
    trends,
    recommendations,
    riskAssessments,
    auditTrail,
    stats,
    isAnalyzing,
    acknowledgeAlert,
    dismissAlert,
    implementRecommendation,
    performRiskAssessment
  } = useIntelligentCompliance()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'low': return <Shield className="h-4 w-4 text-blue-600" />
      default: return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
  const sortedRecommendations = recommendations.sort((a, b) => {
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1
    return bPriority - aPriority
  })

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged)
  const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'critical')

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Intelligent Compliance Monitor</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered compliance monitoring and predictive analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className={`h-4 w-4 ${isAnalyzing ? 'animate-pulse text-blue-600' : 'text-gray-400'}`} />
            {isAnalyzing ? 'Analyzing...' : 'Monitoring Active'}
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {criticalAlerts.length} critical compliance alert{criticalAlerts.length !== 1 ? 's' : ''} require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{stats.totalAlerts}</p>
                <p className="text-xs text-red-600">{stats.criticalAlerts} critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">AI Recommendations</p>
                <p className="text-2xl font-bold">{stats.pendingRecommendations}</p>
                <p className="text-xs text-muted-foreground">Pending implementation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Trend Analysis</p>
                <p className="text-2xl font-bold">{stats.trendsAnalyzed}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-600">↗ {stats.improvingTrends}</span>
                  <span className="text-red-600">↘ {stats.decliningTrends}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Risk Score</p>
                <p className="text-2xl font-bold">{stats.averageRiskScore}</p>
                <Progress value={stats.averageRiskScore} className="w-full mt-1 h-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alerts" className="relative">
            Alerts
            {unacknowledgedAlerts.length > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 text-xs bg-red-600">
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="trends">
            Trends
          </TabsTrigger>
          <TabsTrigger value="risk">
            Risk Assessment
          </TabsTrigger>
          <TabsTrigger value="audit">
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Compliance Alerts
              </CardTitle>
              <CardDescription>
                Real-time alerts based on AI analysis of compliance patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p className="text-lg font-medium">All Clear!</p>
                  <p className="text-sm">No compliance alerts at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className={`border-l-4 ${
                      alert.severity === 'critical' ? 'border-l-red-500' :
                      alert.severity === 'high' ? 'border-l-orange-500' :
                      alert.severity === 'medium' ? 'border-l-yellow-500' :
                      'border-l-blue-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getSeverityIcon(alert.severity)}
                              <h4 className="font-semibold">{alert.title}</h4>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              {alert.acknowledged && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Acknowledged
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                            
                            {alert.affectedEntities.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium mb-1">Affected Entities:</p>
                                <div className="flex flex-wrap gap-1">
                                  {alert.affectedEntities.slice(0, 5).map((entity, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {entity}
                                    </Badge>
                                  ))}
                                  {alert.affectedEntities.length > 5 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{alert.affectedEntities.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="mb-3">
                              <p className="text-sm font-medium mb-1">Recommended Actions:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {alert.recommendedActions.map((action, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              Created: {new Date(alert.createdAt).toLocaleString()}
                              {alert.dueDate && (
                                <> | Due: {new Date(alert.dueDate).toLocaleString()}</>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            {!alert.acknowledged && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => acknowledgeAlert(alert.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => dismissAlert(alert.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Intelligent recommendations to improve compliance processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedRecommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                  <p className="text-lg font-medium">No Recommendations</p>
                  <p className="text-sm">AI analysis is still processing your compliance data.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedRecommendations.map((recommendation) => (
                    <Card key={recommendation.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-4 w-4 text-purple-600" />
                              <h4 className="font-semibold">{recommendation.title}</h4>
                              <Badge className={
                                recommendation.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                recommendation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {recommendation.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(recommendation.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {recommendation.description}
                            </p>
                            
                            <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                              <p className="text-sm font-medium text-purple-900 mb-1">AI Reasoning:</p>
                              <p className="text-sm text-purple-800">{recommendation.reasoning}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium mb-1">Expected Impact:</p>
                                <p className="text-muted-foreground">{recommendation.estimatedImpact}</p>
                              </div>
                              <div>
                                <p className="font-medium mb-1">Timeline:</p>
                                <p className="text-muted-foreground">{recommendation.timeline}</p>
                              </div>
                            </div>

                            {recommendation.requiredResources.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium mb-1">Required Resources:</p>
                                <div className="flex flex-wrap gap-1">
                                  {recommendation.requiredResources.map((resource, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {resource}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => implementRecommendation(recommendation.id)}
                            className="ml-4"
                          >
                            <FileCheck className="h-4 w-4 mr-2" />
                            Implement
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Compliance Trends
              </CardTitle>
              <CardDescription>
                Historical analysis and trend predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <p className="text-lg font-medium">No Trend Data</p>
                  <p className="text-sm">Trend analysis will appear as data accumulates.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {trends.map((trend) => (
                    <div key={`${trend.framework}-${trend.metric}`} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{trend.framework} - {trend.metric.replace('_', ' ')}</h4>
                          {getTrendIcon(trend.trend)}
                          <Badge variant={
                            trend.trend === 'improving' ? 'default' :
                            trend.trend === 'declining' ? 'destructive' :
                            'secondary'
                          }>
                            {trend.trend} ({trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%)
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trend.values}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(date) => new Date(date).toLocaleDateString()}
                            />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(date) => new Date(date).toLocaleDateString()}
                              formatter={(value: number) => [value.toFixed(1), trend.metric]}
                            />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke={trend.trend === 'improving' ? '#22c55e' : trend.trend === 'declining' ? '#ef4444' : '#6b7280'}
                              fill={trend.trend === 'improving' ? '#22c55e' : trend.trend === 'declining' ? '#ef4444' : '#6b7280'}
                              fillOpacity={0.2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Risk Assessments
              </CardTitle>
              <CardDescription>
                AI-powered risk analysis and mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {riskAssessments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                  <p className="text-lg font-medium">No Risk Assessments</p>
                  <p className="text-sm">Risk assessments will appear as entities are analyzed.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Last Assessed</TableHead>
                      <TableHead>Next Assessment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riskAssessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{assessment.entityType}</p>
                            <p className="text-sm text-muted-foreground">{assessment.entityId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{assessment.framework}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{assessment.riskScore}</span>
                            <Progress value={assessment.riskScore} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(assessment.lastAssessed).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(assessment.nextAssessment).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Audit Trail
              </CardTitle>
              <CardDescription>
                Complete audit trail of all compliance monitoring activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {auditTrail.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-lg font-medium">No Audit Records</p>
                    <p className="text-sm">Audit trail will populate as actions are performed.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditTrail.slice().reverse().map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {entry.action} on {entry.entityType} 
                            <span className="text-muted-foreground ml-1">
                              ({entry.entityId})
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()} by {entry.userId}
                          </p>
                          {Object.keys(entry.changes).length > 0 && (
                            <details className="mt-1">
                              <summary className="text-xs text-muted-foreground cursor-pointer">
                                View Changes
                              </summary>
                              <pre className="text-xs bg-gray-50 p-2 rounded mt-1">
                                {JSON.stringify(entry.changes, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}