import { useKV } from '@github/spark/hooks'
import { ComplianceHeader } from '@/components/ComplianceHeader'
import { ComplianceSidebar } from '@/components/ComplianceSidebar'
import { ComplianceDashboard } from '@/components/ComplianceDashboard'
import { AuditSimulations } from '@/components/AuditSimulations'
import { EvidenceManager } from '@/components/EvidenceManager'
import { ComplianceGapAnalyzer } from '@/components/ComplianceGapAnalyzer'
import { RegulatoryIntelligence } from '@/components/RegulatoryIntelligence'
import { DigestScheduler } from '@/components/DigestScheduler'
import { WebhookIntegrations } from '@/components/WebhookIntegrations'
import { WebhookNotificationSystem } from '@/components/WebhookNotificationSystem'
import { CAPAWorkflowGenerator } from '@/components/CAPAWorkflowGenerator'
import { ResourceAllocation } from '@/components/ResourceAllocation'
import { TemplateOptimizationEngine } from '@/components/TemplateOptimizationEngine'
import { useEffect } from 'react'

type SectionType = 'dashboard' | 'simulations' | 'evidence' | 'gap-analysis' | 'workflows' | 'intelligence' | 'scheduler' | 'webhooks' | 'resources' | 'team' | 'settings'

function App() {
  const [activeSection, setActiveSection] = useKV<SectionType>('active-section', 'dashboard')
  const [isWebhookMonitoring] = useKV('webhook-monitoring', false)

  // Handle navigation events from dashboard widgets
  useEffect(() => {
    const handleNavigateToWebhooks = () => {
      setActiveSection('webhooks')
    }

    const handleNavigateToWorkflows = () => {
      setActiveSection('workflows')
    }

    const handleNavigateToResources = () => {
      setActiveSection('resources')
    }

    window.addEventListener('navigate-to-webhooks', handleNavigateToWebhooks)
    window.addEventListener('navigate-to-workflows', handleNavigateToWorkflows)
    window.addEventListener('navigate-to-resources', handleNavigateToResources)
    return () => {
      window.removeEventListener('navigate-to-webhooks', handleNavigateToWebhooks)
      window.removeEventListener('navigate-to-workflows', handleNavigateToWorkflows)
      window.removeEventListener('navigate-to-resources', handleNavigateToResources)
    }
  }, [setActiveSection])

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ComplianceDashboard />
      case 'simulations':
        return <AuditSimulations />
      case 'evidence':
        return <EvidenceManager />
      case 'gap-analysis':
        return <ComplianceGapAnalyzer />
      case 'workflows':
        return <CAPAWorkflowGenerator />
      case 'intelligence':
        return <RegulatoryIntelligence />
      case 'scheduler':
        return <DigestScheduler />
      case 'webhooks':
        return <WebhookIntegrations />
      case 'resources':
        return <ResourceAllocation />
      case 'team':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Team Management</h2>
            <p className="text-muted-foreground">User roles, permissions, and collaboration tools coming soon.</p>
          </div>
        )
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Settings</h2>
            <p className="text-muted-foreground">System configuration and preferences coming soon.</p>
          </div>
        )
      default:
        return <ComplianceDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <ComplianceHeader />
      <div className="flex">
        <ComplianceSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 overflow-auto">
          {renderSection()}
        </main>
      </div>
      
      {/* Global webhook notification system */}
      <WebhookNotificationSystem isMonitoring={isWebhookMonitoring} />
    </div>
  )
}

export default App