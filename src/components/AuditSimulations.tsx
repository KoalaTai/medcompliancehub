import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  FlaskConical, 
  Play, 
  Eye, 
  Calendar,
  CheckCircle,
  Warning,
  Clock
} from '@phosphor-icons/react'

interface AuditSimulation {
  id: string
  title: string
  regulation: string
  status: 'scheduled' | 'running' | 'completed' | 'failed'
  progress: number
  findings: number
  nextRun?: string
  lastRun?: string
}

const simulations: AuditSimulation[] = [
  {
    id: '1',
    title: 'ISO 13485 Quality Management System',
    regulation: 'ISO 13485:2016',
    status: 'running',
    progress: 67,
    findings: 2,
    lastRun: '2024-01-15'
  },
  {
    id: '2',
    title: 'FDA Design Controls Audit',
    regulation: 'FDA 21 CFR 820.30',
    status: 'completed',
    progress: 100,
    findings: 5,
    lastRun: '2024-01-14'
  },
  {
    id: '3',
    title: 'EU MDR Clinical Evaluation',
    regulation: 'EU MDR Article 61',
    status: 'scheduled',
    progress: 0,
    findings: 0,
    nextRun: '2024-01-20'
  },
  {
    id: '4',
    title: 'Risk Management Process',
    regulation: 'ISO 14971:2019',
    status: 'completed',
    progress: 100,
    findings: 1,
    lastRun: '2024-01-12'
  }
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
    case 'running':
      return <Play className="h-4 w-4 text-primary" weight="fill" />
    case 'failed':
      return <Warning className="h-4 w-4 text-destructive" weight="fill" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge variant="secondary">Completed</Badge>
    case 'running':
      return <Badge className="bg-primary text-primary-foreground">Running</Badge>
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>
    case 'scheduled':
      return <Badge variant="outline">Scheduled</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function AuditSimulations() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Simulations</h2>
          <p className="text-muted-foreground">Virtual regulatory audits and compliance assessments</p>
        </div>
        <Button className="gap-2">
          <FlaskConical className="h-4 w-4" />
          New Simulation
        </Button>
      </div>

      <div className="grid gap-4">
        {simulations.map((simulation) => (
          <Card key={simulation.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(simulation.status)}
                    {simulation.title}
                  </CardTitle>
                  <CardDescription>{simulation.regulation}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(simulation.status)}
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {simulation.status === 'running' && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">{simulation.progress}%</span>
                    </div>
                    <Progress value={simulation.progress} className="h-2" />
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    {simulation.findings > 0 && (
                      <span className="text-accent">
                        {simulation.findings} finding{simulation.findings !== 1 ? 's' : ''}
                      </span>
                    )}
                    {simulation.lastRun && (
                      <span className="text-muted-foreground">
                        Last run: {simulation.lastRun}
                      </span>
                    )}
                    {simulation.nextRun && (
                      <span className="text-muted-foreground">
                        Next run: {simulation.nextRun}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {simulation.status === 'scheduled' && (
                      <Button variant="ghost" size="sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        Reschedule
                      </Button>
                    )}
                    {simulation.status === 'completed' && (
                      <Button variant="ghost" size="sm">
                        <Play className="h-3 w-3 mr-1" />
                        Run Again
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Simulation Templates</CardTitle>
          <CardDescription>Pre-configured audit scenarios for common regulations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="text-left">
                <div className="font-medium">FDA 510(k) Submission</div>
                <div className="text-xs text-muted-foreground">Pre-market notification audit</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="text-left">
                <div className="font-medium">CAPA Investigation</div>
                <div className="text-xs text-muted-foreground">Corrective & preventive actions</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="text-left">
                <div className="font-medium">Supplier Qualification</div>
                <div className="text-xs text-muted-foreground">Vendor compliance assessment</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}