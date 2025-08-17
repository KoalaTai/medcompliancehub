import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  GitBranch as Workflow,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  Target,
  Brain,
  ArrowRight,
  FileText,
  Lightbulb,
  GitBranch,
  Repeat,
  Shield,
  TrendUp,
  Eye,
  Play,
  Pause,
  Settings,
  Download,
  Filter
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { WorkflowTemplateManager } from '@/components/WorkflowTemplateManager'
import { AutomatedWorkflowConfiguration } from '@/components/AutomatedWorkflowConfiguration'
import { FrameworkConfigurationStatus } from '@/components/FrameworkConfigurationStatus'
import { AITemplateOptimizer } from '@/components/AITemplateOptimizer'
import { toast } from 'sonner'

interface CAPAWorkflow {
  id: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  sourceGapId?: string
  sourceType: 'gap-analysis' | 'manual' | 'audit-finding' | 'incident' | 'risk-assessment'
  
  // CAPA Details
  rootCause: string
  correctiveActions: CAPAAction[]
  preventiveActions: CAPAAction[]
  
  // Workflow Management
  assignedTo: string
  reviewerIds: string[]
  dueDate: string
  startDate: string
  completionDate?: string
  
  // Progress Tracking
  totalSteps: number
  completedSteps: number
  
  // Compliance
  regulatoryFrameworks: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  
  // Dependencies
  dependsOn: string[]
  blocks: string[]
  
  // Automation
  automatedChecks: AutomatedCheck[]
  notifications: NotificationRule[]
  
  metadata: {
    createdAt: string
    createdBy: string
    lastUpdated: string
    estimatedEffort: string
    actualEffort?: string
    tags: string[]
  }
}

interface CAPAAction {
  id: string
  type: 'corrective' | 'preventive'
  title: string
  description: string
  assignedTo: string
  dueDate: string
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue'
  evidence: Evidence[]
  dependencies: string[]
  verificationCriteria: string[]
  estimatedHours: number
  actualHours?: number
}

interface Evidence {
  id: string
  type: 'document' | 'test-result' | 'photo' | 'report' | 'training-record'
  title: string
  description: string
  filePath?: string
  uploadedAt: string
  uploadedBy: string
  verified: boolean
}

interface AutomatedCheck {
  id: string
  name: string
  description: string
  type: 'document-review' | 'deadline-monitor' | 'effectiveness-check' | 'risk-assessment'
  frequency: 'daily' | 'weekly' | 'monthly'
  lastRun?: string
  nextRun: string
  status: 'active' | 'paused' | 'failed'
  parameters: Record<string, any>
}

interface NotificationRule {
  id: string
  trigger: 'deadline-approaching' | 'overdue' | 'milestone-reached' | 'approval-needed'
  recipients: string[]
  advanceNotice?: number // days before
  message: string
  active: boolean
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  framework: string
  category: 'design-control' | 'risk-management' | 'quality-management' | 'corrective-action' | 'validation'
  difficulty: 'basic' | 'intermediate' | 'advanced'
  
  defaultActions: {
    corrective: Omit<CAPAAction, 'id' | 'assignedTo' | 'dueDate' | 'evidence' | 'status'>[]
    preventive: Omit<CAPAAction, 'id' | 'assignedTo' | 'dueDate' | 'evidence' | 'status'>[]
  }
  
  automatedChecks: Omit<AutomatedCheck, 'id' | 'nextRun' | 'lastRun'>[]
  notifications: Omit<NotificationRule, 'id'>[]
  
  requiredRoles: string[]
  estimatedDuration: number // days
  criticality: 'low' | 'medium' | 'high' | 'critical'
  
  metadata: {
    version: string
    lastUpdated: string
    usage: number
    effectiveness: number // percentage
    tags: string[]
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Quality Manager', department: 'Quality' },
  { id: '2', name: 'Mike Chen', email: 'mike@company.com', role: 'Regulatory Affairs', department: 'Regulatory' },
  { id: '3', name: 'Lisa Rodriguez', email: 'lisa@company.com', role: 'Process Engineer', department: 'Engineering' },
  { id: '4', name: 'David Kim', email: 'david@company.com', role: 'QA Specialist', department: 'Quality' }
]

const priorityColors = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-orange-500 text-white',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-muted text-muted-foreground'
}

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-primary text-primary-foreground',
  completed: 'bg-secondary text-secondary-foreground',
  cancelled: 'bg-destructive/20 text-destructive'
}

