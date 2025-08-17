import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Upload, 
  Search, 
  Eye, 
  Download,
  CheckCircle,
  Warning,
  Clock,
  Brain,
  Target,
  Scan,
  Activity,
  Automation,
  Zap
} from '@phosphor-icons/react'
import { ComplianceGapAnalyzer } from './ComplianceGapAnalyzer'
import { DocumentAnalyzer } from './DocumentAnalyzer'
import { ComplianceAutomation } from './ComplianceAutomation'
import { useKV } from '@github/spark/hooks'

interface Document {
  id: string
  name: string
  type: string
  status: 'approved' | 'under-review' | 'expired' | 'missing'
  version: string
  lastUpdated: string
  expiryDate?: string
  regulation: string
}

const documents: Document[] = [
  {
    id: '1',
    name: 'Quality Manual',
    type: 'SOP',
    status: 'approved',
    version: '3.2',
    lastUpdated: '2024-01-10',
    regulation: 'ISO 13485'
  },
  {
    id: '2',
    name: 'Design History File',
    type: 'DHF',
    status: 'under-review',
    version: '1.5',
    lastUpdated: '2024-01-14',
    regulation: 'FDA 21 CFR 820'
  },
  {
    id: '3',
    name: 'Risk Management File',
    type: 'RMF',
    status: 'approved',
    version: '2.1',
    lastUpdated: '2024-01-08',
    regulation: 'ISO 14971'
  },
  {
    id: '4',
    name: 'Clinical Evaluation Report',
    type: 'CER',
    status: 'expired',
    version: '1.0',
    lastUpdated: '2023-10-15',
    expiryDate: '2024-01-15',
    regulation: 'EU MDR'
  },
  {
    id: '5',
    name: 'Post Market Surveillance Plan',
    type: 'PMS',
    status: 'missing',
    version: '-',
    lastUpdated: '-',
    regulation: 'EU MDR'
  }
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
    case 'under-review':
      return <Clock className="h-4 w-4 text-primary" weight="fill" />
    case 'expired':
    case 'missing':
      return <Warning className="h-4 w-4 text-destructive" weight="fill" />
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'approved':
      return <Badge variant="secondary">Approved</Badge>
    case 'under-review':
      return <Badge className="bg-primary text-primary-foreground">Under Review</Badge>
    case 'expired':
      return <Badge variant="destructive">Expired</Badge>
    case 'missing':
      return <Badge variant="destructive">Missing</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function EvidenceManager() {
  const [activeTab, setActiveTab] = useKV('evidence-manager-tab', 'documents')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Evidence & Documentation Manager</h2>
          <p className="text-muted-foreground">AI-powered compliance documentation with automated gap detection</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Document Library
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="gap-2">
            <Scan className="h-4 w-4" />
            AI Analyzer
          </TabsTrigger>
          <TabsTrigger value="gaps" className="gap-2">
            <Target className="h-4 w-4" />
            Gap Detection
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search documents, SOPs, or regulations..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(doc.status)}
                      <div className="space-y-1">
                        <CardTitle className="text-base">{doc.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.regulation}</span>
                          {doc.version !== '-' && (
                            <>
                              <span>•</span>
                              <span>Version {doc.version}</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc.status)}
                      {doc.status !== 'missing' && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {doc.lastUpdated !== '-' && (
                        <span>Last updated: {doc.lastUpdated}</span>
                      )}
                      {doc.expiryDate && (
                        <span className="text-destructive">Expires: {doc.expiryDate}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === 'missing' ? (
                        <Button size="sm" variant="outline">
                          <Upload className="h-3 w-3 mr-1" />
                          Upload Required
                        </Button>
                      ) : doc.status === 'expired' ? (
                        <Button size="sm" variant="outline">
                          <Upload className="h-3 w-3 mr-1" />
                          Upload New Version
                        </Button>
                      ) : doc.status === 'under-review' ? (
                        <Button size="sm" variant="ghost">
                          Review Progress
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Document Categories</CardTitle>
                <CardDescription>Compliance documentation by type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Quality Management', count: 12, status: 'good' },
                  { name: 'Design Controls', count: 8, status: 'warning' },
                  { name: 'Risk Management', count: 6, status: 'good' },
                  { name: 'Clinical Evidence', count: 4, status: 'critical' },
                  { name: 'Post-Market Surveillance', count: 3, status: 'warning' }
                ].map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-2 rounded border">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{category.count} docs</span>
                      <div className={`w-2 h-2 rounded-full ${
                        category.status === 'good' ? 'bg-secondary' :
                        category.status === 'warning' ? 'bg-accent' : 'bg-destructive'
                      }`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Alerts</CardTitle>
                <CardDescription>Documents requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-destructive/5">
                  <Warning className="h-4 w-4 text-destructive mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">3 documents expired</p>
                    <p className="text-xs text-muted-foreground">
                      Clinical Evaluation Report and 2 others require immediate updates
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-accent/5">
                  <Clock className="h-4 w-4 text-accent mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">5 documents under review</p>
                    <p className="text-xs text-muted-foreground">
                      Average review time: 4.2 days remaining
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-destructive/5">
                  <FileText className="h-4 w-4 text-destructive mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">2 required documents missing</p>
                    <p className="text-xs text-muted-foreground">
                      Post Market Surveillance Plan and Risk Analysis Report
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyzer">
          <DocumentAnalyzer />
        </TabsContent>

        <TabsContent value="gaps">
          <ComplianceGapAnalyzer />
        </TabsContent>

        <TabsContent value="automation">
          <ComplianceAutomation />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Document Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-secondary">87%</div>
                  <div className="text-sm text-muted-foreground">Overall compliance</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-destructive">8</div>
                  <div className="text-sm text-muted-foreground">Require attention</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Optimization opportunities</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>Live compliance status and automated alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <div>
                      <p className="text-sm font-medium">Document integrity monitoring active</p>
                      <p className="text-xs text-muted-foreground">Scanning for changes and compliance drift</p>
                    </div>
                  </div>
                  <Badge className="bg-secondary text-secondary-foreground">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div>
                      <p className="text-sm font-medium">AI gap detection running</p>
                      <p className="text-xs text-muted-foreground">Next full analysis in 2 hours</p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">Running</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <div>
                      <p className="text-sm font-medium">Regulatory update monitoring</p>
                      <p className="text-xs text-muted-foreground">Checking for new requirements</p>
                    </div>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">Monitoring</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}