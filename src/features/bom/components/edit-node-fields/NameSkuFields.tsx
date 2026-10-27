import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NameSkuFieldsProps {
  name: string
  sku: string
  onChange: (patch: { name?: string; sku?: string }) => void
}

/** Identifier fields shown for every node type, regardless of raw material / routing step / etc. */
export function NameSkuFields({ name, sku, onChange }: NameSkuFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => onChange({ name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>SKU</Label>
        <Input value={sku} onChange={(e) => onChange({ sku: e.target.value })} />
      </div>
    </div>
  )
}
