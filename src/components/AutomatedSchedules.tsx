import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Clock,
  Play,
  Pause,
  Calendar,
  Bell,
  CheckCircle,
  AlertTriangle,
  Mail,
  Settings,
  Zap,
  Target,
  Archive
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface ScheduledTask {
  id: string
  name: string
  type: 'digest' | 'scan' | 'alert' | 'report'
  status: 'active' | 'paused' | 'completed' | 'failed'
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string // HH:MM format
    dayOfWeek?: number
    dayOfMonth?: number
  }
  lastRun?: string
  nextRun?: string
  totalRuns: number
  successfulRuns: number
  settings: Record<string, any>
}

interface TaskExecution {
  id: string
  taskId: string
  startedAt: string
  completedAt?: string
  status: 'running' | 'completed' | 'failed'
  duration?: number
  result?: string
  error?: string
}

const sampleTasks: ScheduledTask[] = [
  {
    id: '1',
    name: 'Weekly Regulatory Digest',
    type: 'digest',
    status: 'active',
    schedule: {
      frequency: 'weekly',
      time: '09:00',
      dayOfWeek: 1 // Monday
    },
    lastRun: '2024-01-15T09:00:00Z',
    nextRun: '2024-01-22T09:00:00Z',
    totalRuns: 12,
    successfulRuns: 11,
    settings: {
      recipientGroups: ['executives', 'quality-team'],
      includeAI: true,
      severity: ['critical', 'high']
    }
  },
  {
    id: '2',
    name: 'Daily Compliance Scan',
    type: 'scan',
    status: 'active',
    schedule: {
      frequency: 'daily',
      time: '06:00'
    },
    lastRun: '2024-01-19T06:00:00Z',
    nextRun: '2024-01-20T06:00:00Z',
    totalRuns: 45,
    successfulRuns: 44,
    settings: {
      authorities: ['FDA', 'ISO', 'European Commission'],
      updateTypes: ['new_rule', 'amendment'],
      autoNotify: true
    }
  },
  {
    id: '3',
    name: 'Monthly Compliance Report',
    type: 'report',
    status: 'active',
    schedule: {
      frequency: 'monthly',
      time: '14:00',
      dayOfMonth: 1
    },
    lastRun: '2024-01-01T14:00:00Z',
    nextRun: '2024-02-01T14:00:00Z',
    totalRuns: 3,
    successfulRuns: 3,
    settings: {
      format: 'pdf',
      includeMetrics: true,
      distribution: ['management', 'board']
    }
  }
]

const sampleExecutions: TaskExecution[] = [
  {
    id: '1',
    taskId: '1',
    startedAt: '2024-01-15T09:00:00Z',
    completedAt: '2024-01-15T09:02:30Z',
    status: 'completed',
    duration: 150,
    result: 'Digest sent to 25 recipients'
  },
  {
    id: '2',
    taskId: '2',
    startedAt: '2024-01-19T06:00:00Z',
    completedAt: '2024-01-19T06:01:45Z',
    status: 'completed',
    duration: 105,
    result: 'Found 5 new regulatory updates'
  }
]