// Framework-specific workflow templates
const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'iso13485-design-control',
    name: 'ISO 13485 Design Control CAPA',
    description: 'Comprehensive template for design control deficiencies under ISO 13485',
    framework: 'ISO 13485',
    category: 'design-control',
    difficulty: 'intermediate',
    
    defaultActions: {
      corrective: [
        {
          type: 'corrective',
          title: 'Complete Design History File (DHF)',
          description: 'Identify and compile all missing DHF documentation including design inputs, outputs, reviews, and verification/validation records',
          dependencies: [],
          verificationCriteria: [
            'All design inputs documented and traceable',
            'Design outputs complete and verified',
            'Design reviews conducted at appropriate stages',
            'Design verification and validation documented'
          ],
          estimatedHours: 32
        },
        {
          type: 'corrective',
          title: 'Update Design Control Procedures',
          description: 'Revise existing procedures to ensure compliance with ISO 13485 Section 7.3 requirements',
          dependencies: [],
          verificationCriteria: [
            'Procedures updated to current standards',
            'Design control process clearly defined',
            'Responsibilities and authorities assigned',
            'Document control integrated'
          ],
          estimatedHours: 16
        }
      ],
      preventive: [
        {
          type: 'preventive',
          title: 'Implement Design Control Checklist',
          description: 'Create and deploy standardized checklists for each design phase to prevent future gaps',
          dependencies: [],
          verificationCriteria: [
            'Checklist covers all design phases',
            'Templates created for consistent documentation',
            'Staff trained on new process',
            'Integration with existing systems complete'
          ],
          estimatedHours: 20
        },
        {
          type: 'preventive',
          title: 'Establish Design Review Schedule',
          description: 'Create automated scheduling system for mandatory design reviews at critical milestones',
          dependencies: [],
          verificationCriteria: [
            'Review schedule defined and documented',
            'Automated reminders configured',
            'Review criteria standardized',
            'Escalation procedures established'
          ],
          estimatedHours: 12
        }
      ]
    },
    
    automatedChecks: [
      {
        name: 'DHF Completeness Check',
        description: 'Weekly verification that all required DHF elements are present',
        type: 'document-review',
        frequency: 'weekly',
        status: 'active',
        parameters: { requiredDocuments: ['design_inputs', 'design_outputs', 'design_review', 'verification', 'validation'] }
      },
      {
        name: 'Design Review Schedule Monitor',
        description: 'Monitor upcoming design review deadlines and send reminders',
        type: 'deadline-monitor',
        frequency: 'daily',
        status: 'active',
        parameters: { advanceNotice: 5, milestones: ['concept_review', 'detailed_review', 'final_review'] }
      }
    ],
    
    notifications: [
      {
        trigger: 'deadline-approaching',
        recipients: ['design-team', 'quality-manager'],
        advanceNotice: 7,
        message: 'Design control CAPA milestone approaching: {action} due in {days} days',
        active: true
      },
      {
        trigger: 'milestone-reached',
        recipients: ['quality-manager', 'regulatory-affairs'],
        message: 'Design control CAPA milestone completed: {milestone}',
        active: true
      }
    ],
    
    requiredRoles: ['Quality Manager', 'Design Engineer', 'Regulatory Affairs'],
    estimatedDuration: 45,
    criticality: 'high',
    
    metadata: {
      version: '2.1',
      lastUpdated: '2024-01-15',
      usage: 23,
      effectiveness: 89,
      tags: ['design-control', 'dhf', 'iso13485', 'documentation']
    }
  },
  
  {
    id: 'fda-qsr-risk-management',
    name: 'FDA QSR Risk Management CAPA',
    description: 'Template for risk management process improvements under FDA 21 CFR 820',
    framework: 'FDA 21 CFR 820',
    category: 'risk-management',
    difficulty: 'advanced',
    
    defaultActions: {
      corrective: [
        {
          type: 'corrective',
          title: 'Complete Risk Analysis Documentation',
          description: 'Document comprehensive risk analysis covering all device hazards and use scenarios',
          dependencies: [],
          verificationCriteria: [
            'All potential hazards identified',
            'Risk analysis covers intended use and reasonably foreseeable misuse',
            'Risk evaluation criteria defined',
            'Risk acceptability determined for each hazard'
          ],
          estimatedHours: 40
        },
        {
          type: 'corrective',
          title: 'Implement Risk Control Measures',
          description: 'Deploy identified risk control measures and verify their effectiveness',
          dependencies: [],
          verificationCriteria: [
            'Risk control measures implemented',
            'Residual risk evaluated',
            'Risk control effectiveness verified',
            'Risk-benefit analysis completed where applicable'
          ],
          estimatedHours: 56
        }
      ],
      preventive: [
        {
          type: 'preventive',
          title: 'Establish Risk Management Process',
          description: 'Create systematic risk management process for ongoing product lifecycle',
          dependencies: [],
          verificationCriteria: [
            'Risk management process documented',
            'Risk management plan template created',
            'Periodic risk review schedule established',
            'Post-market surveillance integration defined'
          ],
          estimatedHours: 28
        },
        {
          type: 'preventive',
          title: 'Deploy Risk Management Training',
          description: 'Train relevant personnel on risk management requirements and procedures',
          dependencies: [],
          verificationCriteria: [
            'Training program developed',
            'All relevant personnel trained',
            'Training effectiveness verified',
            'Ongoing training schedule established'
          ],
          estimatedHours: 16
        }
      ]
    },
    
    automatedChecks: [
      {
        name: 'Risk File Completeness',
        description: 'Monitor risk management file for completeness and currency',
        type: 'document-review',
        frequency: 'monthly',
        status: 'active',
        parameters: { requiredSections: ['risk_analysis', 'risk_evaluation', 'risk_control', 'residual_risk'] }
      },
      {
        name: 'Risk Review Schedule',
        description: 'Automated scheduling of periodic risk reviews',
        type: 'deadline-monitor',
        frequency: 'weekly',
        status: 'active',
        parameters: { reviewFrequency: 'quarterly', advanceNotice: 14 }
      }
    ],
    
    notifications: [
      {
        trigger: 'deadline-approaching',
        recipients: ['risk-manager', 'quality-assurance'],
        advanceNotice: 10,
        message: 'Risk management CAPA action due: {action} requires completion in {days} days',
        active: true
      },
      {
        trigger: 'approval-needed',
        recipients: ['regulatory-affairs', 'quality-manager'],
        message: 'Risk management CAPA requires regulatory review and approval',
        active: true
      }
    ],
    
    requiredRoles: ['Risk Manager', 'Quality Assurance', 'Regulatory Affairs', 'Engineering'],
    estimatedDuration: 60,
    criticality: 'critical',
    
    metadata: {
      version: '1.8',
      lastUpdated: '2024-01-10',
      usage: 15,
      effectiveness: 94,
      tags: ['risk-management', 'fda-qsr', 'hazard-analysis', 'risk-control']
    }
  },
  
  {
    id: 'eu-mdr-validation',
    name: 'EU MDR Validation CAPA',
    description: 'Template for addressing validation deficiencies under EU MDR requirements',
    framework: 'EU MDR',
    category: 'validation',
    difficulty: 'intermediate',
    
    defaultActions: {
      corrective: [
        {
          type: 'corrective',
          title: 'Complete Clinical Evaluation Update',
          description: 'Update clinical evaluation to comply with EU MDR requirements including post-market data',
          dependencies: [],
          verificationCriteria: [
            'Clinical evaluation report updated',
            'Literature review conducted per MEDDEV 2.7.1',
            'Post-market clinical data incorporated',
            'Clinical evidence sufficiency demonstrated'
          ],
          estimatedHours: 80
        },
        {
          type: 'corrective',
          title: 'Update Technical Documentation',
          description: 'Align technical documentation with EU MDR Annex II and III requirements',
          dependencies: [],
          verificationCriteria: [
            'Technical documentation structure compliant',
            'All required sections completed',
            'Supporting evidence provided',
            'Notified body requirements addressed'
          ],
          estimatedHours: 64
        }
      ],
      preventive: [
        {
          type: 'preventive',
          title: 'Establish Clinical Evidence Plan',
          description: 'Create systematic approach for ongoing clinical evidence generation',
          dependencies: [],
          verificationCriteria: [
            'Clinical evidence plan documented',
            'Data collection procedures established',
            'Clinical evaluation update schedule defined',
            'Post-market surveillance integration planned'
          ],
          estimatedHours: 24
        },
        {
          type: 'preventive',
          title: 'Implement MDR Compliance Monitoring',
          description: 'Deploy systematic monitoring for ongoing EU MDR compliance',
          dependencies: [],
          verificationCriteria: [
            'Compliance monitoring system established',
            'Key performance indicators defined',
            'Automated alerts configured',
            'Regular compliance reviews scheduled'
          ],
          estimatedHours: 20
        }
      ]
    },
    
    automatedChecks: [
      {
        name: 'Clinical Evaluation Currency',
        description: 'Monitor clinical evaluation update requirements based on MDR timelines',
        type: 'deadline-monitor',
        frequency: 'monthly',
        status: 'active',
        parameters: { updateFrequency: 'annual', criticalDevices: 'continuous' }
      },
      {
        name: 'MDR Documentation Check',
        description: 'Verify technical documentation completeness against MDR requirements',
        type: 'document-review',
        frequency: 'weekly',
        status: 'active',
        parameters: { requiredSections: ['device_description', 'clinical_evaluation', 'risk_management', 'design_verification'] }
      }
    ],
    
    notifications: [
      {
        trigger: 'deadline-approaching',
        recipients: ['regulatory-affairs', 'clinical-affairs'],
        advanceNotice: 30,
        message: 'EU MDR compliance deadline approaching: {action} due in {days} days',
        active: true
      },
      {
        trigger: 'milestone-reached',
        recipients: ['quality-manager', 'regulatory-affairs'],
        message: 'EU MDR CAPA milestone achieved: {milestone} completed successfully',
        active: true
      }
    ],
    
    requiredRoles: ['Regulatory Affairs', 'Clinical Affairs', 'Quality Manager', 'Notified Body Liaison'],
    estimatedDuration: 90,
    criticality: 'critical',
    
    metadata: {
      version: '3.0',
      lastUpdated: '2024-01-12',
      usage: 8,
      effectiveness: 86,
      tags: ['eu-mdr', 'clinical-evaluation', 'validation', 'technical-documentation']
    }
  },
  
  {
    id: 'iso14971-basic',
    name: 'ISO 14971 Basic Risk Management',
    description: 'Foundational template for implementing ISO 14971 risk management processes',
    framework: 'ISO 14971',
    category: 'risk-management',
    difficulty: 'basic',
    
    defaultActions: {
      corrective: [
        {
          type: 'corrective',
          title: 'Establish Risk Management Policy',
          description: 'Define organizational risk management policy and acceptance criteria',
          dependencies: [],
          verificationCriteria: [
            'Risk management policy documented',
            'Risk acceptability criteria defined',
            'Roles and responsibilities assigned',
            'Management approval obtained'
          ],
          estimatedHours: 16
        },
        {
          type: 'corrective',
          title: 'Create Risk Management File Structure',
          description: 'Establish standardized risk management file organization and templates',
          dependencies: [],
          verificationCriteria: [
            'Risk management file structure defined',
            'Document templates created',
            'Version control procedures established',
            'Access controls implemented'
          ],
          estimatedHours: 12
        }
      ],
      preventive: [
        {
          type: 'preventive',
          title: 'Deploy Risk Assessment Training',
          description: 'Train team members on risk assessment methodologies and tools',
          dependencies: [],
          verificationCriteria: [
            'Training materials developed',
            'Key personnel trained',
            'Competency assessments completed',
            'Refresher training scheduled'
          ],
          estimatedHours: 20
        },
        {
          type: 'preventive',
          title: 'Implement Risk Review Process',
          description: 'Establish regular risk review meetings and update procedures',
          dependencies: [],
          verificationCriteria: [
            'Review meeting schedule established',
            'Review criteria documented',
            'Update procedures defined',
            'Communication protocols established'
          ],
          estimatedHours: 8
        }
      ]
    },
    
    automatedChecks: [
      {
        name: 'Risk Management File Monitor',
        description: 'Basic monitoring of risk management file completeness',
        type: 'document-review',
        frequency: 'monthly',
        status: 'active',
        parameters: { requiredDocuments: ['risk_policy', 'risk_analysis', 'risk_evaluation'] }
      }
    ],
    
    notifications: [
      {
        trigger: 'deadline-approaching',
        recipients: ['project-manager', 'quality-team'],
        advanceNotice: 5,
        message: 'Risk management task due soon: {action}',
        active: true
      }
    ],
    
    requiredRoles: ['Project Manager', 'Quality Team', 'Engineering'],
    estimatedDuration: 30,
    criticality: 'medium',
    
    metadata: {
      version: '1.2',
      lastUpdated: '2024-01-08',
      usage: 42,
      effectiveness: 78,
      tags: ['iso14971', 'risk-management', 'basic', 'foundation']
    }
  },
  
  // Additional Framework Templates for Enhanced Coverage
  {
    id: 'fda-510k-predicate',
    name: 'FDA 510(k) Predicate Analysis CAPA',
    description: 'Template for addressing 510(k) predicate comparison and substantial equivalence gaps',
    framework: 'FDA 21 CFR 807',
    category: 'validation',
    difficulty: 'advanced',
    
    defaultActions: {
      corrective: [
        {
          type: 'corrective',
          title: 'Complete Predicate Device Analysis',
          description: 'Conduct comprehensive comparison with predicate devices including technological characteristics',
          dependencies: [],
          verificationCriteria: [
            'Predicate devices identified and justified',
            'Technological comparison completed',
            'Substantial equivalence demonstrated',
            'Clinical data requirements assessed'
          ],
          estimatedHours: 48
        },
        {
          type: 'corrective',
          title: 'Update 510(k) Submission Package',
          description: 'Revise submission to address FDA feedback and regulatory requirements',
          dependencies: [],
          verificationCriteria: [
            'Device description updated',
            'Indications for use clarified',
            'Performance testing completed',
            'Labeling requirements addressed'
          ],
          estimatedHours: 72
        }
      ],
      preventive: [
        {
          type: 'preventive',
          title: 'Establish Pre-Submission Strategy',
          description: 'Develop systematic pre-submission consultation process for future devices',
          dependencies: [],
          verificationCriteria: [
            'Pre-submission process documented',
            'FDA guidance interpretation protocols established',
            'Internal review checkpoints defined',
            'External consultant network established'
          ],
          estimatedHours: 24
        },
        {
          type: 'preventive',
          title: 'Implement Regulatory Intelligence System',
          description: 'Deploy monitoring system for FDA guidance updates and industry trends',
          dependencies: [],
          verificationCriteria: [
            'Automated FDA guidance monitoring',
            'Industry trend analysis process',
            'Internal notification system active',
            'Quarterly regulatory review meetings scheduled'
          ],
          estimatedHours: 32
        }
      ]
    },
    
    automatedChecks: [
      {
        name: '510(k) Submission Completeness',
        description: 'Monitor submission package completeness against FDA requirements',
        type: 'document-review',
        frequency: 'weekly',
        status: 'active',
        parameters: { requiredSections: ['device_description', 'predicate_comparison', 'performance_data', 'labeling'] }
      },
      {
        name: 'FDA Guidance Update Monitor',
        description: 'Track FDA guidance document updates relevant to device classification',
        type: 'document-review',
        frequency: 'weekly',
        status: 'active',
        parameters: { guidanceCategories: ['510k', 'medical_devices', 'quality_systems'] }
      }
    ],
    
    notifications: [
      {
        trigger: 'deadline-approaching',
        recipients: ['regulatory-affairs', 'product-development'],
        advanceNotice: 21,
        message: '510(k) CAPA milestone due: {action} requires completion in {days} days',
        active: true
      },
      {
        trigger: 'approval-needed',
        recipients: ['regulatory-director', 'quality-manager'],
        message: '510(k) submission package requires executive review and approval',
        active: true
      }
    ],
    
    requiredRoles: ['Regulatory Affairs Specialist', 'Product Development', 'Quality Assurance', 'Clinical Affairs'],
    estimatedDuration: 75,
    criticality: 'critical',
    
    metadata: {
      version: '2.3',
      lastUpdated: '2024-01-14',
      usage: 12,
      effectiveness: 91,
      tags: ['fda-510k', 'predicate-analysis', 'substantial-equivalence', 'regulatory-submission']
    }
  },

  {
    id: 'iso13485-management-review',
    name: 'ISO 13485 Management Review CAPA',
    description: 'Template for addressing management review process deficiencies and improvements',
    framework: 'ISO 13485',
    category: 'quality-management',
    difficulty: 'basic',
    
    defaultActions: {
      corrective: [
        {
          type: 'corrective',
          title: 'Establish Management Review Process',
          description: 'Define and implement systematic management review process per ISO 13485 requirements',
          dependencies: [],
          verificationCriteria: [
            'Management review process documented',
            'Review frequency established (minimum annually)',
            'Input requirements defined per Section 5.6.2',
            'Output requirements defined per Section 5.6.3'
          ],
          estimatedHours: 20
        },
        {
          type: 'corrective',
          title: 'Complete Outstanding Management Reviews',
          description: 'Conduct overdue management reviews and document results',
          dependencies: [],
          verificationCriteria: [
            'All overdue reviews completed',
            'Review minutes documented',
            'Action items identified and assigned',
            'Follow-up schedule established'
          ],
          estimatedHours: 16
        }
      ],
      preventive: [
        {
          type: 'preventive',
          title: 'Implement Review Scheduling System',
          description: 'Deploy automated scheduling and reminder system for management reviews',
          dependencies: [],
          verificationCriteria: [
            'Automated calendar invites configured',
            'Pre-review data collection automated',
            'Review agenda templates created',
            'Post-review action tracking system active'
          ],
          estimatedHours: 12
        },
        {
          type: 'preventive',
          title: 'Develop KPI Dashboard',
          description: 'Create management dashboard for ongoing QMS performance monitoring',
          dependencies: [],
          verificationCriteria: [
            'Key performance indicators defined',
            'Real-time data visualization implemented',
            'Trend analysis capabilities deployed',
            'Exception reporting configured'
          ],
          estimatedHours: 28
        }
      ]
    },
    
    automatedChecks: [
      {
        name: 'Management Review Schedule Monitor',
        description: 'Track management review schedule compliance',
        type: 'deadline-monitor',
        frequency: 'monthly',
        status: 'active',
        parameters: { reviewFrequency: 'annual', warningDays: 60 }
      }
    ],
    
    notifications: [
      {
        trigger: 'deadline-approaching',
        recipients: ['quality-manager', 'executive-team'],
        advanceNotice: 30,
        message: 'Management review due: {action} scheduled in {days} days',
        active: true
      }
    ],
    
    requiredRoles: ['Quality Manager', 'Executive Team', 'Department Heads'],
    estimatedDuration: 21,
    criticality: 'medium',
    
    metadata: {
      version: '1.5',
      lastUpdated: '2024-01-11',
      usage: 38,
      effectiveness: 82,
      tags: ['management-review', 'qms', 'iso13485', 'governance']
    }
  },

  {
    id: 'eu-mdr-post-market-surveillance',
    name: 'EU MDR Post-Market Surveillance CAPA',
    description: 'Comprehensive template for establishing post-market surveillance system under EU MDR',
    framework: 'EU MDR',
    category: 'quality-management',
    difficulty: 'advanced',
    
    defaultActions: {
      corrective: [
        {
          type: 'corrective',
          title: 'Establish Post-Market Surveillance System',
          description: 'Implement comprehensive PMS system compliant with EU MDR Article 83-87',
          dependencies: [],
          verificationCriteria: [
            'PMS plan documented per MDR requirements',
            'Data collection procedures established',
            'Adverse event reporting system implemented',
            'Periodic Safety Update Report (PSUR) process defined'
          ],
          estimatedHours: 60
        },
        {
          type: 'corrective',
          title: 'Conduct Literature Review',
          description: 'Perform systematic literature review for post-market clinical evidence',
          dependencies: [],
          verificationCriteria: [
            'Search strategy documented',
            'Literature review completed',
            'Clinical evidence gaps identified',
            'PMCF study requirements assessed'
          ],
          estimatedHours: 40
        }
      ],
      preventive: [
        {
          type: 'preventive',
          title: 'Deploy PMCF Study Framework',
          description: 'Establish Post-Market Clinical Follow-up study infrastructure',
          dependencies: [],
          verificationCriteria: [
            'PMCF study protocol templates created',
            'Ethics approval process defined',
            'Data collection systems deployed',
            'Statistical analysis plan established'
          ],
          estimatedHours: 48
        },
        {
          type: 'preventive',
          title: 'Implement Vigilance System',
          description: 'Deploy automated vigilance reporting and trend analysis system',
          dependencies: [],
          verificationCriteria: [
            'Incident reporting system configured',
            'Trend analysis algorithms implemented',
            'Regulatory reporting automation active',
            'Risk signal detection operational'
          ],
          estimatedHours: 36
        }
      ]
    },
    
    automatedChecks: [
      {
        name: 'PSUR Generation Monitor',
        description: 'Track Periodic Safety Update Report generation requirements',
        type: 'deadline-monitor',
        frequency: 'monthly',
        status: 'active',
        parameters: { reportFrequency: 'annual', dataCollectionDays: 90 }
      },
      {
        name: 'Vigilance Reporting Compliance',
        description: 'Monitor incident reporting timeline compliance',
        type: 'deadline-monitor',
        frequency: 'daily',
        status: 'active',
        parameters: { reportingDeadlines: { serious: 15, others: 30 } }
      }
    ],
    
    notifications: [
      {
        trigger: 'deadline-approaching',
        recipients: ['post-market-team', 'regulatory-affairs'],
        advanceNotice: 30,
        message: 'PMS activity due: {action} requires completion in {days} days',
        active: true
      },
      {
        trigger: 'milestone-reached',
        recipients: ['quality-manager', 'notified-body'],
        message: 'PMS milestone completed: {milestone} - notification to NB required',
        active: true
      }
    ],
    
    requiredRoles: ['Post-Market Surveillance Team', 'Clinical Affairs', 'Regulatory Affairs', 'Quality Assurance'],
    estimatedDuration: 90,
    criticality: 'critical',
    
    metadata: {
      version: '3.2',
      lastUpdated: '2024-01-16',
      usage: 6,
      effectiveness: 88,
      tags: ['eu-mdr', 'post-market-surveillance', 'vigilance', 'pmcf', 'clinical-evidence']
    }
  },

  {
    id: 'fda-qsr-corrective-preventive',
    name: 'FDA QSR CAPA Process Implementation',
    description: 'Template for establishing comprehensive CAPA process under FDA 21 CFR 820.100',
    framework: 'FDA 21 CFR 820',
    category: 'corrective-action',
    difficulty: 'intermediate',
    
    defaultActions: {
      corrective: [
        {
          type: 'corrective',
          title: 'Establish CAPA Process Documentation',
          description: 'Document comprehensive CAPA process per 21 CFR 820.100 requirements',
          dependencies: [],
          verificationCriteria: [
            'CAPA procedure documented and approved',
            'Investigation methodology defined',
            'Root cause analysis process established',
            'Effectiveness evaluation criteria defined'
          ],
          estimatedHours: 24
        },
        {
          type: 'corrective',
          title: 'Implement CAPA Database System',
          description: 'Deploy electronic system for CAPA tracking and management',
          dependencies: [],
          verificationCriteria: [
            'CAPA database system configured',
            'Workflow automation implemented',
            'Reporting capabilities established',
            'User access controls configured'
          ],
          estimatedHours: 40
        }
      ],
      preventive: [
        {
          type: 'preventive',
          title: 'Deploy Trend Analysis System',
          description: 'Implement systematic trend analysis for proactive issue identification',
          dependencies: [],
          verificationCriteria: [
            'Statistical trend analysis tools deployed',
            'Automated data collection configured',
            'Alert thresholds established',
            'Investigation trigger protocols defined'
          ],
          estimatedHours: 32
        },
        {
          type: 'preventive',
          title: 'Establish CAPA Training Program',
          description: 'Develop comprehensive training program for CAPA process participants',
          dependencies: [],
          verificationCriteria: [
            'Training curriculum developed',
            'Role-based training modules created',
            'Competency assessment tools established',
            'Refresher training schedule implemented'
          ],
          estimatedHours: 28
        }
      ]
    },
    
    automatedChecks: [
      {
        name: 'CAPA Closure Timeline Monitor',
        description: 'Monitor CAPA closure timelines and escalation requirements',
        type: 'deadline-monitor',
        frequency: 'daily',
        status: 'active',
        parameters: { escalationDays: [30, 60, 90], criticalEscalation: 14 }
      },
      {
        name: 'Effectiveness Review Scheduler',
        description: 'Schedule and track CAPA effectiveness reviews',
        type: 'deadline-monitor',
        frequency: 'weekly',
        status: 'active',
        parameters: { reviewPeriods: [30, 90, 180], followUpRequired: true }
      }
    ],
    
    notifications: [
      {
        trigger: 'deadline-approaching',
        recipients: ['quality-team', 'capa-owners'],
        advanceNotice: 7,
        message: 'CAPA action overdue: {action} requires immediate attention',
        active: true
      },
      {
        trigger: 'effectiveness-check',
        recipients: ['quality-manager', 'process-owners'],
        advanceNotice: 0,
        message: 'CAPA effectiveness review due: {capa_id} - {title}',
        active: true
      }
    ],
    
    requiredRoles: ['Quality Assurance', 'Process Owners', 'Management Representative', 'CAPA Coordinator'],
    estimatedDuration: 45,
    criticality: 'high',
    
    metadata: {
      version: '2.0',
      lastUpdated: '2024-01-13',
      usage: 28,
      effectiveness: 85,
      tags: ['fda-qsr', 'capa-process', 'quality-system', 'corrective-action', 'trend-analysis']
    }
  },

  {
    id: 'iso27001-isms',
    name: 'ISO 27001 ISMS Implementation CAPA',
    description: 'Template for Information Security Management System implementation and compliance',
    framework: 'ISO 27001',
    category: 'quality-management',
    difficulty: 'advanced',
    
    defaultActions: {
      corrective: [
        {
          type: 'corrective',
          title: 'Conduct Information Security Risk Assessment',
          description: 'Perform comprehensive risk assessment of information assets and security controls',
          dependencies: [],
          verificationCriteria: [
            'Asset inventory completed',
            'Threat and vulnerability assessment conducted',
            'Risk assessment methodology documented',
            'Risk treatment plan developed'
          ],
          estimatedHours: 56
        },
        {
          type: 'corrective',
          title: 'Implement Security Control Framework',
          description: 'Deploy selected security controls from ISO 27001 Annex A',
          dependencies: [],
          verificationCriteria: [
            'Security controls implemented per SoA',
            'Control implementation verified',
            'Security policies documented and approved',
            'Incident response procedures established'
          ],
          estimatedHours: 80
        }
      ],
      preventive: [
        {
          type: 'preventive',
          title: 'Establish Security Monitoring Program',
          description: 'Deploy continuous monitoring and measurement of ISMS effectiveness',
          dependencies: [],
          verificationCriteria: [
            'Security metrics defined and tracked',
            'Automated monitoring tools deployed',
            'Regular security assessments scheduled',
            'Management review process integrated'
          ],
          estimatedHours: 40
        },
        {
          type: 'preventive',
          title: 'Implement Security Awareness Training',
          description: 'Develop and deploy comprehensive security awareness program',
          dependencies: [],
          verificationCriteria: [
            'Training program developed',
            'Role-based training modules created',
            'Training effectiveness measured',
            'Annual refresh training scheduled'
          ],
          estimatedHours: 32
        }
      ]
    },
    
    automatedChecks: [
      {
        name: 'Security Control Assessment',
        description: 'Periodic assessment of security control effectiveness',
        type: 'effectiveness-check',
        frequency: 'monthly',
        status: 'active',
        parameters: { controlCategories: ['access_control', 'cryptography', 'physical_security', 'operations_security'] }
      },
      {
        name: 'Compliance Gap Monitor',
        description: 'Monitor compliance gaps against ISO 27001 requirements',
        type: 'document-review',
        frequency: 'weekly',
        status: 'active',
        parameters: { complianceFramework: 'ISO27001', gapThreshold: 90 }
      }
    ],
    
    notifications: [
      {
        trigger: 'deadline-approaching',
        recipients: ['security-team', 'it-department'],
        advanceNotice: 14,
        message: 'Security control implementation due: {action} in {days} days',
        active: true
      },
      {
        trigger: 'approval-needed',
        recipients: ['ciso', 'management-team'],
        message: 'ISMS documentation requires executive approval: {document}',
        active: true
      }
    ],
    
    requiredRoles: ['CISO', 'Security Team', 'IT Department', 'Risk Manager', 'Legal/Compliance'],
    estimatedDuration: 120,
    criticality: 'high',
    
    metadata: {
      version: '1.9',
      lastUpdated: '2024-01-12',
      usage: 18,
      effectiveness: 87,
      tags: ['iso27001', 'information-security', 'isms', 'risk-assessment', 'security-controls']
    }
  },

  {
    id: 'gdpr-privacy-compliance',
    name: 'GDPR Privacy Compliance CAPA',
    description: 'Template for addressing GDPR compliance gaps and privacy by design implementation',
    framework: 'GDPR',
    category: 'quality-management',
    difficulty: 'intermediate',
    
    defaultActions: {
      corrective: [
        {
          type: 'corrective',
          title: 'Complete Data Protection Impact Assessment',
          description: 'Conduct DPIA for high-risk processing activities per Article 35',
          dependencies: [],
          verificationCriteria: [
            'DPIA completed for identified processing activities',
            'Privacy risks assessed and mitigated',
            'Consultation with DPA completed if required',
            'DPIA review and approval process established'
          ],
          estimatedHours: 40
        },
        {
          type: 'corrective',
          title: 'Update Privacy Policies and Notices',
          description: 'Revise privacy notices to meet GDPR transparency requirements',
          dependencies: [],
          verificationCriteria: [
            'Privacy notices updated per Articles 13-14',
            'Lawful basis clearly identified',
            'Data subject rights information provided',
            'Contact details for DPO included'
          ],
          estimatedHours: 24
        }
      ],
      preventive: [
        {
          type: 'preventive',
          title: 'Implement Data Subject Rights Management',
          description: 'Deploy system for handling data subject requests and rights',
          dependencies: [],
          verificationCriteria: [
            'Request handling procedures documented',
            'Automated response system implemented',
            'Identity verification process established',
            'Response time tracking configured'
          ],
          estimatedHours: 36
        },
        {
          type: 'preventive',
          title: 'Establish Breach Response Procedures',
          description: 'Create incident response plan for personal data breaches',
          dependencies: [],
          verificationCriteria: [
            'Breach detection procedures implemented',
            '72-hour notification process established',
            'Individual notification criteria defined',
            'Breach register system deployed'
          ],
          estimatedHours: 28
        }
      ]
    },
    
    automatedChecks: [
      {
        name: 'Data Subject Request Monitor',
        description: 'Track data subject request response timelines',
        type: 'deadline-monitor',
        frequency: 'daily',
        status: 'active',
        parameters: { responseDeadline: 30, complexRequestExtension: 60 }
      },
      {
        name: 'Consent Management Audit',
        description: 'Periodic audit of consent records and validity',
        type: 'document-review',
        frequency: 'monthly',
        status: 'active',
        parameters: { consentAuditCriteria: ['validity', 'specificity', 'withdrawal_capability'] }
      }
    ],
    
    notifications: [
      {
        trigger: 'deadline-approaching',
        recipients: ['dpo', 'privacy-team'],
        advanceNotice: 5,
        message: 'Data subject request deadline approaching: {request_type} due in {days} days',
        active: true
      },
      {
        trigger: 'approval-needed',
        recipients: ['dpo', 'legal-team'],
        message: 'Privacy impact assessment requires DPO review: {assessment}',
        active: true
      }
    ],
    
    requiredRoles: ['Data Protection Officer', 'Privacy Team', 'Legal Department', 'IT Security'],
    estimatedDuration: 60,
    criticality: 'high',
    
    metadata: {
      version: '2.1',
      lastUpdated: '2024-01-15',
      usage: 22,
      effectiveness: 83,
      tags: ['gdpr', 'privacy', 'data-protection', 'dpia', 'consent-management']
    }
  }
]

