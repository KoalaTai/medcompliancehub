import { useState } from 'react'
import { useRegulatoryDatabase } from '@/lib/services/regulatory-database'
import { useAutomatedEmail } from '@/lib/services/automated-email'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Database, 
  RefreshCw, 
  Plus, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Shield,
  FileText,
  Zap,
  Activity
} from '@phosphor-icons/react'
import type { RegulatoryDatabase, RegFramework, ComplianceGap } from '@/lib/types/regulatory'
import { toast } from 'sonner'

export function RegulatoryDatabaseIntegration() {
  const {
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
    deleteDatabase
  } = useRegulatoryDatabase()

  const { triggerRegulatoryUpdateEmails } = useAutomatedEmail()

  const [selectedFramework, setSelectedFramework] = useState<RegFramework>('FDA_QSR')
  const [gaps, setGaps] = useState<ComplianceGap[]>([])
  const [showAddDatabase, setShowAddDatabase] = useState(false)
  const [newDatabase, setNewDatabase] = useState({
    name: '',
    framework: 'FDA_QSR' as RegFramework,
    endpoint: '',
    apiKey: '',
    syncInterval: 24,
    priority: 1
  })

  const handleSyncDatabase = async (databaseId: string) => {
    try {
      await syncDatabase(databaseId)
      toast.success('Database synchronized successfully')
    } catch (error) {
      toast.error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCheckUpdates = async () => {
    try {
      await checkForUpdates()
      
      // Trigger email notifications for new updates
      const newUpdates = regulatoryUpdates.slice(-5) // Get recent updates
      for (const update of newUpdates) {
        await triggerRegulatoryUpdateEmails(update)
      }
      
      toast.success('Checked for regulatory updates and sent notifications')
    } catch (error) {
      toast.error(`Update check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleGapAnalysis = async () => {
    try {
      const analysisGaps = await performGapAnalysis(selectedFramework)
      setGaps(analysisGaps)
      toast.success(`Gap analysis completed for ${selectedFramework}`)
    } catch (error) {
      toast.error(`Gap analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleAddDatabase = () => {
    addDatabase({
      ...newDatabase,
      isActive: true,
      lastSync: undefined
    })
    setNewDatabase({
      name: '',
      framework: 'FDA_QSR',
      endpoint: '',
      apiKey: '',
      syncInterval: 24,
      priority: 1
    })
    setShowAddDatabase(false)
    toast.success('Database added successfully')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800'
      case 'non_compliant': return 'bg-red-100 text-red-800'
      case 'requires_review': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'major': return 'bg-orange-100 text-orange-800'
      case 'minor': return 'bg-yellow-100 text-yellow-800'
      case 'observation': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const activeDatabases = databases.filter(db => db.isActive)
  const totalRules = complianceRules.length
  const compliantChecks = complianceChecks.filter(check => check.status === 'compliant').length
  const complianceRate = totalRules > 0 ? Math.round((compliantChecks / totalRules) * 100) : 0
  const recentUpdates = regulatoryUpdates.slice(0, 5)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Regulatory Database Integration</h1>
          <p className="text-muted-foreground mt-2">
            Connect and monitor regulatory databases for automated compliance checks
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCheckUpdates} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Check Updates
          </Button>
          <Dialog open={showAddDatabase} onOpenChange={setShowAddDatabase}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Database
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Regulatory Database</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Database Name</Label>
                  <Input
                    id="name"
                    value={newDatabase.name}
                    onChange={(e) => setNewDatabase(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., FDA Regulatory Database"
                  />
                </div>
                <div>
                  <Label htmlFor="framework">Framework</Label>
                  <Select 
                    value={newDatabase.framework} 
                    onValueChange={(value) => setNewDatabase(prev => ({ ...prev, framework: value as RegFramework }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FDA_QSR">FDA QSR</SelectItem>
                      <SelectItem value="ISO_13485">ISO 13485</SelectItem>
                      <SelectItem value="EU_MDR">EU MDR</SelectItem>
                      <SelectItem value="ISO_14971">ISO 14971</SelectItem>
                      <SelectItem value="ANVISA">ANVISA</SelectItem>
                      <SelectItem value="PMDA">PMDA</SelectItem>
                      <SelectItem value="TGA">TGA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="endpoint">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={newDatabase.endpoint}
                    onChange={(e) => setNewDatabase(prev => ({ ...prev, endpoint: e.target.value }))}
                    placeholder="https://api.regulatory-db.com/v1"
                  />
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={newDatabase.apiKey}
                    onChange={(e) => setNewDatabase(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <Label htmlFor="syncInterval">Sync Interval (hours)</Label>
                  <Input
                    id="syncInterval"
                    type="number"
                    value={newDatabase.syncInterval}
                    onChange={(e) => setNewDatabase(prev => ({ ...prev, syncInterval: parseInt(e.target.value) || 24 }))}
                  />
                </div>
                <Button onClick={handleAddDatabase} className="w-full">
                  Add Database
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Databases</p>
                <p className="text-2xl font-bold">{activeDatabases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold">{complianceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Compliance Rules</p>
                <p className="text-2xl font-bold">{totalRules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Recent Updates</p>
                <p className="text-2xl font-bold">{regulatoryUpdates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="databases" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="databases">Databases</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="gap-analysis">Gap Analysis</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="databases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Databases</CardTitle>
              <CardDescription>Manage connected regulatory databases and sync schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {databases.map((database) => {
                  const syncResult = syncResults.find(r => r.databaseId === database.id)
                  const lastSync = database.lastSync ? new Date(database.lastSync) : null
                  
                  return (
                    <div key={database.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{database.name}</h3>
                          <Badge variant={database.isActive ? "default" : "secondary"}>
                            {database.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{database.framework}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Endpoint: {database.endpoint}</p>
                          <p>Sync Interval: {database.syncInterval}h</p>
                          {lastSync && (
                            <p>Last Sync: {lastSync.toLocaleString()}</p>
                          )}
                        </div>
                        {syncResult && (
                          <div className="mt-2 text-sm">
                            <span className="text-green-600">
                              +{syncResult.rulesAdded} added, 
                              ~{syncResult.rulesUpdated} updated
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSyncDatabase(database.id)}
                          disabled={isLoading}
                        >
                          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateDatabase(database.id, { isActive: !database.isActive })}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
              <CardDescription>Current compliance status across all frameworks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Compliance</span>
                    <span>{complianceRate}%</span>
                  </div>
                  <Progress value={complianceRate} className="w-full" />
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Check</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceChecks.slice(0, 10).map((check) => {
                      const rule = complianceRules.find(r => r.id === check.ruleId)
                      return (
                        <TableRow key={check.id}>
                          <TableCell className="font-medium">
                            {rule?.title || 'Unknown Rule'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{rule?.framework}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(check.status)}>
                              {check.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(check.checkedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Updates</CardTitle>
              <CardDescription>Recent changes in regulatory requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {recentUpdates.map((update) => (
                    <div key={update.id} className="border-l-4 border-blue-500 pl-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{update.title}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">{update.framework}</Badge>
                          <Badge className={
                            update.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            update.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {update.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{update.summary}</p>
                      <div className="text-xs text-muted-foreground">
                        Published: {new Date(update.publishedDate).toLocaleDateString()} | 
                        Effective: {new Date(update.effectiveDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gap-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Gap Analysis</CardTitle>
              <CardDescription>AI-powered analysis of compliance gaps and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FDA_QSR">FDA QSR</SelectItem>
                      <SelectItem value="ISO_13485">ISO 13485</SelectItem>
                      <SelectItem value="EU_MDR">EU MDR</SelectItem>
                      <SelectItem value="ISO_14971">ISO 14971</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleGapAnalysis} disabled={isLoading}>
                    <Zap className="h-4 w-4 mr-2" />
                    Analyze Gaps
                  </Button>
                </div>

                {gaps.length > 0 && (
                  <div className="space-y-4">
                    {gaps.map((gap) => (
                      <Card key={gap.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">{gap.requirement}</h4>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <span className="font-medium">Current State:</span> {gap.currentState}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Target State:</span> {gap.targetState}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Estimated Effort:</span> {gap.estimatedEffort} hours
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Timeline:</span> {gap.timeline}
                                </div>
                              </div>
                              {gap.recommendations.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium mb-1">Recommendations:</p>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {gap.recommendations.map((rec, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <Badge className={getSeverityColor(gap.gapSeverity)}>
                                {gap.gapSeverity}
                              </Badge>
                              <div className="text-sm text-muted-foreground mt-2">
                                Priority: {gap.priority}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>Monitor database connections and sync status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDatabases.map((database) => {
                  const syncResult = syncResults.find(r => r.databaseId === database.id)
                  const isRecent = syncResult && 
                    new Date(syncResult.syncCompleted).getTime() > Date.now() - (6 * 60 * 60 * 1000)
                  
                  return (
                    <Card key={database.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{database.name}</h4>
                          <div className="flex items-center gap-1">
                            <Activity className={`h-4 w-4 ${isRecent ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className="text-xs text-muted-foreground">
                              {isRecent ? 'Active' : 'Stale'}
                            </span>
                          </div>
                        </div>
                        
                        {syncResult ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Last Sync:</span>
                              <span className="text-muted-foreground">
                                {new Date(syncResult.syncCompleted).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rules Added:</span>
                              <span className="text-green-600">+{syncResult.rulesAdded}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rules Updated:</span>
                              <span className="text-blue-600">~{syncResult.rulesUpdated}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Next Sync:</span>
                              <span className="text-muted-foreground">
                                {new Date(syncResult.nextSync).toLocaleString()}
                              </span>
                            </div>
                            {syncResult.errors.length > 0 && (
                              <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-800">
                                {syncResult.errors.join(', ')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No sync data available
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}