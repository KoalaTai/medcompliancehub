import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Network, 
  GitBranch, 
  Database, 
  Brain,
  FileText,
  Shield,
  Globe,
  Code,
  ArrowRight,
  Eye,
  Hierarchy
} from '@phosphor-icons/react'

interface ArchitectureNode {
  id: string
  label: string
  type: 'platform' | 'validation' | 'component' | 'external'
  status: 'active' | 'planned' | 'integration'
  dependencies: string[]
  description: string
}

const architectureNodes: ArchitectureNode[] = [
  {
    id: 'web-client',
    label: 'Web Client (HTML + Vanilla JS)',
    type: 'platform',
    status: 'active',
    dependencies: [],
    description: 'Audit templates, simulations, regulatory browser, auth'
  },
  {
    id: 'flask-app',
    label: 'Flask App & Core',
    type: 'platform',
    status: 'active',
    dependencies: ['web-client'],
    description: 'API routes, CSRF, sessions, logging, Firebase/Google auth'
  },
  {
    id: 'blueprints',
    label: 'Blueprints (API & UI)',
    type: 'platform',
    status: 'active',
    dependencies: ['flask-app'],
    description: 'audit_routes.py, simulation_api.py, regulatory_browser_routes.py'
  },
  {
    id: 'services',
    label: 'Services & Utils',
    type: 'component',
    status: 'active',
    dependencies: ['blueprints'],
    description: 'AI providers, citation integration, compliance validator'
  },
  {
    id: 'database',
    label: 'Database (SQLAlchemy)',
    type: 'component',
    status: 'active',
    dependencies: ['services'],
    description: 'Models, migrations, knowledge base'
  },
  {
    id: 'knowledge-base',
    label: 'Knowledge Base',
    type: 'component',
    status: 'active',
    dependencies: ['database'],
    description: 'FDA_QSR, ISO_13485, ISO_14971, EU_MDR'
  },
  {
    id: 'external-apis',
    label: 'External AI/APIs',
    type: 'external',
    status: 'integration',
    dependencies: ['services'],
    description: 'Gemini, OpenAI, Anthropic, Perplexity, OCR/voice'
  },
  {
    id: 'urs-validation',
    label: 'URS from Intended Use & Context',
    type: 'validation',
    status: 'active',
    dependencies: ['knowledge-base'],
    description: 'Boundary conditions, measurable testable URS, version & trace'
  },
  {
    id: 'mq-validation',
    label: 'Model Qualification (MQ)',
    type: 'validation',
    status: 'active',
    dependencies: ['urs-validation'],
    description: 'Classical metrics as statistical floor, safety checks'
  },
  {
    id: 'pq-validation',
    label: 'Performance Qualification (PQ)',
    type: 'validation',
    status: 'planned',
    dependencies: ['mq-validation'],
    description: 'Grounded factuality checks & citation validation'
  },
  {
    id: 'continuous-governance',
    label: 'Continuous Governance',
    type: 'validation',
    status: 'planned',
    dependencies: ['pq-validation'],
    description: 'Drift detection & retraining triggers, SBOM & vulnerability'
  },
  {
    id: 'evidence-traceability',
    label: 'Evidence & Traceability',
    type: 'validation',
    status: 'active',
    dependencies: ['continuous-governance'],
    description: 'Versioned prompts, datasets, model IDs, audit trails'
  }
]

function getNodeColor(type: string, status: string) {
  if (status === 'planned') return 'border-muted bg-muted/10'
  
  switch (type) {
    case 'platform':
      return 'border-primary bg-primary/10'
    case 'validation':
      return 'border-secondary bg-secondary/10'
    case 'component':
      return 'border-accent bg-accent/10'
    case 'external':
      return 'border-orange-500 bg-orange-500/10'
    default:
      return 'border-muted bg-muted/10'
  }
}

function getNodeIcon(type: string) {
  switch (type) {
    case 'platform':
      return <Code className="h-4 w-4" />
    case 'validation':
      return <Shield className="h-4 w-4" />
    case 'component':
      return <Database className="h-4 w-4" />
    case 'external':
      return <Globe className="h-4 w-4" />
    default:
      return <Network className="h-4 w-4" />
  }
}

export function ComplianceArchitectureDiagram() {
  const platformNodes = architectureNodes.filter(n => n.type === 'platform')
  const validationNodes = architectureNodes.filter(n => n.type === 'validation')
  const componentNodes = architectureNodes.filter(n => n.type === 'component')
  const externalNodes = architectureNodes.filter(n => n.type === 'external')

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Hierarchy className="h-5 w-5" />
            VirtualBackroom Architecture - AI Validation Platform
          </CardTitle>
          <CardDescription>
            Platform architecture from Flask blueprints to AI validation workflow (GxP audit-ready)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Platform Architecture (Left Side) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Code className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Platform Architecture</h4>
              </div>
              
              <div className="space-y-3">
                {platformNodes.map((node, index) => (
                  <div key={node.id} className="relative">
                    <Card className={`p-3 ${getNodeColor(node.type, node.status)}`}>
                      <div className="flex items-start gap-3">
                        {getNodeIcon(node.type)}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm">{node.label}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{node.status}</Badge>
                      </div>
                    </Card>
                    {index < platformNodes.length - 1 && (
                      <div className="flex justify-center py-1">
                        <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-accent" />
                  <h5 className="font-medium text-sm">Core Components</h5>
                </div>
                {componentNodes.map((node) => (
                  <Card key={node.id} className={`p-3 ${getNodeColor(node.type, node.status)}`}>
                    <div className="flex items-start gap-3">
                      {getNodeIcon(node.type)}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm">{node.label}</h5>
                        <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-orange-500" />
                  <h5 className="font-medium text-sm">External Integrations</h5>
                </div>
                {externalNodes.map((node) => (
                  <Card key={node.id} className={`p-3 ${getNodeColor(node.type, node.status)}`}>
                    <div className="flex items-start gap-3">
                      {getNodeIcon(node.type)}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm">{node.label}</h5>
                        <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* AI Validation Workflow (Right Side) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-secondary" />
                <h4 className="font-semibold">AI Validation Workflow (GxP audit-ready)</h4>
              </div>
              
              <div className="space-y-3">
                {validationNodes.map((node, index) => (
                  <div key={node.id} className="relative">
                    <Card className={`p-4 ${getNodeColor(node.type, node.status)}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm">{node.label}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={node.status === 'active' ? 'secondary' : 'outline'} className="text-xs">
                              {node.status}
                            </Badge>
                            {node.status === 'planned' && (
                              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                    {index < validationNodes.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowRight className="h-5 w-5 text-secondary rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Integration Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Key Integration Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <h5 className="font-medium mb-2 text-primary">Flask → FastAPI Migration</h5>
              <p className="text-sm text-muted-foreground">
                Legacy blueprints (audit_routes.py, simulation_api.py) being replatformed to FastAPI with typed interfaces
              </p>
            </div>
            <div className="p-4 rounded-lg border border-secondary/20 bg-secondary/5">
              <h5 className="font-medium mb-2 text-secondary">AI Provider Abstraction</h5>
              <p className="text-sm text-muted-foreground">
                Unified LLM adapter supporting OpenAI, Anthropic, Gemini with audit logging and cost tracking
              </p>
            </div>
            <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
              <h5 className="font-medium mb-2 text-accent">Evidence Traceability</h5>
              <p className="text-sm text-muted-foreground">
                Immutable audit trails linking prompts → model outputs → regulatory citations → compliance decisions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}