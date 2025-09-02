import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Calendar,
  Clock,
  Target,
  CheckCircle,
  Warning,
  TrendUp,
  Users,
  Code,
  Zap,
  Shield,
  ChartBar,
  Wrench,
  Sparkles,
  ArrowRight,
  PlayCircle,
  PauseCircle,
  GitBranch,
  Lightbulb,
  Database,
  Cpu,
  Settings,
  MapPin,
  Flag,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  DollarSign,
  Timer,
  Gauge,
  Activity,
  Brain,
  Eye,
  Network
} from '@phosphor-icons/react'

interface RoadmapPhase {
  id: string
  name: string
  description: string
  duration: string
  status: 'planning' | 'in-progress' | 'completed' | 'blocked' | 'on-hold'
  priority: 'critical' | 'high' | 'medium' | 'low'
  features: RoadmapFeature[]
  dependencies: string[]
  resources: string[]
  budget: number
  startDate: string
  endDate: string
  risks: RiskAssessment[]
  successMetrics: SuccessMetric[]
  milestones: Milestone[]
}

interface RoadmapFeature {
  id: string
  name: string
  description: string
  category: 'core' | 'enhancement' | 'integration' | 'optimization' | 'infrastructure'
  complexity: 'simple' | 'moderate' | 'complex' | 'epic'
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'testing'
  assignee?: string
  estimatedHours: number
  actualHours?: number
  blockers: string[]
  dependencies: string[]
  testingRequirements: string[]
  acceptanceCriteria: string[]
}

interface RiskAssessment {
  id: string
  description: string
  probability: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  mitigation: string
  status: 'identified' | 'monitoring' | 'mitigated' | 'occurred'
}

interface SuccessMetric {
  id: string
  name: string
  target: string
  current?: string
  type: 'performance' | 'quality' | 'adoption' | 'business'
}

interface Milestone {
  id: string
  name: string
  description: string
  targetDate: string
  status: 'pending' | 'achieved' | 'missed' | 'at-risk'
  dependencies: string[]
}

interface ResourceAllocation {
  role: string
  allocation: number // percentage
  cost: number // per hour
  availability: string
  skills: string[]
}

interface Implementation {
  phase: string
  approach: string
  technologies: string[]
  timeline: string
  deliverables: string[]
}

