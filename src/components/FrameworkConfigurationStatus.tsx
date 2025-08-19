import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle,
  Warning,
  Clock,
  Settings,
  FileText,
  Target,
  Shield,
  Repeat,
  Bell,
  Users,
  TrendUp,
  Activity,
  Zap
} from '@phosphor-icons/react'

interface FrameworkConfigStatus {
  framework: string
  templatesConfigured: number
  totalTemplates: number
  automationRules: number
  activeNotifications: number
  completionPercentage: number
  status: 'complete' | 'partial' | 'minimal' | 'not-configured'
  lastUpdated: string
}

const frameworkStatuses: FrameworkConfigStatus[] = [
  {
    framework: 'ISO 13485',
    templatesConfigured: 4,
    totalTemplates: 6,
    automationRules: 12,
    activeNotifications: 8,
    completionPercentage: 85,
    status: 'complete',
    lastUpdated: '2024-01-16'
  },
  {
    framework: 'FDA 21 CFR 820',
    templatesConfigured: 3,
    totalTemplates: 5,
    automationRules: 10,
    activeNotifications: 6,
    completionPercentage: 75,
    status: 'partial',
    lastUpdated: '2024-01-15'
  },
  {
    framework: 'FDA 21 CFR 807',
    templatesConfigured: 2,
    totalTemplates: 4,
    automationRules: 6,
    activeNotifications: 4,
    completionPercentage: 65,
    status: 'partial',
    lastUpdated: '2024-01-14'
  },
  {
    framework: 'EU MDR',
    templatesConfigured: 3,
    totalTemplates: 5,
    automationRules: 8,
    activeNotifications: 5,
    completionPercentage: 70,
    status: 'partial',
    lastUpdated: '2024-01-13'
  },
  {
    framework: 'ISO 14971',
    templatesConfigured: 2,
    totalTemplates: 3,
    automationRules: 5,
    activeNotifications: 3,
    completionPercentage: 80,
    status: 'complete',
    lastUpdated: '2024-01-12'
  },
  {
    framework: 'ISO 27001',
    templatesConfigured: 1,
    totalTemplates: 4,
    automationRules: 3,
    activeNotifications: 2,
    completionPercentage: 40,
    status: 'minimal',
    lastUpdated: '2024-01-10'
  },
  {
    framework: 'GDPR',
    templatesConfigured: 1,
    totalTemplates: 3,
    automationRules: 4,
    activeNotifications: 2,
    completionPercentage: 50,
    status: 'minimal',
    lastUpdated: '2024-01-08'
  }
]

const statusConfig = {
  complete: { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  partial: { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Clock },
  minimal: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Warning },
  'not-configured': { color: 'text-red-600', bgColor: 'bg-red-100', icon: Warning }
}

export function FrameworkConfigurationStatus() {
  const totalFrameworks = frameworkStatuses.length
  const completeFrameworks = frameworkStatuses.filter(f => f.status === 'complete').length
  const totalTemplates = frameworkStatuses.reduce((sum, f) => sum + f.templatesConfigured, 0)
  const totalAutomationRules = frameworkStatuses.reduce((sum, f) => sum + f.automationRules, 0)
  const totalNotifications = frameworkStatuses.reduce((sum, f) => sum + f.activeNotifications, 0)
  const averageCompletion = frameworkStatuses.reduce((sum, f) => sum + f.completionPercentage, 0) / totalFrameworks

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Framework Configuration Status
          </h3>
          <p className="text-muted-foreground">
            Automated workflow template configuration across regulatory frameworks
          </p>
        </div>
        <Button variant="outline">
          <TrendUp className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalFrameworks}</p>
                <p className="text-xs text-muted-foreground">Frameworks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalTemplates}</p>
                <p className="text-xs text-muted-foreground">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{totalAutomationRules}</p>
                <p className="text-xs text-muted-foreground">Automation Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{totalNotifications}</p>
                <p className="text-xs text-muted-foreground">Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{averageCompletion.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Avg. Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Framework Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {frameworkStatuses.map((framework) => {
          const statusInfo = statusConfig[framework.status]
          const StatusIcon = statusInfo.icon
          
          return (
            <Card key={framework.framework}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{framework.framework}</CardTitle>
                    <CardDescription>
                      Last updated {new Date(framework.lastUpdated).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                    <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Configuration Progress</span>
                    <span>{framework.completionPercentage}%</span>
                  </div>
                  <Progress value={framework.completionPercentage} />
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-blue-500" />
                      <span>Templates</span>
                    </div>
                    <span className="font-medium">
                      {framework.templatesConfigured}/{framework.totalTemplates}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-3 w-3 text-orange-500" />
                      <span>Automation Rules</span>
                    </div>
                    <span className="font-medium">{framework.automationRules}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-3 w-3 text-purple-500" />
                      <span>Notifications</span>
                    </div>
                    <span className="font-medium">{framework.activeNotifications}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Badge 
                    variant={framework.status === 'complete' ? 'default' : 'secondary'}
                    className={`${statusInfo.color} ${statusInfo.bgColor} border-0`}
                  >
                    {framework.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Configuration Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Configuration Recommendations
          </CardTitle>
          <CardDescription>
            Suggested next steps to improve your automated workflow coverage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">High Priority</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <Warning className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">Complete ISO 27001 templates</div>
                    <div className="text-muted-foreground">Only 1 of 4 templates configured</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">Enhance FDA QSR automation</div>
                    <div className="text-muted-foreground">Add 2 more automation rules for completeness</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Medium Priority</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Bell className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">GDPR notification coverage</div>
                    <div className="text-muted-foreground">Set up additional data breach notifications</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">EU MDR template expansion</div>
                    <div className="text-muted-foreground">Add 2 more workflow templates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Implementing these recommendations will increase your overall completion rate to <strong>92%</strong>
              </div>
              <Button size="sm">
                <Settings className="h-3 w-3 mr-2" />
                Start Configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Configuration Actions</CardTitle>
          <CardDescription>
            Common tasks to enhance your automated workflow setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Add Template
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Create Rule
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Setup Notifications
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Configure Security
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}