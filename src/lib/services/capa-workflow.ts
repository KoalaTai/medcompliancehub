import { useKV } from '@github/spark/hooks'
import { useState, useEffect } from 'react'
import type { ComplianceGap, ComplianceFinding, RegFramework } from '@/lib/types/regulatory'

export interface CAPAWorkflow {
  id: string
  title: string
  description: string
  framework: RegFramework
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'under_review' | 'completed' | 'closed'
  initiatedBy: string
  assignedTo?: string
  approvedBy?: string
  dueDate: string
  completedDate?: string
  
  // Root cause analysis
  problemStatement: string
  rootCause: string
  immediateActions: CAPAAction[]
  correctiveActions: CAPAAction[]
  preventiveActions: CAPAAction[]
  
  // Effectiveness verification
  verificationPlan: string
  verificationDueDate: string
  verificationResults?: string
  effectivenessConfirmed: boolean
  
  // Related items
  relatedGapIds: string[]
  relatedFindingIds: string[]
  attachments: CAPAAttachment[]
  
  // Tracking
  createdAt: string
  updatedAt: string
  lastReviewDate?: string
  nextReviewDate?: string
}

export interface CAPAAction {
  id: string
  description: string
  assignee: string
  dueDate: string
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
  completedDate?: string
  evidenceRequired: boolean
  evidence?: string
  notes?: string
}

export interface CAPAAttachment {
  id: string
  filename: string
  fileType: string
  uploadedBy: string
  uploadedAt: string
  description?: string
}

export interface CAPATemplate {
  id: string
  name: string
  framework: RegFramework
  category: 'design_control' | 'manufacturing' | 'quality_system' | 'post_market' | 'software' | 'general'
  problemStatementTemplate: string
  rootCauseTemplate: string
  correctiveActionsTemplate: string
  preventiveActionsTemplate: string
  verificationPlanTemplate: string
  isActive: boolean
  createdAt: string
}

export interface CAPAMetrics {
  totalCAPAs: number
  openCAPAs: number
  overdueCAPAs: number
  completedThisMonth: number
  averageCompletionTime: number // days
  effectivenessRate: number // percentage
  byPriority: {
    urgent: number
    high: number
    medium: number
    low: number
  }
  byStatus: Record<string, number>
  byFramework: Record<RegFramework, number>
}

export class CAPAWorkflowGenerator {
  private static instance: CAPAWorkflowGenerator
  
  private constructor() {}
  
  static getInstance(): CAPAWorkflowGenerator {
    if (!CAPAWorkflowGenerator.instance) {
      CAPAWorkflowGenerator.instance = new CAPAWorkflowGenerator()
    }
    return CAPAWorkflowGenerator.instance
  }

  async generateWorkflowFromGap(
    gap: ComplianceGap,
    template?: CAPATemplate
  ): Promise<Partial<CAPAWorkflow>> {
    // Use AI to generate a comprehensive CAPA workflow
    const prompt = spark.llmPrompt`
      Generate a comprehensive CAPA (Corrective and Preventive Action) workflow for the following compliance gap:
      
      Gap Details:
      - Framework: ${gap.framework}
      - Requirement: ${gap.requirement}
      - Current State: ${gap.currentState}
      - Target State: ${gap.targetState}
      - Severity: ${gap.gapSeverity}
      - Recommendations: ${gap.recommendations.join(', ')}
      - Dependencies: ${gap.dependencies.join(', ')}
      
      ${template ? `
      Template Context:
      - Category: ${template.category}
      - Problem Statement Template: ${template.problemStatementTemplate}
      - Root Cause Template: ${template.rootCauseTemplate}
      ` : ''}
      
      Generate a CAPA workflow including:
      1. Clear problem statement
      2. Root cause analysis
      3. Immediate actions (if any)
      4. Corrective actions to address current issue
      5. Preventive actions to prevent recurrence
      6. Verification plan to confirm effectiveness
      7. Appropriate timeline and priorities
      
      Return as JSON with structured actions and details.
    `

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const generatedWorkflow = JSON.parse(response)
      
      // Calculate due dates
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + this.calculateDueDateOffset(gap.gapSeverity))
      
      const verificationDueDate = new Date(dueDate)
      verificationDueDate.setDate(verificationDueDate.getDate() + 30) // 30 days after completion
      
