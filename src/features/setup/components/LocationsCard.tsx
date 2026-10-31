import { useState } from 'react'
import { MapPin, Pencil, Phone, Plus, Star, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Can } from '@/features/rbac/components/Can'
import type { OrganizationLocation } from '../types'
import { useSetup } from '../hooks/useSetup'
import { LocationDialog } from './LocationDialog'

/** One organization's sites — plants, warehouses and offices — shown under its profile. */
export function LocationsCard({ organizationId }: { organizationId: string }) {
  const { locationsOf, saveLocation, removeLocation, setPrimaryLocation, isSavingLocation, isRemovingLocation } = useSetup()
  const locations = locationsOf(organizationId)
  const [editing, setEditing] = useState<OrganizationLocation | 'new' | null>(null)
  const [removing, setRemoving] = useState<OrganizationLocation | null>(null)

  // Primary first, then alphabetical — the order people scan for.
  const sorted = [...locations].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.name.localeCompare(b.name))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Locations</CardTitle>
            <CardDescription className="mt-1">Plants, warehouses and offices this organization operates from.</CardDescription>
          </div>
        </div>
        <Can resource="setup.companyProfile" action="write">
          <Button size="sm" variant="outline" onClick={() => setEditing('new')}>
            <Plus />
            Add location
          </Button>
        </Can>
      </CardHeader>

      <CardContent>
        {sorted.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No locations yet. Add the first one — it becomes the primary location.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((location) => (
              <div key={location.id} className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{location.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="secondary">{location.type}</Badge>
                      {location.isPrimary && (
                        <Badge variant="success">
                          <Star className="h-3 w-3" />
                          Primary
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Can resource="setup.companyProfile" action="write">
                    <div className="flex shrink-0 gap-0.5">
                      <Button size="icon" variant="ghost" className="h-7 w-7" aria-label={`Edit ${location.name}`} onClick={() => setEditing(location)}>
                        <Pencil />
                      </Button>
                      {!location.isPrimary && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          aria-label={`Remove ${location.name}`}
                          onClick={() => setRemoving(location)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  </Can>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      {[location.addressLine, location.city, location.stateProvince, location.postalCode, location.country].filter(Boolean).join(', ')}
                    </span>
                  </p>
                  {location.contactNumber && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {location.contactNumber}
                    </p>
                  )}
                </div>

                {!location.isPrimary && (
                  <Can resource="setup.companyProfile" action="write">
                    <Button size="xs" variant="ghost" className="mt-auto self-start px-0 text-primary hover:bg-transparent hover:underline" onClick={() => setPrimaryLocation(location.id)}>
                      Make primary
                    </Button>
                  </Can>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <LocationDialog
        location={editing}
        isSaving={isSavingLocation}
        onClose={() => setEditing(null)}
        onSave={(input) => saveLocation(organizationId, editing === 'new' || !editing ? null : editing.id, input, () => setEditing(null))}
      />

      <ConfirmDialog
        open={!!removing}
        title={`Remove "${removing?.name}"?`}
        description="This location will no longer appear anywhere in the organization's setup."
        confirmLabel="Remove location"
        isPending={isRemovingLocation}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && removeLocation(removing.id, () => setRemoving(null))}
      />
    </Card>
  )
}
