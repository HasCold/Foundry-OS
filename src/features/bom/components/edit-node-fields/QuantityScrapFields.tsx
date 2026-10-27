import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseNumericInput } from '../../utils/formInput'

interface QuantityScrapFieldsProps {
  quantityPer: number
  scrapFactorPct: number
  onChange: (patch: { quantityPer?: number; scrapFactorPct?: number }) => void
}

/** Shown for every node except finished goods — finished goods sit at the top of the tree and have no "per parent" quantity. */
export function QuantityScrapFields({ quantityPer, scrapFactorPct, onChange }: QuantityScrapFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label>Quantity per parent</Label>
        <Input type="number" step="0.01" value={quantityPer} onChange={(e) => onChange({ quantityPer: parseNumericInput(e.target.value) })} />
      </div>
      <div className="space-y-1.5">
        <Label>Scrap factor (%)</Label>
        <Input type="number" step="0.1" value={scrapFactorPct} onChange={(e) => onChange({ scrapFactorPct: parseNumericInput(e.target.value) })} />
      </div>
    </div>
  )
}
