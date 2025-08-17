import { useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface WebhookEvent {
  id: string
  source: string
  type: 'guidance.updated' | 'recall.issued' | 'standard.revised' | 'compliance.alert'
  data: any
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface WebhookEndpoint {
  id: string
  name: string
  url: string
  database: string
  events: string[]
  active: boolean
}

class WebhookMonitoringService {
  private eventListeners: Array<(event: WebhookEvent) => void> = []
  private endpoints: WebhookEndpoint[] = []
  private isMonitoring = false
  private monitoringInterval?: NodeJS.Timeout

  addEndpoint(endpoint: WebhookEndpoint) {
    this.endpoints.push(endpoint)
    if (this.isMonitoring) {
      this.restartMonitoring()
    }
  }

  removeEndpoint(endpointId: string) {
    this.endpoints = this.endpoints.filter(ep => ep.id !== endpointId)
  }

  updateEndpoint(endpointId: string, updates: Partial<WebhookEndpoint>) {
    this.endpoints = this.endpoints.map(ep =>
      ep.id === endpointId ? { ...ep, ...updates } : ep
    )
  }

  addEventListener(listener: (event: WebhookEvent) => void) {
    this.eventListeners.push(listener)
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== listener)
    }
  }

  startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    
    // Simulate real-time webhook events
    this.monitoringInterval = setInterval(() => {
      const activeEndpoints = this.endpoints.filter(ep => ep.active)
      
      if (activeEndpoints.length === 0) return

      // 30% chance of receiving an event every 5 seconds
      if (Math.random() > 0.7) {
        const randomEndpoint = activeEndpoints[Math.floor(Math.random() * activeEndpoints.length)]
        const event = this.generateMockEvent(randomEndpoint)
        
        // Notify all listeners
        this.eventListeners.forEach(listener => listener(event))
        
        // Show toast notification
        this.showNotification(event)
      }
    }, 5000)
  }

  stopMonitoring() {
    this.isMonitoring = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
  }

  private restartMonitoring() {
    this.stopMonitoring()
    this.startMonitoring()
  }

  private generateMockEvent(endpoint: WebhookEndpoint): WebhookEvent {
    const eventTypes = [
      'guidance.updated',
      'recall.issued',
      'standard.revised',
      'compliance.alert'
    ] as const

    const severities = ['low', 'medium', 'high', 'critical'] as const
    
    const mockData = {
      'guidance.updated': {
        document: 'FDA Guidance on AI/ML-Based Medical Device Software',
        version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
        changes: [
          'Updated validation requirements',
          'Enhanced risk management guidance',
          'New cybersecurity considerations'
        ]
      },
      'recall.issued': {
        device: `Medical Device Model ${Math.random().toString(36).substring(7).toUpperCase()}`,
        recallClass: ['Class I', 'Class II', 'Class III'][Math.floor(Math.random() * 3)],
        reason: 'Software malfunction affecting critical functionality',
        affectedDevices: Math.floor(Math.random() * 10000) + 100
      },
      'standard.revised': {
        standard: ['ISO 13485:2016', 'ISO 14971:2019', 'IEC 62304:2006'][Math.floor(Math.random() * 3)],
        amendment: `Amendment ${Math.floor(Math.random() * 3) + 1}:2024`,
        changes: [
          'Updated cybersecurity requirements',
          'AI/ML device considerations',
          'Enhanced risk management'
        ]
      },
      'compliance.alert': {
        type: 'gap_detected',
        message: 'Potential compliance gap identified based on recent regulatory changes',
        impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
      }
    }

    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      source: endpoint.database,
      type: eventType,
      data: mockData[eventType],
      timestamp: new Date().toISOString(),
      severity: severities[Math.floor(Math.random() * severities.length)]
    }
  }

  private showNotification(event: WebhookEvent) {
    const severityConfig = {
      critical: { icon: '🚨', duration: 10000 },
      high: { icon: '⚠️', duration: 8000 },
      medium: { icon: '📋', duration: 6000 },
      low: { icon: 'ℹ️', duration: 4000 }
    }

    const config = severityConfig[event.severity]
    const title = this.getEventTitle(event)

    if (event.severity === 'critical' || event.severity === 'high') {
      toast.error(`${config.icon} ${title}`, {
        description: this.getEventDescription(event),
        duration: config.duration,
        action: {
          label: 'View Details',
          onClick: () => {
            // This could navigate to a detailed view
            console.log('View details for event:', event)
          }
        }
      })
    } else {
      toast.info(`${config.icon} ${title}`, {
        description: this.getEventDescription(event),
        duration: config.duration
      })
    }
  }

  private getEventTitle(event: WebhookEvent): string {
    switch (event.type) {
      case 'guidance.updated':
        return 'Regulatory Guidance Updated'
      case 'recall.issued':
        return 'Medical Device Recall Issued'
      case 'standard.revised':
        return 'Industry Standard Revised'
      case 'compliance.alert':
        return 'Compliance Alert'
      default:
        return 'Regulatory Update'
    }
  }

  private getEventDescription(event: WebhookEvent): string {
    switch (event.type) {
      case 'guidance.updated':
        return `${event.data.document} version ${event.data.version}`
      case 'recall.issued':
        return `${event.data.recallClass} recall: ${event.data.device}`
      case 'standard.revised':
        return `${event.data.standard} ${event.data.amendment}`
      case 'compliance.alert':
        return event.data.message
      default:
        return 'Check webhook integrations for details'
    }
  }

  getActiveEndpoints() {
    return this.endpoints.filter(ep => ep.active)
  }

  isCurrentlyMonitoring() {
    return this.isMonitoring
  }
}

// Singleton instance
export const webhookService = new WebhookMonitoringService()

// React hook for webhook monitoring
export function useWebhookMonitoring() {
  const startMonitoring = useCallback(() => {
    webhookService.startMonitoring()
  }, [])

  const stopMonitoring = useCallback(() => {
    webhookService.stopMonitoring()
  }, [])

  const addEventListene = useCallback((listener: (event: WebhookEvent) => void) => {
    return webhookService.addEventListener(listener)
  }, [])

  return {
    startMonitoring,
    stopMonitoring,
    addEventListener: addEventListene,
    addEndpoint: webhookService.addEndpoint.bind(webhookService),
    removeEndpoint: webhookService.removeEndpoint.bind(webhookService),
    updateEndpoint: webhookService.updateEndpoint.bind(webhookService),
    getActiveEndpoints: webhookService.getActiveEndpoints.bind(webhookService),
    isMonitoring: webhookService.isCurrentlyMonitoring.bind(webhookService)
  }
}

// Hook for webhook events
export function useWebhookEvents(callback: (event: WebhookEvent) => void) {
  useEffect(() => {
    const removeListener = webhookService.addEventListener(callback)
    return removeListener
  }, [callback])
}

// Real-time webhook simulation for development
export function useWebhookSimulation(enabled: boolean, endpoints: WebhookEndpoint[]) {
  useEffect(() => {
    // Update service with current endpoints
    endpoints.forEach(endpoint => {
      webhookService.addEndpoint(endpoint)
    })

    if (enabled) {
      webhookService.startMonitoring()
    } else {
      webhookService.stopMonitoring()
    }

    return () => {
      webhookService.stopMonitoring()
    }
  }, [enabled, endpoints])
}