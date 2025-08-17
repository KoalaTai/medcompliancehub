import { 
  ChartLine, 
  FileText, 
  Users, 
  Gear,
  FlaskConical,
  Shield,
  TrendUp,
  Database,
  Calendar
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: ChartLine, active: true },
  { id: 'simulations', label: 'Audit Simulations', icon: FlaskConical },
  { id: 'evidence', label: 'Evidence Manager', icon: FileText },
  { id: 'workflows', label: 'Compliance Workflows', icon: TrendUp },
  { id: 'intelligence', label: 'Regulatory Intelligence', icon: Database },
  { id: 'scheduler', label: 'Digest Scheduler', icon: Calendar },
  { id: 'team', label: 'Team Management', icon: Users },
  { id: 'settings', label: 'Settings', icon: Gear },
]

interface ComplianceSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function ComplianceSidebar({ activeSection, onSectionChange }: ComplianceSidebarProps) {
  return (
    <aside className="w-64 border-r bg-card/30 backdrop-blur-sm">
      <div className="p-4">
        <div className="mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" weight="fill" />
          <span className="font-semibold">Compliance Hub</span>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive && "bg-primary/10 text-primary border-primary/20"
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}