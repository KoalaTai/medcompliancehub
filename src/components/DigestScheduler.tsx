import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Calendar, 
  Clock,
  Play,
  Pause,
  Settings,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  AlertTriangle,
  User,
  Mail,
  Bell,
  Zap,
  Users,
  Target,
  BarChart3
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface DigestSchedule {
  id: string
  name: string
  description: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  dayOfWeek?: number // 0 = Sunday, only for weekly/biweekly
  dayOfMonth?: number // 1-28, only for monthly
  timeOfDay: string // HH:MM format
  timezone: string
  enabled: boolean
  templateId: string
  recipientGroups: string[]
  lastRun?: string
  nextRun?: string
  totalRuns: number
  successfulRuns: number
  createdAt: string
  createdBy: string
}

interface RecipientGroup {
  id: string
  name: string
  description: string
  recipients: string[]
  filters: {
    severityLevels: string[]
    regulatoryAuthorities: string[]
    updateTypes: string[]
  }
  enabled: boolean
  createdAt: string
}

interface ScheduleExecution {
  id: string
  scheduleId: string
  executedAt: string
  status: 'success' | 'failed' | 'partial'
  recipientCount: number
  updatesIncluded: number
  criticalUpdates: number
  duration: number // seconds
  errorMessage?: string
  digestId?: string
}

const sampleRecipientGroups: RecipientGroup[] = [
  {
    id: '1',
    name: 'Quality Leadership',
    description: 'Quality directors, managers, and senior staff',
    recipients: ['quality@medtech.com', 'qm@pharma.co', 'compliance.lead@biotech.org'],
    filters: {
      severityLevels: ['critical', 'high'],
      regulatoryAuthorities: ['FDA', 'ISO'],
      updateTypes: ['new_rule', 'amendment', 'guidance']
    },
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Regulatory Team',
    description: 'Regulatory affairs professionals and consultants',
    recipients: ['regulatory@medtech.com', 'ra.team@pharma.co'],
    filters: {
      severityLevels: ['critical', 'high', 'medium'],
      regulatoryAuthorities: ['FDA', 'European Commission', 'Health Canada', 'ISO'],
      updateTypes: ['new_rule', 'amendment', 'guidance', 'deadline', 'consultation']
    },
    enabled: true,
    createdAt: '2024-01-05T00:00:00Z'
  }
]

const sampleSchedules: DigestSchedule[] = [
  {
    id: '1',
    name: 'Weekly Executive Summary',
    description: 'High-level regulatory updates for leadership team',
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    timeOfDay: '09:00',
    timezone: 'America/New_York',
    enabled: true,
    templateId: 'executive-template',
    recipientGroups: ['1'],
    lastRun: '2024-01-15T09:00:00Z',
    nextRun: '2024-01-22T09:00:00Z',
    totalRuns: 12,
    successfulRuns: 11,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin@virtualbackroom.com'
  },
  {
    id: '2',
    name: 'Comprehensive Regulatory Digest',
    description: 'Detailed regulatory intelligence for regulatory team',
    frequency: 'weekly',
    dayOfWeek: 2, // Tuesday
    timeOfDay: '10:30',
    timezone: 'America/New_York',
    enabled: true,
    templateId: 'comprehensive-template',
    recipientGroups: ['2'],
    lastRun: '2024-01-16T10:30:00Z',
    nextRun: '2024-01-23T10:30:00Z',
    totalRuns: 8,
    successfulRuns: 8,
    createdAt: '2024-01-08T00:00:00Z',
    createdBy: 'admin@virtualbackroom.com'
  }
]

const sampleExecutions: ScheduleExecution[] = [
  {
    id: '1',
    scheduleId: '1',
    executedAt: '2024-01-15T09:00:00Z',
    status: 'success',
    recipientCount: 15,
    updatesIncluded: 12,
    criticalUpdates: 3,
    duration: 45,
    digestId: 'digest-1'
  },
  {
    id: '2',
    scheduleId: '2',
    executedAt: '2024-01-16T10:30:00Z',
    status: 'success',
    recipientCount: 8,
    updatesIncluded: 18,
    criticalUpdates: 2,
    duration: 52,
    digestId: 'digest-2'
  }
]

