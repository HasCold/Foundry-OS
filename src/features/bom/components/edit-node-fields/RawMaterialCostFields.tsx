import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { parseNumericInput } from '../../utils/formInput'

interface RawMaterialCostFieldsProps {
  standardUnitCost: number
  actualUnitCost: number
  onChange: (patch: { standardUnitCost?: number; actualUnitCost?: number }) => void
}

/**
 * Raw-material-only cost inputs. Editing "actual" here is what drives the
 * standard-vs-actual variance shown in the BOM cost roll-up — it's highlighted
 * (text-primary) to call out that it's the lever a user would pull to simulate
 * a price change.
 */
export function RawMaterialCostFields({ standardUnitCost, actualUnitCost, onChange }: RawMaterialCostFieldsProps) {
  return (
    <>
      <Separator />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Standard unit cost ($)</Label>
          <Input
            type="number"
            step="0.01"
            value={standardUnitCost}
            onChange={(e) => onChange({ standardUnitCost: parseNumericInput(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-primary">Actual unit cost ($)</Label>
          <Input type="number" step="0.01" value={actualUnitCost} onChange={(e) => onChange({ actualUnitCost: parseNumericInput(e.target.value) })} />
        </div>
      </div>
    </>
  )
}
