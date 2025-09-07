import { useKV } from '@github/spark/hooks'
import { useState, useEffect } from 'react'
import type { 
  ComplianceCheck, 
  ComplianceRule, 
  RegulatoryUpdate, 
  IntelligentRecommendation,
  RegFramework,
  AuditTrail
} from '@/lib/types/regulatory'

export interface ComplianceAlert {
  id: string
  type: 'deadline' | 'non_compliance' | 'regulatory_change' | 'gap_detected' | 'threshold_breach'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  affectedEntities: string[]
  recommendedActions: string[]
  dueDate?: string
  createdAt: string
  acknowledged: boolean
  assignee?: string
}

export interface ComplianceTrend {
  framework: RegFramework
  metric: 'compliance_rate' | 'findings_count' | 'remediation_time' | 'audit_readiness'
  values: { date: string; value: number }[]
  trend: 'improving' | 'declining' | 'stable'
  changePercent: number
}

export interface RiskAssessment {
  id: string
  entityType: string
  entityId: string
  framework: RegFramework
  riskScore: number // 0-100
  riskFactors: {
    factor: string
    weight: number
    score: number
    description: string
  }[]
  mitigationStrategies: string[]
  lastAssessed: string
  nextAssessment: string
}

export class IntelligentComplianceMonitor {
  private static instance: IntelligentComplianceMonitor
  
  private constructor() {}
  
  static getInstance(): IntelligentComplianceMonitor {
    if (!IntelligentComplianceMonitor.instance) {
      IntelligentComplianceMonitor.instance = new IntelligentComplianceMonitor()
    }
    return IntelligentComplianceMonitor.instance
  }

  async analyzeComplianceTrends(
    checks: ComplianceCheck[], 
    timeframe: number = 90 // days
  ): Promise<ComplianceTrend[]> {
    const trends: ComplianceTrend[] = []
    const cutoffDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
    
    // Group checks by framework
    const checksByFramework = checks.reduce((acc, check) => {
      // This would normally get framework from the rule, mocking for now
      const framework = 'FDA_QSR' as RegFramework
      if (!acc[framework]) acc[framework] = []
      acc[framework].push(check)
      return acc
    }, {} as Record<RegFramework, ComplianceCheck[]>)

    for (const [framework, frameworkChecks] of Object.entries(checksByFramework)) {
      const recentChecks = frameworkChecks.filter(
        check => new Date(check.checkedAt) >= cutoffDate
      )

      if (recentChecks.length === 0) continue

      // Calculate compliance rate trend
      const complianceValues = this.calculateDailyMetrics(
        recentChecks,
        (checks) => {
          const compliant = checks.filter(c => c.status === 'compliant').length
          return (compliant / checks.length) * 100
        }
      )

      const trend = this.determineTrend(complianceValues)
      
      trends.push({
        framework: framework as RegFramework,
        metric: 'compliance_rate',
        values: complianceValues,
        trend: trend.direction,
        changePercent: trend.changePercent
      })
    }

    return trends
  }

