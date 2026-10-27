import type { RoutingStepDetail } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { parseNumericInput } from '../../utils/formInput'

interface RoutingStepFieldsProps {
  routing: RoutingStepDetail
  onChange: (patch: Partial<RoutingStepDetail>) => void
}

/**
 * Routing-step-only inputs: time standards plus the four rates that feed the
 * labor/machine/overhead cost roll-up. Editing "actual labor rate" is the
 * lever that simulates a wage change, hence the highlighted label.
 */
export function RoutingStepFields({ routing, onChange }: RoutingStepFieldsProps) {
  return (
    <>
      <Separator />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Setup time (min)</Label>
          <Input type="number" value={routing.setupTimeMinutes} onChange={(e) => onChange({ setupTimeMinutes: parseNumericInput(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Run time / unit (min)</Label>
          <Input
            type="number"
            step="0.1"
            value={routing.runTimeMinutesPerUnit}
            onChange={(e) => onChange({ runTimeMinutesPerUnit: parseNumericInput(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Standard labor rate ($/hr)</Label>
          <Input
            type="number"
            step="0.5"
            value={routing.standardLaborRatePerHour}
            onChange={(e) => onChange({ standardLaborRatePerHour: parseNumericInput(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-primary">Actual labor rate ($/hr)</Label>
          <Input
            type="number"
            step="0.5"
            value={routing.actualLaborRatePerHour}
            onChange={(e) => onChange({ actualLaborRatePerHour: parseNumericInput(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Machine rate ($/hr)</Label>
          <Input
            type="number"
            step="0.5"
            value={routing.machineRatePerHour}
            onChange={(e) => onChange({ machineRatePerHour: parseNumericInput(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Overhead rate ($/hr)</Label>
          <Input
            type="number"
            step="0.5"
            value={routing.overheadRatePerHour}
            onChange={(e) => onChange({ overheadRatePerHour: parseNumericInput(e.target.value) })}
          />
        </div>
      </div>
    </>
  )
}
