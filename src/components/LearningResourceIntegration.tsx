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
import { toast } from 'sonner'
import { 
  BookOpen, 
  ExternalLink, 
  Play, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Globe, 
  Settings, 
  Zap, 
  Star,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Bookmark,
  Filter,
  Search,
  RefreshCw
} from '@phosphor-icons/react'

interface LearningPlatform {
  id: string
  name: string
  type: 'lms' | 'mooc' | 'certification' | 'video' | 'documentation'
  icon: string
  connected: boolean
  apiEndpoint?: string
  lastSync?: string
  resourceCount?: number
}

interface LearningResource {
  id: string
  title: string
  platform: string
  type: 'course' | 'video' | 'article' | 'certification' | 'webinar' | 'documentation'
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
}

interface PlatformConnection {
  platform: string
  apiKey: string
  isActive: boolean
  lastSync: string
}

// Mock data for demonstration
const mockPlatforms: LearningPlatform[] = [
  {
    id: 'coursera',
    name: 'Coursera',
    type: 'mooc',
    icon: '🎓',
    connected: true,
    apiEndpoint: 'https://api.coursera.org',
    lastSync: '2024-01-10T10:30:00Z',
    resourceCount: 1247
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Learning',
    type: 'video',
    icon: '💼',
    connected: true,
    apiEndpoint: 'https://api.linkedin.com/learning',
    lastSync: '2024-01-10T09:15:00Z',
    resourceCount: 856
  },
  {
    id: 'udemy',
    name: 'Udemy',
    type: 'video',
    icon: '📚',
    connected: false,
    resourceCount: 0
  },
  {
    id: 'complianceai',
    name: 'ComplianceAI Academy',
    type: 'lms',
    icon: '🛡️',
    connected: true,
    apiEndpoint: 'https://api.complianceai.com',
    lastSync: '2024-01-10T11:00:00Z',
    resourceCount: 423
  },
  {
    id: 'iapp',
    name: 'IAPP Training',
    type: 'certification',
    icon: '🏆',
    connected: true,
    apiEndpoint: 'https://api.iapp.org',
    lastSync: '2024-01-10T08:45:00Z',
    resourceCount: 156
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
    isFavorited: true
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
    cpdCredits: 3
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
    cpdCredits: 12
  }
]

export function LearningResourceIntegration() {
  const [platforms] = useKV<LearningPlatform[]>('learning-platforms', mockPlatforms)
  const [resources, setResources] = useKV<LearningResource[]>('learning-resources', mockResources)
  const [connections, setConnections] = useKV<PlatformConnection[]>('platform-connections', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false)
  const [selectedPlatformToConnect, setSelectedPlatformToConnect] = useState<string>('')
  const [apiKey, setApiKey] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

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

  const handleConnectPlatform = async (platformId: string, apiKey: string) => {
    const newConnection: PlatformConnection = {
      platform: platformId,
      apiKey,
      isActive: true,
      lastSync: new Date().toISOString()
    }
    
    setConnections(current => [...current.filter(c => c.platform !== platformId), newConnection])
    setIsConnectDialogOpen(false)
    setApiKey('')
    toast.success(`Connected to ${platforms.find(p => p.id === platformId)?.name}`)
  }

  const handleSyncResources = async (platformId?: string) => {
    setIsSyncing(true)
    
    // Simulate API call to sync resources
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock adding new resources
    const newResources: LearningResource[] = [
      {
        id: Date.now().toString(),
        title: `New Course from ${platformId || 'Platform'}`,
        platform: platformId || 'coursera',
        type: 'course',
        description: 'Recently synced course content',
        duration: 240,
        difficulty: 'intermediate',
        topics: ['Compliance', 'Training'],
        rating: 4.5,
        enrollmentCount: 1200,
        price: 49,
        url: 'https://example.com/new-course',
        provider: 'Learning Provider',
        lastUpdated: new Date().toISOString().split('T')[0],
        cpdCredits: 4
      }
    ]
    
    setResources(current => [...current, ...newResources])
    setIsSyncing(false)
    toast.success(`Synced resources ${platformId ? `from ${platforms.find(p => p.id === platformId)?.name}` : 'from all platforms'}`)
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
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
                      <ExternalLink className="w-4 h-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map(platform => (
              <Card key={platform.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{platform.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription className="capitalize">{platform.type}</CardDescription>
                      </div>
                    </div>
                    
                    <Badge variant={platform.connected ? "default" : "outline"}>
                      {platform.connected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {platform.connected ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Resources:</span>
                          <div className="font-semibold">{platform.resourceCount?.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Sync:</span>
                          <div className="font-semibold">
                            {platform.lastSync ? new Date(platform.lastSync).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
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
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Connect to access thousands of compliance learning resources
                      </p>
                      
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
                              Enter your API credentials to integrate with {platform.name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
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
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => handleConnectPlatform(platform.id, apiKey)}
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
                      <TrendingUp className="w-4 h-4 text-green-600" />
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
        </TabsContent>
      </Tabs>
    </div>
  )
}