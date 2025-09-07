import { useKV } from '@github/spark/hooks'
import { useState, useEffect } from 'react'
import type { RegulatoryUpdate, ComplianceAlert, ComplianceGap } from '@/lib/types/regulatory'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
  category: 'regulatory_update' | 'compliance_alert' | 'gap_analysis' | 'audit_reminder' | 'training_notification' | 'custom'
  isActive: boolean
  lastUsed?: string
  createdAt: string
  updatedAt: string
}

export interface EmailSchedule {
  id: string
  templateId: string
  recipients: EmailRecipient[]
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  scheduledTime?: string // for non-immediate schedules
  conditions: EmailCondition[]
  isActive: boolean
  nextSend?: string
  lastSent?: string
  createdAt: string
}

export interface EmailRecipient {
  id: string
  email: string
  name: string
  role: 'admin' | 'compliance_officer' | 'auditor' | 'manager' | 'user'
  preferences: {
    regulatory_updates: boolean
    compliance_alerts: boolean
    gap_analysis: boolean
    audit_reminders: boolean
    training_notifications: boolean
  }
  isActive: boolean
}

export interface EmailCondition {
  type: 'framework_update' | 'alert_severity' | 'gap_priority' | 'audit_due' | 'custom'
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
  value: string
  field?: string
}

export interface EmailEvent {
  id: string
  scheduleId: string
  templateId: string
  recipients: string[]
  subject: string
  content: string
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled'
  scheduledAt: string
  sentAt?: string
  errorMessage?: string
  metadata: Record<string, any>
}

export interface EmailDeliveryStats {
  templateId: string
  templateName: string
  totalSent: number
  totalDelivered: number
  totalFailed: number
  deliveryRate: number
  lastSent?: string
  avgOpenRate?: number
  avgClickRate?: number
}

export class AutomatedEmailService {
  private static instance: AutomatedEmailService
  
  private constructor() {}
  
  static getInstance(): AutomatedEmailService {
    if (!AutomatedEmailService.instance) {
      AutomatedEmailService.instance = new AutomatedEmailService()
    }
    return AutomatedEmailService.instance
  }

  async processRegulatoryUpdate(update: RegulatoryUpdate, templates: EmailTemplate[], schedules: EmailSchedule[]): Promise<EmailEvent[]> {
    const events: EmailEvent[] = []
    
    // Find relevant email schedules for regulatory updates
    const relevantSchedules = schedules.filter(schedule => {
      const template = templates.find(t => t.id === schedule.templateId)
      if (!template || !template.isActive || !schedule.isActive) return false
      
      // Check if schedule conditions match the update
      return schedule.conditions.every(condition => {
        switch (condition.type) {
          case 'framework_update':
            return condition.value === update.framework || condition.value === 'all'
          case 'alert_severity':
            return condition.value === update.priority || condition.value === 'all'
          default:
            return true
        }
      })
    })

    for (const schedule of relevantSchedules) {
      const template = templates.find(t => t.id === schedule.templateId)
      if (!template) continue

      const event = await this.createEmailEvent(schedule, template, update)
      if (event) {
        events.push(event)
      }
    }

    return events
  }

  async processComplianceAlert(alert: ComplianceAlert, templates: EmailTemplate[], schedules: EmailSchedule[]): Promise<EmailEvent[]> {
    const events: EmailEvent[] = []
    
    const relevantSchedules = schedules.filter(schedule => {
      const template = templates.find(t => t.id === schedule.templateId)
      if (!template || !template.isActive || !schedule.isActive) return false
      
      return schedule.conditions.every(condition => {
        switch (condition.type) {
          case 'alert_severity':
            return condition.value === alert.severity || condition.value === 'all'
          default:
            return true
        }
      })
    })

    for (const schedule of relevantSchedules) {
      const template = templates.find(t => t.id === schedule.templateId)
      if (!template) continue

      const event = await this.createEmailEvent(schedule, template, alert)
      if (event) {
        events.push(event)
      }
    }

    return events
  }

