import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Database, CheckCircle, XCircle, Clock, Settings, Search, Bell, Download, RefreshCw, Shield, Globe, FileText, Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface RegulatoryDatabase {
  id: string
  name: string
  type: 'federal' | 'state' | 'international' | 'industry'
  jurisdiction: string
  status: 'connected' | 'error' | 'pending'
  lastSync: string
  totalRules: number
  applicableRules: number
  apiEndpoint: string
  description: string
  costPerQuery: number
  rateLimit: string
}

interface ComplianceRule {
  id: string
  ruleId: string
  title: string
  description: string
  framework: string
  severity: 'high' | 'medium' | 'low'
  category: string
  lastUpdated: string
  status: 'compliant' | 'non-compliant' | 'unknown' | 'pending'
  requirements: string[]
  evidence: string[]
  dueDate?: string
}

interface AutomatedCheck {
  id: string
  name: string
  description: string
  databases: string[]
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
  isActive: boolean
  lastRun: string
  nextRun: string
  rules: number
  findings: number
  status: 'running' | 'completed' | 'error' | 'scheduled'
}

const mockDatabases: RegulatoryDatabase[] = [
  {
    id: 'cfr',
    name: 'Code of Federal Regulations',
    type: 'federal',
    jurisdiction: 'United States',
    status: 'connected',
    lastSync: '2024-01-15T10:30:00Z',
    totalRules: 85000,
    applicableRules: 1250,
    apiEndpoint: 'https://api.federalregister.gov',
    description: 'Comprehensive federal regulations database',
    costPerQuery: 0.02,
    rateLimit: '1000/hour'
  },
  {
    id: 'fda',
    name: 'FDA Regulations',
    type: 'federal',
    jurisdiction: 'United States',
    status: 'connected',
    lastSync: '2024-01-15T09:15:00Z',
    totalRules: 12500,
    applicableRules: 380,
    apiEndpoint: 'https://api.fda.gov',
    description: 'Food and Drug Administration regulatory data',
    costPerQuery: 0.05,
    rateLimit: '500/hour'
  },
  {
    id: 'gdpr',
    name: 'GDPR Database',
    type: 'international',
    jurisdiction: 'European Union',
    status: 'error',
    lastSync: '2024-01-14T16:20:00Z',
    totalRules: 2500,
    applicableRules: 45,
    apiEndpoint: 'https://api.gdpr.eu',
    description: 'General Data Protection Regulation compliance',
    costPerQuery: 0.08,
    rateLimit: '200/hour'
  },
  {
    id: 'iso',
    name: 'ISO Standards Database',
    type: 'international',
    jurisdiction: 'International',
    status: 'pending',
    lastSync: '',
    totalRules: 25000,
    applicableRules: 0,
    apiEndpoint: 'https://api.iso.org',
    description: 'International Organization for Standardization',
    costPerQuery: 0.12,
    rateLimit: '100/hour'
  }
]

const mockRules: ComplianceRule[] = [
  {
    id: '1',
    ruleId: '21-CFR-820.30',
    title: 'Design Controls',
    description: 'Requirements for design controls in medical device manufacturing',
    framework: 'FDA QSR',
    severity: 'high',
    category: 'Quality Management',
    lastUpdated: '2024-01-10T14:30:00Z',
    status: 'compliant',
    requirements: ['Design planning', 'Design input', 'Design output', 'Design review'],
    evidence: ['Design control procedures', 'Design history file'],
    dueDate: '2024-02-15'
  },
  {
    id: '2',
    ruleId: 'GDPR-Art-25',
    title: 'Data Protection by Design',
    description: 'Privacy by design and default requirements',
    framework: 'GDPR',
    severity: 'high',
    category: 'Data Privacy',
    lastUpdated: '2024-01-12T11:20:00Z',
    status: 'non-compliant',
    requirements: ['Technical measures', 'Organizational measures', 'Privacy impact assessment'],
    evidence: [],
    dueDate: '2024-01-30'
  }
]

