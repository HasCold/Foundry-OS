import { Activity } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useSimulatorStore } from '../store/simulatorStore'

/**
 * The operator-facing on/off control for the shop-floor simulator's background
 * loop (mounted separately in AppLayout via useShopFloorSimulator). This
 * component only renders the switch and reads/writes the store — it has no
 * timer or simulation logic of its own.
 */
export function SimulatorToggle() {
  const isActive = useSimulatorStore((s) => s.isActive)
  const toggle = useSimulatorStore((s) => s.toggle)

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2">
      <Activity className={isActive ? 'h-4 w-4 text-success' : 'h-4 w-4 text-muted-foreground'} />
      <div className="leading-tight">
        <p className="text-xs font-semibold">Live Shop-Floor Simulator</p>
        <p className="text-[11px] text-muted-foreground">Randomly cycles machine status &amp; FX rates</p>
      </div>
      <Switch checked={isActive} onCheckedChange={toggle} aria-label="Toggle shop-floor simulator" />
      {isActive && (
        <Badge variant="success" className="text-[10px]">
          Live
        </Badge>
      )}
    </div>
  )
}