export function DevelopmentRoadmap() {
  const [phases, setPhases] = useKV<RoadmapPhase[]>('roadmap-phases', [])
  const [resources, setResources] = useKV<ResourceAllocation[]>('roadmap-resources', [])
  const [implementations, setImplementations] = useKV<Implementation[]>('implementation-plans', [])
  const [activePhase, setActivePhase] = useState<string>('')
  const [selectedFeature, setSelectedFeature] = useState<RoadmapFeature | null>(null)
  const [selectedRisk, setSelectedRisk] = useState<RiskAssessment | null>(null)
  const [showPhaseDialog, setShowPhaseDialog] = useState(false)
  const [showFeatureDialog, setShowFeatureDialog] = useState(false)
  const [showRiskDialog, setShowRiskDialog] = useState(false)
  const [showImplementationDialog, setShowImplementationDialog] = useState(false)
  const [editingPhase, setEditingPhase] = useState<RoadmapPhase | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [viewMode, setViewMode] = useState<'gantt' | 'kanban' | 'timeline'>('timeline')

  // Initialize with sample roadmap if empty
  useEffect(() => {
    if (phases.length === 0) {
      generateInitialRoadmap()
    }
  }, [])

  const generateInitialRoadmap = async () => {
    setIsGenerating(true)
    try {
      const prompt = spark.llmPrompt`
        Generate a comprehensive 4-phase development roadmap for VirtualBackroom compliance platform.
        
        Each phase should include:
        1. Detailed features with acceptance criteria and testing requirements
        2. Risk assessments with probability, impact, and mitigation strategies
        3. Success metrics and measurable outcomes
        4. Key milestones with dependencies
        5. Implementation approaches and technical strategies
        
        Phase structure:
        1. Foundation & Core MVP (10 weeks) - Basic platform functionality
        2. AI Intelligence & Automation (12 weeks) - Advanced AI features
        3. Analytics & Learning Platform (10 weeks) - Comprehensive analytics
        4. Enterprise & Scale (8 weeks) - Enterprise features and optimization
        
        Include realistic risk assessments, resource planning, and implementation strategies.
        Return as comprehensive JSON structure.
      `
      
      const roadmapData = await spark.llm(prompt, 'gpt-4o', true)
      const parsedRoadmap = JSON.parse(roadmapData)
      
      setPhases(parsedRoadmap.phases || defaultPhases)
      setResources(parsedRoadmap.resources || defaultResources)
      setImplementations(parsedRoadmap.implementations || defaultImplementations)
      
      toast.success('Comprehensive development roadmap generated')
    } catch (error) {
      console.error('Error generating roadmap:', error)
      setPhases(defaultPhases)
      setResources(defaultResources)
      setImplementations(defaultImplementations)
      toast.error('Using enhanced default roadmap template')
    }
    setIsGenerating(false)
  }

  const defaultPhases: RoadmapPhase[] = [
    {
      id: 'phase-1',
      name: 'Foundation & MVP',
      description: 'Core platform infrastructure and essential compliance features',
      duration: '10 weeks',
      status: 'in-progress',
      priority: 'critical',
      startDate: '2024-01-15',
      endDate: '2024-03-25',
      budget: 125000,
      resources: ['Frontend Developer', 'Backend Developer', 'UX Designer'],
      dependencies: [],
      risks: [
        {
          id: 'r1-1',
          description: 'Authentication system complexity could delay other features',
          probability: 'medium',
          impact: 'high',
          mitigation: 'Use proven OAuth2 library and allocate extra time for testing',
          status: 'monitoring'
        },
        {
          id: 'r1-2',
          description: 'Database schema changes might affect existing integrations',
          probability: 'low',
          impact: 'medium',
          mitigation: 'Implement database migrations and maintain backward compatibility',
          status: 'identified'
        }
      ],
      successMetrics: [
        {
          id: 'm1-1',
          name: 'User Authentication Success Rate',
          target: '99.9%',
          current: '98.5%',
          type: 'performance'
        },
        {
          id: 'm1-2',
          name: 'Core Feature Completion',
          target: '100%',
          current: '75%',
          type: 'quality'
        }
      ],
      milestones: [
        {
          id: 'ms1-1',
          name: 'Authentication System Complete',
          description: 'Secure login with role-based access control',
          targetDate: '2024-02-15',
          status: 'achieved',
          dependencies: []
        },
        {
          id: 'ms1-2',
          name: 'Evidence Management MVP',
          description: 'Basic document upload and organization',
          targetDate: '2024-03-01',
          status: 'at-risk',
          dependencies: ['ms1-1']
        }
      ],
      features: [
        {
          id: 'f1-1',
          name: 'Core Dashboard & Navigation',
          description: 'Main dashboard with sidebar navigation and basic metrics',
          category: 'core',
          complexity: 'moderate',
          status: 'completed',
          estimatedHours: 40,
          actualHours: 45,
          blockers: [],
          dependencies: [],
          testingRequirements: ['Unit tests for components', 'E2E navigation tests', 'Responsive design tests'],
          acceptanceCriteria: ['Dashboard loads in <2s', 'Navigation works on mobile', 'Metrics display correctly']
        },
        {
          id: 'f1-2',
          name: 'User Authentication & Roles',
          description: 'Secure login system with role-based access control',
          category: 'core',
          complexity: 'complex',
          status: 'in-progress',
          estimatedHours: 60,
          actualHours: 45,
          blockers: [],
          dependencies: [],
          testingRequirements: ['Security penetration testing', 'Role permission tests', 'OAuth integration tests'],
          acceptanceCriteria: ['Support multiple auth providers', 'Role-based UI rendering', 'Session management']
        },
        {
          id: 'f1-3',
          name: 'Evidence Management System',
          description: 'Document upload, organization, and compliance tracking',
          category: 'core',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 80,
          blockers: ['Authentication system'],
          dependencies: ['f1-2'],
          testingRequirements: ['File upload stress tests', 'Search functionality tests', 'Compliance workflow tests'],
          acceptanceCriteria: ['Support 10MB+ files', 'Fast search results', 'Audit trail tracking']
        },
        {
          id: 'f1-4',
          name: 'Basic Audit Simulations',
          description: 'Simple audit scenario execution and results tracking',
          category: 'core',
          complexity: 'moderate',
          status: 'not-started',
          estimatedHours: 50,
          blockers: [],
          dependencies: ['f1-3'],
          testingRequirements: ['Simulation accuracy tests', 'Results reporting tests', 'Performance benchmarks'],
          acceptanceCriteria: ['Create custom scenarios', 'Generate detailed reports', 'Export results to PDF']
        }
      ]
    },
    {
      id: 'phase-2',
      name: 'AI Intelligence & Automation',
      description: 'Advanced AI features for gap analysis and intelligent recommendations',
      duration: '12 weeks',
      status: 'planning',
      priority: 'critical',
      startDate: '2024-03-25',
      endDate: '2024-06-17',
      budget: 180000,
      resources: ['AI/ML Engineer', 'Backend Developer', 'Data Engineer'],
      dependencies: ['phase-1'],
      risks: [
        {
          id: 'r2-1',
          description: 'AI model accuracy may not meet business requirements',
          probability: 'medium',
          impact: 'high',
          mitigation: 'Implement A/B testing and gradual rollout with human oversight',
          status: 'identified'
        },
        {
          id: 'r2-2',
          description: 'Training data quality issues could impact model performance',
          probability: 'high',
          impact: 'medium',
          mitigation: 'Establish data validation pipeline and quality metrics',
          status: 'monitoring'
        }
      ],
      successMetrics: [
        {
          id: 'm2-1',
          name: 'Gap Detection Accuracy',
          target: '85%+',
          type: 'quality'
        },
        {
          id: 'm2-2',
          name: 'CAPA Generation Success Rate',
          target: '90%+',
          type: 'performance'
        }
      ],
      milestones: [
        {
          id: 'ms2-1',
          name: 'AI Model Training Complete',
          description: 'Initial gap analysis models trained and validated',
          targetDate: '2024-04-30',
          status: 'pending',
          dependencies: ['ms1-2']
        },
        {
          id: 'ms2-2',
          name: 'CAPA Generator Beta',
          description: 'Beta version of automated CAPA workflow generator',
          targetDate: '2024-05-30',
          status: 'pending',
          dependencies: ['ms2-1']
        }
      ],
      features: [
        {
          id: 'f2-1',
          name: 'AI-Powered Gap Analysis',
          description: 'Machine learning models for compliance gap identification',
          category: 'core',
          complexity: 'epic',
          status: 'not-started',
          estimatedHours: 120,
          blockers: [],
          dependencies: ['f1-3'],
          testingRequirements: ['Model accuracy validation', 'Performance benchmarking', 'Bias detection tests'],
          acceptanceCriteria: ['85%+ accuracy rate', 'Process 1000+ documents', 'Generate actionable insights']
        },
        {
          id: 'f2-2',
          name: 'CAPA Workflow Generator',
          description: 'Automated corrective action plan generation',
          category: 'core',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 100,
          blockers: [],
          dependencies: ['f2-1'],
          testingRequirements: ['Workflow validation tests', 'Template generation tests', 'Integration tests'],
          acceptanceCriteria: ['Generate complete CAPAs', 'Customizable templates', 'Track implementation']
        },
        {
          id: 'f2-3',
          name: 'Skill Gap Analyzer',
          description: 'AI assessment of individual and team skill deficiencies',
          category: 'core',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 90,
          blockers: [],
          dependencies: ['f2-1'],
          testingRequirements: ['Skill assessment validation', 'Recommendation quality tests', 'Privacy compliance'],
          acceptanceCriteria: ['Assess 50+ skills', 'Personalized recommendations', 'Team benchmarking']
        },
        {
          id: 'f2-4',
          name: 'Regulatory Intelligence Engine',
          description: 'Real-time monitoring and analysis of regulatory changes',
          category: 'integration',
          complexity: 'epic',
          status: 'not-started',
          estimatedHours: 110,
          blockers: [],
          dependencies: [],
          testingRequirements: ['Real-time data processing', 'Alert system tests', 'API integration tests'],
          acceptanceCriteria: ['Monitor 10+ regulatory bodies', 'Real-time alerts', 'Impact analysis']
        }
      ]
    },
    {
      id: 'phase-3',
      name: 'Advanced Analytics & Learning',
      description: 'Comprehensive analytics, learning path optimization, and team insights',
      duration: '10 weeks',
      status: 'planning',
      priority: 'high',
      startDate: '2024-06-17',
      endDate: '2024-08-26',
      budget: 145000,
      resources: ['Data Scientist', 'Frontend Developer', 'UX Designer'],
      dependencies: ['phase-2'],
      risks: [
        {
          id: 'r3-1',
          description: 'Learning path algorithm complexity may impact user experience',
          probability: 'medium',
          impact: 'medium',
          mitigation: 'Implement progressive enhancement with simple fallbacks',
          status: 'identified'
        }
      ],
      successMetrics: [
        {
          id: 'm3-1',
          name: 'Learning Path Engagement',
          target: '70%+ completion rate',
          type: 'adoption'
        },
        {
          id: 'm3-2',
          name: 'Analytics Dashboard Usage',
          target: '80%+ daily active users',
          type: 'business'
        }
      ],
      milestones: [
        {
          id: 'ms3-1',
          name: 'Analytics Platform Beta',
          description: 'Comprehensive analytics dashboard with core metrics',
          targetDate: '2024-07-30',
          status: 'pending',
          dependencies: ['ms2-2']
        }
      ],
      features: [
        {
          id: 'f3-1',
          name: 'Learning Path Optimization',
          description: 'AI-driven personalized learning recommendations with scheduling',
          category: 'enhancement',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 80,
          blockers: [],
          dependencies: ['f2-3'],
          testingRequirements: ['Algorithm effectiveness tests', 'User experience testing', 'Performance optimization'],
          acceptanceCriteria: ['Personalized paths for all users', 'Adaptive scheduling', 'Progress tracking']
        },
        {
          id: 'f3-2',
          name: 'Team Skill Comparison Dashboard',
          description: 'Comprehensive team analytics and benchmarking',
          category: 'enhancement',
          complexity: 'moderate',
          status: 'not-started',
          estimatedHours: 60,
          blockers: [],
          dependencies: ['f2-3'],
          testingRequirements: ['Data visualization tests', 'Performance benchmarking', 'Privacy compliance'],
          acceptanceCriteria: ['Compare unlimited teams', 'Industry benchmarks', 'Export capabilities']
        },
        {
          id: 'f3-3',
          name: 'Career Path Recommendations',
          description: 'AI-powered career guidance and development planning',
          category: 'enhancement',
          complexity: 'moderate',
          status: 'not-started',
          estimatedHours: 70,
          blockers: [],
          dependencies: ['f3-1'],
          testingRequirements: ['Recommendation accuracy tests', 'User satisfaction surveys', 'Goal tracking'],
          acceptanceCriteria: ['Multiple career paths', 'Goal setting', 'Progress milestones']
        },
        {
          id: 'f3-4',
          name: 'Advanced Reporting & Analytics',
          description: 'Comprehensive reporting suite with predictive analytics',
          category: 'enhancement',
          complexity: 'moderate',
          status: 'not-started',
          estimatedHours: 55,
          blockers: [],
          dependencies: ['f3-2'],
          testingRequirements: ['Report generation performance', 'Data accuracy validation', 'Export functionality'],
          acceptanceCriteria: ['20+ report templates', 'Scheduled reports', 'Interactive dashboards']
        }
      ]
    },
    {
      id: 'phase-4',
      name: 'Enterprise & Integration',
      description: 'Enterprise features, external integrations, and scalability optimizations',
      duration: '8 weeks',
      status: 'planning',
      priority: 'high',
      startDate: '2024-08-26',
      endDate: '2024-10-21',
      budget: 120000,
      resources: ['DevOps Engineer', 'Backend Developer', 'Integration Specialist'],
      dependencies: ['phase-3'],
      risks: [
        {
          id: 'r4-1',
          description: 'External API dependencies may cause integration failures',
          probability: 'high',
          impact: 'medium',
          mitigation: 'Implement circuit breakers and fallback mechanisms',
          status: 'identified'
        },
        {
          id: 'r4-2',
          description: 'Scaling requirements may exceed infrastructure capacity',
          probability: 'medium',
          impact: 'high',
          mitigation: 'Implement auto-scaling and load balancing early',
          status: 'monitoring'
        }
      ],
      successMetrics: [
        {
          id: 'm4-1',
          name: 'System Uptime',
          target: '99.9%+',
          type: 'performance'
        },
        {
          id: 'm4-2',
          name: 'Integration Success Rate',
          target: '95%+',
          type: 'quality'
        }
      ],
      milestones: [
        {
          id: 'ms4-1',
          name: 'Production Deployment',
          description: 'Full enterprise-ready system deployment',
          targetDate: '2024-10-15',
          status: 'pending',
          dependencies: ['ms3-1']
        }
      ],
      features: [
        {
          id: 'f4-1',
          name: 'Learning Platform Integrations',
          description: 'API connections to external learning platforms with webhook support',
          category: 'integration',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 90,
          blockers: [],
          dependencies: [],
          testingRequirements: ['API integration tests', 'Webhook reliability tests', 'Error handling tests'],
          acceptanceCriteria: ['5+ platform integrations', 'Real-time sync', 'Error recovery']
        },
        {
          id: 'f4-2',
          name: 'Email Notification System',
          description: 'Comprehensive email templates and automated notifications',
          category: 'integration',
          complexity: 'moderate',
          status: 'not-started',
          estimatedHours: 45,
          blockers: [],
          dependencies: ['f4-1'],
          testingRequirements: ['Email delivery tests', 'Template rendering tests', 'Spam score validation'],
          acceptanceCriteria: ['10+ email templates', 'Delivery tracking', 'Personalization']
        },
        {
          id: 'f4-3',
          name: 'Enterprise Security & Compliance',
          description: 'Advanced security features, audit trails, and compliance controls',
          category: 'infrastructure',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 75,
          blockers: [],
          dependencies: [],
          testingRequirements: ['Security penetration testing', 'Compliance validation', 'Audit trail tests'],
          acceptanceCriteria: ['SOC2 compliance', 'GDPR compliance', 'Audit trail coverage']
        },
        {
          id: 'f4-4',
          name: 'Performance Optimization & Scale',
          description: 'System optimization for enterprise-scale deployments',
          category: 'optimization',
          complexity: 'complex',
          status: 'not-started',
          estimatedHours: 65,
          blockers: [],
          dependencies: [],
          testingRequirements: ['Load testing', 'Performance profiling', 'Scalability tests'],
          acceptanceCriteria: ['Handle 10K+ users', 'Sub-second response', 'Auto-scaling']
        }
      ]
    }
  ]

  const defaultResources: ResourceAllocation[] = [
    { 
      role: 'Senior Frontend Developer', 
      allocation: 80, 
      cost: 85, 
      availability: 'Full-time',
      skills: ['React', 'TypeScript', 'UI/UX', 'Testing']
    },
    { 
      role: 'Senior Backend Developer', 
      allocation: 100, 
      cost: 90,
      availability: 'Full-time',
      skills: ['Node.js', 'Python', 'Database Design', 'API Development']
    },
    { 
      role: 'AI/ML Engineer', 
      allocation: 60, 
      cost: 110,
      availability: 'Contract',
      skills: ['Machine Learning', 'NLP', 'TensorFlow', 'Data Analysis']
    },
    { 
      role: 'UX/UI Designer', 
      allocation: 40, 
      cost: 70,
      availability: 'Part-time',
      skills: ['User Research', 'Prototyping', 'Design Systems', 'Accessibility']
    },
    { 
      role: 'Data Engineer', 
      allocation: 50, 
      cost: 95,
      availability: 'Contract',
      skills: ['ETL Pipelines', 'Data Warehousing', 'Analytics', 'Cloud Platforms']
    },
    { 
      role: 'DevOps Engineer', 
      allocation: 30, 
      cost: 80,
      availability: 'Consultant',
      skills: ['AWS/Azure', 'CI/CD', 'Monitoring', 'Security']
    },
    { 
      role: 'Product Manager', 
      allocation: 50, 
      cost: 85,
      availability: 'Part-time',
      skills: ['Strategy', 'Stakeholder Management', 'Analytics', 'Roadmapping']
    }
  ]

  const defaultImplementations: Implementation[] = [
    {
      phase: 'Foundation & MVP',
      approach: 'Agile development with 2-week sprints focusing on core user journeys',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      timeline: '10 weeks with parallel development streams',
      deliverables: ['MVP Platform', 'User Documentation', 'Testing Suite', 'Deployment Pipeline']
    },
    {
      phase: 'AI Intelligence & Automation',
      approach: 'Model-driven development with extensive testing and validation',
      technologies: ['Python', 'TensorFlow', 'Apache Kafka', 'Redis'],
      timeline: '12 weeks with phased ML model deployment',
      deliverables: ['AI Models', 'Training Pipeline', 'API Endpoints', 'Performance Benchmarks']
    },
    {
      phase: 'Advanced Analytics & Learning',
      approach: 'Data-driven development with user feedback integration',
      technologies: ['D3.js', 'Apache Spark', 'Elasticsearch', 'Docker'],
      timeline: '10 weeks with iterative dashboard development',
      deliverables: ['Analytics Platform', 'Learning Algorithms', 'Reporting Suite', 'User Training']
    },
    {
      phase: 'Enterprise & Integration',
      approach: 'Integration-first development with comprehensive testing',
      technologies: ['Kubernetes', 'API Gateway', 'Monitoring Stack', 'Security Tools'],
      timeline: '8 weeks with parallel integration workstreams',
      deliverables: ['Production System', 'Integration APIs', 'Security Audit', 'Scale Testing']
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-blue-500'
      case 'blocked': return 'bg-red-500'
      case 'planning': return 'bg-yellow-500'
      case 'on-hold': return 'bg-gray-500'
      case 'testing': return 'bg-purple-500'
      default: return 'bg-gray-400'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'complex': return 'bg-orange-100 text-orange-800'
      case 'epic': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Cpu className="h-4 w-4" />
      case 'enhancement': return <Sparkles className="h-4 w-4" />
      case 'integration': return <GitBranch className="h-4 w-4" />
      case 'optimization': return <Zap className="h-4 w-4" />
      case 'infrastructure': return <Database className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const calculatePhaseProgress = (phase: RoadmapPhase) => {
    const completed = phase.features.filter(f => f.status === 'completed').length
    return phase.features.length > 0 ? (completed / phase.features.length) * 100 : 0
  }

  const calculateTotalBudget = () => {
    return phases.reduce((sum, phase) => sum + phase.budget, 0)
  }

  const calculateResourceUtilization = () => {
    return resources.reduce((sum, resource) => sum + (resource.allocation * resource.cost), 0)
  }

  const getCurrentPhase = () => {
    return phases.find(p => p.status === 'in-progress') || phases[0]
  }

  const calculateRiskScore = (phase: RoadmapPhase) => {
    const riskWeights = { low: 1, medium: 3, high: 5 }
    const impactWeights = { low: 1, medium: 2, high: 3 }
    
    return phase.risks.reduce((score, risk) => {
      if (risk.status === 'mitigated') return score
      const probability = riskWeights[risk.probability]
      const impact = impactWeights[risk.impact]
      return score + (probability * impact)
    }, 0)
  }

  const getPhaseHealthScore = (phase: RoadmapPhase) => {
    const progress = calculatePhaseProgress(phase)
    const riskScore = calculateRiskScore(phase)
    const blockedFeatures = phase.features.filter(f => f.status === 'blocked').length
    
    let health = 100
    health -= (riskScore * 2) // Risk penalty
    health -= (blockedFeatures * 10) // Blocker penalty
    health = Math.max(0, Math.min(100, health))
    
    return health
  }

  const getTotalEstimatedHours = () => {
    return phases.reduce((sum, phase) => 
      sum + phase.features.reduce((featureSum, feature) => 
        featureSum + feature.estimatedHours, 0), 0)
  }

  const getTotalActualHours = () => {
    return phases.reduce((sum, phase) => 
      sum + phase.features.reduce((featureSum, feature) => 
        featureSum + (feature.actualHours || 0), 0), 0)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Development Roadmap</h2>
          <p className="text-muted-foreground">
            Comprehensive implementation plan with phased delivery
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={generateInitialRoadmap}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Regenerate Roadmap
          </Button>
          <Button onClick={() => setShowPhaseDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Phase
          </Button>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Phases</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{phases.length}</div>
            <p className="text-xs text-muted-foreground">
              {phases.filter(p => p.status === 'completed').length} completed, {phases.filter(p => p.status === 'in-progress').length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features & Risks</CardTitle>
            <div className="flex items-center gap-1">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <Warning className="h-3 w-3 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {phases.reduce((sum, p) => sum + p.features.length, 0)}
              <span className="text-sm text-yellow-600 ml-1">
                ({phases.reduce((sum, p) => sum + p.risks.length, 0)}R)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {phases.reduce((sum, p) => sum + p.features.filter(f => f.status === 'completed').length, 0)} completed, {phases.reduce((sum, p) => sum + p.risks.filter(r => r.status === 'identified').length, 0)} risks active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget & Hours</CardTitle>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Timer className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(calculateTotalBudget() / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              {getTotalEstimatedHours()}h estimated, {getTotalActualHours()}h actual
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">40 weeks</div>
            <p className="text-xs text-muted-foreground">
              Jan 2024 - Oct 2024
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(phases.reduce((sum, p) => sum + getPhaseHealthScore(p), 0) / phases.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall project health
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="features">Feature Details</TabsTrigger>
          <TabsTrigger value="resources">Resource Planning</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          <TabsTrigger value="implementation">Implementation Plans</TabsTrigger>
          <TabsTrigger value="analytics">Progress Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <div className="space-y-4">
            {phases.map((phase, index) => (
              <Card key={phase.id} className={`${phase.status === 'in-progress' ? 'border-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(phase.status)}`} />
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Phase {index + 1}: {phase.name}
                          <Badge variant={phase.priority === 'high' ? 'destructive' : phase.priority === 'medium' ? 'default' : 'secondary'}>
                            {phase.priority}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{phase.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{phase.duration}</div>
                      <div>${phase.budget.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(calculatePhaseProgress(phase))}%</span>
                      </div>
                      <Progress value={calculatePhaseProgress(phase)} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {phase.features.filter(f => f.status === 'completed').length}/{phase.features.length} features
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Key Features
                      </h4>
                      <div className="space-y-2">
                        {phase.features.slice(0, 3).map(feature => (
                          <div key={feature.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(feature.category)}
                              <span className="text-sm">{feature.name}</span>
                            </div>
                            <Badge 
                              variant="outline"
                              className={feature.status === 'completed' ? 'border-green-500 text-green-700' :
                                feature.status === 'in-progress' ? 'border-blue-500 text-blue-700' :
                                feature.status === 'blocked' ? 'border-red-500 text-red-700' : ''}
                            >
                              {feature.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        ))}
                        {phase.features.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            +{phase.features.length - 3} more features
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Resources & Dependencies
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Team:</p>
                          <div className="flex flex-wrap gap-1">
                            {phase.resources.map(resource => (
                              <Badge key={resource} variant="secondary" className="text-xs">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {phase.dependencies.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Dependencies:</p>
                            <div className="flex flex-wrap gap-1">
                              {phase.dependencies.map(dep => (
                                <Badge key={dep} variant="outline" className="text-xs">
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4">
            {phases.map(phase => (
              <Card key={phase.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {phase.name}
                    <Badge>{phase.features.length} features</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {phase.features.map(feature => (
                      <div 
                        key={feature.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedFeature(feature)}
                      >
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(feature.category)}
                          <div>
                            <h4 className="font-medium">{feature.name}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getComplexityColor(feature.complexity)}>
                            {feature.complexity}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={feature.status === 'completed' ? 'border-green-500 text-green-700' :
                              feature.status === 'in-progress' ? 'border-blue-500 text-blue-700' :
                              feature.status === 'blocked' ? 'border-red-500 text-red-700' : ''}
                          >
                            {feature.status.replace('-', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{feature.estimatedHours}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {phases.map(phase => (
              <Card key={`${phase.id}-risks`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {phase.name} - Risk Assessment
                    <Badge className={getRiskColor(calculateRiskScore(phase) > 20 ? 'high' : calculateRiskScore(phase) > 10 ? 'medium' : 'low')}>
                      Risk Score: {calculateRiskScore(phase)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {phase.risks.map(risk => (
                      <div 
                        key={risk.id}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                          risk.status === 'occurred' ? 'border-red-500 bg-red-50' :
                          risk.status === 'mitigated' ? 'border-green-500 bg-green-50' :
                          'border-yellow-500 bg-yellow-50'
                        }`}
                        onClick={() => setSelectedRisk(risk)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{risk.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Mitigation: {risk.mitigation}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Badge className={getRiskColor(risk.probability)} size="sm">
                              {risk.probability} prob
                            </Badge>
                            <Badge className={getRiskColor(risk.impact)} size="sm">
                              {risk.impact} impact
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Success Metrics */}
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Success Metrics
                      </h4>
                      <div className="space-y-2">
                        {phase.successMetrics.map(metric => (
                          <div key={metric.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <p className="text-sm font-medium">{metric.name}</p>
                              <p className="text-xs text-muted-foreground">{metric.type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">{metric.target}</p>
                              {metric.current && (
                                <p className="text-xs text-muted-foreground">Current: {metric.current}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestones */}
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Key Milestones
                      </h4>
                      <div className="space-y-2">
                        {phase.milestones.map(milestone => (
                          <div key={milestone.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <p className="text-sm font-medium">{milestone.name}</p>
                              <p className="text-xs text-muted-foreground">{milestone.description}</p>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant={
                                  milestone.status === 'achieved' ? 'default' :
                                  milestone.status === 'at-risk' ? 'destructive' :
                                  milestone.status === 'missed' ? 'destructive' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {milestone.status.replace('-', ' ')}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(milestone.targetDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <div className="space-y-4">
            {implementations.map((implementation, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {implementation.phase} - Implementation Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Approach & Timeline
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">{implementation.approach}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Timeline:</span>
                        <span>{implementation.timeline}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Technologies & Tools
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {implementation.technologies.map(tech => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Key Deliverables
                      </h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {implementation.deliverables.map(deliverable => (
                          <div key={deliverable} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {deliverable}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Implementation Dependencies
              </CardTitle>
              <CardDescription>
                Critical path analysis and dependency management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  Phase 2 (AI Intelligence) is the critical path blocker. Any delays in ML model development 
                  will cascade to Phases 3 and 4. Consider parallel development of infrastructure components.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Foundation → AI Intelligence</span>
                  <Badge variant="destructive">Critical Path</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">AI Intelligence → Analytics</span>
                  <Badge variant="outline">High Impact</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Analytics → Enterprise</span>
                  <Badge variant="secondary">Medium Impact</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar className="h-5 w-5" />
                  Phase Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phases.map((phase, index) => (
                    <div key={phase.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Phase {index + 1}: {phase.name}</span>
                        <span>{Math.round(calculatePhaseProgress(phase))}%</span>
                      </div>
                      <Progress value={calculatePhaseProgress(phase)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp className="h-5 w-5" />
                  Feature Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'completed', label: 'Completed', color: 'bg-green-500' },
                    { status: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
                    { status: 'not-started', label: 'Not Started', color: 'bg-gray-500' },
                    { status: 'blocked', label: 'Blocked', color: 'bg-red-500' }
                  ].map(({ status, label, color }) => {
                    const count = phases.reduce((sum, p) => 
                      sum + p.features.filter(f => f.status === status).length, 0
                    )
                    const total = phases.reduce((sum, p) => sum + p.features.length, 0)
                    const percentage = total > 0 ? (count / total) * 100 : 0
                    
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${color}`} />
                            {label}
                          </span>
                          <span>{count} ({Math.round(percentage)}%)</span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Risk Detail Dialog */}
      <Dialog open={!!selectedRisk} onOpenChange={() => setSelectedRisk(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Warning className="h-5 w-5 text-yellow-500" />
              Risk Assessment Details
            </DialogTitle>
            <DialogDescription>{selectedRisk?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedRisk && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm font-medium">Probability</Label>
                  <Badge className={`mt-1 ${getRiskColor(selectedRisk.probability)}`}>
                    {selectedRisk.probability}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Impact</Label>
                  <Badge className={`mt-1 ${getRiskColor(selectedRisk.impact)}`}>
                    {selectedRisk.impact}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge 
                    variant={
                      selectedRisk.status === 'mitigated' ? 'default' :
                      selectedRisk.status === 'occurred' ? 'destructive' : 'secondary'
                    }
                    className="mt-1"
                  >
                    {selectedRisk.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Mitigation Strategy</Label>
                <p className="mt-1 text-sm bg-muted p-3 rounded">{selectedRisk.mitigation}</p>
              </div>
              
              <div className="p-3 border rounded bg-blue-50">
                <h4 className="font-semibold text-sm text-blue-800 mb-1">Risk Score Calculation</h4>
                <p className="text-sm text-blue-700">
                  Probability ({selectedRisk.probability}) × Impact ({selectedRisk.impact}) = 
                  {' '}{
                    ({'low': 1, 'medium': 3, 'high': 5}[selectedRisk.probability] || 1) *
                    ({'low': 1, 'medium': 2, 'high': 3}[selectedRisk.impact] || 1)
                  } points
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRisk(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Feature Detail Dialog */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFeature && getCategoryIcon(selectedFeature.category)}
              {selectedFeature?.name}
            </DialogTitle>
            <DialogDescription>{selectedFeature?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedFeature && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge 
                    className={`mt-1 ${selectedFeature.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedFeature.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      selectedFeature.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {selectedFeature.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Complexity</Label>
                  <Badge className={`mt-1 ${getComplexityColor(selectedFeature.complexity)}`}>
                    {selectedFeature.complexity}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estimated Hours</Label>
                  <p className="mt-1">{selectedFeature.estimatedHours}h</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Actual Hours</Label>
                  <p className="mt-1">{selectedFeature.actualHours || 'TBD'}h</p>
                </div>
              </div>
              
              {selectedFeature.testingRequirements && selectedFeature.testingRequirements.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Testing Requirements</Label>
                  <div className="mt-1 space-y-1">
                    {selectedFeature.testingRequirements.map((requirement, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {requirement}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedFeature.acceptanceCriteria && selectedFeature.acceptanceCriteria.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Acceptance Criteria</Label>
                  <div className="mt-1 space-y-1">
                    {selectedFeature.acceptanceCriteria.map((criteria, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Target className="h-3 w-3 text-blue-500" />
                        {criteria}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedFeature.blockers.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Blockers</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFeature.blockers.map(blocker => (
                      <Badge key={blocker} variant="destructive">{blocker}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedFeature.dependencies.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Dependencies</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFeature.dependencies.map(dep => (
                      <Badge key={dep} variant="outline">{dep}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFeature(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}