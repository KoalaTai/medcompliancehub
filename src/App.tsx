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
import { SkillGapAnalyzer } from '@/components/SkillGapAnalyzer'
import { TeamSkillComparison } from '@/components/TeamSkillComparison'
import { CareerPathRecommendations } from '@/components/CareerPathRecommendations'
import { LearningResourceIntegration } from '@/components/LearningResourceIntegration'
import { EmailTemplateManager } from '@/components/EmailTemplateManager'
import { FeatureGapAnalyzer } from '@/components/FeatureGapAnalyzer'
import { DevelopmentRoadmap } from '@/components/DevelopmentRoadmap'
import { MilestoneTracker } from '@/components/MilestoneTracker'
import { RegulatoryDatabaseIntegration } from '@/components/RegulatoryDatabaseIntegration'
import { IntelligentComplianceMonitor } from '@/components/IntelligentComplianceMonitor'
import { useEffect } from 'react'

type SectionType = 'dashboard' | 'simulations' | 'evidence' | 'gap-analysis' | 'workflows' | 'intelligence' | 'scheduler' | 'webhooks' | 'resources' | 'skills' | 'team-comparison' | 'career-paths' | 'learning-resources' | 'email-templates' | 'feature-gaps' | 'roadmap' | 'milestones' | 'regulatory-db' | 'compliance-monitor' | 'team' | 'settings'

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

    const handleNavigateToSkills = () => {
      setActiveSection('skills')
    }

    const handleNavigateToTeamComparison = () => {
      setActiveSection('team-comparison')
    }

    const handleNavigateToCareerPaths = () => {
      setActiveSection('career-paths')
    }

    const handleNavigateToLearningResources = () => {
      setActiveSection('learning-resources')
    }

    const handleNavigateToEmailTemplates = () => {
      setActiveSection('email-templates')
    }

    const handleNavigateToFeatureGaps = () => {
      setActiveSection('feature-gaps')
    }

    const handleNavigateToRoadmap = () => {
      setActiveSection('roadmap')
    }

    const handleNavigateToMilestones = () => {
      setActiveSection('milestones')
    }

    const handleNavigateToRegulatoryDB = () => {
      setActiveSection('regulatory-db')
    }

    const handleNavigateToComplianceMonitor = () => {
      setActiveSection('compliance-monitor')
    }

    window.addEventListener('navigate-to-webhooks', handleNavigateToWebhooks)
    window.addEventListener('navigate-to-workflows', handleNavigateToWorkflows)
    window.addEventListener('navigate-to-resources', handleNavigateToResources)
    window.addEventListener('navigate-to-skills', handleNavigateToSkills)
    window.addEventListener('navigate-to-team-comparison', handleNavigateToTeamComparison)
    window.addEventListener('navigate-to-career-paths', handleNavigateToCareerPaths)
    window.addEventListener('navigate-to-learning-resources', handleNavigateToLearningResources)
    window.addEventListener('navigate-to-email-templates', handleNavigateToEmailTemplates)
    window.addEventListener('navigate-to-feature-gaps', handleNavigateToFeatureGaps)
    window.addEventListener('navigate-to-roadmap', handleNavigateToRoadmap)
    window.addEventListener('navigate-to-milestones', handleNavigateToMilestones)
    window.addEventListener('navigate-to-regulatory-db', handleNavigateToRegulatoryDB)
    window.addEventListener('navigate-to-compliance-monitor', handleNavigateToComplianceMonitor)
    return () => {
      window.removeEventListener('navigate-to-webhooks', handleNavigateToWebhooks)
      window.removeEventListener('navigate-to-workflows', handleNavigateToWorkflows)
      window.removeEventListener('navigate-to-resources', handleNavigateToResources)
      window.removeEventListener('navigate-to-skills', handleNavigateToSkills)
      window.removeEventListener('navigate-to-team-comparison', handleNavigateToTeamComparison)
      window.removeEventListener('navigate-to-career-paths', handleNavigateToCareerPaths)
      window.removeEventListener('navigate-to-learning-resources', handleNavigateToLearningResources)
      window.removeEventListener('navigate-to-email-templates', handleNavigateToEmailTemplates)
      window.removeEventListener('navigate-to-feature-gaps', handleNavigateToFeatureGaps)
      window.removeEventListener('navigate-to-roadmap', handleNavigateToRoadmap)
      window.removeEventListener('navigate-to-milestones', handleNavigateToMilestones)
      window.removeEventListener('navigate-to-regulatory-db', handleNavigateToRegulatoryDB)
      window.removeEventListener('navigate-to-compliance-monitor', handleNavigateToComplianceMonitor)
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
      case 'skills':
        return <SkillGapAnalyzer />
      case 'team-comparison':
        return <TeamSkillComparison />
      case 'career-paths':
        return <CareerPathRecommendations />
      case 'learning-resources':
        return <LearningResourceIntegration />
      case 'email-templates':
        return <EmailTemplateManager />
      case 'feature-gaps':
        return <FeatureGapAnalyzer />
      case 'roadmap':
        return <DevelopmentRoadmap />
      case 'milestones':
        return <MilestoneTracker />
      case 'regulatory-db':
        return <RegulatoryDatabaseIntegration />
      case 'compliance-monitor':
        return <IntelligentComplianceMonitor />
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