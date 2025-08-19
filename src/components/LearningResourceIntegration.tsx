import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { LearningResourceNotifications } from '@/components/LearningResourceNotifications'
import { 
  BookOpen, 
  ArrowSquareOut, 
  Play, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Globe, 
  Settings, 
  Zap, 
  Star,
  TrendUp,
  Users,
  Calendar,
  Download,
  Bookmark,
  Filter,
  Search,
  RefreshCw,
  Link,
  Database,
  CloudArrowUp,
  Bell,
  Key,
  XCircle,
  Warning,
  Code,
  Webhook,
  Activity,
  Shield,
  ArrowRight,
  Plus,
  Trash,
  Edit,
  TestTube
} from '@phosphor-icons/react'

interface LearningPlatform {
  id: string
  name: string
  type: 'lms' | 'mooc' | 'certification' | 'video' | 'documentation' | 'api' | 'enterprise'
  icon: string
  connected: boolean
  apiEndpoint?: string
  lastSync?: string
  resourceCount?: number
  webhookUrl?: string
  apiVersion?: string
  rateLimitRemaining?: number
  rateLimitReset?: string
  status: 'active' | 'error' | 'syncing' | 'inactive'
  supportedFeatures: string[]
  authType: 'api_key' | 'oauth' | 'basic_auth' | 'custom'
}

interface LearningResource {
  id: string
  title: string
  platform: string
  type: 'course' | 'video' | 'article' | 'certification' | 'webinar' | 'documentation' | 'assessment' | 'lab'
  description: string
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  topics: string[]
  rating: number
  enrollmentCount: number
  completionRate?: number
  price: number
  url: string
  thumbnail?: string
  provider: string
  lastUpdated: string
  cpdCredits?: number
  isFavorited?: boolean
  prerequisites?: string[]
  learningObjectives?: string[]
  language: string
  subtitles?: string[]
  syncedAt: string
  externalId: string
}

interface PlatformConnection {
  platform: string
  apiKey: string
  isActive: boolean
  lastSync: string
  authType: 'api_key' | 'oauth' | 'basic_auth' | 'custom'
  endpoint: string
  webhookSecret?: string
  customHeaders?: Record<string, string>
  syncSchedule: 'manual' | 'hourly' | 'daily' | 'weekly'
  autoSync: boolean
}

interface APIEndpoint {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers: Record<string, string>
  queryParams?: Record<string, string>
  body?: string
  isActive: boolean
  lastTested?: string
  testResult?: 'success' | 'error'
  responseMapping: {
    titleField: string
    descriptionField: string
    urlField: string
    durationField?: string
    ratingField?: string
  }
}

interface SyncActivity {
  id: string
  platform: string
  timestamp: string
  type: 'sync' | 'webhook' | 'manual'
  status: 'success' | 'error' | 'pending'
  resourcesAdded: number
  resourcesUpdated: number
  resourcesSkipped: number
  errorMessage?: string
}

