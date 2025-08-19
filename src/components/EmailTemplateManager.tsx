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
  Warning,
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
  accentColor: string
  backgroundColor: string
  textColor: string
  linkColor: string
  borderColor: string
  buttonStyle: 'rounded' | 'square' | 'pill'
  fontFamily: string
  headerImage?: string
  footerText: string
  footerLinks: Array<{ label: string; url: string }>
  socialLinks: {
    linkedin?: string
    twitter?: string
    website?: string
    facebook?: string
    instagram?: string
  }
  customCSS?: string
  logoWidth?: number
  headerHeight?: number
  contentPadding: number
  borderRadius: number
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
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  linkColor: '#2563eb',
  borderColor: '#e2e8f0',
  buttonStyle: 'rounded',
  fontFamily: 'Inter, system-ui, sans-serif',
  footerText: '© 2024 VirtualBackroom. All rights reserved.',
  footerLinks: [
    { label: 'Privacy Policy', url: 'https://virtualbackroom.com/privacy' },
    { label: 'Terms of Service', url: 'https://virtualbackroom.com/terms' }
  ],
  socialLinks: {},
  logoWidth: 200,
  headerHeight: 80,
  contentPadding: 24,
  borderRadius: 8
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
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{SUBJECT}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      font-family: {FONT_FAMILY};
      background-color: {BACKGROUND_COLOR};
      margin: 0;
      padding: {CONTENT_PADDING}px;
      line-height: 1.6;
      color: {TEXT_COLOR};
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: {BORDER_RADIUS}px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .email-header {
      background: linear-gradient(135deg, {PRIMARY_COLOR} 0%, {ACCENT_COLOR} 100%);
      color: white;
      padding: {CONTENT_PADDING}px;
      text-align: center;
      min-height: {HEADER_HEIGHT}px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    
    .company-logo {
      width: {LOGO_WIDTH}px;
      height: auto;
      margin-bottom: 16px;
    }
    
    .email-content {
      padding: {CONTENT_PADDING}px;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 20px;
      border-radius: {BORDER_RADIUS}px;
      border-left: 4px solid {ACCENT_COLOR};
      margin: 24px 0;
    }
    
    .cta-button {
      background: linear-gradient(135deg, {PRIMARY_COLOR} 0%, {ACCENT_COLOR} 100%);
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: {BUTTON_RADIUS}px;
      display: inline-block;
      font-weight: 600;
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }
    
    .stat-item {
      text-align: center;
      padding: 16px;
      background-color: #f8fafc;
      border-radius: {BORDER_RADIUS}px;
      border: 1px solid {BORDER_COLOR};
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: {PRIMARY_COLOR};
      display: block;
    }
    
    .stat-label {
      font-size: 12px;
      color: {SECONDARY_COLOR};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .email-footer {
      background-color: #f8fafc;
      padding: 24px;
      border-top: 1px solid {BORDER_COLOR};
      text-align: center;
    }
    
    .social-links {
      margin: 16px 0;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      padding: 8px;
      background-color: {PRIMARY_COLOR};
      color: white;
      border-radius: 50%;
      text-decoration: none;
      width: 32px;
      height: 32px;
      line-height: 16px;
      text-align: center;
    }
    
    .footer-links {
      margin: 12px 0;
    }
    
    .footer-links a {
      color: {LINK_COLOR};
      text-decoration: none;
      margin: 0 12px;
      font-size: 12px;
    }
    
    @media (max-width: 600px) {
      body {
        padding: 12px;
      }
      
      .email-header,
      .email-content {
        padding: 16px;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    
    <!-- Header -->
    <div class="email-header">
      {COMPANY_LOGO}
      <h1 style="margin: 0; font-size: 28px; font-weight: 700;">{COMPANY_NAME}</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.95; font-size: 16px;">Learning Resource Update</p>
    </div>
    
    <!-- Content -->
    <div class="email-content">
      <h2 style="color: {TEXT_COLOR}; font-size: 24px; margin: 0 0 16px 0; font-weight: 600;">
        🎉 New Resources from {PLATFORM_NAME}
      </h2>
      
      <p style="color: {TEXT_COLOR}; margin: 0 0 24px 0; font-size: 16px;">
        Hi {USER_NAME},
      </p>
      
      <p style="color: {TEXT_COLOR}; margin: 0 0 24px 0; font-size: 16px;">
        We've just synced <strong style="color: {PRIMARY_COLOR};">{RESOURCE_COUNT} new learning resources</strong> from {PLATFORM_NAME} to your VirtualBackroom library!
      </p>
      
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">{RESOURCE_COUNT}</span>
          <span class="stat-label">Resources</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{PLATFORM_NAME}</span>
          <span class="stat-label">Platform</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{SYNC_TIME}</span>
          <span class="stat-label">Synced</span>
        </div>
      </div>
      
      <div class="highlight-box">
        <h3 style="color: {TEXT_COLOR}; font-size: 18px; margin: 0 0 12px 0; font-weight: 600;">📚 New Resources:</h3>
        {RESOURCE_LIST}
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="{DASHBOARD_URL}" class="cta-button">
          Explore New Resources
        </a>
      </div>
      
      <p style="color: {SECONDARY_COLOR}; font-size: 14px; margin: 24px 0 0 0; text-align: center; font-style: italic;">
        Keep learning and stay compliant! 🚀
      </p>
    </div>
    
    <!-- Footer -->
    <div class="email-footer">
      <div class="social-links">
        {SOCIAL_LINKS}
      </div>
      
      <div class="footer-links">
        {FOOTER_LINKS}
      </div>
      
      <p style="color: {SECONDARY_COLOR}; font-size: 12px; margin: 12px 0 0 0;">
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
  },
  
  {
    id: 'sync-error-alert',
    name: 'Sync Error Alert',
    description: 'Alert notification when resource sync fails',
    category: 'alerts',
    subject: 'Action Required: {PLATFORM_NAME} Sync Failed',
    preheader: 'We encountered an issue syncing your learning resources',
    htmlBody: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{SUBJECT}</title>
  <style>
    body {
      font-family: {FONT_FAMILY};
      background-color: {BACKGROUND_COLOR};
      margin: 0;
      padding: {CONTENT_PADDING}px;
      line-height: 1.6;
      color: {TEXT_COLOR};
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: {BORDER_RADIUS}px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
      border-top: 4px solid #ef4444;
    }
    
    .email-header {
      background-color: #fef2f2;
      color: #991b1b;
      padding: {CONTENT_PADDING}px;
      text-align: center;
    }
    
    .alert-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .email-content {
      padding: {CONTENT_PADDING}px;
    }
    
    .error-box {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      padding: 16px;
      border-radius: {BORDER_RADIUS}px;
      margin: 16px 0;
    }
    
    .cta-button {
      background-color: #ef4444;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: {BUTTON_RADIUS}px;
      display: inline-block;
      font-weight: 600;
    }
    
    .secondary-button {
      background-color: transparent;
      color: {PRIMARY_COLOR};
      border: 2px solid {PRIMARY_COLOR};
      padding: 10px 22px;
      text-decoration: none;
      border-radius: {BUTTON_RADIUS}px;
      display: inline-block;
      font-weight: 600;
      margin-left: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="alert-icon">⚠️</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">{COMPANY_NAME}</h1>
      <p style="margin: 8px 0 0 0; font-size: 16px;">Sync Issue Alert</p>
    </div>
    
    <div class="email-content">
      <h2 style="color: #991b1b; font-size: 20px; margin: 0 0 16px 0;">
        Sync Failed for {PLATFORM_NAME}
      </h2>
      
      <p>Hi {USER_NAME},</p>
      
      <p>We encountered an issue while trying to sync learning resources from {PLATFORM_NAME}.</p>
      
      <div class="error-box">
        <h4 style="margin: 0 0 8px 0; color: #991b1b;">Error Details:</h4>
        <p style="margin: 0; font-family: monospace; font-size: 14px;">{ERROR_MESSAGE}</p>
      </div>
      
      <h4>What to do next:</h4>
      <p>{ACTION_REQUIRED}</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="{DASHBOARD_URL}" class="cta-button">Fix Integration</a>
        <a href="{DASHBOARD_URL}" class="secondary-button">View Details</a>
      </div>
    </div>
  </div>
</body>
</html>`,
    textBody: `Sync Failed for {PLATFORM_NAME}

Hi {USER_NAME},

We encountered an issue while syncing learning resources from {PLATFORM_NAME}.

Error: {ERROR_MESSAGE}

What to do: {ACTION_REQUIRED}

Fix the issue: {DASHBOARD_URL}

{FOOTER_TEXT}`,
    variables: [...commonVariables, ...categoryVariables.alerts],
    branding: defaultBranding,
    isDefault: true,
    isActive: true,
    version: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0
  },
  
  {
    id: 'weekly-digest',
    name: 'Weekly Learning Digest',
    description: 'Weekly summary of learning progress and new resources',
    category: 'reminders',
    subject: 'Your Weekly Learning Digest - {CURRENT_DATE}',
    preheader: 'This week\'s learning highlights and new resources',
    htmlBody: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{SUBJECT}</title>
  <style>
    body {
      font-family: {FONT_FAMILY};
      background-color: {BACKGROUND_COLOR};
      margin: 0;
      padding: {CONTENT_PADDING}px;
      line-height: 1.6;
      color: {TEXT_COLOR};
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: {BORDER_RADIUS}px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .digest-header {
      background: linear-gradient(135deg, {PRIMARY_COLOR} 0%, {SECONDARY_COLOR} 100%);
      color: white;
      padding: {CONTENT_PADDING}px;
      text-align: center;
    }
    
    .week-badge {
      background-color: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      margin-bottom: 16px;
      display: inline-block;
    }
    
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }
    
    .metric-card {
      background-color: #f8fafc;
      padding: 16px;
      border-radius: {BORDER_RADIUS}px;
      text-align: center;
      border: 1px solid {BORDER_COLOR};
    }
    
    .metric-number {
      font-size: 28px;
      font-weight: 700;
      color: {ACCENT_COLOR};
      display: block;
      margin-bottom: 4px;
    }
    
    .section-header {
      background-color: #f8fafc;
      padding: 12px 16px;
      margin: 24px -24px 16px -24px;
      font-weight: 600;
      color: {PRIMARY_COLOR};
      border-left: 4px solid {ACCENT_COLOR};
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="digest-header">
      {COMPANY_LOGO}
      <div class="week-badge">Week of {CURRENT_DATE}</div>
      <h1 style="margin: 0; font-size: 24px;">Weekly Learning Digest</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">Your learning journey continues</p>
    </div>
    
    <div style="padding: {CONTENT_PADDING}px;">
      <p>Hi {USER_NAME},</p>
      
      <p>Here's your weekly learning summary and what's new in your library:</p>
      
      <div class="metric-grid">
        <div class="metric-card">
          <span class="metric-number">12</span>
          <span style="font-size: 12px; color: {SECONDARY_COLOR};">New Resources</span>
        </div>
        <div class="metric-card">
          <span class="metric-number">4</span>
          <span style="font-size: 12px; color: {SECONDARY_COLOR};">Hours Learned</span>
        </div>
        <div class="metric-card">
          <span class="metric-number">85%</span>
          <span style="font-size: 12px; color: {SECONDARY_COLOR};">Completion Rate</span>
        </div>
      </div>
      
      <div class="section-header">🎯 This Week's Highlights</div>
      <ul style="margin: 0 0 24px 16px; padding: 0;">
        <li style="margin-bottom: 8px;">Completed 3 compliance training modules</li>
        <li style="margin-bottom: 8px;">New ISO 27001 certification path available</li>
        <li style="margin-bottom: 8px;">Updated GDPR training materials synced</li>
      </ul>
      
      <div class="section-header">📚 New This Week</div>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: {BORDER_RADIUS}px; margin-bottom: 24px;">
        {RESOURCE_LIST}
      </div>
      
      <div style="text-align: center;">
        <a href="{DASHBOARD_URL}" style="background: linear-gradient(135deg, {PRIMARY_COLOR} 0%, {ACCENT_COLOR} 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: {BUTTON_RADIUS}px; display: inline-block; font-weight: 600;">
          View Full Dashboard
        </a>
      </div>
      
      <p style="text-align: center; color: {SECONDARY_COLOR}; font-size: 14px; margin-top: 24px;">
        Keep up the great work! 🌟
      </p>
    </div>
    
    <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid {BORDER_COLOR};">
      <p style="color: {SECONDARY_COLOR}; font-size: 12px; margin: 0;">
        {FOOTER_TEXT}
      </p>
    </div>
  </div>
</body>
</html>`,
    textBody: `Weekly Learning Digest - {CURRENT_DATE}

Hi {USER_NAME},

This Week's Highlights:
- Completed 3 compliance training modules
- New ISO 27001 certification path available
- Updated GDPR training materials synced

New This Week:
{RESOURCE_LIST}

View your full dashboard: {DASHBOARD_URL}

Keep up the great work!

{FOOTER_TEXT}`,
    variables: [...commonVariables, ...categoryVariables.resources],
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

  const handleExportTemplates = () => {
    const exportData = {
      templates: templates,
      branding: brandingSettings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-templates-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Templates exported successfully')
  }

  const handleImportTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string)
        
        if (importData.templates) {
          const importedTemplates = importData.templates.map((template: EmailTemplate) => ({
            ...template,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            isDefault: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0
          }))
          
          setTemplates(current => [...current, ...importedTemplates])
          toast.success(`Imported ${importedTemplates.length} templates`)
        }
        
        if (importData.branding) {
          setBrandingSettings(importData.branding)
          toast.success('Branding settings imported')
        }
      } catch (error) {
        toast.error('Failed to import templates. Please check the file format.')
      }
    }
    
    reader.readAsText(file)
  }

  const handleSendTestEmail = async (template: EmailTemplate) => {
    try {
      // In a real application, this would send a test email
      // For now, we'll just show a success message
      toast.success(`Test email sent for template: ${template.name}`)
    } catch (error) {
      toast.error('Failed to send test email')
    }
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
    preview = preview.replace(/\{ACCENT_COLOR\}/g, template.branding.accentColor || template.branding.primaryColor)
    preview = preview.replace(/\{BACKGROUND_COLOR\}/g, template.branding.backgroundColor)
    preview = preview.replace(/\{TEXT_COLOR\}/g, template.branding.textColor)
    preview = preview.replace(/\{LINK_COLOR\}/g, template.branding.linkColor)
    preview = preview.replace(/\{BORDER_COLOR\}/g, template.branding.borderColor || '#e2e8f0')
    preview = preview.replace(/\{FONT_FAMILY\}/g, template.branding.fontFamily)
    preview = preview.replace(/\{FOOTER_TEXT\}/g, template.branding.footerText)
    preview = preview.replace(/\{CONTENT_PADDING\}/g, (template.branding.contentPadding || 24).toString())
    preview = preview.replace(/\{BORDER_RADIUS\}/g, (template.branding.borderRadius || 8).toString())
    preview = preview.replace(/\{LOGO_WIDTH\}/g, (template.branding.logoWidth || 200).toString())
    preview = preview.replace(/\{HEADER_HEIGHT\}/g, (template.branding.headerHeight || 80).toString())
    
    // Handle button style
    let buttonRadius = template.branding.borderRadius || 8
    if (template.branding.buttonStyle === 'pill') buttonRadius = 50
    if (template.branding.buttonStyle === 'square') buttonRadius = 0
    preview = preview.replace(/\{BUTTON_RADIUS\}/g, buttonRadius.toString())
    
    // Handle company logo
    const logoHtml = template.branding.companyLogo 
      ? `<img src="${template.branding.companyLogo}" alt="${template.branding.companyName}" class="company-logo" />` 
      : ''
    preview = preview.replace(/\{COMPANY_LOGO\}/g, logoHtml)
    
    // Handle social links
    const socialLinksHtml = Object.entries(template.branding.socialLinks)
      .filter(([_, url]) => url)
      .map(([platform, url]) => {
        const icons: Record<string, string> = {
          website: '🌐',
          linkedin: '💼',
          twitter: '🐦',
          facebook: '📘',
          instagram: '📸'
        }
        return `<a href="${url}" title="${platform}">${icons[platform] || '🔗'}</a>`
      })
      .join('')
    preview = preview.replace(/\{SOCIAL_LINKS\}/g, socialLinksHtml)
    
    // Handle footer links
    const footerLinksHtml = template.branding.footerLinks
      ?.map(link => `<a href="${link.url}">${link.label}</a>`)
      .join('') || ''
    preview = preview.replace(/\{FOOTER_LINKS\}/g, footerLinksHtml)
    
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
          <Button
            variant="outline"
            onClick={handleExportTemplates}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
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
                        onClick={() => handleSendTestEmail(template)}
                        title="Send test email"
                      >
                        <Mail className="w-4 h-4" />
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

      {/* Import Template Input (Hidden) */}
      <input
        type="file"
        accept=".json"
        onChange={handleImportTemplates}
        style={{ display: 'none' }}
        id="template-import"
      />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById('template-import')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Templates
            </Button>
            <Button
              variant="outline"
              onClick={handleExportTemplates}
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Templates
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const activeTemplates = templates.filter(t => t.isActive)
                if (activeTemplates.length > 0) {
                  toast.success(`${activeTemplates.length} active templates ready to use`)
                } else {
                  toast.warning('No active templates found')
                }
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Check Active Templates
            </Button>
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
                            { name: 'COMPANY_LOGO', description: 'Company logo image HTML element' },
                            { name: 'PRIMARY_COLOR', description: 'Primary brand color' },
                            { name: 'SECONDARY_COLOR', description: 'Secondary brand color' },
                            { name: 'ACCENT_COLOR', description: 'Accent/highlight color' },
                            { name: 'BACKGROUND_COLOR', description: 'Email background color' },
                            { name: 'TEXT_COLOR', description: 'Main text color' },
                            { name: 'LINK_COLOR', description: 'Link color' },
                            { name: 'BORDER_COLOR', description: 'Border color for elements' },
                            { name: 'FONT_FAMILY', description: 'Email font family' },
                            { name: 'FOOTER_TEXT', description: 'Footer text from branding settings' },
                            { name: 'SOCIAL_LINKS', description: 'Social media links HTML' },
                            { name: 'FOOTER_LINKS', description: 'Footer navigation links' },
                            { name: 'CONTENT_PADDING', description: 'Content padding in pixels' },
                            { name: 'BORDER_RADIUS', description: 'Border radius for elements' },
                            { name: 'BUTTON_RADIUS', description: 'Button border radius based on style' },
                            { name: 'LOGO_WIDTH', description: 'Company logo width in pixels' },
                            { name: 'HEADER_HEIGHT', description: 'Email header height in pixels' }
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
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
              </TabsList>

              <TabsContent value="colors" className="space-y-4">
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
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={brandingSettings.accentColor}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={brandingSettings.accentColor}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Used for buttons and highlights</p>
                  </div>

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
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <Label htmlFor="link-color">Link Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="link-color"
                        type="color"
                        value={brandingSettings.linkColor}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, linkColor: e.target.value }))}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={brandingSettings.linkColor}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, linkColor: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="border-color">Border Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="border-color"
                      type="color"
                      value={brandingSettings.borderColor}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, borderColor: e.target.value }))}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={brandingSettings.borderColor}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, borderColor: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
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
                      <SelectItem value="'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">SF Pro (Apple-style)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="button-style">Button Style</Label>
                  <Select
                    value={brandingSettings.buttonStyle}
                    onValueChange={(value: any) => setBrandingSettings(prev => ({ ...prev, buttonStyle: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded">Rounded (8px radius)</SelectItem>
                      <SelectItem value="pill">Pill (50px radius)</SelectItem>
                      <SelectItem value="square">Square (0px radius)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="content-padding">Content Padding (px)</Label>
                    <Input
                      id="content-padding"
                      type="number"
                      min="8"
                      max="48"
                      value={brandingSettings.contentPadding}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, contentPadding: parseInt(e.target.value) || 24 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="border-radius">Border Radius (px)</Label>
                    <Input
                      id="border-radius"
                      type="number"
                      min="0"
                      max="24"
                      value={brandingSettings.borderRadius}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, borderRadius: parseInt(e.target.value) || 8 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo-width">Logo Width (px)</Label>
                    <Input
                      id="logo-width"
                      type="number"
                      min="100"
                      max="400"
                      value={brandingSettings.logoWidth}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, logoWidth: parseInt(e.target.value) || 200 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="header-height">Header Height (px)</Label>
                    <Input
                      id="header-height"
                      type="number"
                      min="60"
                      max="200"
                      value={brandingSettings.headerHeight}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, headerHeight: parseInt(e.target.value) || 80 }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={brandingSettings.companyName}
                    onChange={(e) => setBrandingSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="company-logo">Company Logo URL</Label>
                  <Input
                    id="company-logo"
                    placeholder="https://yourcompany.com/logo.png"
                    value={brandingSettings.companyLogo || ''}
                    onChange={(e) => setBrandingSettings(prev => ({ ...prev, companyLogo: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional: URL to your company logo image
                  </p>
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

                <div>
                  <Label className="text-sm font-medium mb-2 block">Footer Links</Label>
                  <div className="space-y-2">
                    {brandingSettings.footerLinks?.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Link label"
                          value={link.label}
                          onChange={(e) => {
                            const newLinks = [...(brandingSettings.footerLinks || [])]
                            newLinks[index] = { ...link, label: e.target.value }
                            setBrandingSettings(prev => ({ ...prev, footerLinks: newLinks }))
                          }}
                        />
                        <Input
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...(brandingSettings.footerLinks || [])]
                            newLinks[index] = { ...link, url: e.target.value }
                            setBrandingSettings(prev => ({ ...prev, footerLinks: newLinks }))
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newLinks = brandingSettings.footerLinks?.filter((_, i) => i !== index) || []
                            setBrandingSettings(prev => ({ ...prev, footerLinks: newLinks }))
                          }}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    )) || []}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newLinks = [...(brandingSettings.footerLinks || []), { label: '', url: '' }]
                        setBrandingSettings(prev => ({ ...prev, footerLinks: newLinks }))
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Footer Link
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Social Media Links</Label>
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
                    <div>
                      <Label htmlFor="facebook-url" className="text-xs">Facebook</Label>
                      <Input
                        id="facebook-url"
                        placeholder="https://facebook.com/yourcompany"
                        value={brandingSettings.socialLinks.facebook || ''}
                        onChange={(e) => setBrandingSettings(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram-url" className="text-xs">Instagram</Label>
                      <Input
                        id="instagram-url"
                        placeholder="https://instagram.com/yourcompany"
                        value={brandingSettings.socialLinks.instagram || ''}
                        onChange={(e) => setBrandingSettings(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="custom-css">Custom CSS (Advanced)</Label>
                  <Textarea
                    id="custom-css"
                    placeholder="/* Add custom CSS styles here */"
                    value={brandingSettings.customCSS || ''}
                    onChange={(e) => setBrandingSettings(prev => ({ ...prev, customCSS: e.target.value }))}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <Alert className="mt-2">
                    <Code className="w-4 h-4" />
                    <AlertDescription>
                      Advanced: Add custom CSS to override default styling. Use with caution to maintain email compatibility.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </Tabs>
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