export function CAPAWorkflowGenerator() {
  const [workflows, setWorkflows] = useKV<CAPAWorkflow[]>('capa-workflows', [])
  const [selectedWorkflow, setSelectedWorkflow] = useState<CAPAWorkflow | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [templateFilter, setTemplateFilter] = useState<string>('all')
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all')

  // Template configuration state
  const [templateConfig, setTemplateConfig] = useState({
    title: '',
    description: '',
    priority: 'medium' as CAPAWorkflow['priority'],
    assignedTo: '',
    dueDate: '',
    customizations: {} as Record<string, any>
  })

  // Sample data - would be populated from gap analysis
  const sampleGaps = [
    {
      id: '1',
      title: 'Design History File completeness verification',
      description: 'Missing critical documentation for DHF compliance',
      severity: 'critical',
      framework: 'ISO 13485',
      estimatedEffort: '40 hours'
    },
    {
      id: '2',
      title: 'Risk management process documentation',
      description: 'Incomplete risk control measures documentation',
      severity: 'high',
      framework: 'FDA 21 CFR 820',
      estimatedEffort: '24 hours'
    }
  ]

  const filteredWorkflows = workflows.filter(workflow => {
    const statusMatch = filterStatus === 'all' || workflow.status === filterStatus
    const priorityMatch = filterPriority === 'all' || workflow.priority === filterPriority
    return statusMatch && priorityMatch
  })

  const filteredTemplates = workflowTemplates.filter(template => {
    const frameworkMatch = frameworkFilter === 'all' || template.framework === frameworkFilter
    const categoryMatch = templateFilter === 'all' || template.category === templateFilter
    return frameworkMatch && categoryMatch
  })

  const createWorkflowFromTemplate = async (template: WorkflowTemplate, config: typeof templateConfig) => {
    setIsGenerating(true)
    
    try {
      // Simulate AI-powered customization
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const baseDate = new Date(config.dueDate || new Date(Date.now() + template.estimatedDuration * 24 * 60 * 60 * 1000))
      
      // Generate actions with proper IDs and assignments
      const correctiveActions: CAPAAction[] = template.defaultActions.corrective.map((action, index) => ({
        ...action,
        id: `ca-${Date.now()}-${index}`,
        assignedTo: config.assignedTo || 'unassigned',
        dueDate: new Date(baseDate.getTime() - (template.defaultActions.corrective.length - index) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'not-started' as const,
        evidence: []
      }))
      
      const preventiveActions: CAPAAction[] = template.defaultActions.preventive.map((action, index) => ({
        ...action,
        id: `pa-${Date.now()}-${index}`,
        assignedTo: config.assignedTo || 'unassigned',
        dueDate: new Date(baseDate.getTime() + index * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'not-started' as const,
        evidence: []
      }))

      // Generate automated checks with proper IDs
      const automatedChecks: AutomatedCheck[] = template.automatedChecks.map((check, index) => ({
        ...check,
        id: `check-${Date.now()}-${index}`,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        lastRun: undefined
      }))

      // Generate notification rules with proper IDs
      const notifications: NotificationRule[] = template.notifications.map((notif, index) => ({
        ...notif,
        id: `notif-${Date.now()}-${index}`
      }))

      const newWorkflow: CAPAWorkflow = {
        id: `capa-${Date.now()}`,
        title: config.title || `${template.name} - ${new Date().toLocaleDateString()}`,
        description: config.description || template.description,
        priority: config.priority,
        status: 'draft',
        sourceType: 'manual',
        
        rootCause: `Root cause analysis to be completed using ${template.framework} methodology`,
        correctiveActions,
        preventiveActions,
        
        assignedTo: config.assignedTo || 'unassigned',
        reviewerIds: template.requiredRoles.slice(1).map((role, index) => `reviewer-${index}`),
        dueDate: baseDate.toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        
        totalSteps: correctiveActions.length + preventiveActions.length,
        completedSteps: 0,
        
        regulatoryFrameworks: [template.framework],
        riskLevel: template.criticality,
        
        dependsOn: [],
        blocks: [],
        
        automatedChecks,
        notifications,
        
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'template-system',
          lastUpdated: new Date().toISOString(),
          estimatedEffort: `${template.estimatedDuration} days`,
          tags: [...template.metadata.tags, 'template-generated', template.framework.toLowerCase().replace(/\s+/g, '-')]
        }
      }

      setWorkflows(current => [...current, newWorkflow])
      setSelectedWorkflow(newWorkflow)
      setSelectedTemplate(null)
      setTemplateConfig({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: '',
        customizations: {}
      })
      toast.success(`CAPA workflow created from ${template.name}`)
      
    } catch (error) {
      toast.error('Failed to create workflow from template')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateWorkflowFromGap = async (gapId: string) => {
    setIsGenerating(true)
    const gap = sampleGaps.find(g => g.id === gapId)
    
    if (!gap) {
      toast.error('Gap not found')
      setIsGenerating(false)
      return
    }

    try {
      // Simulate AI-powered workflow generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newWorkflow: CAPAWorkflow = {
        id: `capa-${Date.now()}`,
        title: `CAPA: ${gap.title}`,
        description: `Corrective and Preventive Action plan for ${gap.description}`,
        priority: gap.severity as 'critical' | 'high' | 'medium' | 'low',
        status: 'draft',
        sourceGapId: gapId,
        sourceType: 'gap-analysis',
        
        rootCause: `Root cause analysis pending - initial assessment suggests gaps in ${gap.framework} compliance processes`,
        
        correctiveActions: [
          {
            id: `ca-${Date.now()}-1`,
            type: 'corrective',
            title: 'Address immediate compliance gap',
            description: `Create missing documentation for ${gap.title}`,
            assignedTo: 'sarah-johnson',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'not-started',
            evidence: [],
            dependencies: [],
            verificationCriteria: [
              'Documentation completed and reviewed',
              'Compliance verified by QA team',
              'Gap closure approved by regulatory'
            ],
            estimatedHours: parseInt(gap.estimatedEffort) * 0.6
          }
        ],
        
        preventiveActions: [
          {
            id: `pa-${Date.now()}-1`,
            type: 'preventive',
            title: 'Implement systematic controls',
            description: `Establish ongoing monitoring for ${gap.framework} requirements`,
            assignedTo: 'mike-chen',
            dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'not-started',
            evidence: [],
            dependencies: [`ca-${Date.now()}-1`],
            verificationCriteria: [
              'Monitoring process documented',
              'Automated checks implemented',
              'Training completed for relevant staff'
            ],
            estimatedHours: parseInt(gap.estimatedEffort) * 0.4
          }
        ],
        
        assignedTo: 'sarah-johnson',
        reviewerIds: ['mike-chen', 'lisa-rodriguez'],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        
        totalSteps: 6,
        completedSteps: 0,
        
        regulatoryFrameworks: [gap.framework],
        riskLevel: gap.severity === 'critical' ? 'critical' : gap.severity === 'high' ? 'high' : 'medium',
        
        dependsOn: [],
        blocks: [],
        
        automatedChecks: [
          {
            id: `check-${Date.now()}-1`,
            name: 'Deadline Monitor',
            description: 'Monitor action item deadlines and send alerts',
            type: 'deadline-monitor',
            frequency: 'daily',
            nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            parameters: { advanceNotice: 3 }
          },
          {
            id: `check-${Date.now()}-2`,
            name: 'Document Completeness',
            description: 'Verify required documentation is complete',
            type: 'document-review',
            frequency: 'weekly',
            nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            parameters: { requiredDocuments: ['DHF', 'Design Reviews', 'Test Results'] }
          }
        ],
        
        notifications: [
          {
            id: `notif-${Date.now()}-1`,
            trigger: 'deadline-approaching',
            recipients: ['sarah-johnson', 'mike-chen'],
            advanceNotice: 3,
            message: 'CAPA action deadline approaching in {days} days',
            active: true
          }
        ],
        
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastUpdated: new Date().toISOString(),
          estimatedEffort: gap.estimatedEffort,
          tags: ['auto-generated', gap.framework.toLowerCase(), gap.severity]
        }
      }

      setWorkflows(current => [...current, newWorkflow])
      setSelectedWorkflow(newWorkflow)
      toast.success('CAPA workflow generated successfully')
      
    } catch (error) {
      toast.error('Failed to generate CAPA workflow')
    } finally {
      setIsGenerating(false)
    }
  }

  const updateWorkflowStatus = (workflowId: string, newStatus: CAPAWorkflow['status']) => {
    setWorkflows(current => 
      current.map(workflow => 
        workflow.id === workflowId 
          ? { ...workflow, status: newStatus, metadata: { ...workflow.metadata, lastUpdated: new Date().toISOString() }}
          : workflow
      )
    )
    toast.success(`Workflow ${newStatus}`)
  }

  const updateActionStatus = (workflowId: string, actionId: string, newStatus: CAPAAction['status']) => {
    setWorkflows(current => 
      current.map(workflow => {
        if (workflow.id === workflowId) {
          const updatedCorrectiveActions = workflow.correctiveActions.map(action =>
            action.id === actionId ? { ...action, status: newStatus } : action
          )
          const updatedPreventiveActions = workflow.preventiveActions.map(action =>
            action.id === actionId ? { ...action, status: newStatus } : action
          )
          
          // Recalculate progress
          const allActions = [...updatedCorrectiveActions, ...updatedPreventiveActions]
          const completedActions = allActions.filter(action => action.status === 'completed').length
          
          return {
            ...workflow,
            correctiveActions: updatedCorrectiveActions,
            preventiveActions: updatedPreventiveActions,
            completedSteps: completedActions,
            totalSteps: allActions.length,
            metadata: { ...workflow.metadata, lastUpdated: new Date().toISOString() }
          }
        }
        return workflow
      })
    )
    toast.success('Action status updated')
  }

  const generateEffectivenessReport = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) return

    // Simulate AI-powered effectiveness analysis
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const effectiveness = Math.random() * 40 + 60 // 60-100%
    const report = {
      workflowId,
      effectivenessScore: effectiveness,
      findings: [
        'Corrective actions successfully addressed the root cause',
        'Preventive measures show positive early indicators',
        effectiveness > 80 ? 'Workflow exceeded effectiveness targets' : 'Additional monitoring recommended'
      ],
      recommendations: effectiveness < 80 ? [
        'Extend monitoring period',
        'Consider additional preventive controls',
        'Schedule follow-up assessment'
      ] : [
        'Workflow can be considered for closure',
        'Document lessons learned',
        'Apply best practices to similar processes'
      ]
    }

    toast.success(`Effectiveness report generated: ${effectiveness.toFixed(1)}% effective`)
    return report
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            CAPA Workflow Generator
          </h2>
          <p className="text-muted-foreground">
            Automated Corrective and Preventive Action workflows from compliance gaps
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generateEffectivenessReport(workflows[0]?.id)}>
            <TrendUp className="h-4 w-4 mr-2" />
            Effectiveness Report
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create CAPA
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generator">Auto-Generate</TabsTrigger>
          <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="optimizer">AI Optimizer</TabsTrigger>
          <TabsTrigger value="template-manager">Template Manager</TabsTrigger>
          <TabsTrigger value="automation-config">Automation Config</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Dashboard Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{workflows.length}</p>
                      <p className="text-xs text-muted-foreground">Total CAPAs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {workflows.filter(w => w.status === 'active').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-2xl font-bold">
                        {workflows.filter(w => new Date(w.dueDate) < new Date() && w.status !== 'completed').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Overdue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {workflows.filter(w => w.status === 'completed').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Workflows */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent CAPA Workflows</h3>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredWorkflows.slice(0, 5).map((workflow) => (
                  <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedWorkflow(workflow)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{workflow.title}</CardTitle>
                            <Badge className={priorityColors[workflow.priority]}>
                              {workflow.priority}
                            </Badge>
                            <Badge className={statusColors[workflow.status]}>
                              {workflow.status}
                            </Badge>
                          </div>
                          <CardDescription>{workflow.description}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          {workflow.status === 'draft' && (
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); updateWorkflowStatus(workflow.id, 'active') }}>
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          {workflow.status === 'active' && (
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); updateWorkflowStatus(workflow.id, 'completed') }}>
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{workflow.completedSteps} of {workflow.totalSteps} steps</span>
                        </div>
                        <Progress value={(workflow.completedSteps / workflow.totalSteps) * 100} />
                        
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Assigned:</span> {mockUsers.find(u => u.id === workflow.assignedTo)?.name || workflow.assignedTo}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Due:</span> {new Date(workflow.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Framework Configuration Status */}
            <div className="mt-8">
              <FrameworkConfigurationStatus />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="generator" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI-Powered CAPA Generator
                </h3>
                <p className="text-sm text-muted-foreground">
                  Generate comprehensive CAPA workflows from identified compliance gaps
                </p>
              </div>
            </div>

            {/* Available Gaps */}
            <div className="space-y-4">
              <h4 className="font-medium">Compliance Gaps Available for CAPA Generation</h4>
              <div className="grid gap-4">
                {sampleGaps.map((gap) => (
                  <Card key={gap.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{gap.title}</CardTitle>
                            <Badge className={priorityColors[gap.severity as keyof typeof priorityColors]}>
                              {gap.severity}
                            </Badge>
                            <Badge variant="outline">{gap.framework}</Badge>
                          </div>
                          <CardDescription>{gap.description}</CardDescription>
                        </div>
                        <Button 
                          onClick={() => generateWorkflowFromGap(gap.id)}
                          disabled={isGenerating}
                          className="gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <Brain className="h-4 w-4 animate-pulse" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Lightbulb className="h-4 w-4" />
                              Generate CAPA
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">Estimated Effort:</span> {gap.estimatedEffort}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">Framework:</span> {gap.framework}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Generation Preview */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  CAPA Generation Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span>Analyze compliance gap and root causes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span>Generate corrective actions to address immediate issues</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span>Create preventive actions to avoid recurrence</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span>Assign responsibilities and timelines</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span>Set up automated monitoring and notifications</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span>Define verification criteria and success metrics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="mt-6">
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{workflow.title}</CardTitle>
                        <Badge className={priorityColors[workflow.priority]}>
                          {workflow.priority}
                        </Badge>
                        <Badge className={statusColors[workflow.status]}>
                          {workflow.status}
                        </Badge>
                      </div>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => setSelectedWorkflow(workflow)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{workflow.completedSteps} of {workflow.totalSteps} steps</span>
                    </div>
                    <Progress value={(workflow.completedSteps / workflow.totalSteps) * 100} />

                    {/* Actions Summary */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Target className="h-3 w-3 text-destructive" />
                          Corrective Actions ({workflow.correctiveActions.length})
                        </h5>
                        <div className="space-y-1">
                          {workflow.correctiveActions.map((action) => (
                            <div key={action.id} className="flex items-center justify-between text-xs">
                              <span className="truncate">{action.title}</span>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {action.status}
                                </Badge>
                                {action.status !== 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0"
                                    onClick={() => updateActionStatus(workflow.id, action.id, 'completed')}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Shield className="h-3 w-3 text-secondary" />
                          Preventive Actions ({workflow.preventiveActions.length})
                        </h5>
                        <div className="space-y-1">
                          {workflow.preventiveActions.map((action) => (
                            <div key={action.id} className="flex items-center justify-between text-xs">
                              <span className="truncate">{action.title}</span>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {action.status}
                                </Badge>
                                {action.status !== 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0"
                                    onClick={() => updateActionStatus(workflow.id, action.id, 'completed')}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Resolution Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18.5 days</div>
                  <p className="text-xs text-muted-foreground">-2.3 days from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Effectiveness Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">+5% improvement</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">On-Time Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-muted-foreground">Above target (85%)</p>
                </CardContent>
              </Card>
            </div>

            {/* Framework Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>CAPA by Regulatory Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['ISO 13485', 'FDA 21 CFR 820', 'EU MDR'].map((framework, index) => (
                    <div key={framework} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{framework}</span>
                        <span>{[3, 2, 1][index]} CAPAs</span>
                      </div>
                      <Progress value={[60, 40, 20][index]} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Framework-Specific Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Pre-configured CAPA workflows for different regulatory frameworks
                </p>
              </div>
              <div className="flex gap-2">
                <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frameworks</SelectItem>
                    <SelectItem value="ISO 13485">ISO 13485</SelectItem>
                    <SelectItem value="FDA 21 CFR 820">FDA QSR</SelectItem>
                    <SelectItem value="FDA 21 CFR 807">FDA 510(k)</SelectItem>
                    <SelectItem value="EU MDR">EU MDR</SelectItem>
                    <SelectItem value="ISO 14971">ISO 14971</SelectItem>
                    <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                    <SelectItem value="GDPR">GDPR</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={templateFilter} onValueChange={setTemplateFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="design-control">Design Control</SelectItem>
                    <SelectItem value="risk-management">Risk Management</SelectItem>
                    <SelectItem value="validation">Validation</SelectItem>
                    <SelectItem value="quality-management">Quality Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Badge variant="outline">{template.framework}</Badge>
                          <Badge 
                            variant={template.difficulty === 'basic' ? 'secondary' : template.difficulty === 'intermediate' ? 'default' : 'destructive'}
                          >
                            {template.difficulty}
                          </Badge>
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2 md:grid-cols-2 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Category:</span>
                        <div className="capitalize">{template.category.replace('-', ' ')}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Duration:</span>
                        <div>{template.estimatedDuration} days</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Effectiveness:</span>
                        <div>{template.metadata.effectiveness}%</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Usage:</span>
                        <div>{template.metadata.usage} times</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Actions:</span>
                        <div className="flex gap-4 mt-1">
                          <span className="text-xs">
                            <Target className="h-3 w-3 inline mr-1 text-destructive" />
                            {template.defaultActions.corrective.length} corrective
                          </span>
                          <span className="text-xs">
                            <Shield className="h-3 w-3 inline mr-1 text-secondary" />
                            {template.defaultActions.preventive.length} preventive
                          </span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Required Roles:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.requiredRoles.slice(0, 2).map((role) => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                          {template.requiredRoles.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.requiredRoles.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.metadata.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
                  <p className="text-muted-foreground">
                    No templates match the current filters. Try adjusting your framework or category selection.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="optimizer" className="mt-6">
          <AITemplateOptimizer />
        </TabsContent>

        <TabsContent value="template-manager" className="mt-6">
          <WorkflowTemplateManager />
        </TabsContent>

        <TabsContent value="automation-config" className="mt-6">
          <AutomatedWorkflowConfiguration />
        </TabsContent>
      </Tabs>

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                {selectedWorkflow.title}
              </DialogTitle>
              <DialogDescription>
                {selectedWorkflow.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={priorityColors[selectedWorkflow.priority]}>
                    {selectedWorkflow.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={statusColors[selectedWorkflow.status]}>
                    {selectedWorkflow.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Root Cause Analysis</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {selectedWorkflow.rootCause}
                </div>
              </div>

              <Tabs defaultValue="corrective">
                <TabsList>
                  <TabsTrigger value="corrective">Corrective Actions</TabsTrigger>
                  <TabsTrigger value="preventive">Preventive Actions</TabsTrigger>
                  <TabsTrigger value="automation">Automation</TabsTrigger>
                </TabsList>

                <TabsContent value="corrective" className="mt-4">
                  <div className="space-y-3">
                    {selectedWorkflow.correctiveActions.map((action) => (
                      <Card key={action.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{action.title}</h4>
                              <p className="text-sm text-muted-foreground">{action.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>Due: {action.dueDate}</span>
                                <span>•</span>
                                <span>Assigned: {mockUsers.find(u => u.id === action.assignedTo)?.name}</span>
                              </div>
                            </div>
                            <Badge variant="outline">{action.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="preventive" className="mt-4">
                  <div className="space-y-3">
                    {selectedWorkflow.preventiveActions.map((action) => (
                      <Card key={action.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{action.title}</h4>
                              <p className="text-sm text-muted-foreground">{action.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>Due: {action.dueDate}</span>
                                <span>•</span>
                                <span>Assigned: {mockUsers.find(u => u.id === action.assignedTo)?.name}</span>
                              </div>
                            </div>
                            <Badge variant="outline">{action.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="automation" className="mt-4">
                  <div className="space-y-3">
                    {selectedWorkflow.automatedChecks.map((check) => (
                      <Card key={check.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{check.name}</h4>
                              <p className="text-sm text-muted-foreground">{check.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>Frequency: {check.frequency}</span>
                                <span>•</span>
                                <span>Next run: {new Date(check.nextRun).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Badge variant={check.status === 'active' ? 'default' : 'outline'}>
                              {check.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedWorkflow(null)}>
                Close
              </Button>
              <Button onClick={() => generateEffectivenessReport(selectedWorkflow.id)}>
                <TrendUp className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Template Configuration Modal */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configure {selectedTemplate.name}
              </DialogTitle>
              <DialogDescription>
                Customize the template parameters before creating your CAPA workflow
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="template-title">Workflow Title</Label>
                  <Input
                    id="template-title"
                    value={templateConfig.title}
                    onChange={(e) => setTemplateConfig(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={`${selectedTemplate.name} - ${new Date().toLocaleDateString()}`}
                  />
                </div>
                <div>
                  <Label htmlFor="template-priority">Priority</Label>
                  <Select 
                    value={templateConfig.priority} 
                    onValueChange={(value: CAPAWorkflow['priority']) => 
                      setTemplateConfig(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={templateConfig.description}
                  onChange={(e) => setTemplateConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={selectedTemplate.description}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="template-assignee">Assigned To</Label>
                  <Select 
                    value={templateConfig.assignedTo} 
                    onValueChange={(value) => 
                      setTemplateConfig(prev => ({ ...prev, assignedTo: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template-due-date">Due Date</Label>
                  <Input
                    id="template-due-date"
                    type="date"
                    value={templateConfig.dueDate}
                    onChange={(e) => setTemplateConfig(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Template Overview */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Template Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <span className="text-sm font-medium">Framework:</span>
                      <div className="text-sm text-muted-foreground">{selectedTemplate.framework}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Category:</span>
                      <div className="text-sm text-muted-foreground capitalize">{selectedTemplate.category.replace('-', ' ')}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Estimated Duration:</span>
                      <div className="text-sm text-muted-foreground">{selectedTemplate.estimatedDuration} days</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Criticality:</span>
                      <div className="text-sm text-muted-foreground capitalize">{selectedTemplate.criticality}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Included Actions:</span>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-destructive" />
                        <span className="text-sm">{selectedTemplate.defaultActions.corrective.length} Corrective Actions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-secondary" />
                        <span className="text-sm">{selectedTemplate.defaultActions.preventive.length} Preventive Actions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4 text-primary" />
                        <span className="text-sm">{selectedTemplate.automatedChecks.length} Automated Checks</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Required Roles:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTemplate.requiredRoles.map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createWorkflowFromTemplate(selectedTemplate, templateConfig)}
                disabled={isGenerating || !templateConfig.assignedTo}
              >
                {isGenerating ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Creating Workflow...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create CAPA Workflow
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}