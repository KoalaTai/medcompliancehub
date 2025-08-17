import { Shield, Bell, User } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function ComplianceHeader() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" weight="fill" />
            <div>
              <h1 className="text-xl font-bold">VirtualBackroom</h1>
              <p className="text-xs text-muted-foreground">Compliance Simulation Platform</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-secondary" />
            System Operational
          </Badge>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">3</Badge>
          </Button>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}