export function DigestScheduler() {
  const [schedules, setSchedules] = useKV<DigestSchedule[]>('digest-schedules', sampleSchedules)
  const [recipientGroups, setRecipientGroups] = useKV<RecipientGroup[]>('recipient-groups', sampleRecipientGroups)
  const [executions, setExecutions] = useKV<ScheduleExecution[]>('schedule-executions', sampleExecutions)
  const [activeTab, setActiveTab] = useState('schedules')
  const [showAddSchedule, setShowAddSchedule] = useState(false)
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [isRunningSchedule, setIsRunningSchedule] = useState<string | null>(null)

  const handleRunScheduleNow = async (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId)
    if (!schedule) return

    setIsRunningSchedule(scheduleId)

    try {
      // Simulate digest generation and delivery
      const prompt = spark.llmPrompt`Generate a regulatory intelligence digest for schedule "${schedule.name}". 
      Create content appropriate for recipient groups with focus on:
      - Critical regulatory updates requiring immediate attention
      - New guidance documents and rule changes
      - Upcoming compliance deadlines
      - Impact analysis for medical device and pharmaceutical companies
      
      Format as professional email content with executive summary and detailed sections.`
      
      const digestContent = await spark.llm(prompt)
      
      // Get recipient count from groups
      const recipientCount = schedule.recipientGroups.reduce((count, groupId) => {
        const group = recipientGroups.find(g => g.id === groupId)
        return count + (group?.recipients.length || 0)
      }, 0)
      
      // Simulate execution metrics
      const execution: ScheduleExecution = {
        id: Date.now().toString(),
        scheduleId: schedule.id,
        executedAt: new Date().toISOString(),
        status: 'success',
        recipientCount,
        updatesIncluded: Math.floor(Math.random() * 20) + 5,
        criticalUpdates: Math.floor(Math.random() * 5) + 1,
        duration: Math.floor(Math.random() * 60) + 30,
        digestId: `digest-${Date.now()}`
      }
      
      setExecutions(current => [execution, ...current])
      
      // Update schedule stats
      setSchedules(current => 
        current.map(s => 
          s.id === scheduleId 
            ? { 
                ...s, 
                lastRun: execution.executedAt,
                totalRuns: s.totalRuns + 1,
                successfulRuns: s.successfulRuns + 1,
                nextRun: getNextRunTime(s).toISOString()
              }
            : s
        )
      )
      
      toast.success(`Digest sent successfully to ${execution.recipientCount} recipients!`)
    } catch (error) {
      const execution: ScheduleExecution = {
        id: Date.now().toString(),
        scheduleId: schedule.id,
        executedAt: new Date().toISOString(),
        status: 'failed',
        recipientCount: 0,
        updatesIncluded: 0,
        criticalUpdates: 0,
        duration: 0,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      }
      
      setExecutions(current => [execution, ...current])
      toast.error('Failed to run scheduled digest. Check execution logs.')
    } finally {
      setIsRunningSchedule(null)
    }
  }

  const handleToggleSchedule = (scheduleId: string, enabled: boolean) => {
    setSchedules(current => 
      current.map(s => 
        s.id === scheduleId 
          ? { ...s, enabled, nextRun: enabled ? getNextRunTime(s).toISOString() : undefined }
          : s
      )
    )
    
    const schedule = schedules.find(s => s.id === scheduleId)
    toast.success(`${schedule?.name} ${enabled ? 'enabled' : 'disabled'} successfully`)
  }

  const getNextRunTime = (schedule: DigestSchedule): Date => {
    const now = new Date()
    const [hours, minutes] = schedule.timeOfDay.split(':').map(Number)
    
    let nextRun = new Date()
    nextRun.setHours(hours, minutes, 0, 0)
    
    switch (schedule.frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1)
        }
        break
        
      case 'weekly':
        // Find next occurrence of the specified day
        const targetDay = schedule.dayOfWeek || 1
        const currentDay = nextRun.getDay()
        let daysToAdd = targetDay - currentDay
        
        if (daysToAdd <= 0 || (daysToAdd === 0 && nextRun <= now)) {
          daysToAdd += 7
        }
        
        nextRun.setDate(nextRun.getDate() + daysToAdd)
        break
        
      case 'biweekly':
        // Similar to weekly but add 14 days instead of 7
        const biweeklyTargetDay = schedule.dayOfWeek || 1
        const biweeklyCurrentDay = nextRun.getDay()
        let biweeklyDaysToAdd = biweeklyTargetDay - biweeklyCurrentDay
        
        if (biweeklyDaysToAdd <= 0 || (biweeklyDaysToAdd === 0 && nextRun <= now)) {
          biweeklyDaysToAdd += 14
        }
        
        nextRun.setDate(nextRun.getDate() + biweeklyDaysToAdd)
        break
        
      case 'monthly':
        const targetDayOfMonth = schedule.dayOfMonth || 1
        nextRun.setDate(targetDayOfMonth)
        
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1)
        }
        break
    }
    
    return nextRun
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayNumber]
  }

  const getFrequencyDescription = (schedule: DigestSchedule) => {
    switch (schedule.frequency) {
      case 'daily':
        return `Daily at ${schedule.timeOfDay}`
      case 'weekly':
        return `Weekly on ${getDayName(schedule.dayOfWeek || 1)} at ${schedule.timeOfDay}`
      case 'biweekly':
        return `Every two weeks on ${getDayName(schedule.dayOfWeek || 1)} at ${schedule.timeOfDay}`
      case 'monthly':
        return `Monthly on day ${schedule.dayOfMonth || 1} at ${schedule.timeOfDay}`
      default:
        return 'Custom schedule'
    }
  }

  const activeSchedules = schedules.filter(s => s.enabled).length
  const totalRecipients = recipientGroups.reduce((sum, group) => sum + group.recipients.length, 0)
  const successRate = schedules.reduce((sum, s) => sum + s.totalRuns, 0) > 0 
    ? Math.round((schedules.reduce((sum, s) => sum + s.successfulRuns, 0) / schedules.reduce((sum, s) => sum + s.totalRuns, 0)) * 100)
    : 100

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Digest Scheduler</h2>
          <p className="text-muted-foreground">Automated delivery schedules for regulatory intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddGroup(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            Add Group
          </Button>
          <Button size="sm" onClick={() => setShowAddSchedule(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Active Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSchedules}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Total Recipients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecipients}</div>
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">Successful deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {executions.filter(e => {
                const executedAt = new Date(e.executedAt)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return executedAt >= weekAgo
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Executions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="groups">Recipient Groups</TabsTrigger>
          <TabsTrigger value="executions">Execution History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Delivery Schedules</h3>
            <Button size="sm" onClick={() => setShowAddSchedule(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>
          
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{schedule.name}</CardTitle>
                          <Badge className={schedule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {schedule.enabled ? (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <Pause className="h-3 w-3 mr-1" />
                                Paused
                              </>
                            )}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">{schedule.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={schedule.enabled}
                          onCheckedChange={(enabled) => handleToggleSchedule(schedule.id, enabled)}
                        />
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Schedule</Label>
                        <p className="text-sm font-medium">{getFrequencyDescription(schedule)}</p>
                        <p className="text-xs text-muted-foreground">{schedule.timezone}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Recipients</Label>
                        <p className="text-sm font-medium">
                          {schedule.recipientGroups.reduce((count, groupId) => {
                            const group = recipientGroups.find(g => g.id === groupId)
                            return count + (group?.recipients.length || 0)
                          }, 0)} recipients across {schedule.recipientGroups.length} groups
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">{schedule.totalRuns}</div>
                        <div className="text-xs text-muted-foreground">Total Runs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{schedule.successfulRuns}</div>
                        <div className="text-xs text-muted-foreground">Successful</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          {schedule.totalRuns > 0 ? Math.round((schedule.successfulRuns / schedule.totalRuns) * 100) : 100}%
                        </div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {schedule.lastRun && (
                        <div className="text-xs text-muted-foreground">
                          Last run: {formatDate(schedule.lastRun)}
                        </div>
                      )}
                      {schedule.nextRun && schedule.enabled && (
                        <div className="text-xs text-muted-foreground">
                          Next run: {formatDate(schedule.nextRun)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleRunScheduleNow(schedule.id)}
                        disabled={isRunningSchedule === schedule.id}
                      >
                        {isRunningSchedule === schedule.id ? (
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Run Now
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Target className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recipient Groups</h3>
            <Button size="sm" onClick={() => setShowAddGroup(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </div>
          
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {recipientGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={group.enabled}
                          onCheckedChange={(enabled) => {
                            setRecipientGroups(current => 
                              current.map(g => 
                                g.id === group.id ? { ...g, enabled } : g
                              )
                            )
                          }}
                        />
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Recipients ({group.recipients.length})</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {group.recipients.slice(0, 3).map((email, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {email}
                            </Badge>
                          ))}
                          {group.recipients.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{group.recipients.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Filter Preferences</Label>
                        <div className="grid grid-cols-1 gap-2 mt-1">
                          <div>
                            <span className="text-xs font-medium">Severity: </span>
                            {group.filters.severityLevels.map((level, index) => (
                              <Badge key={index} variant="secondary" className="text-xs mr-1">
                                {level}
                              </Badge>
                            ))}
                          </div>
                          <div>
                            <span className="text-xs font-medium">Authorities: </span>
                            {group.filters.regulatoryAuthorities.map((authority, index) => (
                              <Badge key={index} variant="secondary" className="text-xs mr-1">
                                {authority}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Execution History</h3>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {executions.map((execution) => {
                const schedule = schedules.find(s => s.id === execution.scheduleId)
                return (
                  <Card key={execution.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{schedule?.name || 'Unknown Schedule'}</CardTitle>
                          <CardDescription>{formatDate(execution.executedAt)}</CardDescription>
                        </div>
                        <Badge className={
                          execution.status === 'success' ? 'bg-green-100 text-green-800' :
                          execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {execution.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {execution.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{execution.recipientCount}</div>
                          <div className="text-xs text-muted-foreground">Recipients</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{execution.updatesIncluded}</div>
                          <div className="text-xs text-muted-foreground">Updates</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-red-600">{execution.criticalUpdates}</div>
                          <div className="text-xs text-muted-foreground">Critical</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-purple-600">{formatDuration(execution.duration)}</div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                        </div>
                      </div>
                      
                      {execution.errorMessage && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                          <p className="text-sm text-red-700">{execution.errorMessage}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {execution.digestId && (
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4 mr-2" />
                            View Digest
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <User className="h-4 w-4 mr-2" />
                          Recipients
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduler Settings</CardTitle>
              <CardDescription>Configure global settings for automated digest delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Enable automatic scheduling</Label>
                  <p className="text-xs text-muted-foreground">Allow schedules to run automatically</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Retry failed executions</Label>
                  <p className="text-xs text-muted-foreground">Automatically retry failed digest deliveries</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Send execution notifications</Label>
                  <p className="text-xs text-muted-foreground">Notify administrators of execution status</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Execution Limits</CardTitle>
              <CardDescription>Set limits to prevent abuse and ensure system stability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-recipients">Max recipients per schedule</Label>
                  <Input id="max-recipients" type="number" defaultValue="100" />
                </div>
                <div>
                  <Label htmlFor="max-executions">Max executions per hour</Label>
                  <Input id="max-executions" type="number" defaultValue="10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Schedule Dialog */}
      <Dialog open={showAddSchedule} onOpenChange={setShowAddSchedule}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Set up automated delivery schedule for regulatory digests
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="schedule-name">Schedule Name</Label>
              <Input id="schedule-name" placeholder="Weekly Executive Summary" />
            </div>
            <div>
              <Label htmlFor="schedule-description">Description</Label>
              <Input id="schedule-description" placeholder="Brief description of this schedule" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frequency</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Day of Week</Label>
                <Select defaultValue="1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" defaultValue="09:00" />
              </div>
              <div>
                <Label>Timezone</Label>
                <Select defaultValue="America/New_York">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddSchedule(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Schedule created successfully!')
                setShowAddSchedule(false)
              }}>
                Create Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Group Dialog */}
      <Dialog open={showAddGroup} onOpenChange={setShowAddGroup}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Recipient Group</DialogTitle>
            <DialogDescription>
              Group recipients with similar preferences and filters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input id="group-name" placeholder="Quality Leadership Team" />
            </div>
            <div>
              <Label htmlFor="group-description">Description</Label>
              <Input id="group-description" placeholder="Quality directors and senior staff" />
            </div>
            <div>
              <Label htmlFor="recipients">Recipients (one email per line)</Label>
              <textarea 
                id="recipients"
                className="w-full p-2 border border-input bg-background text-sm rounded-md resize-none min-h-[80px]"
                placeholder="quality@company.com&#10;director@company.com&#10;manager@company.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddGroup(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Recipient group created successfully!')
                setShowAddGroup(false)
              }}>
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}