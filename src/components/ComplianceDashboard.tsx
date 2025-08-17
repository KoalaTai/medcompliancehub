import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { WebhookStatusWidget } from '@/components/WebhookStatusWidget'
import { AIInsightsPanel } from '@/components/AIInsightsPanel'
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
  GitBranch as Workflow
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
  const unreadNotifications = getUnreadCount()
  const criticalNotifications = getCriticalCount()
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
          <p className="text-muted-foreground">Monitor your regulatory compliance status and recent activities</p>
        </div>
        <Button className="gap-2">
          <Calendar className="h-4 w-4" />
          Schedule Audit
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {complianceMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {getStatusIcon(metric.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs flex items-center gap-1 ${
                metric.trend === 'up' ? 'text-secondary' : 
                metric.trend === 'down' ? 'text-muted-foreground' : 
                'text-muted-foreground'
              }`}>
                <TrendUp className={`h-3 w-3 ${
                  metric.trend === 'down' ? 'rotate-180' : ''
                }`} />
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Regulatory Notifications Summary */}
      {(unreadNotifications > 0 || criticalNotifications > 0) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Bell className="h-5 w-5" />
              Regulatory Update Notifications
            </CardTitle>
            <CardDescription className="text-amber-700">
              Important regulatory changes that may affect your compliance status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-800">{unreadNotifications}</div>
                  <p className="text-xs text-amber-600">Unread Updates</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-800">{criticalNotifications}</div>
                  <p className="text-xs text-red-600">Critical Issues</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-800">
                    {notifications.filter(n => n.actionRequired && !n.dismissed).length}
                  </div>
                  <p className="text-xs text-amber-600">Require Action</p>
                </div>
              </div>
              <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                View All Updates
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Overview
            </CardTitle>
            <CardDescription>Current compliance status across key regulations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>FDA 21 CFR Part 820</span>
                <span className="font-medium">96%</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>ISO 13485:2016</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>EU MDR 2017/745</span>
                <span className="font-medium">89%</span>
              </div>
              <Progress value={89} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>ISO 14971:2019</span>
                <span className="font-medium">98%</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest compliance activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-4 p-3 rounded-lg border bg-card/30">
                  <div className="mt-1">
                    {activity.type === 'audit' && <FileText className="h-4 w-4 text-primary" />}
                    {activity.type === 'document' && <FileText className="h-4 w-4 text-secondary" />}
                    {activity.type === 'regulatory' && <Shield className="h-4 w-4 text-accent" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{activity.title}</h4>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Features Section */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Brain className="h-5 w-5" />
              AI Gap Detection
            </CardTitle>
            <CardDescription>Automated compliance gap identification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Automated Monitoring</span>
                <Badge className="bg-secondary text-secondary-foreground">Active</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Gaps Detected Today</span>
                  <span className="font-medium text-destructive">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Regulatory Changes</span>
                  <span className="font-medium">2 new</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Confidence Level</span>
                  <span className="font-medium">92%</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <Target className="h-3 w-3 mr-1" />
                View Analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <Workflow className="h-5 w-5" />
              CAPA Workflows
            </CardTitle>
            <CardDescription>Automated corrective & preventive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Smart Generation</span>
                <Badge variant="outline" className="border-secondary text-secondary">Active</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Auto-Generated CAPAs</span>
                  <span className="font-medium text-secondary">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Workflows</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg. Resolution Time</span>
                  <span className="font-medium">18.5 days</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-workflows'))}
              >
                <Workflow className="h-3 w-3 mr-1" />
                Manage CAPAs
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Brain className="h-5 w-5" />
              Document Intelligence
            </CardTitle>
            <CardDescription>AI-powered document analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Documents Analyzed</span>
                <span className="text-2xl font-bold text-accent">47</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Compliance Score</span>
                <span className="text-2xl font-bold text-accent">87%</span>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <FileText className="h-3 w-3 mr-1" />
                Analyze Documents
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Mail className="h-5 w-5" />
              Email Digests
            </CardTitle>
            <CardDescription>Weekly regulatory update summaries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Subscribers</span>
                <span className="text-2xl font-bold text-blue-600">47</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">This Week's Updates</span>
                <span className="text-2xl font-bold text-blue-600">12</span>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <Mail className="h-3 w-3 mr-1" />
                Manage Digests
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <Brain className="h-5 w-5" />
              Learning Paths
            </CardTitle>
            <CardDescription>AI-optimized skill development tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Paths</span>
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Completion Rate</span>
                <span className="text-2xl font-bold text-purple-600">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Critical Gaps</span>
                <span className="text-lg font-bold text-destructive">3</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>SOX Preparation</span>
                  <span className="font-medium">45%</span>
                </div>
                <Progress value={45} className="h-1.5" />
                <div className="flex justify-between text-xs">
                  <span>AI Act Readiness</span>
                  <span className="font-medium">0%</span>
                </div>
                <Progress value={0} className="h-1.5" />
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-skills'))}
              >
                <Target className="h-3 w-3 mr-1" />
                View Learning Paths
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Integration Status with AI Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <WebhookStatusWidget 
            showDetails={true}
            onViewAll={() => {
              // This would typically use a router to navigate
              // For now, we'll use the useKV hook to change the active section
              window.dispatchEvent(new CustomEvent('navigate-to-webhooks'))
            }}
          />
        </div>
        
        <div className="lg:col-span-1">
          <AIInsightsPanel className="h-full" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Skill Performance
            </CardTitle>
            <CardDescription>Real-time team skill benchmarking and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">7.3</div>
                  <div className="text-xs text-muted-foreground">Avg Team Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">2</div>
                  <div className="text-xs text-muted-foreground">At Risk</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>SOX Compliance</span>
                  <span className="font-medium">8.2/10</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Data Privacy</span>
                  <span className="font-medium text-destructive">6.1/10</span>
                </div>
                <Progress value={61} className="h-2" />
              </div>

              <Button 
                size="sm" 
                variant="outline" 
                className="w-full" 
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-team-comparison'))}
              >
                <Users className="h-3 w-3 mr-1" />
                View Team Benchmarks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Allocation Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Users className="h-5 w-5" />
              Resource Allocation
            </CardTitle>
            <CardDescription>AI-powered intelligent resource optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Team Utilization</span>
                <span className="text-2xl font-bold text-green-700">78%</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active Allocations</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Efficiency Score</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>On-time Delivery</span>
                  <span className="font-medium">98%</span>
                </div>
              </div>

              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-resources'))}
              >
                <TrendUp className="h-3 w-3 mr-1" />
                Optimize Resources
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Performance Analytics
            </CardTitle>
            <CardDescription>Historical performance trends and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Q3 Efficiency Improvement</span>
                  <span className="font-medium text-green-600">+5%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quality Score</span>
                  <span className="font-medium">4.8/5.0</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>

              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                <CheckCircle className="h-4 w-4" />
                <span>AI optimization active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/5 to-indigo-500/10 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <MapPin className="h-5 w-5" />
              Career Development
            </CardTitle>
            <CardDescription>AI-powered individual career path recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Promotion Ready</span>
                <span className="text-2xl font-bold text-indigo-700">2</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>At Career Risk</span>
                  <span className="font-medium text-destructive">1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Career Velocity</span>
                  <span className="font-medium">24 months</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Market Alignment</span>
                  <span className="font-medium text-accent">82%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Sarah Chen - Promotion Track</span>
                  <span className="font-medium text-accent">Ready</span>
                </div>
                <Progress value={95} className="h-1.5" />
                <div className="flex justify-between text-xs">
                  <span>Emily Johnson - Development</span>
                  <span className="font-medium">68%</span>
                </div>
                <Progress value={68} className="h-1.5" />
              </div>

              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-career-paths'))}
              >
                <MapPin className="h-3 w-3 mr-1" />
                View Career Paths
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}