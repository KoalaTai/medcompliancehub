import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { 
  Settings,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Download,
  Upload,
  FileText,
  Clock,
  Users,
  Target,
  Shield,
  Repeat,
  CheckCircle,
  Warning,
  Brain,
  Lightbulb,
  GitBranch,
  Save,
  X
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface TemplateAutomation {
  id: string
  name: string
  description: string
  triggerType: 'schedule' | 'event' | 'threshold' | 'manual'
  triggerConfig: Record<string, any>
  actions: AutomationAction[]
  conditions: AutomationCondition[]
  notifications: NotificationConfig[]
  active: boolean
}

interface AutomationAction {
  id: string
  type: 'create_workflow' | 'update_status' | 'assign_user' | 'send_notification' | 'generate_report'
  config: Record<string, any>
  order: number
}

interface AutomationCondition {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

interface NotificationConfig {
  id: string
  channel: 'email' | 'webhook' | 'ui' | 'teams' | 'slack'
  recipients: string[]
  template: string
  active: boolean
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  framework: string
  category: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  version: string
  active: boolean
  defaultActions: {
    corrective: TemplateAction[]
    preventive: TemplateAction[]
  }
  automations: TemplateAutomation[]
  requiredRoles: string[]
  estimatedDuration: number
  criticality: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  customFields: CustomField[]
  createdAt: string
  lastModified: string
}

interface TemplateAction {
  id: string
  type: 'corrective' | 'preventive'
  title: string
  description: string
  estimatedHours: number
  dependencies: string[]
  verificationCriteria: string[]
  assignmentRules: AssignmentRule[]
}

interface AssignmentRule {
  condition: string
  assignTo: string
  priority: number
}

interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'textarea'
  required: boolean
  options?: string[]
  defaultValue?: any
  validation?: Record<string, any>
}

const frameworkOptions = [
  'ISO 13485', 'FDA 21 CFR 820', 'FDA 21 CFR 807', 'EU MDR', 'ISO 14971', 
  'ISO 27001', 'GDPR', 'HIPAA', 'SOX', 'ISO 9001'
]

const categoryOptions = [
  'design-control', 'risk-management', 'quality-management', 'corrective-action',
  'validation', 'document-control', 'training', 'supplier-control', 
  'post-market-surveillance', 'clinical-evaluation'
]

const triggerTypes = [
  { value: 'schedule', label: 'Scheduled', description: 'Run on a specific schedule' },
  { value: 'event', label: 'Event-Based', description: 'Trigger on specific events' },
  { value: 'threshold', label: 'Threshold-Based', description: 'Trigger when metrics cross thresholds' },
  { value: 'manual', label: 'Manual', description: 'Manually triggered' }
]

export function WorkflowTemplateManager() {
  const [templates, setTemplates] = useKV<WorkflowTemplate[]>('workflow-templates', [])
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  const [templateForm, setTemplateForm] = useState<Partial<WorkflowTemplate>>({
    name: '',
    description: '',
    framework: '',
    category: '',
    difficulty: 'intermediate',
    version: '1.0',
    active: true,
    defaultActions: { corrective: [], preventive: [] },
    automations: [],
    requiredRoles: [],
    estimatedDuration: 30,
    criticality: 'medium',
    tags: [],
    customFields: []
  })

  const [automationForm, setAutomationForm] = useState<Partial<TemplateAutomation>>({
    name: '',
    description: '',
    triggerType: 'schedule',
    triggerConfig: {},
    actions: [],
    conditions: [],
    notifications: [],
    active: true
  })

  const createTemplate = async () => {
    if (!templateForm.name || !templateForm.framework || !templateForm.category) {
      toast.error('Please fill in required fields')
      return
    }

    const newTemplate: WorkflowTemplate = {
      ...templateForm,
      id: `template-${Date.now()}`,
      name: templateForm.name!,
      description: templateForm.description || '',
      framework: templateForm.framework!,
      category: templateForm.category!,
      difficulty: templateForm.difficulty!,
      version: templateForm.version || '1.0',
      active: templateForm.active ?? true,
      defaultActions: templateForm.defaultActions || { corrective: [], preventive: [] },
      automations: templateForm.automations || [],
      requiredRoles: templateForm.requiredRoles || [],
      estimatedDuration: templateForm.estimatedDuration || 30,
      criticality: templateForm.criticality || 'medium',
      tags: templateForm.tags || [],
      customFields: templateForm.customFields || [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }

    setTemplates(current => [...current, newTemplate])
    setIsCreating(false)
    setTemplateForm({
      name: '',
      description: '',
      framework: '',
      category: '',
      difficulty: 'intermediate',
      version: '1.0',
      active: true,
      defaultActions: { corrective: [], preventive: [] },
      automations: [],
      requiredRoles: [],
      estimatedDuration: 30,
      criticality: 'medium',
      tags: [],
      customFields: []
    })
    toast.success('Template created successfully')
  }

  const updateTemplate = async () => {
    if (!selectedTemplate || !templateForm.name) return

    const updatedTemplate: WorkflowTemplate = {
      ...selectedTemplate,
      ...templateForm,
      id: selectedTemplate.id,
      lastModified: new Date().toISOString()
    }

    setTemplates(current => 
      current.map(template => 
        template.id === selectedTemplate.id ? updatedTemplate : template
      )
    )
    setSelectedTemplate(updatedTemplate)
    setIsEditing(false)
    toast.success('Template updated successfully')
  }

  const deleteTemplate = (templateId: string) => {
    setTemplates(current => current.filter(template => template.id !== templateId))
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null)
    }
    toast.success('Template deleted')
  }

  const duplicateTemplate = (template: WorkflowTemplate) => {
    const duplicatedTemplate: WorkflowTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      version: '1.0',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }

    setTemplates(current => [...current, duplicatedTemplate])
    toast.success('Template duplicated')
  }

  const exportTemplate = (template: WorkflowTemplate) => {
    const dataStr = JSON.stringify(template, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${template.name.replace(/\s+/g, '_')}_template.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Template exported')
  }

  const addAction = (type: 'corrective' | 'preventive') => {
    const newAction: TemplateAction = {
      id: `action-${Date.now()}`,
      type,
      title: '',
      description: '',
      estimatedHours: 8,
      dependencies: [],
      verificationCriteria: [],
      assignmentRules: []
    }

    setTemplateForm(prev => ({
      ...prev,
      defaultActions: {
        ...prev.defaultActions!,
        [type]: [...(prev.defaultActions?.[type] || []), newAction]
      }
    }))
  }

  const updateAction = (type: 'corrective' | 'preventive', actionId: string, updates: Partial<TemplateAction>) => {
    setTemplateForm(prev => ({
      ...prev,
      defaultActions: {
        ...prev.defaultActions!,
        [type]: (prev.defaultActions?.[type] || []).map(action =>
          action.id === actionId ? { ...action, ...updates } : action
        )
      }
    }))
  }

  const removeAction = (type: 'corrective' | 'preventive', actionId: string) => {
    setTemplateForm(prev => ({
      ...prev,
      defaultActions: {
        ...prev.defaultActions!,
        [type]: (prev.defaultActions?.[type] || []).filter(action => action.id !== actionId)
      }
    }))
  }

  const addAutomation = () => {
    const newAutomation: TemplateAutomation = {
      id: `automation-${Date.now()}`,
      name: automationForm.name || 'New Automation',
      description: automationForm.description || '',
      triggerType: automationForm.triggerType || 'schedule',
      triggerConfig: automationForm.triggerConfig || {},
      actions: [],
      conditions: [],
      notifications: [],
      active: true
    }

    setTemplateForm(prev => ({
      ...prev,
      automations: [...(prev.automations || []), newAutomation]
    }))

    setAutomationForm({
      name: '',
      description: '',
      triggerType: 'schedule',
      triggerConfig: {},
      actions: [],
      conditions: [],
      notifications: [],
      active: true
    })
    toast.success('Automation added')
  }

  const addCustomField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      name: 'New Field',
      type: 'text',
      required: false
    }

    setTemplateForm(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), newField]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Workflow Template Manager
          </h2>
          <p className="text-muted-foreground">
            Configure and manage automated workflow templates for different frameworks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Template
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Template Library</TabsTrigger>
          <TabsTrigger value="builder">Template Builder</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Badge variant="outline">{template.framework}</Badge>
                          {!template.active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTemplate(template)
                            setTemplateForm(template)
                            setIsEditing(true)
                          }}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateTemplate(template)
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => {
                            e.stopPropagation()
                            exportTemplate(template)
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="capitalize">{template.category.replace('-', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{template.estimatedDuration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Version:</span>
                        <span>{template.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Actions:</span>
                        <span>
                          {template.defaultActions.corrective.length} corrective, {template.defaultActions.preventive.length} preventive
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Automations:</span>
                        <span>{template.automations.length} rules</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTemplate(template.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {templates.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first workflow template to get started.
                  </p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Powered Template Builder
                </CardTitle>
                <CardDescription>
                  Generate workflow templates automatically based on framework requirements and best practices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Target Framework</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        {frameworkOptions.map((framework) => (
                          <SelectItem key={framework} value={framework}>
                            {framework}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Compliance Area</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Specific Requirements or Context</Label>
                  <Textarea 
                    placeholder="Describe the specific compliance requirements or business context..."
                    rows={3}
                  />
                </div>
                <Button>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Start Templates</CardTitle>
                <CardDescription>
                  Pre-built templates for common compliance scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium">Quality Management Systems</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-3 w-3 mr-2" />
                        ISO 13485 QMS Implementation
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-3 w-3 mr-2" />
                        FDA QSR Compliance Review
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-3 w-3 mr-2" />
                        Document Control Procedure
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Risk Management</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-3 w-3 mr-2" />
                        ISO 14971 Risk Assessment
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-3 w-3 mr-2" />
                        Cybersecurity Risk Analysis
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-3 w-3 mr-2" />
                        Supply Chain Risk Review
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="h-5 w-5" />
                  Automation Rule Builder
                </CardTitle>
                <CardDescription>
                  Configure automated triggers and actions for workflow templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Rule Name</Label>
                    <Input 
                      value={automationForm.name || ''}
                      onChange={(e) => setAutomationForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter rule name"
                    />
                  </div>
                  <div>
                    <Label>Trigger Type</Label>
                    <Select 
                      value={automationForm.triggerType} 
                      onValueChange={(value) => setAutomationForm(prev => ({ ...prev, triggerType: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {triggerTypes.map((trigger) => (
                          <SelectItem key={trigger.value} value={trigger.value}>
                            {trigger.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addAutomation}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={automationForm.description || ''}
                    onChange={(e) => setAutomationForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this automation rule does..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {triggerTypes.map((trigger) => (
                <Card key={trigger.value}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {trigger.label}
                    </CardTitle>
                    <CardDescription>{trigger.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      Configure {trigger.label}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{templates.length}</p>
                      <p className="text-xs text-muted-foreground">Total Templates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <div>
                      <p className="text-2xl font-bold">{templates.filter(t => t.active).length}</p>
                      <p className="text-xs text-muted-foreground">Active Templates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-accent" />
                    <div>
                      <p className="text-2xl font-bold">
                        {templates.reduce((sum, t) => sum + t.automations.length, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Automation Rules</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">87%</p>
                      <p className="text-xs text-muted-foreground">Avg. Effectiveness</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Template Usage by Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {frameworkOptions.slice(0, 5).map((framework, index) => (
                    <div key={framework} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{framework}</span>
                        <span>{templates.filter(t => t.framework === framework).length} templates</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2" 
                          style={{ width: `${Math.random() * 80 + 20}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Creation/Edit Modal */}
      {(isCreating || isEditing) && (
        <Dialog open={isCreating || isEditing} onOpenChange={() => {
          setIsCreating(false)
          setIsEditing(false)
          setTemplateForm({
            name: '',
            description: '',
            framework: '',
            category: '',
            difficulty: 'intermediate',
            version: '1.0',
            active: true,
            defaultActions: { corrective: [], preventive: [] },
            automations: [],
            requiredRoles: [],
            estimatedDuration: 30,
            criticality: 'medium',
            tags: [],
            customFields: []
          })
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreating ? 'Create New Template' : `Edit ${selectedTemplate?.name}`}
              </DialogTitle>
              <DialogDescription>
                Configure template settings, actions, and automation rules
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={templateForm.name || ''}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-framework">Framework *</Label>
                  <Select 
                    value={templateForm.framework || ''} 
                    onValueChange={(value) => setTemplateForm(prev => ({ ...prev, framework: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworkOptions.map((framework) => (
                        <SelectItem key={framework} value={framework}>
                          {framework}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={templateForm.description || ''}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the template purpose and scope"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="template-category">Category *</Label>
                  <Select 
                    value={templateForm.category || ''} 
                    onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template-difficulty">Difficulty</Label>
                  <Select 
                    value={templateForm.difficulty || 'intermediate'} 
                    onValueChange={(value) => setTemplateForm(prev => ({ ...prev, difficulty: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template-duration">Duration (days)</Label>
                  <Input
                    id="template-duration"
                    type="number"
                    value={templateForm.estimatedDuration || 30}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreating(false)
                setIsEditing(false)
              }}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={isCreating ? createTemplate : updateTemplate}>
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? 'Create Template' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && !isEditing && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedTemplate.name}
              </DialogTitle>
              <DialogDescription>
                {selectedTemplate.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Framework</Label>
                  <div className="text-sm text-muted-foreground">{selectedTemplate.framework}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="text-sm text-muted-foreground capitalize">
                    {selectedTemplate.category.replace('-', ' ')}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Difficulty</Label>
                  <div className="text-sm text-muted-foreground capitalize">{selectedTemplate.difficulty}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <div className="text-sm text-muted-foreground">{selectedTemplate.estimatedDuration} days</div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Default Actions
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="h-3 w-3 text-destructive" />
                      Corrective Actions ({selectedTemplate.defaultActions.corrective.length})
                    </h5>
                    <div className="space-y-2">
                      {selectedTemplate.defaultActions.corrective.map((action) => (
                        <div key={action.id} className="text-xs p-2 bg-muted rounded">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-muted-foreground">{action.estimatedHours}h estimated</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Shield className="h-3 w-3 text-secondary" />
                      Preventive Actions ({selectedTemplate.defaultActions.preventive.length})
                    </h5>
                    <div className="space-y-2">
                      {selectedTemplate.defaultActions.preventive.map((action) => (
                        <div key={action.id} className="text-xs p-2 bg-muted rounded">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-muted-foreground">{action.estimatedHours}h estimated</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {selectedTemplate.automations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Repeat className="h-4 w-4" />
                      Automation Rules ({selectedTemplate.automations.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedTemplate.automations.map((automation) => (
                        <div key={automation.id} className="text-xs p-2 bg-muted rounded">
                          <div className="font-medium">{automation.name}</div>
                          <div className="text-muted-foreground">
                            {automation.triggerType} trigger • {automation.actions.length} actions
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedTemplate.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
              <Button onClick={() => {
                setTemplateForm(selectedTemplate)
                setIsEditing(true)
              }}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}