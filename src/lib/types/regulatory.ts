// Core regulatory database types based on the VirtualBackroom architecture
export type RegFramework = 'FDA_QSR' | 'ISO_13485' | 'EU_MDR' | 'ISO_14971' | 'ANVISA' | 'PMDA' | 'TGA'
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'requires_review' | 'pending' | 'not_applicable'
export type FindingSeverity = 'critical' | 'major' | 'minor' | 'observation'

export interface RegulatoryDatabase {
  id: string
  name: string
  framework: RegFramework
  endpoint: string
  apiKey?: string
  isActive: boolean
  lastSync?: string
  syncInterval: number // hours
  priority: number
}

export interface ComplianceRule {
  id: string
  framework: RegFramework
  section: string
  title: string
  description: string
  requirements: string[]
  checkMethod: 'automated' | 'manual' | 'hybrid'
  severity: FindingSeverity
  lastUpdated: string
}

export interface ComplianceCheck {
  id: string
  ruleId: string
  entityId: string
  entityType: 'document' | 'process' | 'system' | 'procedure'
  status: ComplianceStatus
  findings: ComplianceFinding[]
  checkedAt: string
  nextCheck?: string
  autoRemediation?: RemediationAction[]
}

export interface ComplianceFinding {
  id: string
  checkId: string
  ruleId: string
  severity: FindingSeverity
  title: string
  description: string
  evidence: string[]
  recommendations: string[]
  citation: RegulatoryReference
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk'
  assignee?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface RegulatoryReference {
  framework: RegFramework
  section: string
  subsection?: string
  paragraph?: string
  title: string
  url?: string
  effectiveDate?: string
}

export interface RemediationAction {
  id: string
  findingId: string
  action: string
  priority: 'high' | 'medium' | 'low'
  estimatedEffort: number // hours
  status: 'pending' | 'in_progress' | 'completed'
  assignee?: string
  dueDate?: string
}

export interface RegulatoryUpdate {
  id: string
  framework: RegFramework
  section: string
  changeType: 'new' | 'modified' | 'deprecated' | 'withdrawn'
  title: string
  summary: string
  impactAssessment: string
  effectiveDate: string
  publishedDate: string
  source: string
  url?: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  affectedEntities: string[]
}

export interface DatabaseSyncResult {
  databaseId: string
  framework: RegFramework
  syncStarted: string
  syncCompleted: string
  rulesUpdated: number
  rulesAdded: number
  rulesRemoved: number
  errors: string[]
  nextSync: string
}

export interface ComplianceGap {
  id: string
  framework: RegFramework
  requirement: string
  currentState: string
  targetState: string
  gapSeverity: FindingSeverity
  estimatedEffort: number
  priority: number
  recommendations: string[]
  dependencies: string[]
  timeline: string
}

export interface AuditTrail {
  id: string
  entityType: string
  entityId: string
  action: string
  changes: Record<string, any>
  userId: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  hash: string
  previousHash?: string
}

// AI-powered analysis types
export interface IntelligentRecommendation {
  id: string
  type: 'compliance_action' | 'process_improvement' | 'risk_mitigation'
  title: string
  description: string
  reasoning: string
  confidence: number
  priority: 'urgent' | 'high' | 'medium' | 'low'
  estimatedImpact: string
  requiredResources: string[]
  timeline: string
  dependencies: string[]
  references: RegulatoryReference[]
}