const mockChecks: AutomatedCheck[] = [
  {
    id: '1',
    name: 'Daily FDA Compliance Scan',
    description: 'Automated check against FDA regulations for medical devices',
    databases: ['fda', 'cfr'],
    frequency: 'daily',
    isActive: true,
    lastRun: '2024-01-15T08:00:00Z',
    nextRun: '2024-01-16T08:00:00Z',
    rules: 380,
    findings: 3,
    status: 'completed'
  },
  {
    id: '2',
    name: 'Weekly GDPR Assessment',
    description: 'Privacy compliance check against GDPR requirements',
    databases: ['gdpr'],
    frequency: 'weekly',
    isActive: false,
    lastRun: '2024-01-08T10:00:00Z',
    nextRun: '2024-01-22T10:00:00Z',
    rules: 45,
    findings: 7,
    status: 'error'
  }
]

export function RegulatoryDatabaseIntegration() {
  const [databases] = useKV<RegulatoryDatabase[]>('regulatory-databases', mockDatabases)
  const [rules] = useKV<ComplianceRule[]>('compliance-rules', mockRules)
  const [automatedChecks] = useKV<AutomatedCheck[]>('automated-checks', mockChecks)
  
  const [selectedDatabase, setSelectedDatabase] = useState<RegulatoryDatabase | null>(null)
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [isRunningCheck, setIsRunningCheck] = useState(false)
  const [checkProgress, setCheckProgress] = useState(0)
  
  // Simulate automated check progress
  useEffect(() => {
    if (isRunningCheck) {
      const interval = setInterval(() => {
        setCheckProgress(prev => {
          if (prev >= 100) {
            setIsRunningCheck(false)
            toast.success('Automated compliance check completed')
            return 0
          }
          return prev + 5
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [isRunningCheck])

  const handleRunCheck = async (checkId: string) => {
    setIsRunningCheck(true)
    setCheckProgress(0)
    toast.info('Starting automated compliance check...')
  }

  const handleSyncDatabase = async (databaseId: string) => {
    toast.info('Syncing regulatory database...')
    // Simulate API call
    setTimeout(() => {
      toast.success('Database synchronized successfully')
    }, 2000)
  }

  const connectedDatabases = databases.filter(db => db.status === 'connected')
  const totalRules = connectedDatabases.reduce((sum, db) => sum + db.applicableRules, 0)
  const complianceRate = Math.round((rules.filter(rule => rule.status === 'compliant').length / rules.length) * 100)
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Regulatory Database Integration</h2>
          <p className="text-muted-foreground mt-1">
            Connect to regulatory databases for automated compliance monitoring
          </p>
        </div>
        <Button onClick={() => setIsConfiguring(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Configure Integration
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Databases</CardTitle>
            <Database className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedDatabases.length}</div>
            <p className="text-xs text-muted-foreground">
              of {databases.length} configured
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRules.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              applicable regulations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceRate}%</div>
            <p className="text-xs text-muted-foreground">
              current compliance level
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Checks</CardTitle>
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automatedChecks.filter(c => c.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              automated processes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="databases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="databases">Database Connections</TabsTrigger>
          <TabsTrigger value="rules">Compliance Rules</TabsTrigger>
          <TabsTrigger value="checks">Automated Checks</TabsTrigger>
        </TabsList>

        <TabsContent value="databases" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {databases.map((database) => (
              <Card key={database.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{database.name}</CardTitle>
                        <CardDescription>{database.jurisdiction}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          database.status === 'connected' ? 'default' :
                          database.status === 'error' ? 'destructive' : 'secondary'
                        }
                      >
                        {database.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {database.status === 'error' && <XCircle className="w-3 h-3 mr-1" />}
                        {database.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {database.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncDatabase(database.id)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {database.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Rules:</span>
                      <div className="text-muted-foreground">{database.totalRules.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="font-medium">Applicable:</span>
                      <div className="text-muted-foreground">{database.applicableRules.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="font-medium">Cost/Query:</span>
                      <div className="text-muted-foreground">${database.costPerQuery}</div>
                    </div>
                    <div>
                      <span className="font-medium">Rate Limit:</span>
                      <div className="text-muted-foreground">{database.rateLimit}</div>
                    </div>
                  </div>
                  {database.lastSync && (
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Last sync: {new Date(database.lastSync).toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{rule.title}</CardTitle>
                        <Badge variant="outline">{rule.ruleId}</Badge>
                        <Badge
                          variant={
                            rule.severity === 'high' ? 'destructive' :
                            rule.severity === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {rule.severity}
                        </Badge>
                      </div>
                      <CardDescription>{rule.framework} • {rule.category}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        rule.status === 'compliant' ? 'default' :
                        rule.status === 'non-compliant' ? 'destructive' : 'secondary'
                      }
                    >
                      {rule.status === 'compliant' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {rule.status === 'non-compliant' && <XCircle className="w-3 h-3 mr-1" />}
                      {rule.status === 'unknown' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {rule.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {rule.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Requirements</h4>
                      <ul className="text-sm space-y-1">
                        {rule.requirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Evidence</h4>
                      {rule.evidence.length > 0 ? (
                        <ul className="text-sm space-y-1">
                          {rule.evidence.map((evidence, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {evidence}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No evidence provided</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Updated: {new Date(rule.lastUpdated).toLocaleDateString()}
                    </span>
                    {rule.dueDate && (
                      <span className="text-sm text-muted-foreground">
                        Due: {new Date(rule.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="checks" className="space-y-4">
          {isRunningCheck && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Running compliance check...</span>
                    <span className="text-sm text-muted-foreground">{checkProgress}%</span>
                  </div>
                  <Progress value={checkProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-4">
            {automatedChecks.map((check) => (
              <Card key={check.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{check.name}</CardTitle>
                        <Switch
                          checked={check.isActive}
                          onCheckedChange={() => {
                            toast.info(`${check.isActive ? 'Disabled' : 'Enabled'} automated check`)
                          }}
                        />
                      </div>
                      <CardDescription>{check.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          check.status === 'completed' ? 'default' :
                          check.status === 'error' ? 'destructive' :
                          check.status === 'running' ? 'secondary' : 'outline'
                        }
                      >
                        {check.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {check.status === 'error' && <XCircle className="w-3 h-3 mr-1" />}
                        {check.status === 'running' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                        {check.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunCheck(check.id)}
                        disabled={isRunningCheck}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Run Check
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Frequency:</span>
                      <div className="text-muted-foreground capitalize">{check.frequency}</div>
                    </div>
                    <div>
                      <span className="font-medium">Rules Checked:</span>
                      <div className="text-muted-foreground">{check.rules.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="font-medium">Findings:</span>
                      <div className="text-muted-foreground">{check.findings}</div>
                    </div>
                    <div>
                      <span className="font-medium">Databases:</span>
                      <div className="text-muted-foreground">{check.databases.length}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Last run: {new Date(check.lastRun).toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Next run: {new Date(check.nextRun).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Database Integration</DialogTitle>
            <DialogDescription>
              Set up connections to regulatory databases for automated compliance monitoring.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="database-type">Database Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="federal">Federal Regulations</SelectItem>
                  <SelectItem value="state">State Regulations</SelectItem>
                  <SelectItem value="international">International Standards</SelectItem>
                  <SelectItem value="industry">Industry Standards</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="api-endpoint">API Endpoint</Label>
                <Input id="api-endpoint" placeholder="https://api.example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" type="password" placeholder="Enter API key" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe this regulatory database..." />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sync-frequency">Sync Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Input id="jurisdiction" placeholder="e.g., United States, EU" />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfiguring(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Database integration configured successfully')
              setIsConfiguring(false)
            }}>
              Configure Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}