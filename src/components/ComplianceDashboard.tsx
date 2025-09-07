import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { WebhookStatusWidget } from '@/components/WebhookStatusWidget'
import { AIInsightsPanel } from '@/components/AIInsightsPanel'
import { useRegulatoryDatabase } from '@/lib/services/regulatory-database'
import { useIntelligentCompliance } from '@/lib/services/intelligent-compliance'
import { useCAPAWorkflow } from '@/lib/services/capa-workflow'
import { useAutomatedEmail } from '@/lib/services/automated-email'
import { 
  Shield, 
  Warning, 
  CheckCircle, 
  Clock,
  TrendUp,
  FileText,
  Users,
  Calendar,
  Brain,
  Zap,
  Target,
  Bell,
  Mail,
  ArrowRight,
  MapPin,
  BookOpen,
  GitBranch as Workflow,
  Bug,
  Code,
  Database,
  Activity,
  AlertTriangle
} from '@phosphor-icons/react'
import { useNotificationService } from '@/hooks/useNotificationService'

interface ComplianceMetric {
  id: string
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  status: 'compliant' | 'warning' | 'critical'
}

const complianceMetrics: ComplianceMetric[] = [
  {
    id: 'overall',
    title: 'Overall Compliance Score',
    value: '94%',
    change: '+2.1%',
    trend: 'up',
    status: 'compliant'
  },
  {
    id: 'audits',
    title: 'Active Audit Simulations',
    value: '7',
    change: '+3',
    trend: 'up',
    status: 'warning'
  },
  {
    id: 'documents',
    title: 'Documents Under Review',
    value: '23',
    change: '-5',
    trend: 'down',
    status: 'compliant'
  },
  {
    id: 'findings',
    title: 'Open Findings',
    value: '12',
    change: '-2',
    trend: 'down',
    status: 'warning'
  }
]