  private async createEmailEvent(
    schedule: EmailSchedule,
    template: EmailTemplate,
    data: any
  ): Promise<EmailEvent | null> {
    try {
      // Filter recipients based on preferences
      const eligibleRecipients = schedule.recipients.filter(recipient => {
        if (!recipient.isActive) return false
        
        switch (template.category) {
          case 'regulatory_update':
            return recipient.preferences.regulatory_updates
          case 'compliance_alert':
            return recipient.preferences.compliance_alerts
          case 'gap_analysis':
            return recipient.preferences.gap_analysis
          case 'audit_reminder':
            return recipient.preferences.audit_reminders
          case 'training_notification':
            return recipient.preferences.training_notifications
          default:
            return true
        }
      })

      if (eligibleRecipients.length === 0) return null

      // Process template variables
      const processedSubject = this.processTemplate(template.subject, data)
      const processedContent = this.processTemplate(template.content, data)

      const event: EmailEvent = {
        id: crypto.randomUUID(),
        scheduleId: schedule.id,
        templateId: template.id,
        recipients: eligibleRecipients.map(r => r.email),
        subject: processedSubject,
        content: processedContent,
        status: schedule.frequency === 'immediate' ? 'scheduled' : 'scheduled',
        scheduledAt: schedule.frequency === 'immediate' 
          ? new Date().toISOString()
          : this.calculateNextSendTime(schedule),
        metadata: {
          dataType: data.constructor.name,
          dataId: data.id,
          recipientCount: eligibleRecipients.length
        }
      }

      return event
    } catch (error) {
      console.error('Failed to create email event:', error)
      return null
    }
  }

  private processTemplate(template: string, data: any): string {
    let processed = template
    
    // Common variables
    const variables = {
      '{{date}}': new Date().toLocaleDateString(),
      '{{time}}': new Date().toLocaleTimeString(),
      '{{datetime}}': new Date().toLocaleString(),
      '{{title}}': data.title || data.name || 'N/A',
      '{{description}}': data.description || data.summary || 'N/A',
      '{{priority}}': data.priority || data.severity || 'medium',
      '{{framework}}': data.framework || 'N/A',
      '{{effective_date}}': data.effectiveDate || data.dueDate || 'N/A',
      '{{recommendations}}': Array.isArray(data.recommendations) 
        ? data.recommendations.join(', ') 
        : data.recommendedActions?.join(', ') || 'None'
    }

    for (const [variable, value] of Object.entries(variables)) {
      processed = processed.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), String(value))
    }

    return processed
  }

  private calculateNextSendTime(schedule: EmailSchedule): string {
    const now = new Date()
    
    switch (schedule.frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString()
      case 'daily':
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        if (schedule.scheduledTime) {
          const [hours, minutes] = schedule.scheduledTime.split(':').map(Number)
          tomorrow.setHours(hours, minutes, 0, 0)
        }
        return tomorrow.toISOString()
      case 'weekly':
        const nextWeek = new Date(now)
        nextWeek.setDate(nextWeek.getDate() + 7)
        if (schedule.scheduledTime) {
          const [hours, minutes] = schedule.scheduledTime.split(':').map(Number)
          nextWeek.setHours(hours, minutes, 0, 0)
        }
        return nextWeek.toISOString()
      case 'monthly':
        const nextMonth = new Date(now)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        if (schedule.scheduledTime) {
          const [hours, minutes] = schedule.scheduledTime.split(':').map(Number)
          nextMonth.setHours(hours, minutes, 0, 0)
        }
        return nextMonth.toISOString()
      default:
        return now.toISOString()
    }
  }

  async sendEmail(event: EmailEvent): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with an email service
      // For now, we'll simulate the email sending process
      
      console.log(`Sending email: ${event.subject}`)
      console.log(`Recipients: ${event.recipients.join(', ')}`)
      console.log(`Content: ${event.content.substring(0, 100)}...`)

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulate 95% success rate
      return Math.random() > 0.05
    } catch (error) {
      console.error('Email sending failed:', error)
      return false
    }
  }

  generateDeliveryStats(events: EmailEvent[], templates: EmailTemplate[]): EmailDeliveryStats[] {
    const stats: EmailDeliveryStats[] = []
    
    for (const template of templates) {
      const templateEvents = events.filter(e => e.templateId === template.id)
      
      const totalSent = templateEvents.length
      const totalDelivered = templateEvents.filter(e => e.status === 'sent').length
      const totalFailed = templateEvents.filter(e => e.status === 'failed').length
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
      
      const lastSentEvent = templateEvents
        .filter(e => e.sentAt)
        .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime())[0]

      stats.push({
        templateId: template.id,
        templateName: template.name,
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate,
        lastSent: lastSentEvent?.sentAt,
        avgOpenRate: Math.random() * 30 + 60, // Mock data
        avgClickRate: Math.random() * 10 + 5   // Mock data
      })
    }
    
    return stats.sort((a, b) => b.totalSent - a.totalSent)
  }
}

