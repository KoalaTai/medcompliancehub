import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Mail,
  Plus,
  Edit,
  Trash,
  Copy,
  Eye,
  Save,
  Palette,
  Image,
  Settings,
  Code,
  Variable,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Sparkle,
  Layout,
  Type,
  AlignLeft,
  Bold,
  Italic
} from '@phosphor-icons/react'

interface EmailTemplate {
  id: string
  name: string
  description: string
  category: 'sync' | 'resources' | 'reminders' | 'alerts' | 'custom'
  subject: string
  preheader: string
  htmlBody: string
  textBody: string
  variables: TemplateVariable[]
  branding: BrandingConfig
  isDefault: boolean
  isActive: boolean
  version: string
  createdAt: string
  updatedAt: string
  usageCount: number
  lastUsed?: string
}

interface TemplateVariable {
  name: string
  description: string
  type: 'text' | 'number' | 'date' | 'url' | 'email' | 'list' | 'html'
  required: boolean
  defaultValue?: string
  example: string
}

interface BrandingConfig {
  companyName: string
  companyLogo?: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  linkColor: string
  fontFamily: string
  headerImage?: string
  footerText: string
  socialLinks: {
    linkedin?: string
    twitter?: string
    website?: string
  }
  customCSS?: string
}

// Default variables available across all templates
const commonVariables: TemplateVariable[] = [
  {
    name: 'COMPANY_NAME',
    description: 'Your company or organization name',
    type: 'text',
    required: true,
    example: 'VirtualBackroom'
  },
  {
    name: 'USER_NAME',
    description: 'Recipient\'s first name or full name',
    type: 'text',
    required: false,
    example: 'John'
  },
  {
    name: 'USER_EMAIL',
    description: 'Recipient\'s email address',
    type: 'email',
    required: false,
    example: 'john@example.com'
  },
  {
    name: 'CURRENT_DATE',
    description: 'Current date in readable format',
    type: 'date',
    required: false,
    example: 'March 15, 2024'
  },
  {
    name: 'DASHBOARD_URL',
    description: 'Link to the user\'s dashboard',
    type: 'url',
    required: false,
    example: 'https://app.virtualbackroom.com/dashboard'
  }
]

// Category-specific variables
const categoryVariables: Record<string, TemplateVariable[]> = {
  sync: [
    {
      name: 'PLATFORM_NAME',
      description: 'Name of the synced platform',
      type: 'text',
      required: true,
      example: 'Coursera'
    },
    {
      name: 'SYNC_TIME',
      description: 'When the sync was completed',
      type: 'date',
      required: true,
      example: '2:30 PM EST'
    },
    {
      name: 'SYNC_STATUS',
      description: 'Success or failure status',
      type: 'text',
      required: true,
      example: 'Success'
    }
  ],
  resources: [
    {
      name: 'RESOURCE_COUNT',
      description: 'Number of resources added/updated',
      type: 'number',
      required: true,
      example: '15'
    },
    {
      name: 'RESOURCE_LIST',
      description: 'Formatted list of new resources',
      type: 'html',
      required: false,
      example: '<ul><li>Course 1</li><li>Course 2</li></ul>'
    },
    {
      name: 'RESOURCE_TYPES',
      description: 'Types of resources (courses, videos, etc.)',
      type: 'list',
      required: false,
      example: 'Courses, Videos, Articles'
    }
  ],
  alerts: [
    {
      name: 'ALERT_TYPE',
      description: 'Type of alert being sent',
      type: 'text',
      required: true,
      example: 'Error'
    },
    {
      name: 'ERROR_MESSAGE',
      description: 'Detailed error message',
      type: 'text',
      required: false,
      example: 'Connection timeout'
    },
    {
      name: 'ACTION_REQUIRED',
      description: 'What action the user should take',
      type: 'text',
      required: false,
      example: 'Please check your API credentials'
    }
  ]
}

// Default branding configuration
const defaultBranding: BrandingConfig = {
  companyName: 'VirtualBackroom',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  linkColor: '#2563eb',
  fontFamily: 'Inter, system-ui, sans-serif',
  footerText: '© 2024 VirtualBackroom. All rights reserved.',
  socialLinks: {}
}

