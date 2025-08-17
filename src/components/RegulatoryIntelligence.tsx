import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Bell, 
  Calendar, 
  TrendUp, 
  Filter, 
  Search, 
  Warning, 
  CheckCircle, 
  Clock, 
  Globe,
  Download,
  Eye,
  Star,
  Archive
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface RegulatoryUpdate {
  id: string
  title: string
  description: string
  regulation: string
  authority: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: 'new_rule' | 'amendment' | 'guidance' | 'deadline' | 'withdrawal'
  publishedAt: string
  effectiveDate?: string
  affectedSystems: string[]
  impactScore: number
  actionRequired: boolean
  summary: string
  fullText?: string
  attachments?: string[]
  relatedUpdates?: string[]
  starred: boolean
  archived: boolean
  source: string
}

const sampleUpdates: RegulatoryUpdate[] = [
  {
    id: '1',
    title: 'FDA Finalizes AI/ML-Based Medical Device Software Guidance',
    description: 'FDA publishes comprehensive guidance on predetermined change control plans for AI/ML-enabled medical devices.',
    regulation: 'FDA Guidance Document',
    authority: 'FDA',
    severity: 'critical',
    type: 'guidance',
    publishedAt: '2024-01-15T10:00:00Z',
    effectiveDate: '2024-04-15T00:00:00Z',
    affectedSystems: ['AI/ML Systems', 'Software Validation', 'Change Control'],
    impactScore: 9.2,
    actionRequired: true,
    summary: 'This guidance establishes requirements for predetermined change control plans (PCCP) that allow manufacturers to implement certain AI/ML algorithm modifications without requiring new 510(k) submissions.',
    starred: true,
    archived: false,
    source: 'FDA.gov'
  },
  {
    id: '2',
    title: 'ISO 13485:2024 Risk Management Amendment',
    description: 'Significant updates to risk management requirements in design controls and post-market surveillance.',
    regulation: 'ISO 13485:2016',
    authority: 'ISO',
    severity: 'high',
    type: 'amendment',
    publishedAt: '2024-01-12T14:30:00Z',
    effectiveDate: '2024-07-01T00:00:00Z',
    affectedSystems: ['Design Controls', 'Risk Management', 'Post-Market Surveillance'],
    impactScore: 8.1,
    actionRequired: true,
    summary: 'Enhanced requirements for risk assessment documentation, including mandatory AI bias assessment for software medical devices.',
    starred: false,
    archived: false,
    source: 'ISO.org'
  },
  {
    id: '3',
    title: 'EU MDR Technical File Submission Extension',
    description: 'European Commission extends deadline for Class I medical device technical file submissions.',
    regulation: 'EU MDR 2017/745',
    authority: 'European Commission',
    severity: 'medium',
    type: 'deadline',
    publishedAt: '2024-01-10T09:15:00Z',
    effectiveDate: '2024-03-31T23:59:59Z',
    affectedSystems: ['Technical Documentation', 'UDI Database'],
    impactScore: 6.5,
    actionRequired: false,
    summary: 'Additional 90-day extension granted for manufacturers struggling with EUDAMED system integration.',
    starred: false,
    archived: false,
    source: 'EUR-Lex'
  },
  {
    id: '4',
    title: 'Health Canada Cybersecurity Guidance Update',
    description: 'Updated requirements for cybersecurity risk management in connected medical devices.',
    regulation: 'Health Canada Guidance',
    authority: 'Health Canada',
    severity: 'high',
    type: 'guidance',
    publishedAt: '2024-01-08T16:00:00Z',
    effectiveDate: '2024-06-01T00:00:00Z',
    affectedSystems: ['Cybersecurity', 'Connected Devices', 'Risk Management'],
    impactScore: 7.8,
    actionRequired: true,
    summary: 'Mandatory cybersecurity bill of materials (CBOM) and vulnerability disclosure requirements for internet-connected devices.',
    starred: true,
    archived: false,
    source: 'canada.ca'
  }
]

export function RegulatoryIntelligence() {
  const [updates] = useKV<RegulatoryUpdate[]>('regulatory-updates', sampleUpdates)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_rule': return <Warning className="h-4 w-4" />
      case 'amendment': return <CheckCircle className="h-4 w-4" />
      case 'guidance': return <Globe className="h-4 w-4" />
      case 'deadline': return <Clock className="h-4 w-4" />
      case 'withdrawal': return <Archive className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredUpdates = updates.filter(update => {
    const matchesSearch = update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         update.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         update.regulation.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSeverity = severityFilter === 'all' || update.severity === severityFilter
    const matchesType = typeFilter === 'all' || update.type === typeFilter
    
    switch (activeTab) {
      case 'starred':
        return matchesSearch && matchesSeverity && matchesType && update.starred
      case 'action-required':
        return matchesSearch && matchesSeverity && matchesType && update.actionRequired
      case 'archived':
        return matchesSearch && matchesSeverity && matchesType && update.archived
      default:
        return matchesSearch && matchesSeverity && matchesType && !update.archived
    }
  })

  const criticalCount = updates.filter(u => u.severity === 'critical' && !u.archived).length
  const actionRequiredCount = updates.filter(u => u.actionRequired && !u.archived).length
  const starredCount = updates.filter(u => u.starred && !u.archived).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Regulatory Intelligence</h2>
          <p className="text-muted-foreground">Real-time monitoring of regulatory changes and compliance requirements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Configure Alerts
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Warning className="h-4 w-4 text-red-500" />
              Critical Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-500" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionRequiredCount}</div>
            <p className="text-xs text-muted-foreground">Need compliance action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-500" />
              Starred
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{starredCount}</div>
            <p className="text-xs text-muted-foreground">Important to your organization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendUp className="h-4 w-4 text-green-500" />
              Impact Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.9</div>
            <p className="text-xs text-muted-foreground">Average across all updates</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search updates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="new_rule">New Rules</SelectItem>
              <SelectItem value="amendment">Amendments</SelectItem>
              <SelectItem value="guidance">Guidance</SelectItem>
              <SelectItem value="deadline">Deadlines</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Updates</TabsTrigger>
          <TabsTrigger value="action-required">Action Required</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredUpdates.map((update) => (
                <Card key={update.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1">
                            {getTypeIcon(update.type)}
                            <Badge className={getSeverityColor(update.severity)} variant="outline">
                              {update.severity}
                            </Badge>
                          </div>
                          <Badge variant="secondary">{update.authority}</Badge>
                          {update.actionRequired && (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              Action Required
                            </Badge>
                          )}
                          {update.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </div>
                        <CardTitle className="text-lg leading-tight">{update.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {update.regulation}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                        <span>Impact: {update.impactScore}/10</span>
                        <span>Published {formatDate(update.publishedAt)}</span>
                        {update.effectiveDate && (
                          <span>Effective {formatDate(update.effectiveDate)}</span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {update.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Summary</h4>
                        <p className="text-sm text-muted-foreground">{update.summary}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Affected Systems</h4>
                        <div className="flex flex-wrap gap-1">
                          {update.affectedSystems.map((system) => (
                            <Badge key={system} variant="outline" className="text-xs">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span>Source: {update.source}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Star className="h-4 w-4 mr-2" />
                            Star
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}