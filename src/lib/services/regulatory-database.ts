import { useKV } from '@github/spark/hooks'
import { useState, useEffect } from 'react'
import type { 
  RegulatoryDatabase, 
  ComplianceRule, 
  ComplianceCheck, 
  RegulatoryUpdate,
  DatabaseSyncResult,
  RegFramework,
  ComplianceGap
} from '@/lib/types/regulatory'

// Enhanced regulatory database service with AI integration
export class RegulatoryDatabaseService {
  private static instance: RegulatoryDatabaseService
  
  private constructor() {}
  
  static getInstance(): RegulatoryDatabaseService {
    if (!RegulatoryDatabaseService.instance) {
      RegulatoryDatabaseService.instance = new RegulatoryDatabaseService()
    }
    return RegulatoryDatabaseService.instance
  }

  // Core database operations
  async syncDatabase(database: RegulatoryDatabase): Promise<DatabaseSyncResult> {
    try {
      const syncStart = new Date().toISOString()
      
      // Simulate API call to regulatory database
      const response = await fetch(`${database.endpoint}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${database.apiKey}`
        },
        body: JSON.stringify({
          framework: database.framework,
          lastSync: database.lastSync
        })
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const syncData = await response.json()
      const syncEnd = new Date().toISOString()

      return {
        databaseId: database.id,
        framework: database.framework,
        syncStarted: syncStart,
        syncCompleted: syncEnd,
        rulesUpdated: syncData.updated || 0,
        rulesAdded: syncData.added || 0,
        rulesRemoved: syncData.removed || 0,
        errors: syncData.errors || [],
        nextSync: new Date(Date.now() + database.syncInterval * 60 * 60 * 1000).toISOString()
      }
    } catch (error) {
      throw new Error(`Database sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // AI-powered gap analysis
  async performGapAnalysis(framework: RegFramework, currentCompliance: ComplianceCheck[]): Promise<ComplianceGap[]> {
    // Simulate AI-powered gap analysis using Spark's LLM API
    const prompt = spark.llmPrompt`
      Analyze the following compliance data for ${framework} and identify gaps:
      ${JSON.stringify(currentCompliance, null, 2)}
      
      Please identify:
      1. Missing compliance requirements
      2. Areas needing improvement
      3. Priority recommendations
      4. Implementation timeline estimates
    `

    try {
      const analysis = await spark.llm(prompt, 'gpt-4o', true)
      const gaps = JSON.parse(analysis)
      
      return gaps.map((gap: any) => ({
        id: crypto.randomUUID(),
        framework,
        requirement: gap.requirement,
        currentState: gap.currentState,
        targetState: gap.targetState,
        gapSeverity: gap.severity,
        estimatedEffort: gap.estimatedHours,
        priority: gap.priority,
        recommendations: gap.recommendations,
        dependencies: gap.dependencies,
        timeline: gap.timeline
      }))
    } catch (error) {
      console.error('Gap analysis failed:', error)
      return []
    }
  }

  // Real-time regulatory update monitoring
  async checkForUpdates(frameworks: RegFramework[]): Promise<RegulatoryUpdate[]> {
    const updates: RegulatoryUpdate[] = []
    
    for (const framework of frameworks) {
      try {
        // Simulate checking for regulatory updates
        const mockUpdates = await this.getMockRegulatoryUpdates(framework)
        updates.push(...mockUpdates)
      } catch (error) {
        console.error(`Failed to check updates for ${framework}:`, error)
      }
    }
    
    return updates.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
  }

  private async getMockRegulatoryUpdates(framework: RegFramework): Promise<RegulatoryUpdate[]> {
    // Mock regulatory updates - in production, this would connect to actual regulatory APIs
    const mockUpdates: RegulatoryUpdate[] = [
      {
        id: crypto.randomUUID(),
        framework,
        section: '820.30',
        changeType: 'modified',
        title: 'Updated Design Controls Requirements',
        summary: 'New requirements for AI/ML devices in design controls',
        impactAssessment: 'Medium impact on AI-enabled medical devices',
        effectiveDate: '2024-06-01',
        publishedDate: '2024-01-15',
        source: 'FDA',
        url: 'https://fda.gov/example-update',
        priority: 'high',
        affectedEntities: ['design-controls', 'ai-ml-devices']
      }
    ]
    
    return mockUpdates
  }

  // Automated compliance checking
  async performComplianceCheck(
    rules: ComplianceRule[], 
    entityId: string, 
    entityType: string,
    entityData: any
  ): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = []
    
    for (const rule of rules) {
      if (rule.checkMethod === 'automated' || rule.checkMethod === 'hybrid') {
        const check = await this.executeAutomatedCheck(rule, entityId, entityType, entityData)
        checks.push(check)
      }
    }
    
    return checks
  }

  private async executeAutomatedCheck(
    rule: ComplianceRule,
    entityId: string,
    entityType: string,
    entityData: any
  ): Promise<ComplianceCheck> {
    // AI-powered compliance checking
    const prompt = spark.llmPrompt`
      Evaluate the following entity against regulatory rule:
      
      Rule: ${rule.title}
      Requirements: ${rule.requirements.join(', ')}
      Entity Type: ${entityType}
      Entity Data: ${JSON.stringify(entityData, null, 2)}
      
      Provide a compliance assessment with findings and recommendations.
    `

    try {
      const assessment = await spark.llm(prompt, 'gpt-4o', true)
      const result = JSON.parse(assessment)
      
      return {
        id: crypto.randomUUID(),
        ruleId: rule.id,
        entityId,
        entityType: entityType as any,
        status: result.status || 'requires_review',
        findings: result.findings || [],
        checkedAt: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        autoRemediation: result.remediationActions || []
      }
    } catch (error) {
      console.error('Automated check failed:', error)
      return {
        id: crypto.randomUUID(),
        ruleId: rule.id,
        entityId,
        entityType: entityType as any,
        status: 'pending',
        findings: [],
        checkedAt: new Date().toISOString()
      }
    }
  }
}

// React hook for regulatory database integration
export function useRegulatoryDatabase() {
  const [databases, setDatabases] = useKV<RegulatoryDatabase[]>('regulatory-databases', [])
  const [complianceRules, setComplianceRules] = useKV<ComplianceRule[]>('compliance-rules', [])
  const [complianceChecks, setComplianceChecks] = useKV<ComplianceCheck[]>('compliance-checks', [])
  const [regulatoryUpdates, setRegulatoryUpdates] = useKV<RegulatoryUpdate[]>('regulatory-updates', [])
  const [syncResults, setSyncResults] = useKV<DatabaseSyncResult[]>('sync-results', [])
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const service = RegulatoryDatabaseService.getInstance()

  // Auto-sync databases on interval
  useEffect(() => {
    const autoSync = async () => {
      const activeDatabases = databases.filter(db => db.isActive)
      
      for (const database of activeDatabases) {
        const lastSync = database.lastSync ? new Date(database.lastSync) : null
        const nextSync = lastSync ? new Date(lastSync.getTime() + database.syncInterval * 60 * 60 * 1000) : new Date()
        
        if (!lastSync || new Date() >= nextSync) {
          try {
            const result = await service.syncDatabase(database)
            setSyncResults(current => [...current.filter(r => r.databaseId !== database.id), result])
            
            // Update database last sync time
            setDatabases(current => 
              current.map(db => 
                db.id === database.id 
                  ? { ...db, lastSync: result.syncCompleted }
                  : db
              )
            )
          } catch (error) {
            console.error(`Auto-sync failed for ${database.name}:`, error)
          }
        }
      }
    }

    const interval = setInterval(autoSync, 60 * 60 * 1000) // Check every hour
    autoSync() // Initial check
    
    return () => clearInterval(interval)
  }, [databases, setSyncResults, setDatabases])

  const syncDatabase = async (databaseId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const database = databases.find(db => db.id === databaseId)
      if (!database) {
        throw new Error('Database not found')
      }
      
      const result = await service.syncDatabase(database)
      setSyncResults(current => [...current.filter(r => r.databaseId !== databaseId), result])
      
      // Update last sync time
      setDatabases(current => 
        current.map(db => 
          db.id === databaseId 
            ? { ...db, lastSync: result.syncCompleted }
            : db
        )
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sync failed')
    } finally {
      setIsLoading(false)
    }
  }

  const checkForUpdates = async (frameworks?: RegFramework[]) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const frameworksToCheck = frameworks || databases.map(db => db.framework)
      const updates = await service.checkForUpdates(frameworksToCheck)
      setRegulatoryUpdates(current => {
        const existingIds = new Set(current.map(u => u.id))
        const newUpdates = updates.filter(u => !existingIds.has(u.id))
        return [...current, ...newUpdates]
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to check for updates')
    } finally {
      setIsLoading(false)
    }
  }

  const performGapAnalysis = async (framework: RegFramework) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const frameworkChecks = complianceChecks.filter(check => 
        complianceRules.find(rule => rule.id === check.ruleId)?.framework === framework
      )
      
      const gaps = await service.performGapAnalysis(framework, frameworkChecks)
      return gaps
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gap analysis failed')
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const addDatabase = (database: Omit<RegulatoryDatabase, 'id'>) => {
    const newDatabase: RegulatoryDatabase = {
      ...database,
      id: crypto.randomUUID()
    }
    setDatabases(current => [...current, newDatabase])
  }

  const updateDatabase = (id: string, updates: Partial<RegulatoryDatabase>) => {
    setDatabases(current => 
      current.map(db => db.id === id ? { ...db, ...updates } : db)
    )
  }

  const deleteDatabase = (id: string) => {
    setDatabases(current => current.filter(db => db.id !== id))
    setSyncResults(current => current.filter(result => result.databaseId !== id))
  }

  return {
    databases,
    complianceRules,
    complianceChecks,
    regulatoryUpdates,
    syncResults,
    isLoading,
    error,
    syncDatabase,
    checkForUpdates,
    performGapAnalysis,
    addDatabase,
    updateDatabase,
    deleteDatabase,
    service
  }
}