import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  Brain,
  Warning,
  CheckCircle,
  Clock,
  FileX,
  Target,
  ArrowRight,
  Refresh,
  Robot,
  Zap,
  Lightbulb,
  Gauge,
  Bell,
  Eye,
  Shield
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { useGapDetectionService } from '@/hooks/useGapDetectionService'
import { toast } from 'sonner'

function getImpactBadge(impact: string) {
  switch (impact) {
    case 'critical':
      return <Badge className="bg-destructive text-destructive-foreground">Critical</Badge>
    case 'high':
      return <Badge className="bg-orange-500 text-white">High</Badge>
    case 'medium':
      return <Badge className="bg-accent text-accent-foreground">Medium</Badge>
    case 'low':
      return <Badge variant="outline">Low</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function AutomatedGapDetection() {
  const {
    settings,
    setSettings,
    detectedGaps,
    runGapScan,
    createCAPAFromGap,
    updateGapStatus,
    getGapStats,
    lastScanTime
  } = useGapDetectionService()
  
  const [isScanning, setIsScanning] = useState(false)
  const [selectedChange, setSelectedChange] = useState<string | null>(null)

  const stats = getGapStats()

  const runAutomatedScan = async () => {
    setIsScanning(true)
    
    try {
      // Mock regulatory changes for demonstration
      const mockRegulatoryChanges = [
        {
          id: '1',
          regulation: 'FDA 21 CFR 820',
          framework: 'Quality System Regulation',
          changeType: 'amendment' as const,
          title: 'Enhanced Risk Management Requirements for Software Devices',
          description: 'New guidance requires additional documentation for AI/ML-enabled medical devices including algorithmic bias assessment and continuous monitoring protocols.',
          effectiveDate: '2024-04-01',
          impactLevel: 'critical' as const,
          confidence: 92,
          analysisTimestamp: new Date().toISOString(),
          source: 'FDA.gov'
        },
        {
          id: '2',
          regulation: 'ISO 13485',
          framework: 'Quality Management Systems',
          changeType: 'new_requirement' as const,
          title: 'Cybersecurity Risk Management Integration',
          description: 'Integration of cybersecurity considerations throughout device lifecycle, requiring updated risk management processes.',
          effectiveDate: '2024-03-15',
          impactLevel: 'high' as const,
          confidence: 87,
          analysisTimestamp: new Date().toISOString(),
          source: 'ISO.org'
        }
      ]

      const result = await runGapScan(mockRegulatoryChanges)
      
      toast.success('Automated gap detection scan completed', {
        description: `Found ${result.gapsDetected} potential compliance gaps from ${result.changesAnalyzed} regulatory changes`
      })
    } catch (error) {
      toast.error('Gap detection scan failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsScanning(false)
    }
  }

  const updateSettings = (key: string, value: any) => {
    setSettings(current => ({
      ...current,
      [key]: value
    }))
  }

  const handleCreateCAPAForGap = async (gap: any) => {
    try {
      const capa = await createCAPAFromGap(gap)
      toast.success('CAPA Created', {
        description: `Created corrective action for ${gap.description}`
      })
    } catch (error) {
      toast.error('Failed to create CAPA', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  // Group gaps by regulation for display
  const groupedGaps = detectedGaps.reduce((groups, gap) => {
    const key = gap.regulation
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(gap)
    return groups
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Robot className="h-5 w-5 text-primary" />
            Automated Compliance Gap Detection
          </h3>
          <p className="text-sm text-muted-foreground">
            Last scan: {new Date(lastScanTime).toLocaleDateString()} at {new Date(lastScanTime).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => updateSettings('enabled', !settings.enabled)}
            className={`gap-2 ${settings.enabled ? 'border-secondary text-secondary' : ''}`}
          >
            <Zap className={`h-4 w-4 ${settings.enabled ? 'text-secondary' : ''}`} />
            {settings.enabled ? 'Enabled' : 'Disabled'}
          </Button>
          <Button 
            onClick={runAutomatedScan} 
            disabled={isScanning}
            className="gap-2"
          >
            <Refresh className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Run Scan'}
          </Button>
        </div>
      </div>

      {/* Automation Status & Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Automation Settings
          </CardTitle>
          <CardDescription>
            Configure automated regulatory change monitoring and gap detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Automation</p>
                <p className="text-sm text-muted-foreground">Automatically scan for regulatory changes</p>
              </div>
              <Switch 
                checked={settings.enabled}
                onCheckedChange={(enabled) => updateSettings('enabled', enabled)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Create CAPAs</p>
                <p className="text-sm text-muted-foreground">Automatically create corrective actions</p>
              </div>
              <Switch 
                checked={settings.autoCreateCAPAs}
                onCheckedChange={(enabled) => updateSettings('autoCreateCAPAs', enabled)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Confidence Threshold: {settings.confidenceThreshold}%</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Low</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={settings.confidenceThreshold}
                  onChange={(e) => updateSettings('confidenceThreshold', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-muted-foreground">High</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Only create gaps for changes with confidence above this threshold
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detection Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Gaps Detected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Warning className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Critical Gaps</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Warning className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.high}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Robot className="h-4 w-4 text-accent" />
              <div>
                <p className="text-2xl font-bold">{stats.autoGenerated}</p>
                <p className="text-xs text-muted-foreground">Auto-Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detected Compliance Gaps */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Detected Compliance Gaps</h4>
        
        <div className="space-y-4">
          {Object.entries(groupedGaps).map(([regulation, gaps]) => (
            <Card key={regulation}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  {regulation}
                </CardTitle>
                <CardDescription>
                  {gaps.length} gaps detected from recent regulatory changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gaps.map((gap) => (
                    <Card key={gap.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h6 className="font-medium">{gap.description}</h6>
                              {getImpactBadge(gap.priority)}
                              <Badge variant="outline" className="text-xs">
                                {gap.complianceRisk}% risk
                              </Badge>
                              {gap.autoGenerated && (
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                  AI Generated
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Effort: {gap.estimatedEffort}
                            </p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleCreateCAPAForGap(gap)}
                            className="gap-1"
                          >
                            <Target className="h-3 w-3" />
                            Create CAPA
                          </Button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 text-sm">
                          <div>
                            <p className="font-medium text-destructive mb-1">Current State</p>
                            <p className="text-muted-foreground">{gap.currentState}</p>
                          </div>
                          <div>
                            <p className="font-medium text-secondary mb-1">Required State</p>
                            <p className="text-muted-foreground">{gap.requiredState}</p>
                          </div>
                        </div>

                        {gap.recommendedActions.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium mb-2">Recommended Actions</p>
                            <ul className="space-y-1">
                              {gap.recommendedActions.map((action, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <ArrowRight className="h-3 w-3 text-primary flex-shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {gap.affectedDocuments.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium mb-2">Affected Documents</p>
                            <div className="flex flex-wrap gap-1">
                              {gap.affectedDocuments.map((doc, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {doc}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {Object.keys(groupedGaps).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Gaps Detected</h3>
                <p className="text-muted-foreground">
                  No compliance gaps have been identified from recent regulatory changes.
                  {!settings.enabled && " Enable automation to start monitoring for changes."}
                </p>
                {!settings.enabled && (
                  <Button 
                    className="mt-4"
                    onClick={() => updateSettings('enabled', true)}
                  >
                    Enable Automated Detection
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}