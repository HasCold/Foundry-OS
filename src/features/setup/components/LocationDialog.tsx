import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LOCATION_TYPES, type LocationInput, type LocationType, type OrganizationLocation } from '../types'

interface LocationDialogProps {
  /** `null` while closed; `'new'` to add a location; an existing location to edit it. */
  location: OrganizationLocation | 'new' | null
  isSaving: boolean
  onClose: () => void
  onSave: (input: LocationInput) => void
}

const EMPTY_LOCATION: LocationInput = {
  name: '',
  type: 'Manufacturing Plant',
  addressLine: '',
  city: '',
  stateProvince: '',
  country: 'Pakistan',
  postalCode: '',
  contactNumber: '',
}

/** Text inputs below the name/type row, in display order. */
const ADDRESS_FIELDS: { key: Exclude<keyof LocationInput, 'name' | 'type'>; label: string; placeholder: string; wide?: boolean }[] = [
  { key: 'addressLine', label: 'Address line', placeholder: 'Plot 45, Sundar Industrial Estate', wide: true },
  { key: 'city', label: 'City', placeholder: 'Lahore' },
  { key: 'stateProvince', label: 'State / Province', placeholder: 'Punjab' },
  { key: 'country', label: 'Country', placeholder: 'Pakistan' },
  { key: 'postalCode', label: 'Postal code', placeholder: '55050' },
  { key: 'contactNumber', label: 'Contact number', placeholder: '+92 300 0000000', wide: true },
]

export function LocationDialog({ location, ...props }: LocationDialogProps) {
  if (!location) return null
  // Keyed so the form resets whenever a different location (or "new") is opened.
  return <LocationForm key={location === 'new' ? 'new' : location.id} location={location} {...props} />
}

function LocationForm({ location, isSaving, onClose, onSave }: Omit<LocationDialogProps, 'location'> & { location: OrganizationLocation | 'new' }) {
  const existing = location === 'new' ? null : location
  const [form, setForm] = useState<LocationInput>(() => {
    if (!existing) return EMPTY_LOCATION
    const { id: _id, isPrimary: _isPrimary, ...input } = existing
    return input
  })

  const canSave = form.name.trim() && form.city.trim() && form.country.trim()

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{existing ? `Edit location — ${existing.name}` : 'Add location'}</DialogTitle>
          <DialogDescription>A plant, warehouse or office your organization operates from.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="location-name">Location name</Label>
            <Input id="location-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sundar Plant 1" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location-type">Type</Label>
            <Select value={form.type} onValueChange={(type) => setForm({ ...form, type: type as LocationType })}>
              <SelectTrigger id="location-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {ADDRESS_FIELDS.map((field) => (
            <div key={field.key} className={field.wide ? 'space-y-1.5 sm:col-span-2' : 'space-y-1.5'}>
              <Label htmlFor={`location-${field.key}`}>{field.label}</Label>
              <Input
                id={`location-${field.key}`}
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)} disabled={isSaving || !canSave}>
            {isSaving && <Loader2 className="animate-spin" />}
            {existing ? 'Save changes' : 'Add location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