      return {
        title: `CAPA for ${gap.requirement}`,
        description: generatedWorkflow.description || `Address compliance gap in ${gap.requirement}`,
        framework: gap.framework,
        priority: this.mapSeverityToPriority(gap.gapSeverity),
        status: 'draft',
        dueDate: dueDate.toISOString(),
        problemStatement: generatedWorkflow.problemStatement || `Compliance gap identified: ${gap.currentState}`,
        rootCause: generatedWorkflow.rootCause || 'To be determined during investigation',
        immediateActions: this.processActions(generatedWorkflow.immediateActions || []),
        correctiveActions: this.processActions(generatedWorkflow.correctiveActions || []),
        preventiveActions: this.processActions(generatedWorkflow.preventiveActions || []),
        verificationPlan: generatedWorkflow.verificationPlan || 'Verify implementation through process audit and documentation review',
        verificationDueDate: verificationDueDate.toISOString(),
        effectivenessConfirmed: false,
        relatedGapIds: [gap.id],
        relatedFindingIds: [],
        attachments: []
      }
    } catch (error) {
      console.error('CAPA generation failed:', error)
      
      // Fallback to basic template
      return this.generateBasicWorkflow(gap)
    }
  }

  async generateWorkflowFromFinding(
    finding: ComplianceFinding,
    template?: CAPATemplate
  ): Promise<Partial<CAPAWorkflow>> {
    const prompt = spark.llmPrompt`
      Generate a CAPA workflow for the following compliance finding:
      
      Finding Details:
      - Title: ${finding.title}
      - Description: ${finding.description}
      - Severity: ${finding.severity}
      - Recommendations: ${finding.recommendations.join(', ')}
      - Citation: ${finding.citation.framework} ${finding.citation.section}
      
      Generate appropriate corrective and preventive actions based on the finding severity and recommendations.
    `

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const generatedWorkflow = JSON.parse(response)
      
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + this.calculateDueDateOffset(finding.severity))
      
      return {
        title: `CAPA for Finding: ${finding.title}`,
        description: generatedWorkflow.description || finding.description,
        framework: finding.citation.framework,
        priority: this.mapSeverityToPriority(finding.severity),
        status: 'draft',
        dueDate: dueDate.toISOString(),
        problemStatement: generatedWorkflow.problemStatement || finding.description,
        rootCause: generatedWorkflow.rootCause || 'Root cause analysis pending',
        immediateActions: this.processActions(generatedWorkflow.immediateActions || []),
        correctiveActions: this.processActions(generatedWorkflow.correctiveActions || []),
        preventiveActions: this.processActions(generatedWorkflow.preventiveActions || []),
        verificationPlan: generatedWorkflow.verificationPlan || 'Standard verification process',
        verificationDueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
        effectivenessConfirmed: false,
        relatedGapIds: [],
        relatedFindingIds: [finding.id],
        attachments: []
      }
    } catch (error) {
      console.error('CAPA generation from finding failed:', error)
      
      // Fallback to basic workflow
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + this.calculateDueDateOffset(finding.severity))
      
      return {
        title: `CAPA for Finding: ${finding.title}`,
        description: finding.description,
        framework: finding.citation.framework,
        priority: this.mapSeverityToPriority(finding.severity),
        status: 'draft',
        dueDate: dueDate.toISOString(),
        problemStatement: finding.description,
        rootCause: 'Root cause analysis pending',
        immediateActions: [],
        correctiveActions: [
          {
            id: crypto.randomUUID(),
            description: 'Address identified compliance issue',
            assignee: 'TBD',
            dueDate: dueDate.toISOString(),
            status: 'not_started',
            evidenceRequired: true
          }
        ],
        preventiveActions: [
          {
            id: crypto.randomUUID(),
            description: 'Implement measures to prevent recurrence',
            assignee: 'TBD',
            dueDate: new Date(dueDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'not_started',
            evidenceRequired: true
          }
        ],
        verificationPlan: 'Verify corrective actions through documentation review and process audit',
        verificationDueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        effectivenessConfirmed: false,
        relatedGapIds: [],
        relatedFindingIds: [finding.id],
        attachments: []
      }
    }
  }

  async optimizeWorkflow(workflow: CAPAWorkflow): Promise<Partial<CAPAWorkflow>> {
    // Use AI to optimize the workflow based on best practices
    const prompt = spark.llmPrompt`
      Optimize the following CAPA workflow based on industry best practices and regulatory requirements:
      
      Current Workflow:
      - Framework: ${workflow.framework}
      - Problem Statement: ${workflow.problemStatement}
      - Root Cause: ${workflow.rootCause}
      - Corrective Actions: ${workflow.correctiveActions.length} actions
      - Preventive Actions: ${workflow.preventiveActions.length} actions
      - Priority: ${workflow.priority}
      
      Provide optimized recommendations for:
      1. More effective corrective actions
      2. Better preventive measures
      3. Improved verification plan
      4. Timeline optimization
      5. Resource allocation
      
      Focus on FDA/ISO best practices for CAPA effectiveness.
    `

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const optimizations = JSON.parse(response)
      
      return {
        correctiveActions: optimizations.correctiveActions ? 
          this.processActions(optimizations.correctiveActions) : 
          workflow.correctiveActions,
        preventiveActions: optimizations.preventiveActions ? 
          this.processActions(optimizations.preventiveActions) : 
          workflow.preventiveActions,
        verificationPlan: optimizations.verificationPlan || workflow.verificationPlan,
        updatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Workflow optimization failed:', error)
      return {}
    }
  }

  calculateMetrics(workflows: CAPAWorkflow[]): CAPAMetrics {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const totalCAPAs = workflows.length
    const openCAPAs = workflows.filter(w => !['completed', 'closed'].includes(w.status)).length
    
    const overdueCAPAs = workflows.filter(w => 
      !['completed', 'closed'].includes(w.status) && 
      new Date(w.dueDate) < now
    ).length
    
    const completedThisMonth = workflows.filter(w => 
      w.status === 'completed' && 
      w.completedDate && 
      new Date(w.completedDate) >= thirtyDaysAgo
    ).length
    
    // Calculate average completion time
    const completedWorkflows = workflows.filter(w => w.completedDate)
    const averageCompletionTime = completedWorkflows.length > 0 ? 
      completedWorkflows.reduce((sum, w) => {
        const created = new Date(w.createdAt).getTime()
        const completed = new Date(w.completedDate!).getTime()
        return sum + (completed - created) / (24 * 60 * 60 * 1000)
      }, 0) / completedWorkflows.length : 0
    
    // Calculate effectiveness rate
    const verifiedWorkflows = workflows.filter(w => w.effectivenessConfirmed)
    const effectivenessRate = completedWorkflows.length > 0 ? 
      (verifiedWorkflows.length / completedWorkflows.length) * 100 : 0
    
    // Group by priority
    const byPriority = workflows.reduce((acc, w) => {
      acc[w.priority] = (acc[w.priority] || 0) + 1
      return acc
    }, {} as any)
    
    // Group by status
    const byStatus = workflows.reduce((acc, w) => {
      acc[w.status] = (acc[w.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Group by framework
    const byFramework = workflows.reduce((acc, w) => {
      acc[w.framework] = (acc[w.framework] || 0) + 1
      return acc
    }, {} as Record<RegFramework, number>)
    
    return {
      totalCAPAs,
      openCAPAs,
      overdueCAPAs,
      completedThisMonth,
      averageCompletionTime: Math.round(averageCompletionTime),
      effectivenessRate: Math.round(effectivenessRate),
      byPriority: {
        urgent: byPriority.urgent || 0,
        high: byPriority.high || 0,
        medium: byPriority.medium || 0,
        low: byPriority.low || 0
      },
      byStatus,
      byFramework
    }
  }

  private processActions(actions: any[]): CAPAAction[] {
    return actions.map(action => ({
      id: crypto.randomUUID(),
      description: action.description || action.action || 'Action description',
      assignee: action.assignee || 'TBD',
      dueDate: action.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'not_started',
      evidenceRequired: action.evidenceRequired || true
    }))
  }

  private generateBasicWorkflow(gap: ComplianceGap): Partial<CAPAWorkflow> {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + this.calculateDueDateOffset(gap.gapSeverity))
    
    return {
      title: `CAPA for ${gap.requirement}`,
      description: `Address compliance gap in ${gap.requirement}`,
      framework: gap.framework,
      priority: this.mapSeverityToPriority(gap.gapSeverity),
      status: 'draft',
      dueDate: dueDate.toISOString(),
      problemStatement: `Compliance gap identified: ${gap.currentState}`,
      rootCause: 'Root cause analysis pending',
      immediateActions: [],
      correctiveActions: gap.recommendations.map(rec => ({
        id: crypto.randomUUID(),
        description: rec,
        assignee: 'TBD',
        dueDate: dueDate.toISOString(),
        status: 'not_started' as const,
        evidenceRequired: true
      })),
      preventiveActions: [
        {
          id: crypto.randomUUID(),
          description: 'Implement preventive measures to avoid recurrence',
          assignee: 'TBD',
          dueDate: new Date(dueDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'not_started' as const,
          evidenceRequired: true
        }
      ],
      verificationPlan: 'Verify implementation through process audit and documentation review',
      verificationDueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      effectivenessConfirmed: false,
      relatedGapIds: [gap.id],
      relatedFindingIds: [],
      attachments: []
    }
  }

  private calculateDueDateOffset(severity: string): number {
    switch (severity) {
      case 'critical': return 7  // 1 week
      case 'major': return 30    // 1 month
      case 'minor': return 90    // 3 months
      default: return 60         // 2 months
    }
  }

  private mapSeverityToPriority(severity: string): 'urgent' | 'high' | 'medium' | 'low' {
    switch (severity) {
      case 'critical': return 'urgent'
      case 'major': return 'high'
      case 'minor': return 'medium'
      default: return 'low'
    }
  }
}

// React hook for CAPA workflow management
export function useCAPAWorkflow() {
  const [workflows, setWorkflows] = useKV<CAPAWorkflow[]>('capa-workflows', [])
  const [templates, setTemplates] = useKV<CAPATemplate[]>('capa-templates', [])
  
  const [isGenerating, setIsGenerating] = useState(false)
  
  const generator = CAPAWorkflowGenerator.getInstance()

  const generateFromGap = async (gap: ComplianceGap, templateId?: string) => {
    setIsGenerating(true)
    try {
      const template = templateId ? templates.find(t => t.id === templateId) : undefined
      const workflowData = await generator.generateWorkflowFromGap(gap, template)
      
      const workflow: CAPAWorkflow = {
        id: crypto.randomUUID(),
        initiatedBy: 'current-user', // Would get from auth context
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...workflowData
      } as CAPAWorkflow
      
      setWorkflows(current => [...current, workflow])
      return workflow
    } catch (error) {
      console.error('Failed to generate CAPA from gap:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFromFinding = async (finding: ComplianceFinding, templateId?: string) => {
    setIsGenerating(true)
    try {
      const template = templateId ? templates.find(t => t.id === templateId) : undefined
      const workflowData = await generator.generateWorkflowFromFinding(finding, template)
      
      const workflow: CAPAWorkflow = {
        id: crypto.randomUUID(),
        initiatedBy: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...workflowData
      } as CAPAWorkflow
      
      setWorkflows(current => [...current, workflow])
      return workflow
    } catch (error) {
      console.error('Failed to generate CAPA from finding:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const optimizeWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) throw new Error('Workflow not found')
    
    setIsGenerating(true)
    try {
      const optimizations = await generator.optimizeWorkflow(workflow)
      
      setWorkflows(current =>
        current.map(w =>
          w.id === workflowId
            ? { ...w, ...optimizations }
            : w
        )
      )
    } catch (error) {
      console.error('Failed to optimize workflow:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const updateWorkflow = (workflowId: string, updates: Partial<CAPAWorkflow>) => {
    setWorkflows(current =>
      current.map(workflow =>
        workflow.id === workflowId
          ? { ...workflow, ...updates, updatedAt: new Date().toISOString() }
          : workflow
      )
    )
  }

  const updateAction = (workflowId: string, actionId: string, updates: Partial<CAPAAction>, actionType: 'immediate' | 'corrective' | 'preventive') => {
    setWorkflows(current =>
      current.map(workflow => {
        if (workflow.id !== workflowId) return workflow
        
        const actionKey = `${actionType}Actions` as keyof CAPAWorkflow
        const actions = workflow[actionKey] as CAPAAction[]
        
        return {
          ...workflow,
          [actionKey]: actions.map(action =>
            action.id === actionId ? { ...action, ...updates } : action
          ),
          updatedAt: new Date().toISOString()
        }
      })
    )
  }

  const getMetrics = (): CAPAMetrics => {
    return generator.calculateMetrics(workflows)
  }

  const getOverdueWorkflows = () => {
    const now = new Date()
    return workflows.filter(w => 
      !['completed', 'closed'].includes(w.status) && 
      new Date(w.dueDate) < now
    )
  }

  const getWorkflowsByStatus = (status: string) => {
    return workflows.filter(w => w.status === status)
  }

  return {
    workflows,
    templates,
    isGenerating,
    generateFromGap,
    generateFromFinding,
    optimizeWorkflow,
    updateWorkflow,
    updateAction,
    getMetrics,
    getOverdueWorkflows,
    getWorkflowsByStatus,
    generator
  }
}