// React hook for automated email notifications
export function useAutomatedEmail() {
  const [templates, setTemplates] = useKV<EmailTemplate[]>('email-templates', [])
  const [schedules, setSchedules] = useKV<EmailSchedule[]>('email-schedules', [])
  const [recipients, setRecipients] = useKV<EmailRecipient[]>('email-recipients', [])
  const [events, setEvents] = useKV<EmailEvent[]>('email-events', [])
  
  const [isProcessing, setIsProcessing] = useState(false)
  
  const service = AutomatedEmailService.getInstance()

  // Auto-process scheduled emails
  useEffect(() => {
    const processScheduledEmails = async () => {
      if (isProcessing) return
      
      setIsProcessing(true)
      try {
        const now = new Date()
        const dueEvents = events.filter(event => 
          event.status === 'scheduled' && 
          new Date(event.scheduledAt) <= now
        )

        for (const event of dueEvents) {
          const success = await service.sendEmail(event)
          
          setEvents(current => 
            current.map(e => 
              e.id === event.id 
                ? {
                    ...e,
                    status: success ? 'sent' : 'failed',
                    sentAt: success ? new Date().toISOString() : undefined,
                    errorMessage: success ? undefined : 'Delivery failed'
                  }
                : e
            )
          )
        }
      } catch (error) {
        console.error('Email processing failed:', error)
      } finally {
        setIsProcessing(false)
      }
    }

    const interval = setInterval(processScheduledEmails, 5 * 60 * 1000) // Check every 5 minutes
    processScheduledEmails() // Initial check

    return () => clearInterval(interval)
  }, [events, setEvents, service, isProcessing])

  const addTemplate = (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setTemplates(current => [...current, newTemplate])
  }

  const updateTemplate = (id: string, updates: Partial<EmailTemplate>) => {
    setTemplates(current =>
      current.map(template =>
        template.id === id
          ? { ...template, ...updates, updatedAt: new Date().toISOString() }
          : template
      )
    )
  }

  const deleteTemplate = (id: string) => {
    setTemplates(current => current.filter(template => template.id !== id))
    // Also remove associated schedules
    setSchedules(current => current.filter(schedule => schedule.templateId !== id))
  }

  const addSchedule = (schedule: Omit<EmailSchedule, 'id' | 'createdAt'>) => {
    const newSchedule: EmailSchedule = {
      ...schedule,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }
    setSchedules(current => [...current, newSchedule])
  }

  const updateSchedule = (id: string, updates: Partial<EmailSchedule>) => {
    setSchedules(current =>
      current.map(schedule =>
        schedule.id === id ? { ...schedule, ...updates } : schedule
      )
    )
  }

  const deleteSchedule = (id: string) => {
    setSchedules(current => current.filter(schedule => schedule.id !== id))
  }

  const addRecipient = (recipient: Omit<EmailRecipient, 'id'>) => {
    const newRecipient: EmailRecipient = {
      ...recipient,
      id: crypto.randomUUID()
    }
    setRecipients(current => [...current, newRecipient])
  }

  const updateRecipient = (id: string, updates: Partial<EmailRecipient>) => {
    setRecipients(current =>
      current.map(recipient =>
        recipient.id === id ? { ...recipient, ...updates } : recipient
      )
    )
  }

  const deleteRecipient = (id: string) => {
    setRecipients(current => current.filter(recipient => recipient.id !== id))
  }

  const triggerRegulatoryUpdateEmails = async (update: RegulatoryUpdate) => {
    const newEvents = await service.processRegulatoryUpdate(update, templates, schedules)
    setEvents(current => [...current, ...newEvents])
  }

  const triggerComplianceAlertEmails = async (alert: ComplianceAlert) => {
    const newEvents = await service.processComplianceAlert(alert, templates, schedules)
    setEvents(current => [...current, ...newEvents])
  }

  const getDeliveryStats = (): EmailDeliveryStats[] => {
    return service.generateDeliveryStats(events, templates)
  }

  // Statistics
  const stats = {
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.isActive).length,
    totalSchedules: schedules.length,
    activeSchedules: schedules.filter(s => s.isActive).length,
    totalRecipients: recipients.length,
    activeRecipients: recipients.filter(r => r.isActive).length,
    totalEmailsSent: events.filter(e => e.status === 'sent').length,
    emailsFailedToday: events.filter(e => 
      e.status === 'failed' && 
      new Date(e.scheduledAt).toDateString() === new Date().toDateString()
    ).length,
    pendingEmails: events.filter(e => e.status === 'scheduled').length
  }

  return {
    templates,
    schedules,
    recipients,
    events,
    stats,
    isProcessing,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    addRecipient,
    updateRecipient,
    deleteRecipient,
    triggerRegulatoryUpdateEmails,
    triggerComplianceAlertEmails,
    getDeliveryStats,
    service
  }
}