const recentActivities = [
  {
    id: 1,
    type: 'audit',
    title: 'ISO 13485 Simulation Completed',
    description: 'Quality Management System audit simulation finished with 3 minor findings',
    timestamp: '2 hours ago',
    status: 'completed'
  },
  {
    id: 2,
    type: 'document',
    title: 'SOP-QM-001 Updated',
    description: 'Quality Manual updated to reflect latest regulatory changes',
    timestamp: '4 hours ago',
    status: 'pending'
  },
  {
    id: 3,
    type: 'regulatory',
    title: 'FDA Guidance Update',
    description: 'New guidance on medical device cybersecurity requirements detected',
    timestamp: '6 hours ago',
    status: 'alert'
  }
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'compliant':
      return <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
    case 'warning':
      return <Warning className="h-4 w-4 text-accent" weight="fill" />
    case 'critical':
      return <Shield className="h-4 w-4 text-destructive" weight="fill" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge variant="secondary">Completed</Badge>
    case 'pending':
      return <Badge variant="outline">Pending Review</Badge>
    case 'alert':
      return <Badge className="bg-accent text-accent-foreground">Alert</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function ComplianceDashboard() {
  const { notifications, getUnreadCount, getCriticalCount } = useNotificationService()
  const { databases, regulatoryUpdates, syncResults, complianceChecks } = useRegulatoryDatabase()
  const { alerts, stats: complianceStats, recommendations } = useIntelligentCompliance()
  const { workflows, getMetrics: getCAPAMetrics } = useCAPAWorkflow()
  const { stats: emailStats } = useAutomatedEmail()
  
  const unreadNotifications = getUnreadCount()
  const criticalNotifications = getCriticalCount()
  
  const capaMetrics = getCAPAMetrics()
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged)
  const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'critical')
  const activeDatabases = databases.filter(db => db.isActive)
  const recentUpdates = regulatoryUpdates.slice(0, 3)
  
  // Calculate compliance rate
  const totalChecks = complianceChecks.length
  const compliantChecks = complianceChecks.filter(check => check.status === 'compliant').length
  const complianceRate = totalChecks > 0 ? Math.round((compliantChecks / totalChecks) * 100) : 94
  
  const enhancedComplianceMetrics: ComplianceMetric[] = [
    {
      id: 'overall',
      title: 'Overall Compliance Score',
      value: `${complianceRate}%`,
      change: '+2.1%',
      trend: 'up',
      status: complianceRate >= 90 ? 'compliant' : complianceRate >= 75 ? 'warning' : 'critical'
    },
    {
      id: 'databases',
      title: 'Active Regulatory Databases',
      value: activeDatabases.length.toString(),
      change: syncResults.length > 0 ? `Last sync: ${syncResults[0]?.rulesAdded || 0} new rules` : 'No recent sync',
      trend: 'up',
      status: activeDatabases.length > 0 ? 'compliant' : 'warning'
    },
    {
      id: 'alerts',
      title: 'Active Compliance Alerts',
      value: unacknowledgedAlerts.length.toString(),
      change: criticalAlerts.length > 0 ? `${criticalAlerts.length} critical` : 'No critical alerts',
      trend: criticalAlerts.length > 0 ? 'down' : 'neutral',
      status: criticalAlerts.length > 0 ? 'critical' : unacknowledgedAlerts.length > 5 ? 'warning' : 'compliant'
    },
    {
      id: 'capa',
      title: 'Open CAPA Workflows',
      value: capaMetrics.openCAPAs.toString(),
      change: capaMetrics.overdueCAPAs > 0 ? `${capaMetrics.overdueCAPAs} overdue` : 'All on track',
      trend: capaMetrics.overdueCAPAs > 0 ? 'down' : 'neutral',
      status: capaMetrics.overdueCAPAs > 0 ? 'warning' : 'compliant'
    }
  ]

  // Enhanced recent activities with real data
  const enhancedRecentActivities = [
    ...(recentUpdates.length > 0 ? [{
      id: 'regulatory-' + recentUpdates[0].id,
      type: 'regulatory',
      title: recentUpdates[0].title,
      description: recentUpdates[0].summary,
      timestamp: new Date(recentUpdates[0].publishedDate).toLocaleDateString(),
      status: recentUpdates[0].priority === 'urgent' ? 'alert' : 'pending'
    }] : []),
    ...(criticalAlerts.length > 0 ? [{
      id: 'alert-' + criticalAlerts[0].id,
      type: 'alert',
      title: criticalAlerts[0].title,
      description: criticalAlerts[0].description,
      timestamp: new Date(criticalAlerts[0].createdAt).toLocaleDateString(),
      status: 'alert'
    }] : []),
    ...(capaMetrics.completedThisMonth > 0 ? [{
      id: 'capa-completed',
      type: 'capa',
      title: `${capaMetrics.completedThisMonth} CAPA Workflows Completed`,
      description: 'Monthly CAPA completion milestone reached',
      timestamp: 'This month',
      status: 'completed'
    }] : []),
    ...recentActivities.slice(0, 3)
  ].slice(0, 5)
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
          <p className="text-muted-foreground">AI-powered regulatory compliance monitoring and management</p>
        </div>
        <div className="flex gap-2">
          {criticalAlerts.length > 0 && (
            <Button 
              variant="destructive" 
              className="gap-2"
              onClick={() => window.dispatchEvent(new Event('navigate-to-compliance-monitor'))}
            >
              <AlertTriangle className="h-4 w-4" />
              {criticalAlerts.length} Critical Alert{criticalAlerts.length !== 1 ? 's' : ''}
            </Button>
          )}
          <Button className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Audit
          </Button>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {enhancedComplianceMetrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {getStatusIcon(metric.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {metric.trend === 'up' && <TrendUp className="h-3 w-3 text-secondary" />}
                {metric.trend === 'down' && <Warning className="h-3 w-3 text-destructive" />}
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Regulatory Database Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Regulatory Databases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Connections</span>
                <Badge>{activeDatabases.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Recent Updates</span>
                <Badge variant="outline">{regulatoryUpdates.length}</Badge>
              </div>
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={() => window.dispatchEvent(new Event('navigate-to-regulatory-db'))}
              >
                <ArrowRight className="h-4 w-4" />
                Manage Databases
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Intelligence Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monitoring Status</span>
                <Badge className="bg-green-100 text-green-800">
                  <Activity className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Recommendations</span>
                <Badge variant="outline">{recommendations.length}</Badge>
              </div>
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={() => window.dispatchEvent(new Event('navigate-to-compliance-monitor'))}
              >
                <ArrowRight className="h-4 w-4" />
                View Insights
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Automation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              Email Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Templates</span>
                <Badge>{emailStats.activeTemplates}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Emails</span>
                <Badge variant="outline">{emailStats.pendingEmails}</Badge>
              </div>
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={() => window.dispatchEvent(new Event('navigate-to-email-templates'))}
              >
                <ArrowRight className="h-4 w-4" />
                Manage Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Enhanced Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest compliance and regulatory activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enhancedRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'regulatory' && <FileText className="h-4 w-4 text-blue-600 mt-0.5" />}
                    {activity.type === 'alert' && <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />}
                    {activity.type === 'capa' && <Workflow className="h-4 w-4 text-purple-600 mt-0.5" />}
                    {activity.type === 'audit' && <Shield className="h-4 w-4 text-green-600 mt-0.5" />}
                    {activity.type === 'document' && <FileText className="h-4 w-4 text-orange-600 mt-0.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Navigate to key compliance features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button 
                variant="outline" 
                className="justify-start gap-3"
                onClick={() => window.dispatchEvent(new Event('navigate-to-simulations'))}
              >
                <Shield className="h-4 w-4" />
                Run Audit Simulation
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start gap-3"
                onClick={() => window.dispatchEvent(new Event('navigate-to-gap-analysis'))}
              >
                <Target className="h-4 w-4" />
                Gap Analysis
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start gap-3"
                onClick={() => window.dispatchEvent(new Event('navigate-to-workflows'))}
              >
                <Workflow className="h-4 w-4" />
                CAPA Workflows
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start gap-3"
                onClick={() => window.dispatchEvent(new Event('navigate-to-evidence'))}
              >
                <FileText className="h-4 w-4" />
                Evidence Management
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start gap-3"
                onClick={() => window.dispatchEvent(new Event('navigate-to-intelligence'))}
              >
                <Brain className="h-4 w-4" />
                Regulatory Intelligence
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Existing components */}
      <div className="grid gap-4 md:grid-cols-2">
        <WebhookStatusWidget />
        <AIInsightsPanel />
      </div>

      {/* Notifications Panel */}
      {(criticalNotifications > 0 || unreadNotifications > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Notifications
              {unreadNotifications > 0 && (
                <Badge className="ml-2">{unreadNotifications} unread</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalNotifications > 0 && (
                <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      {criticalNotifications} critical notification{criticalNotifications !== 1 ? 's' : ''} require immediate attention
                    </span>
                  </div>
                </div>
              )}
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}