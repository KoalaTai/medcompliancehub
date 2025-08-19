import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { CalendarIcon, Plus, Target, Clock, CheckCircle2, AlertTriangle, Circle } from '@phosphor-icons/react'
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { SAMPLE_MILESTONES, type Milestone } from '@/data/milestonesSeed'

interface MilestoneTask {
  id: string
  milestoneId: string
  title: string
  description: string
  completed: boolean
  dueDate?: Date
  assignee?: string
}

const MILESTONE_CATEGORIES = [
  { value: 'audit', label: 'Audit Preparation' },
  { value: 'compliance', label: 'Compliance Implementation' },
  { value: 'regulatory', label: 'Regulatory Submission' },
  { value: 'training', label: 'Training & Certification' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'risk-management', label: 'Risk Management' }
]

const FRAMEWORKS = [
  'ISO 13485', 'ISO 14971', 'FDA QSR', 'EU MDR', 'ISO 27001', 
  'NIST CSF', 'GDPR', 'HIPAA', 'SOX', 'GxP'
]

export function MilestoneTracker() {
  const [milestones, setMilestones] = useKV<Milestone[]>('milestones', [])
  const [tasks, setTasks] = useKV<MilestoneTask[]>('milestone-tasks', [])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Initialize with sample data if empty
  useEffect(() => {
    if (milestones.length === 0) {
      setMilestones(SAMPLE_MILESTONES)
    }
  }, [milestones, setMilestones])

  // Form states
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    title: '',
    description: '',
    category: 'compliance',
    priority: 'medium',
    status: 'not-started',
    targetDate: addDays(new Date(), 30),
    startDate: new Date(),
    progress: 0,
    dependencies: [],
    assignees: [],
    deliverables: [],
    riskFactors: [],
    framework: []
  })

  const createMilestone = () => {
    if (!newMilestone.title || !newMilestone.targetDate) {
      toast.error('Please fill in required fields')
      return
    }

    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title,
      description: newMilestone.description || '',
      category: newMilestone.category as any,
      priority: newMilestone.priority as any,
      status: 'not-started',
      targetDate: newMilestone.targetDate,
      startDate: newMilestone.startDate || new Date(),
      progress: 0,
      dependencies: newMilestone.dependencies || [],
      assignees: newMilestone.assignees || [],
      deliverables: newMilestone.deliverables || [],
      riskFactors: newMilestone.riskFactors || [],
      framework: newMilestone.framework || []
    }

    setMilestones(current => [...current, milestone])
    setNewMilestone({
      title: '',
      description: '',
      category: 'compliance',
      priority: 'medium',
      status: 'not-started',
      targetDate: addDays(new Date(), 30),
      startDate: new Date(),
      progress: 0,
      dependencies: [],
      assignees: [],
      deliverables: [],
      riskFactors: [],
      framework: []
    })
    setIsCreateModalOpen(false)
    toast.success('Milestone created successfully')
  }

  const updateMilestoneProgress = (milestoneId: string, progress: number) => {
    setMilestones(current =>
      current.map(milestone => {
        if (milestone.id === milestoneId) {
          const updatedMilestone = { ...milestone, progress }
          
          // Auto-update status based on progress
          if (progress === 100) {
            updatedMilestone.status = 'completed'
            updatedMilestone.completedDate = new Date()
          } else if (progress > 0) {
            updatedMilestone.status = 'in-progress'
          }
          
          // Check if milestone is at risk due to date
          const daysUntilDue = differenceInDays(milestone.targetDate, new Date())
          if (daysUntilDue <= 7 && progress < 80) {
            updatedMilestone.status = 'at-risk'
          } else if (isAfter(new Date(), milestone.targetDate) && progress < 100) {
            updatedMilestone.status = 'delayed'
          }
          
          return updatedMilestone
        }
        return milestone
      })
    )
    toast.success('Milestone progress updated')
  }

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'in-progress':
        return <Circle className="w-4 h-4 text-blue-600 fill-current" />
      case 'at-risk':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'delayed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'at-risk':
        return 'bg-orange-100 text-orange-800'
      case 'delayed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Milestone['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const filteredMilestones = milestones.filter(milestone => {
    const categoryMatch = filterCategory === 'all' || milestone.category === filterCategory
    const statusMatch = filterStatus === 'all' || milestone.status === filterStatus
    return categoryMatch && statusMatch
  })

  const overallProgress = milestones.length > 0 
    ? Math.round(milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length)
    : 0

  const upcomingDeadlines = milestones
    .filter(m => m.status !== 'completed')
    .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Milestone Tracker</h1>
          <p className="text-muted-foreground">
            Track progress against key compliance delivery dates and milestones
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Milestone</DialogTitle>
              <DialogDescription>
                Define a new compliance milestone with target dates and deliverables
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Milestone title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newMilestone.category} 
                    onValueChange={(value) => setNewMilestone(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MILESTONE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Milestone description and objectives"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newMilestone.priority} 
                    onValueChange={(value) => setNewMilestone(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {newMilestone.startDate ? format(newMilestone.startDate, 'MMM dd, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newMilestone.startDate}
                        onSelect={(date) => setNewMilestone(prev => ({ ...prev, startDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Target Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {newMilestone.targetDate ? format(newMilestone.targetDate, 'MMM dd, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newMilestone.targetDate}
                        onSelect={(date) => setNewMilestone(prev => ({ ...prev, targetDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Frameworks</Label>
                <div className="flex flex-wrap gap-2">
                  {FRAMEWORKS.map(framework => (
                    <Badge
                      key={framework}
                      variant={newMilestone.framework?.includes(framework) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const frameworks = newMilestone.framework || []
                        const updated = frameworks.includes(framework)
                          ? frameworks.filter(f => f !== framework)
                          : [...frameworks, framework]
                        setNewMilestone(prev => ({ ...prev, framework: updated }))
                      }}
                    >
                      {framework}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createMilestone}>Create Milestone</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{milestones.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {milestones.filter(m => m.status === 'at-risk').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {milestones.filter(m => m.status === 'delayed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters and Milestones List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {MILESTONE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredMilestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(milestone.status)}
                        <h3 className="text-lg font-semibold">{milestone.title}</h3>
                        <Badge className={cn(getPriorityColor(milestone.priority))}>
                          {milestone.priority}
                        </Badge>
                        <Badge className={cn(getStatusColor(milestone.status))}>
                          {milestone.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">
                        {milestone.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Due: {format(milestone.targetDate, 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {differenceInDays(milestone.targetDate, new Date())} days remaining
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{milestone.progress}%</span>
                    </div>
                    <Progress value={milestone.progress} />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={milestone.progress}
                        onChange={(e) => updateMilestoneProgress(milestone.id, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <Button
                        size="sm"
                        onClick={() => updateMilestoneProgress(milestone.id, 100)}
                        disabled={milestone.progress === 100}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  </div>

                  {milestone.framework && milestone.framework.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {milestone.framework.map(framework => (
                        <Badge key={framework} variant="outline" className="text-xs">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {filteredMilestones.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Milestones Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first milestone to start tracking compliance progress
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Milestone
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>
                Next 5 milestones by target date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines.map(milestone => {
                const daysUntil = differenceInDays(milestone.targetDate, new Date())
                return (
                  <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(milestone.status)}
                        <h4 className="font-medium text-sm">{milestone.title}</h4>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(milestone.targetDate, 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {daysUntil > 0 ? `${daysUntil} days left` : `${Math.abs(daysUntil)} days overdue`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{milestone.progress}%</div>
                      <Badge className={cn(getStatusColor(milestone.status), "text-xs")}>
                        {milestone.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                )
              })}
              
              {upcomingDeadlines.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No upcoming deadlines
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}