// Mock data for demonstration
const mockPlatforms: LearningPlatform[] = [
  {
    id: 'coursera',
    name: 'Coursera',
    type: 'mooc',
    icon: '🎓',
    connected: true,
    apiEndpoint: 'https://api.coursera.org/v2',
    lastSync: '2024-01-10T10:30:00Z',
    resourceCount: 1247,
    status: 'active',
    supportedFeatures: ['courses', 'certificates', 'progress_tracking'],
    authType: 'api_key',
    rateLimitRemaining: 450,
    rateLimitReset: '2024-01-10T12:00:00Z'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Learning',
    type: 'video',
    icon: '💼',
    connected: true,
    apiEndpoint: 'https://api.linkedin.com/learning/v2',
    lastSync: '2024-01-10T09:15:00Z',
    resourceCount: 856,
    status: 'active',
    supportedFeatures: ['videos', 'paths', 'skills_assessment'],
    authType: 'oauth',
    rateLimitRemaining: 800,
    rateLimitReset: '2024-01-10T11:00:00Z'
  },
  {
    id: 'udemy',
    name: 'Udemy Business',
    type: 'video',
    icon: '📚',
    connected: false,
    resourceCount: 0,
    status: 'inactive',
    supportedFeatures: ['courses', 'analytics', 'bulk_enrollment'],
    authType: 'api_key'
  },
  {
    id: 'complianceai',
    name: 'ComplianceAI Academy',
    type: 'lms',
    icon: '🛡️',
    connected: true,
    apiEndpoint: 'https://api.complianceai.com/v1',
    lastSync: '2024-01-10T11:00:00Z',
    resourceCount: 423,
    status: 'active',
    supportedFeatures: ['compliance_courses', 'assessments', 'certifications'],
    authType: 'api_key',
    webhookUrl: 'https://webhook.complianceai.com/updates',
    rateLimitRemaining: 200,
    rateLimitReset: '2024-01-10T13:00:00Z'
  },
  {
    id: 'iapp',
    name: 'IAPP Training',
    type: 'certification',
    icon: '🏆',
    connected: true,
    apiEndpoint: 'https://api.iapp.org/training/v1',
    lastSync: '2024-01-10T08:45:00Z',
    resourceCount: 156,
    status: 'active',
    supportedFeatures: ['certifications', 'cpe_tracking', 'events'],
    authType: 'oauth',
    rateLimitRemaining: 300,
    rateLimitReset: '2024-01-10T10:45:00Z'
  },
  {
    id: 'custom_api',
    name: 'Custom Learning API',
    type: 'api',
    icon: '⚡',
    connected: false,
    status: 'inactive',
    supportedFeatures: ['custom_integration'],
    authType: 'custom'
  }
]

const mockResources: LearningResource[] = [
  {
    id: '1',
    title: 'GDPR Compliance Masterclass',
    platform: 'coursera',
    type: 'course',
    description: 'Comprehensive guide to GDPR compliance for modern organizations',
    duration: 480,
    difficulty: 'intermediate',
    topics: ['GDPR', 'Privacy', 'Data Protection'],
    rating: 4.8,
    enrollmentCount: 12450,
    completionRate: 87,
    price: 79,
    url: 'https://coursera.org/gdpr-masterclass',
    provider: 'University of Edinburgh',
    lastUpdated: '2024-01-05',
    cpdCredits: 8,
    isFavorited: true,
    prerequisites: ['Basic Privacy Law Knowledge'],
    learningObjectives: ['Understand GDPR requirements', 'Implement compliance programs'],
    language: 'English',
    subtitles: ['Spanish', 'French', 'German'],
    syncedAt: '2024-01-10T10:30:00Z',
    externalId: 'coursera-gdpr-2024'
  },
  {
    id: '2',
    title: 'SOX Compliance for Financial Services',
    platform: 'linkedin',
    type: 'video',
    description: 'Essential SOX compliance requirements and implementation strategies',
    duration: 180,
    difficulty: 'advanced',
    topics: ['SOX', 'Financial Compliance', 'Auditing'],
    rating: 4.6,
    enrollmentCount: 8230,
    completionRate: 92,
    price: 0,
    url: 'https://linkedin.com/learning/sox-compliance',
    provider: 'PwC Learning',
    lastUpdated: '2023-12-20',
    cpdCredits: 3,
    prerequisites: ['Financial Auditing Basics'],
    learningObjectives: ['Master SOX requirements', 'Develop compliance frameworks'],
    language: 'English',
    subtitles: ['English'],
    syncedAt: '2024-01-10T09:15:00Z',
    externalId: 'linkedin-sox-2024'
  },
  {
    id: '3',
    title: 'AI Ethics and Compliance Framework',
    platform: 'complianceai',
    type: 'certification',
    description: 'Navigate the complex landscape of AI ethics and regulatory compliance',
    duration: 720,
    difficulty: 'advanced',
    topics: ['AI Ethics', 'Algorithm Governance', 'Risk Management'],
    rating: 4.9,
    enrollmentCount: 3450,
    completionRate: 78,
    price: 299,
    url: 'https://complianceai.com/ai-ethics-cert',
    provider: 'ComplianceAI Institute',
    lastUpdated: '2024-01-08',
    cpdCredits: 12,
    prerequisites: ['Basic AI Knowledge', 'Compliance Fundamentals'],
    learningObjectives: ['Understand AI ethics frameworks', 'Implement governance controls'],
    language: 'English',
    subtitles: ['English', 'Spanish'],
    syncedAt: '2024-01-10T11:00:00Z',
    externalId: 'compliance-ai-ethics-2024'
  }
]