// Default email templates with branding
const defaultTemplates: EmailTemplate[] = [
  {
    id: 'resource-sync-success',
    name: 'Resource Sync Success',
    description: 'Notification when learning resources are successfully synced',
    category: 'sync',
    subject: 'New Learning Resources Available - {PLATFORM_NAME}',
    preheader: '{RESOURCE_COUNT} new resources have been synced to your library',
    htmlBody: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{SUBJECT}</title>
</head>
<body style="font-family: {FONT_FAMILY}; background-color: {BACKGROUND_COLOR}; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background-color: {PRIMARY_COLOR}; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">{COMPANY_NAME}</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">Learning Resource Update</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px 24px;">
      <h2 style="color: {TEXT_COLOR}; font-size: 20px; margin: 0 0 16px 0;">
        🎉 New Resources from {PLATFORM_NAME}
      </h2>
      
      <p style="color: {TEXT_COLOR}; line-height: 1.6; margin: 0 0 24px 0;">
        Hi {USER_NAME},
      </p>
      
      <p style="color: {TEXT_COLOR}; line-height: 1.6; margin: 0 0 24px 0;">
        We've just synced <strong>{RESOURCE_COUNT} new learning resources</strong> from {PLATFORM_NAME} to your VirtualBackroom library!
      </p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 24px 0;">
        <h3 style="color: {TEXT_COLOR}; font-size: 16px; margin: 0 0 12px 0;">📚 New Resources:</h3>
        {RESOURCE_LIST}
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="{DASHBOARD_URL}" style="background-color: {PRIMARY_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          View All Resources
        </a>
      </div>
      
      <p style="color: {SECONDARY_COLOR}; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
        Synced on {SYNC_TIME} • {RESOURCE_COUNT} resources added
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 20px 24px; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
      <p style="color: {SECONDARY_COLOR}; font-size: 12px; text-align: center; margin: 0;">
        {FOOTER_TEXT}
      </p>
    </div>
  </div>
</body>
</html>`,
    textBody: `New Learning Resources Available - {PLATFORM_NAME}

Hi {USER_NAME},

We've just synced {RESOURCE_COUNT} new learning resources from {PLATFORM_NAME} to your VirtualBackroom library!

Visit your dashboard to explore these new resources: {DASHBOARD_URL}

Synced on {SYNC_TIME}

{FOOTER_TEXT}`,
    variables: [...commonVariables, ...categoryVariables.sync, ...categoryVariables.resources],
    branding: defaultBranding,
    isDefault: true,
    isActive: true,
    version: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0
  }
]

export function EmailTemplateManager() {
  const [templates, setTemplates] = useKV<EmailTemplate[]>('email-templates', defaultTemplates)
  const [brandingSettings, setBrandingSettings] = useKV<BrandingConfig>('email-branding', defaultBranding)
  
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isBrandingDialogOpen, setIsBrandingDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [activeTab, setActiveTab] = useState('html')
  
  // Form state for template creation/editing
  const [templateForm, setTemplateForm] = useState<Partial<EmailTemplate>>({
    name: '',
    description: '',
    category: 'custom',
    subject: '',
    preheader: '',
    htmlBody: '',
    textBody: '',
    variables: [],
    branding: brandingSettings,
    isDefault: false,
    isActive: true,
    version: '1.0'
  })

  // Reset form when dialog closes
  useEffect(() => {
    if (!isTemplateDialogOpen) {
      setSelectedTemplate(null)
      resetTemplateForm()
    }
  }, [isTemplateDialogOpen])

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      category: 'custom',
      subject: '',
      preheader: '',
      htmlBody: '',
      textBody: '',
      variables: [],
      branding: brandingSettings,
      isDefault: false,
      isActive: true,
      version: '1.0'
    })
  }

  const handleCreateTemplate = () => {
    setSelectedTemplate(null)
    resetTemplateForm()
    setIsTemplateDialogOpen(true)
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setTemplateForm(template)
    setIsTemplateDialogOpen(true)
  }

  const handleSaveTemplate = () => {
    const template: EmailTemplate = {
      id: selectedTemplate?.id || Date.now().toString(),
      ...templateForm as EmailTemplate,
      variables: getTemplateVariables(templateForm.category!, templateForm.htmlBody!, templateForm.subject!),
      createdAt: selectedTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: selectedTemplate?.usageCount || 0
    }

    if (selectedTemplate) {
      setTemplates(current => current.map(t => t.id === template.id ? template : t))
      toast.success('Email template updated successfully')
    } else {
      setTemplates(current => [...current, template])
      toast.success('Email template created successfully')
    }

    setIsTemplateDialogOpen(false)
  }

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template?.isDefault) {
      toast.error('Cannot delete default templates')
      return
    }
    
    setTemplates(current => current.filter(t => t.id !== templateId))
    toast.success('Email template deleted')
  }

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const duplicated: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    }
    
    setTemplates(current => [...current, duplicated])
    toast.success('Template duplicated successfully')
  }

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template)
    setIsPreviewDialogOpen(true)
  }

  const handleSaveBranding = () => {
    setBrandingSettings(brandingSettings)
    toast.success('Branding settings saved')
    setIsBrandingDialogOpen(false)
  }

  const getTemplateVariables = (category: string, htmlBody: string, subject: string): TemplateVariable[] => {
    const combinedText = `${subject} ${htmlBody}`.toLowerCase()
    const foundVariables: TemplateVariable[] = []
    
    // Add common variables
    foundVariables.push(...commonVariables)
    
    // Add category-specific variables
    if (categoryVariables[category]) {
      foundVariables.push(...categoryVariables[category])
    }
    
    // Extract custom variables from the template
    const customMatches = combinedText.match(/\{([^}]+)\}/g) || []
    customMatches.forEach(match => {
      const varName = match.slice(1, -1).toUpperCase()
      if (!foundVariables.some(v => v.name === varName)) {
        foundVariables.push({
          name: varName,
          description: 'Custom variable',
          type: 'text',
          required: false,
          example: 'Sample value'
        })
      }
    })
    
    return foundVariables
  }

  const renderPreview = (template: EmailTemplate) => {
    let preview = template.htmlBody
    
    // Replace branding variables
    preview = preview.replace(/\{COMPANY_NAME\}/g, template.branding.companyName)
    preview = preview.replace(/\{PRIMARY_COLOR\}/g, template.branding.primaryColor)
    preview = preview.replace(/\{SECONDARY_COLOR\}/g, template.branding.secondaryColor)
    preview = preview.replace(/\{BACKGROUND_COLOR\}/g, template.branding.backgroundColor)
    preview = preview.replace(/\{TEXT_COLOR\}/g, template.branding.textColor)
    preview = preview.replace(/\{LINK_COLOR\}/g, template.branding.linkColor)
    preview = preview.replace(/\{FONT_FAMILY\}/g, template.branding.fontFamily)
    preview = preview.replace(/\{FOOTER_TEXT\}/g, template.branding.footerText)
    
    // Replace sample variables
    template.variables.forEach(variable => {
      const placeholder = `{${variable.name}}`
      preview = preview.replace(new RegExp(placeholder, 'g'), variable.example)
    })
    
    return preview
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-muted-foreground">
            Create and customize branded email templates with variable placeholders
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsBrandingDialogOpen(true)}
          >
            <Palette className="w-4 h-4 mr-2" />
            Branding
          </Button>
          <Button onClick={handleCreateTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Template Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              {templates.filter(t => t.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(templates.map(t => t.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.reduce((sum, t) => sum + t.usageCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Times sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Custom Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter(t => !t.isDefault).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Created by you
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.length > 0 ? (
              templates.map(template => (
                <div key={template.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant={template.isDefault ? 'default' : 'secondary'}>
                          {template.isDefault ? 'Default' : 'Custom'}
                        </Badge>
                        <Badge variant={template.isActive ? 'default' : 'outline'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!template.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Variable className="w-3 h-3" />
                      <span>{template.variables.length} variables</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      <span>Used {template.usageCount} times</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="w-3 h-3" />
                      <span>v{template.version}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Subject: {template.subject}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-semibold mb-2">No Templates</h4>
                <p className="text-muted-foreground mb-4">
                  Create your first email template to get started
                </p>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template Editor Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Email Template' : 'Create Email Template'}
            </DialogTitle>
            <DialogDescription>
              Design a branded email template with variable placeholders for dynamic content
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="html">HTML Content</TabsTrigger>
              <TabsTrigger value="text">Text Version</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[60vh] overflow-y-auto">
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      placeholder="e.g., Weekly Resource Digest"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-category">Category</Label>
                    <Select
                      value={templateForm.category}
                      onValueChange={(value: any) => setTemplateForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sync">Sync Notifications</SelectItem>
                        <SelectItem value="resources">Resource Updates</SelectItem>
                        <SelectItem value="reminders">Reminders</SelectItem>
                        <SelectItem value="alerts">Alerts</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Input
                    id="template-description"
                    placeholder="Brief description of when this template is used"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="template-subject">Subject Line</Label>
                  <Input
                    id="template-subject"
                    placeholder="e.g., New Learning Resources - {PLATFORM_NAME}"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {'{VARIABLE_NAME}'} for dynamic content
                  </p>
                </div>

                <div>
                  <Label htmlFor="template-preheader">Preheader Text</Label>
                  <Input
                    id="template-preheader"
                    placeholder="Preview text that appears after subject line"
                    value={templateForm.preheader}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, preheader: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="template-active"
                    checked={templateForm.isActive}
                    onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="template-active">Active Template</Label>
                </div>
              </TabsContent>

              <TabsContent value="html" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>HTML Email Content</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (templateForm.htmlBody) {
                          const preview = renderPreview({ ...templateForm } as EmailTemplate)
                          setPreviewTemplate({ ...templateForm, htmlBody: preview } as EmailTemplate)
                          setIsPreviewDialogOpen(true)
                        }
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
                <Textarea
                  placeholder="HTML email template with variables like {COMPANY_NAME}, {USER_NAME}, etc."
                  value={templateForm.htmlBody}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, htmlBody: e.target.value }))}
                  rows={20}
                  className="font-mono text-sm"
                />
                <Alert>
                  <Code className="w-4 h-4" />
                  <AlertDescription>
                    Use variables like {'{COMPANY_NAME}'}, {'{PRIMARY_COLOR}'}, {'{USER_NAME}'} etc. for dynamic content.
                    Branding variables will be automatically replaced.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <Label>Plain Text Version</Label>
                <Textarea
                  placeholder="Plain text version of the email (fallback for clients that don't support HTML)"
                  value={templateForm.textBody}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, textBody: e.target.value }))}
                  rows={15}
                />
                <Alert>
                  <AlignLeft className="w-4 h-4" />
                  <AlertDescription>
                    This version will be shown to users whose email clients don't support HTML emails.
                    Keep it simple and readable.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="variables" className="space-y-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Available Variables</h4>
                    <div className="space-y-3">
                      {templateForm.category && (
                        <>
                          <div>
                            <h5 className="text-sm font-medium mb-2">Common Variables</h5>
                            <div className="grid grid-cols-1 gap-2">
                              {commonVariables.map(variable => (
                                <div key={variable.name} className="flex items-center justify-between p-2 border rounded">
                                  <div>
                                    <code className="text-sm font-mono">{`{${variable.name}}`}</code>
                                    <p className="text-xs text-muted-foreground">{variable.description}</p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {variable.type}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>

                          {categoryVariables[templateForm.category] && (
                            <div>
                              <h5 className="text-sm font-medium mb-2 capitalize">
                                {templateForm.category} Variables
                              </h5>
                              <div className="grid grid-cols-1 gap-2">
                                {categoryVariables[templateForm.category].map(variable => (
                                  <div key={variable.name} className="flex items-center justify-between p-2 border rounded">
                                    <div>
                                      <code className="text-sm font-mono">{`{${variable.name}}`}</code>
                                      <p className="text-xs text-muted-foreground">{variable.description}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {variable.type}
                                      {variable.required && <span className="ml-1 text-red-500">*</span>}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <div>
                        <h5 className="text-sm font-medium mb-2">Branding Variables</h5>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { name: 'COMPANY_NAME', description: 'Your company name from branding settings' },
                            { name: 'PRIMARY_COLOR', description: 'Primary brand color' },
                            { name: 'SECONDARY_COLOR', description: 'Secondary brand color' },
                            { name: 'BACKGROUND_COLOR', description: 'Email background color' },
                            { name: 'TEXT_COLOR', description: 'Main text color' },
                            { name: 'LINK_COLOR', description: 'Link color' },
                            { name: 'FONT_FAMILY', description: 'Email font family' },
                            { name: 'FOOTER_TEXT', description: 'Footer text from branding settings' }
                          ].map(variable => (
                            <div key={variable.name} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <code className="text-sm font-mono">{`{${variable.name}}`}</code>
                                <p className="text-xs text-muted-foreground">{variable.description}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                branding
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTemplate}
              disabled={!templateForm.name || !templateForm.subject || !templateForm.htmlBody}
            >
              <Save className="w-4 h-4 mr-2" />
              {selectedTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Preview how your email will look to recipients
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {previewTemplate && (
              <div className="h-[70vh] overflow-y-auto border rounded">
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ 
                    __html: renderPreview(previewTemplate) 
                  }}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Branding Settings Dialog */}
      <Dialog open={isBrandingDialogOpen} onOpenChange={setIsBrandingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Email Branding Settings
            </DialogTitle>
            <DialogDescription>
              Customize the look and feel of your email templates
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={brandingSettings.companyName}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={brandingSettings.primaryColor}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={brandingSettings.primaryColor}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={brandingSettings.secondaryColor}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={brandingSettings.secondaryColor}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background-color"
                      type="color"
                      value={brandingSettings.backgroundColor}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={brandingSettings.backgroundColor}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={brandingSettings.textColor}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={brandingSettings.textColor}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, textColor: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="font-family">Font Family</Label>
                <Select
                  value={brandingSettings.fontFamily}
                  onValueChange={(value) => setBrandingSettings(prev => ({ ...prev, fontFamily: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter, system-ui, sans-serif">Inter (Modern)</SelectItem>
                    <SelectItem value="Arial, sans-serif">Arial (Classic)</SelectItem>
                    <SelectItem value="Helvetica, Arial, sans-serif">Helvetica (Professional)</SelectItem>
                    <SelectItem value="Georgia, serif">Georgia (Traditional)</SelectItem>
                    <SelectItem value="'Times New Roman', serif">Times New Roman (Formal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="footer-text">Footer Text</Label>
                <Textarea
                  id="footer-text"
                  placeholder="© 2024 Your Company. All rights reserved."
                  value={brandingSettings.footerText}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, footerText: e.target.value }))}
                  rows={2}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Social Links (Optional)</Label>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="website-url" className="text-xs">Website</Label>
                    <Input
                      id="website-url"
                      placeholder="https://yourcompany.com"
                      value={brandingSettings.socialLinks.website || ''}
                      onChange={(e) => setBrandingSettings(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, website: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin-url" className="text-xs">LinkedIn</Label>
                    <Input
                      id="linkedin-url"
                      placeholder="https://linkedin.com/company/yourcompany"
                      value={brandingSettings.socialLinks.linkedin || ''}
                      onChange={(e) => setBrandingSettings(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter-url" className="text-xs">Twitter</Label>
                    <Input
                      id="twitter-url"
                      placeholder="https://twitter.com/yourcompany"
                      value={brandingSettings.socialLinks.twitter || ''}
                      onChange={(e) => setBrandingSettings(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBrandingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBranding}>
              <Sparkle className="w-4 h-4 mr-2" />
              Save Branding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}