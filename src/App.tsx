import { useKV } from '@github/spark/hooks'
import { ComplianceHeader } from '@/components/ComplianceHeader'
import { ComplianceSidebar } from '@/components/ComplianceSidebar'
import { ComplianceDashboard } from '@/components/ComplianceDashboard'
import { AuditSimulations } from '@/components/AuditSimulations'
import { EvidenceManager } from '@/components/EvidenceManager'

type SectionType = 'dashboard' | 'simulations' | 'evidence' | 'workflows' | 'intelligence' | 'team' | 'settings'

function App() {
  const [activeSection, setActiveSection] = useKV<SectionType>('active-section', 'dashboard')

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ComplianceDashboard />
      case 'simulations':
        return <AuditSimulations />
      case 'evidence':
        return <EvidenceManager />
      case 'workflows':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Compliance Workflows</h2>
            <p className="text-muted-foreground">Automated CAPA, change control, and risk management workflows coming soon.</p>
          </div>
        )
      case 'intelligence':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Regulatory Intelligence</h2>
            <p className="text-muted-foreground">Real-time regulatory updates and impact analysis coming soon.</p>
          </div>
        )
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
    </div>
  )
}

export default App