export function LearningResourceIntegration() {
  const [platforms] = useKV<LearningPlatform[]>('learning-platforms', mockPlatforms)
  const [resources, setResources] = useKV<LearningResource[]>('learning-resources', mockResources)
  const [connections, setConnections] = useKV<PlatformConnection[]>('platform-connections', [])
  const [customEndpoints, setCustomEndpoints] = useKV<APIEndpoint[]>('custom-endpoints', [])
  const [syncActivities, setSyncActivities] = useKV<SyncActivity[]>('sync-activities', [])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false)
  const [isCustomAPIDialogOpen, setIsCustomAPIDialogOpen] = useState(false)
  const [selectedPlatformToConnect, setSelectedPlatformToConnect] = useState<string>('')
  const [apiKey, setApiKey] = useState('')
  const [apiEndpoint, setApiEndpoint] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  
  // Custom API configuration state
  const [customAPIConfig, setCustomAPIConfig] = useState({
    name: '',
    url: '',
    method: 'GET' as 'GET' | 'POST' | 'PUT' | 'DELETE',
    headers: '{"Authorization": "Bearer YOUR_TOKEN"}',
    responseMapping: {
      titleField: 'title',
      descriptionField: 'description',
      urlField: 'url',
      durationField: 'duration',
      ratingField: 'rating'
    }
  })

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesPlatform = selectedPlatform === 'all' || resource.platform === selectedPlatform
    const matchesType = selectedType === 'all' || resource.type === selectedType
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty
    const matchesFavorites = !showOnlyFavorites || resource.isFavorited

    return matchesSearch && matchesPlatform && matchesType && matchesDifficulty && matchesFavorites
  })

  const handleConnectPlatform = async (platformId: string, credentials: any) => {
    const platform = platforms.find(p => p.id === platformId)
    if (!platform) return

    const newConnection: PlatformConnection = {
      platform: platformId,
      apiKey: credentials.apiKey || credentials.token,
      isActive: true,
      lastSync: new Date().toISOString(),
      authType: platform.authType,
      endpoint: credentials.endpoint || platform.apiEndpoint || '',
      webhookSecret: credentials.webhookSecret,
      customHeaders: credentials.customHeaders ? JSON.parse(credentials.customHeaders) : {},
      syncSchedule: 'daily',
      autoSync: true
    }
    
    setConnections(current => [...current.filter(c => c.platform !== platformId), newConnection])
    setIsConnectDialogOpen(false)
    setApiKey('')
    setApiEndpoint('')
    setWebhookSecret('')
    
    // Trigger notification event for successful connection
    const connectionEvent = new CustomEvent('learning-resource-sync', {
      detail: {
        platform: platformId,
        resourcesAdded: 0,
        resourcesUpdated: 0,
        status: 'success'
      }
    })
    window.dispatchEvent(connectionEvent)
    
    // Log connection activity
    const activity: SyncActivity = {
      id: Date.now().toString(),
      platform: platformId,
      timestamp: new Date().toISOString(),
      type: 'sync',
      status: 'success',
      resourcesAdded: 0,
      resourcesUpdated: 0,
      resourcesSkipped: 0
    }
    setSyncActivities(current => [activity, ...current.slice(0, 49)])
    
    toast.success(`Connected to ${platform.name}`)
  }

  const handleTestConnection = async (platformId: string, credentials: any) => {
    setIsTestingConnection(true)
    
    try {
      // Simulate API test call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock successful response
      const testSuccess = Math.random() > 0.3 // 70% success rate for demo
      
      if (testSuccess) {
        toast.success('Connection test successful!')
        return true
      } else {
        toast.error('Connection test failed. Please check your credentials.')
        return false
      }
    } catch (error) {
      toast.error('Connection test failed. Please try again.')
      return false
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSyncResources = async (platformId?: string) => {
    setIsSyncing(true)
    
    try {
      // Simulate API call to sync resources
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const platformName = platformId ? platforms.find(p => p.id === platformId)?.name : 'all platforms'
      const resourcesAdded = Math.floor(Math.random() * 10) + 1
      const resourcesUpdated = Math.floor(Math.random() * 5)
      
      // Mock adding new resources
      const newResources: LearningResource[] = Array.from({ length: resourcesAdded }, (_, index) => ({
        id: `${Date.now()}-${index}`,
        title: `New Course ${index + 1} from ${platformName}`,
        platform: platformId || 'coursera',
        type: 'course',
        description: 'Recently synced course content with advanced compliance topics',
        duration: 180 + Math.floor(Math.random() * 300),
        difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any,
        topics: ['Compliance', 'Training', 'Best Practices'],
        rating: 4.0 + Math.random(),
        enrollmentCount: Math.floor(Math.random() * 5000) + 100,
        price: Math.floor(Math.random() * 200),
        url: `https://example.com/new-course-${index}`,
        provider: 'Learning Provider',
        lastUpdated: new Date().toISOString().split('T')[0],
        cpdCredits: Math.floor(Math.random() * 8) + 2,
        language: 'English',
        syncedAt: new Date().toISOString(),
        externalId: `sync-${Date.now()}-${index}`
      }))
      
      setResources(current => [...current, ...newResources])
      
      // Trigger notification event for new resources
      const syncEvent = new CustomEvent('learning-resource-sync', {
        detail: {
          platform: platformId || 'all',
          resourcesAdded,
          resourcesUpdated,
          status: 'success',
          resources: newResources
        }
      })
      window.dispatchEvent(syncEvent)
      
      // Log sync activity
      const activity: SyncActivity = {
        id: Date.now().toString(),
        platform: platformId || 'all',
        timestamp: new Date().toISOString(),
        type: 'sync',
        status: 'success',
        resourcesAdded,
        resourcesUpdated,
        resourcesSkipped: Math.floor(Math.random() * 3)
      }
      setSyncActivities(current => [activity, ...current.slice(0, 49)])
      
      toast.success(`Synced ${resourcesAdded} new resources from ${platformName}`)
    } catch (error) {
      // Trigger notification event for sync failure
      const errorEvent = new CustomEvent('learning-resource-sync', {
        detail: {
          platform: platformId || 'all',
          resourcesAdded: 0,
          resourcesUpdated: 0,
          status: 'error',
          error: 'Failed to sync resources'
        }
      })
      window.dispatchEvent(errorEvent)
      
      const activity: SyncActivity = {
        id: Date.now().toString(),
        platform: platformId || 'all',
        timestamp: new Date().toISOString(),
        type: 'sync',
        status: 'error',
        resourcesAdded: 0,
        resourcesUpdated: 0,
        resourcesSkipped: 0,
        errorMessage: 'Failed to sync resources'
      }
      setSyncActivities(current => [activity, ...current.slice(0, 49)])
      toast.error('Sync failed. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCreateCustomEndpoint = async () => {
    try {
      const newEndpoint: APIEndpoint = {
        id: Date.now().toString(),
        name: customAPIConfig.name,
        url: customAPIConfig.url,
        method: customAPIConfig.method,
        headers: JSON.parse(customAPIConfig.headers),
        isActive: true,
        responseMapping: customAPIConfig.responseMapping
      }
      
      setCustomEndpoints(current => [...current, newEndpoint])
      setIsCustomAPIDialogOpen(false)
      setCustomAPIConfig({
        name: '',
        url: '',
        method: 'GET',
        headers: '{"Authorization": "Bearer YOUR_TOKEN"}',
        responseMapping: {
          titleField: 'title',
          descriptionField: 'description',
          urlField: 'url',
          durationField: 'duration',
          ratingField: 'rating'
        }
      })
      
      toast.success('Custom API endpoint created successfully')
    } catch (error) {
      toast.error('Failed to create custom API endpoint. Please check your configuration.')
    }
  }

  const handleTestCustomEndpoint = async (endpoint: APIEndpoint) => {
    setIsTestingConnection(true)
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const testSuccess = Math.random() > 0.4
      
      if (testSuccess) {
        setCustomEndpoints(current => 
          current.map(e => 
            e.id === endpoint.id 
              ? { ...e, lastTested: new Date().toISOString(), testResult: 'success' }
              : e
          )
        )
        toast.success('API endpoint test successful!')
      } else {
        setCustomEndpoints(current => 
          current.map(e => 
            e.id === endpoint.id 
              ? { ...e, lastTested: new Date().toISOString(), testResult: 'error' }
              : e
          )
        )
        toast.error('API endpoint test failed!')
      }
    } catch (error) {
      toast.error('Failed to test API endpoint')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const toggleFavorite = (resourceId: string) => {
    setResources(current => 
      current.map(resource => 
        resource.id === resourceId 
          ? { ...resource, isFavorited: !resource.isFavorited }
          : resource
      )
    )
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="w-4 h-4" />
      case 'video': return <Play className="w-4 h-4" />
      case 'certification': return <Trophy className="w-4 h-4" />
      case 'webinar': return <Users className="w-4 h-4" />
      case 'article': return <BookOpen className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Resources</h1>
          <p className="text-muted-foreground mt-2">
            Integrated learning from top compliance education platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleSyncResources()}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync All'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="resources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    {platforms.filter(p => p.connected).map(platform => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.icon} {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="course">Courses</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="certification">Certifications</SelectItem>
                    <SelectItem value="webinar">Webinars</SelectItem>
                    <SelectItem value="article">Articles</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="favorites"
                    checked={showOnlyFavorites}
                    onCheckedChange={setShowOnlyFavorites}
                  />
                  <Label htmlFor="favorites" className="text-sm">Favorites only</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <Card key={resource.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(resource.type)}
                      <Badge variant="outline" className={getDifficultyColor(resource.difficulty)}>
                        {resource.difficulty}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(resource.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Bookmark 
                        className={`w-4 h-4 ${resource.isFavorited ? 'fill-current text-yellow-500' : ''}`} 
                      />
                    </Button>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight">
                    {resource.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {platforms.find(p => p.id === resource.platform)?.icon}
                      {platforms.find(p => p.id === resource.platform)?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(resource.duration)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {resource.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {resource.topics.slice(0, 3).map(topic => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {resource.topics.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{resource.topics.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <span>{resource.rating}</span>
                      </div>
                      <span className="text-muted-foreground">
                        ({resource.enrollmentCount.toLocaleString()})
                      </span>
                    </div>
                    
                    {resource.cpdCredits && (
                      <Badge variant="outline" className="text-xs">
                        {resource.cpdCredits} CPD
                      </Badge>
                    )}
                  </div>

                  {resource.completionRate && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span>{resource.completionRate}%</span>
                      </div>
                      <Progress value={resource.completionRate} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-lg font-semibold">
                      {resource.price === 0 ? 'Free' : `$${resource.price}`}
                    </div>
                    <Button 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      <ArrowSquareOut className="w-4 h-4" />
                      View Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No resources found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or sync with more platforms
                </p>
                <Button onClick={() => handleSyncResources()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Resources
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Learning Platform Connections</h3>
            <Dialog open={isCustomAPIDialogOpen} onOpenChange={setIsCustomAPIDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Custom API
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Custom API Integration</DialogTitle>
                  <DialogDescription>
                    Configure a custom API endpoint to sync learning resources from any platform
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="custom-name">Integration Name</Label>
                      <Input
                        id="custom-name"
                        placeholder="My Learning Platform"
                        value={customAPIConfig.name}
                        onChange={(e) => setCustomAPIConfig(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-method">HTTP Method</Label>
                      <Select 
                        value={customAPIConfig.method} 
                        onValueChange={(value: any) => setCustomAPIConfig(prev => ({ ...prev, method: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="custom-url">API Endpoint URL</Label>
                    <Input
                      id="custom-url"
                      placeholder="https://api.example.com/courses"
                      value={customAPIConfig.url}
                      onChange={(e) => setCustomAPIConfig(prev => ({ ...prev, url: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="custom-headers">Headers (JSON)</Label>
                    <Textarea
                      id="custom-headers"
                      placeholder='{"Authorization": "Bearer YOUR_TOKEN", "Content-Type": "application/json"}'
                      value={customAPIConfig.headers}
                      onChange={(e) => setCustomAPIConfig(prev => ({ ...prev, headers: e.target.value }))}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm font-medium">Response Field Mapping</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Map API response fields to learning resource attributes
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="title-field" className="text-xs">Title Field</Label>
                        <Input
                          id="title-field"
                          placeholder="title"
                          value={customAPIConfig.responseMapping.titleField}
                          onChange={(e) => setCustomAPIConfig(prev => ({
                            ...prev,
                            responseMapping: { ...prev.responseMapping, titleField: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="desc-field" className="text-xs">Description Field</Label>
                        <Input
                          id="desc-field"
                          placeholder="description"
                          value={customAPIConfig.responseMapping.descriptionField}
                          onChange={(e) => setCustomAPIConfig(prev => ({
                            ...prev,
                            responseMapping: { ...prev.responseMapping, descriptionField: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="url-field" className="text-xs">URL Field</Label>
                        <Input
                          id="url-field"
                          placeholder="url"
                          value={customAPIConfig.responseMapping.urlField}
                          onChange={(e) => setCustomAPIConfig(prev => ({
                            ...prev,
                            responseMapping: { ...prev.responseMapping, urlField: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration-field" className="text-xs">Duration Field (Optional)</Label>
                        <Input
                          id="duration-field"
                          placeholder="duration_minutes"
                          value={customAPIConfig.responseMapping.durationField || ''}
                          onChange={(e) => setCustomAPIConfig(prev => ({
                            ...prev,
                            responseMapping: { ...prev.responseMapping, durationField: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCustomAPIDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateCustomEndpoint}
                    disabled={!customAPIConfig.name || !customAPIConfig.url}
                  >
                    Create Integration
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map(platform => (
              <Card key={platform.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{platform.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription className="capitalize">{platform.type}</CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={platform.connected ? "default" : "outline"}
                        className={platform.status === 'error' ? 'bg-red-100 text-red-700' : ''}
                      >
                        {platform.connected ? 'Connected' : 'Not Connected'}
                      </Badge>
                      {platform.connected && (
                        <div className={`w-2 h-2 rounded-full ${
                          platform.status === 'active' ? 'bg-green-500' :
                          platform.status === 'error' ? 'bg-red-500' :
                          platform.status === 'syncing' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {platform.connected ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Resources:</span>
                          <div className="font-semibold flex items-center gap-1">
                            {platform.resourceCount?.toLocaleString()}
                            <Database className="w-3 h-3" />
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Sync:</span>
                          <div className="font-semibold">
                            {platform.lastSync ? new Date(platform.lastSync).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>

                      {platform.rateLimitRemaining && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Rate Limit:</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(platform.rateLimitRemaining / 1000) * 100} 
                              className="flex-1 h-2" 
                            />
                            <span className="text-xs">{platform.rateLimitRemaining}/1000</span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {platform.supportedFeatures.map(feature => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncResources(platform.id)}
                          disabled={isSyncing}
                          className="flex-1"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                          Sync
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedPlatformToConnect(platform.id)
                            setIsConnectDialogOpen(true)
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>

                      {platform.webhookUrl && (
                        <Alert>
                          <Webhook className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Webhook enabled for real-time updates
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Connect to access thousands of compliance learning resources
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {platform.supportedFeatures.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                      
                      <Dialog open={isConnectDialogOpen && selectedPlatformToConnect === platform.id} onOpenChange={setIsConnectDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full"
                            onClick={() => setSelectedPlatformToConnect(platform.id)}
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            Connect Platform
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Connect to {platform.name}</DialogTitle>
                            <DialogDescription>
                              Enter your credentials to integrate with {platform.name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {platform.authType === 'api_key' && (
                              <div>
                                <Label htmlFor="apiKey">API Key</Label>
                                <Input
                                  id="apiKey"
                                  type="password"
                                  placeholder="Enter your API key"
                                  value={apiKey}
                                  onChange={(e) => setApiKey(e.target.value)}
                                />
                              </div>
                            )}
                            
                            {platform.authType === 'oauth' && (
                              <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertDescription>
                                  OAuth integration will redirect you to {platform.name} for authentication
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            <div>
                              <Label htmlFor="endpoint">API Endpoint (Optional)</Label>
                              <Input
                                id="endpoint"
                                placeholder={platform.apiEndpoint || "https://api.example.com"}
                                value={apiEndpoint}
                                onChange={(e) => setApiEndpoint(e.target.value)}
                              />
                            </div>
                            
                            {platform.supportedFeatures.includes('webhooks') && (
                              <div>
                                <Label htmlFor="webhook">Webhook Secret (Optional)</Label>
                                <Input
                                  id="webhook"
                                  type="password"
                                  placeholder="Webhook secret for real-time updates"
                                  value={webhookSecret}
                                  onChange={(e) => setWebhookSecret(e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                          
                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => handleTestConnection(platform.id, { 
                                apiKey, 
                                endpoint: apiEndpoint, 
                                webhookSecret 
                              })}
                              disabled={isTestingConnection || !apiKey}
                            >
                              <TestTube className={`w-4 h-4 mr-2 ${isTestingConnection ? 'animate-pulse' : ''}`} />
                              Test Connection
                            </Button>
                            <Button 
                              onClick={() => handleConnectPlatform(platform.id, { 
                                apiKey, 
                                endpoint: apiEndpoint, 
                                webhookSecret 
                              })}
                              disabled={!apiKey}
                            >
                              Connect
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Custom API Integrations</h3>
              <p className="text-sm text-muted-foreground">
                Manage custom API endpoints and data synchronization
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {customEndpoints.map(endpoint => (
              <Card key={endpoint.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        {endpoint.name}
                      </CardTitle>
                      <CardDescription className="font-mono text-sm">
                        {endpoint.method} {endpoint.url}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={endpoint.isActive ? "default" : "outline"}>
                        {endpoint.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {endpoint.testResult && (
                        <Badge 
                          variant={endpoint.testResult === 'success' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {endpoint.testResult === 'success' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {endpoint.testResult}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Headers:</span>
                      <div className="font-mono text-xs bg-muted p-2 rounded mt-1">
                        {JSON.stringify(endpoint.headers, null, 2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Response Mapping:</span>
                      <div className="font-mono text-xs bg-muted p-2 rounded mt-1">
                        Title: {endpoint.responseMapping.titleField}<br/>
                        URL: {endpoint.responseMapping.urlField}
                      </div>
                    </div>
                  </div>

                  {endpoint.lastTested && (
                    <div className="text-sm text-muted-foreground">
                      Last tested: {new Date(endpoint.lastTested).toLocaleString()}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestCustomEndpoint(endpoint)}
                      disabled={isTestingConnection}
                    >
                      <TestTube className={`w-4 h-4 mr-2 ${isTestingConnection ? 'animate-pulse' : ''}`} />
                      Test API
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSyncResources(`custom-${endpoint.id}`)}
                      disabled={isSyncing}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                      Sync Resources
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {customEndpoints.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Code className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Custom Integrations</h3>
                  <p className="text-muted-foreground mb-4">
                    Create custom API integrations to sync resources from any platform
                  </p>
                  <Button onClick={() => setIsCustomAPIDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Integration
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Configure webhook endpoints for real-time learning resource updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhook-url"
                      placeholder="https://your-app.com/webhook/learning"
                      value="https://virtualbackroom.app/webhook/learning-updates"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm">
                      <Code className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="webhook-secret">Webhook Secret</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhook-secret"
                      type="password"
                      value="••••••••••••••••"
                      readOnly
                    />
                    <Button variant="outline" size="sm">
                      <Key className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Supported Events</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'course.created',
                    'course.updated',
                    'enrollment.completed',
                    'certificate.earned',
                    'progress.updated'
                  ].map(event => (
                    <Badge key={event} variant="secondary" className="text-xs font-mono">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>

              <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  Webhooks enable real-time updates when learning resources change on connected platforms.
                  Configure your platforms to send updates to the webhook URL above.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <LearningResourceNotifications />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Synchronization Activity</h3>
              <p className="text-sm text-muted-foreground">
                Track API calls, sync operations, and integration health
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setSyncActivities([])}
              disabled={syncActivities.length === 0}
            >
              Clear Activity
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Syncs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{syncActivities.length}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">
                    {syncActivities.filter(a => a.status === 'success').length} successful
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Resources Added</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {syncActivities.reduce((sum, activity) => sum + activity.resourcesAdded, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  This session
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {syncActivities.length > 0 
                    ? Math.round((syncActivities.filter(a => a.status === 'error').length / syncActivities.length) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={syncActivities.filter(a => a.status === 'error').length === 0 ? 'text-green-600' : 'text-red-600'}>
                    {syncActivities.filter(a => a.status === 'error').length} errors
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {platforms.filter(p => p.connected && p.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {platforms.length} total
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncActivities.length > 0 ? (
                  syncActivities.slice(0, 10).map(activity => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {platforms.find(p => p.id === activity.platform)?.icon}
                            {platforms.find(p => p.id === activity.platform)?.name || activity.platform}
                            <Badge variant="outline" className="text-xs capitalize">
                              {activity.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {activity.status === 'success' ? (
                              `Added ${activity.resourcesAdded}, Updated ${activity.resourcesUpdated}, Skipped ${activity.resourcesSkipped}`
                            ) : activity.errorMessage || 'Sync failed'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {activity.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : activity.status === 'error' ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h4 className="text-lg font-semibold mb-2">No Activity Yet</h4>
                    <p className="text-muted-foreground">
                      Sync activity will appear here once you start synchronizing resources
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resources.length}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12</span> this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">84%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+5%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">CPD Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  Available this quarter
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platforms.filter(p => p.connected).length}</div>
                <p className="text-xs text-muted-foreground">
                  of {platforms.length} available
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Topics</CardTitle>
                <CardDescription>Most accessed learning topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['GDPR', 'SOX Compliance', 'AI Ethics', 'Risk Management', 'Audit Procedures'].map((topic, index) => (
                    <div key={topic} className="flex items-center justify-between">
                      <span className="text-sm">{topic}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={90 - index * 15} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground w-8">{90 - index * 15}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Team completion statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed Courses</span>
                    <span className="font-semibold">24/30</span>
                  </div>
                  <Progress value={80} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In Progress</span>
                    <span className="font-semibold">6</span>
                  </div>
                  <Progress value={20} className="h-2" />
                  
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm">12% improvement this month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">3 certifications earned</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>Sync success rates by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platforms.filter(p => p.connected).map(platform => (
                    <div key={platform.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{platform.icon}</span>
                        <span className="text-sm">{platform.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={platform.status === 'active' ? 95 : platform.status === 'error' ? 20 : 50} 
                          className="w-20 h-2" 
                        />
                        <Badge 
                          variant={platform.status === 'active' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {platform.status === 'active' ? '95%' : platform.status === 'error' ? '20%' : '50%'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Distribution</CardTitle>
                <CardDescription>Learning resource types and counts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Courses', count: resources.filter(r => r.type === 'course').length, icon: <BookOpen className="w-4 h-4" /> },
                    { type: 'Videos', count: resources.filter(r => r.type === 'video').length, icon: <Play className="w-4 h-4" /> },
                    { type: 'Certifications', count: resources.filter(r => r.type === 'certification').length, icon: <Trophy className="w-4 h-4" /> },
                    { type: 'Webinars', count: resources.filter(r => r.type === 'webinar').length, icon: <Users className="w-4 h-4" /> },
                    { type: 'Articles', count: resources.filter(r => r.type === 'article').length, icon: <BookOpen className="w-4 h-4" /> }
                  ].map(item => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span className="text-sm">{item.type}</span>
                      </div>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}