export function AutomatedSchedules() {
  const [tasks, setTasks] = useKV<ScheduledTask[]>('scheduled-tasks', sampleTasks)
  const [executions, setExecutions] = useKV<TaskExecution[]>('task-executions', sampleExecutions)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleToggleTask = (taskId: string, active: boolean) => {
    setTasks(current => 
      current.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: active ? 'active' : 'paused',
              nextRun: active ? calculateNextRun(task).toISOString() : undefined
            }
          : task
      )
    )
    
    const task = tasks.find(t => t.id === taskId)
    toast.success(`${task?.name} ${active ? 'activated' : 'paused'}`)
  }

  const handleRunTaskNow = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || runningTasks.has(taskId)) return

    setRunningTasks(prev => new Set(prev).add(taskId))
    
    const execution: TaskExecution = {
      id: Date.now().toString(),
      taskId,
      startedAt: new Date().toISOString(),
      status: 'running'
    }
    
    setExecutions(current => [execution, ...current])
    
    try {
      let result = ''
      
      switch (task.type) {
        case 'digest':
          const prompt = spark.llmPrompt`Generate a regulatory intelligence digest for task "${task.name}". 
          Create comprehensive content including:
          - Executive summary of critical regulatory changes
          - Impact analysis for compliance teams
          - Actionable recommendations
          - Upcoming deadline alerts
          
          Focus on severity levels: ${task.settings.severity?.join(', ')} 
          Format as professional email digest.`
          
          const digestContent = await spark.llm(prompt)
          result = `Digest generated and sent to ${task.settings.recipientGroups?.length || 0} groups`
          break
          
        case 'scan':
          // Simulate regulatory database scan
          await new Promise(resolve => setTimeout(resolve, 2000))
          const updateCount = Math.floor(Math.random() * 10) + 1
          result = `Found ${updateCount} new regulatory updates`
          break
          
        case 'report':
          // Simulate report generation
          await new Promise(resolve => setTimeout(resolve, 3000))
          result = `Monthly compliance report generated in ${task.settings.format} format`
          break
          
        case 'alert':
          // Simulate alert check
          await new Promise(resolve => setTimeout(resolve, 1000))
          const alertCount = Math.floor(Math.random() * 3)
          result = alertCount > 0 ? `${alertCount} critical alerts sent` : 'No critical alerts found'
          break
      }
      
      const completedExecution = {
        ...execution,
        completedAt: new Date().toISOString(),
        status: 'completed' as const,
        duration: Math.floor((Date.now() - new Date(execution.startedAt).getTime()) / 1000),
        result
      }
      
      setExecutions(current => 
        current.map(e => e.id === execution.id ? completedExecution : e)
      )
      
      // Update task statistics
      setTasks(current => 
        current.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                totalRuns: t.totalRuns + 1,
                successfulRuns: t.successfulRuns + 1,
                lastRun: completedExecution.completedAt,
                nextRun: calculateNextRun(t).toISOString()
              }
            : t
        )
      )
      
      toast.success(`${task.name} completed successfully`)
      
    } catch (error) {
      const failedExecution = {
        ...execution,
        completedAt: new Date().toISOString(),
        status: 'failed' as const,
        duration: Math.floor((Date.now() - new Date(execution.startedAt).getTime()) / 1000),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      
      setExecutions(current => 
        current.map(e => e.id === execution.id ? failedExecution : e)
      )
      
      // Update task statistics
      setTasks(current => 
        current.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                totalRuns: t.totalRuns + 1,
                status: 'failed'
              }
            : t
        )
      )
      
      toast.error(`${task.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setRunningTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  const calculateNextRun = (task: ScheduledTask): Date => {
    const now = new Date()
    const [hours, minutes] = task.schedule.time.split(':').map(Number)
    
    let nextRun = new Date()
    nextRun.setHours(hours, minutes, 0, 0)
    
    switch (task.schedule.frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1)
        }
        break
        
      case 'weekly':
        const targetDay = task.schedule.dayOfWeek || 1
        const currentDay = nextRun.getDay()
        let daysToAdd = targetDay - currentDay
        
        if (daysToAdd <= 0 || (daysToAdd === 0 && nextRun <= now)) {
          daysToAdd += 7
        }
        
        nextRun.setDate(nextRun.getDate() + daysToAdd)
        break
        
      case 'monthly':
        const targetDayOfMonth = task.schedule.dayOfMonth || 1
        nextRun.setDate(targetDayOfMonth)
        
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1)
        }
        break
    }
    
    return nextRun
  }

  const formatDateTime = (dateString: string) => {
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
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'digest': return Mail
      case 'scan': return Target
      case 'report': return Archive
      case 'alert': return Bell
      default: return Clock
    }
  }

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'digest': return 'text-blue-600'
      case 'scan': return 'text-green-600'
      case 'report': return 'text-purple-600'
      case 'alert': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeUntilNext = (nextRun?: string) => {
    if (!nextRun) return null
    
    const next = new Date(nextRun)
    const now = new Date()
    const diff = next.getTime() - now.getTime()
    
    if (diff <= 0) return 'Due now'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} day${days !== 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const activeTasks = tasks.filter(t => t.status === 'active').length
  const successRate = tasks.reduce((sum, t) => sum + t.totalRuns, 0) > 0 
    ? Math.round((tasks.reduce((sum, t) => sum + t.successfulRuns, 0) / tasks.reduce((sum, t) => sum + t.totalRuns, 0)) * 100)
    : 100

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Automated Schedules</h2>
          <p className="text-muted-foreground">Manage recurring compliance and intelligence tasks</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current time</p>
            <p className="text-lg font-mono">
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Today's Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {executions.filter(e => {
                const executedAt = new Date(e.startedAt)
                const today = new Date()
                return executedAt.toDateString() === today.toDateString()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'failed').length}
            </div>
            <p className="text-xs text-muted-foreground">Failed tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Tasks</CardTitle>
          <CardDescription>All automated compliance and intelligence tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {tasks.map((task) => {
                const TypeIcon = getTaskTypeIcon(task.type)
                const isRunning = runningTasks.has(task.id)
                const timeUntilNext = getTimeUntilNext(task.nextRun)
                
                return (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <TypeIcon className={`h-5 w-5 ${getTaskTypeColor(task.type)} mt-0.5`} />
                        <div>
                          <h4 className="font-semibold">{task.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{task.type} • {task.schedule.frequency}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <Switch 
                          checked={task.status === 'active'}
                          onCheckedChange={(active) => handleToggleTask(task.id, active)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Next Run</p>
                        <p className="font-medium">
                          {task.nextRun ? formatDateTime(task.nextRun) : 'Not scheduled'}
                        </p>
                        {timeUntilNext && (
                          <p className="text-xs text-muted-foreground">in {timeUntilNext}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Run</p>
                        <p className="font-medium">
                          {task.lastRun ? formatDateTime(task.lastRun) : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-medium">
                          {task.totalRuns > 0 ? Math.round((task.successfulRuns / task.totalRuns) * 100) : 100}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.successfulRuns}/{task.totalRuns} runs
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Schedule</p>
                        <p className="font-medium">{task.schedule.time}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.schedule.frequency === 'weekly' && task.schedule.dayOfWeek !== undefined && 
                            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][task.schedule.dayOfWeek]
                          }
                          {task.schedule.frequency === 'monthly' && task.schedule.dayOfMonth && 
                            `Day ${task.schedule.dayOfMonth}`
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleRunTaskNow(task.id)}
                        disabled={isRunning}
                      >
                        {isRunning ? (
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isRunning ? 'Running...' : 'Run Now'}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>Latest task execution results and logs</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {executions.slice(0, 10).map((execution) => {
                const task = tasks.find(t => t.id === execution.taskId)
                const TypeIcon = getTaskTypeIcon(task?.type || 'default')
                
                return (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <TypeIcon className={`h-4 w-4 ${getTaskTypeColor(task?.type || 'default')}`} />
                      <div>
                        <p className="font-medium">{task?.name || 'Unknown Task'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(execution.startedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {execution.duration && (
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(execution.duration)}
                        </span>
                      )}
                      <Badge 
                        className={
                          execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                          execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {execution.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {execution.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {execution.status === 'running' && <Clock className="h-3 w-3 mr-1 animate-spin" />}
                        {execution.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}