  async generateIntelligentRecommendations(
    checks: ComplianceCheck[],
    rules: ComplianceRule[],
    updates: RegulatoryUpdate[]
  ): Promise<IntelligentRecommendation[]> {
    // Use AI to analyze patterns and generate recommendations
    const prompt = spark.llmPrompt`
      Analyze the following compliance data and generate intelligent recommendations:
      
      Compliance Checks: ${JSON.stringify(checks.slice(-20), null, 2)}
      Rules: ${JSON.stringify(rules.slice(-10), null, 2)}
      Recent Updates: ${JSON.stringify(updates.slice(-5), null, 2)}
      
      Generate actionable recommendations focusing on:
      1. Preventing compliance issues before they occur
      2. Optimizing compliance processes
      3. Addressing regulatory changes proactively
      4. Improving overall compliance posture
      
      Return as JSON array with recommendations including type, priority, reasoning, and implementation steps.
    `

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const recommendations = JSON.parse(response)
      
      return recommendations.map((rec: any) => ({
        id: crypto.randomUUID(),
        type: rec.type || 'process_improvement',
        title: rec.title,
        description: rec.description,
        reasoning: rec.reasoning,
        confidence: rec.confidence || 0.8,
        priority: rec.priority || 'medium',
        estimatedImpact: rec.estimatedImpact || 'Medium improvement in compliance efficiency',
        requiredResources: rec.requiredResources || [],
        timeline: rec.timeline || '2-4 weeks',
        dependencies: rec.dependencies || [],
        references: rec.references || []
      }))
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
      return []
    }
  }

  async assessRisk(
    entityType: string,
    entityId: string,
    framework: RegFramework,
    contextData: any
  ): Promise<RiskAssessment> {
    // AI-powered risk assessment
    const prompt = spark.llmPrompt`
      Perform a comprehensive risk assessment for the following entity:
      
      Entity Type: ${entityType}
      Entity ID: ${entityId}
      Framework: ${framework}
      Context Data: ${JSON.stringify(contextData, null, 2)}
      
      Assess risk factors including:
      1. Compliance history
      2. Regulatory complexity
      3. Change frequency
      4. Business impact
      5. Technical complexity
      
      Return a JSON object with:
      - Overall risk score (0-100)
      - Individual risk factors with weights and scores
      - Mitigation strategies
      - Recommended monitoring frequency
    `

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const assessment = JSON.parse(response)
      
      return {
        id: crypto.randomUUID(),
        entityType,
        entityId,
        framework,
        riskScore: assessment.riskScore || 50,
        riskFactors: assessment.riskFactors || [],
        mitigationStrategies: assessment.mitigationStrategies || [],
        lastAssessed: new Date().toISOString(),
        nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    } catch (error) {
      console.error('Risk assessment failed:', error)
      return {
        id: crypto.randomUUID(),
        entityType,
        entityId,
        framework,
        riskScore: 50,
        riskFactors: [],
        mitigationStrategies: ['Conduct manual review', 'Implement additional monitoring'],
        lastAssessed: new Date().toISOString(),
        nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  }

  async detectAnomalies(checks: ComplianceCheck[]): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = []
    const now = new Date()
    
    // Detect sudden increase in non-compliance
    const recentChecks = checks.filter(
      check => new Date(check.checkedAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    )
    
    const nonCompliantRate = recentChecks.filter(c => c.status === 'non_compliant').length / recentChecks.length
    
    if (nonCompliantRate > 0.3) {
      alerts.push({
        id: crypto.randomUUID(),
        type: 'threshold_breach',
        severity: 'high',
        title: 'High Non-Compliance Rate Detected',
        description: `Non-compliance rate has increased to ${Math.round(nonCompliantRate * 100)}% in the past week`,
        affectedEntities: recentChecks.filter(c => c.status === 'non_compliant').map(c => c.entityId),
        recommendedActions: [
          'Review recent changes in processes',
          'Conduct immediate compliance audit',
          'Implement corrective actions',
          'Increase monitoring frequency'
        ],
        createdAt: now.toISOString(),
        acknowledged: false
      })
    }

    // Detect overdue compliance checks
    const overdueChecks = checks.filter(check => {
      if (!check.nextCheck) return false
      return new Date(check.nextCheck) < now
    })

    if (overdueChecks.length > 0) {
      alerts.push({
        id: crypto.randomUUID(),
        type: 'deadline',
        severity: 'medium',
        title: 'Overdue Compliance Checks',
        description: `${overdueChecks.length} compliance checks are overdue`,
        affectedEntities: overdueChecks.map(c => c.entityId),
        recommendedActions: [
          'Schedule immediate compliance checks',
          'Update compliance calendar',
          'Review check frequencies'
        ],
        createdAt: now.toISOString(),
        acknowledged: false
      })
    }

    return alerts
  }

  private calculateDailyMetrics(
    checks: ComplianceCheck[],
    calculator: (checks: ComplianceCheck[]) => number
  ): { date: string; value: number }[] {
    const dailyChecks: Record<string, ComplianceCheck[]> = {}
    
    checks.forEach(check => {
      const date = new Date(check.checkedAt).toISOString().split('T')[0]
      if (!dailyChecks[date]) dailyChecks[date] = []
      dailyChecks[date].push(check)
    })

    return Object.entries(dailyChecks)
      .map(([date, dayChecks]) => ({
        date,
        value: calculator(dayChecks)
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private determineTrend(values: { date: string; value: number }[]): {
    direction: 'improving' | 'declining' | 'stable'
    changePercent: number
  } {
    if (values.length < 2) {
      return { direction: 'stable', changePercent: 0 }
    }

    const first = values[0].value
    const last = values[values.length - 1].value
    const changePercent = ((last - first) / first) * 100

    if (Math.abs(changePercent) < 5) {
      return { direction: 'stable', changePercent }
    }

    return {
      direction: changePercent > 0 ? 'improving' : 'declining',
      changePercent
    }
  }
}

// React hook for intelligent compliance monitoring
export function useIntelligentCompliance() {
  const [alerts, setAlerts] = useKV<ComplianceAlert[]>('compliance-alerts', [])
  const [trends, setTrends] = useKV<ComplianceTrend[]>('compliance-trends', [])
  const [recommendations, setRecommendations] = useKV<IntelligentRecommendation[]>('intelligent-recommendations', [])
  const [riskAssessments, setRiskAssessments] = useKV<RiskAssessment[]>('risk-assessments', [])
  const [auditTrail, setAuditTrail] = useKV<AuditTrail[]>('compliance-audit-trail', [])
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const monitor = IntelligentComplianceMonitor.getInstance()

  // Auto-monitoring effect
  useEffect(() => {
    const runAnalysis = async () => {
      if (isAnalyzing) return
      
      setIsAnalyzing(true)
      try {
        // This would normally get real data from the regulatory database service
        const mockChecks: ComplianceCheck[] = []
        const mockRules: ComplianceRule[] = []
        const mockUpdates: RegulatoryUpdate[] = []

        // Detect anomalies and generate alerts
        const newAlerts = await monitor.detectAnomalies(mockChecks)
        if (newAlerts.length > 0) {
          setAlerts(current => [...current, ...newAlerts])
        }

        // Generate trends
        const newTrends = await monitor.analyzeComplianceTrends(mockChecks)
        setTrends(newTrends)

        // Generate recommendations
        const newRecommendations = await monitor.generateIntelligentRecommendations(
          mockChecks, mockRules, mockUpdates
        )
        if (newRecommendations.length > 0) {
          setRecommendations(current => [...current, ...newRecommendations])
        }
      } catch (error) {
        console.error('Analysis failed:', error)
      } finally {
        setIsAnalyzing(false)
      }
    }

    // Run analysis every 6 hours
    const interval = setInterval(runAnalysis, 6 * 60 * 60 * 1000)
    runAnalysis() // Initial run

    return () => clearInterval(interval)
  }, [monitor, setAlerts, setTrends, setRecommendations, isAnalyzing])

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(current => 
      current.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    )
    
    // Log action to audit trail
    const auditEntry: AuditTrail = {
      id: crypto.randomUUID(),
      entityType: 'alert',
      entityId: alertId,
      action: 'acknowledged',
      changes: { acknowledged: true },
      userId: 'current-user', // Would get from auth context
      timestamp: new Date().toISOString(),
      hash: crypto.randomUUID() // Would be proper hash in production
    }
    
    setAuditTrail(current => [...current, auditEntry])
  }

  const performRiskAssessment = async (
    entityType: string,
    entityId: string,
    framework: RegFramework,
    contextData: any
  ) => {
    setIsAnalyzing(true)
    try {
      const assessment = await monitor.assessRisk(entityType, entityId, framework, contextData)
      setRiskAssessments(current => [
        ...current.filter(r => !(r.entityType === entityType && r.entityId === entityId && r.framework === framework)),
        assessment
      ])
      return assessment
    } catch (error) {
      console.error('Risk assessment failed:', error)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(current => current.filter(alert => alert.id !== alertId))
    
    // Log dismissal to audit trail
    const auditEntry: AuditTrail = {
      id: crypto.randomUUID(),
      entityType: 'alert',
      entityId: alertId,
      action: 'dismissed',
      changes: {},
      userId: 'current-user',
      timestamp: new Date().toISOString(),
      hash: crypto.randomUUID()
    }
    
    setAuditTrail(current => [...current, auditEntry])
  }

  const implementRecommendation = (recommendationId: string) => {
    setRecommendations(current => 
      current.filter(rec => rec.id !== recommendationId)
    )
    
    // Log implementation to audit trail
    const auditEntry: AuditTrail = {
      id: crypto.randomUUID(),
      entityType: 'recommendation',
      entityId: recommendationId,
      action: 'implemented',
      changes: {},
      userId: 'current-user',
      timestamp: new Date().toISOString(),
      hash: crypto.randomUUID()
    }
    
    setAuditTrail(current => [...current, auditEntry])
  }

  // Get statistics
  const stats = {
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
    pendingRecommendations: recommendations.length,
    averageRiskScore: riskAssessments.length > 0 
      ? Math.round(riskAssessments.reduce((sum, r) => sum + r.riskScore, 0) / riskAssessments.length)
      : 0,
    trendsAnalyzed: trends.length,
    improvingTrends: trends.filter(t => t.trend === 'improving').length,
    decliningTrends: trends.filter(t => t.trend === 'declining').length
  }

  return {
    alerts,
    trends,
    recommendations,
    riskAssessments,
    auditTrail,
    stats,
    isAnalyzing,
    acknowledgeAlert,
    dismissAlert,
    implementRecommendation,
    performRiskAssessment,
    monitor
  }
}