import { useState } from 'react'
import { Building, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { INDUSTRY_TYPES } from '@/features/auth/types'
import { Can } from '@/features/rbac/components/Can'
import { useSetup } from '../hooks/useSetup'
import { useEditableForm } from '../hooks/useEditableForm'
import { BASE_CURRENCIES, type Organization, type OrganizationProfile, type SetupFieldDef } from '../types'
import { SetupFieldGrid } from './SetupFieldGrid'
import { EditActions } from './EditActions'

const PROFILE_FIELDS: SetupFieldDef<OrganizationProfile>[] = [
  { key: 'name', label: 'Organization Name' },
  { key: 'code', label: 'Organization Code' },
  { kind: 'select', key: 'industry', label: 'Industry', options: INDUSTRY_TYPES.map((type) => ({ value: type, label: type })) },
  { kind: 'dateRange', key: 'fiscalYearStart', endKey: 'fiscalYearEnd', label: 'Fiscal Year' },
  { kind: 'select', key: 'baseCurrency', label: 'Base Currency', options: BASE_CURRENCIES.map((c) => ({ value: c.code, label: c.label })) },
  { key: 'timeZone', label: 'Time Zone' },
]

const year = new Date().getFullYear()

/** Starting values for a brand-new organization — sensible defaults, blank identity. */
const NEW_ORGANIZATION: OrganizationProfile = {
  name: '',
  code: '',
  industry: INDUSTRY_TYPES[0],
  fiscalYearStart: `${year}-01-01`,
  fiscalYearEnd: `${year}-12-31`,
  baseCurrency: 'USD',
  timeZone: 'Asia/Karachi (PKT)',
}

interface OrganizationCardProps {
  /** `null` renders the create form for a new organization. */
  organization: Organization | null
  canRemove: boolean
  onCreated: (organizationId: string) => void
  onCancelCreate: () => void
  onRemoved: () => void
}

/** One organization's profile, with its own Edit / Save and (for existing ones) Remove. */
export function OrganizationCard({ organization, canRemove, onCreated, onCancelCreate, onRemoved }: OrganizationCardProps) {
  const { addOrganization, updateOrganization, removeOrganization, isSavingOrganization, isRemovingOrganization } = useSetup()
  const isNew = organization === null
  const saved: OrganizationProfile = organization ?? NEW_ORGANIZATION
  const form = useEditableForm(saved, { startInEditMode: isNew })
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  // ISO yyyy-MM-dd strings compare correctly as plain strings.
  const { name, code, fiscalYearStart, fiscalYearEnd } = form.values
  const isValid = Boolean(name.trim() && code.trim() && fiscalYearStart && fiscalYearEnd) && fiscalYearStart < fiscalYearEnd

  const save = () =>
    isNew ? addOrganization(form.values, onCreated) : updateOrganization(organization.id, form.values, form.cancelEditing)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{isNew ? 'New Organization' : 'Organization Information'}</CardTitle>
            <CardDescription className="mt-1">
              {isNew ? 'Set up another business under this company. You can add its locations once it is saved.' : 'General settings and preferences for this organization.'}
            </CardDescription>
          </div>
        </div>
        <Can resource="setup.companyProfile" action="write">
          <div className="flex shrink-0 items-center gap-2">
            {!isNew && !form.isEditing && canRemove && (
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingRemove(true)}>
                <Trash2 />
                Remove
              </Button>
            )}
            <EditActions
              isEditing={form.isEditing}
              // A new organization only needs to be valid; an existing one also needs a change to save.
              isDirty={isValid && (isNew || form.isDirty)}
              isSaving={isSavingOrganization}
              onEdit={form.startEditing}
              onCancel={isNew ? onCancelCreate : form.cancelEditing}
              onSave={save}
            />
          </div>
        </Can>
      </CardHeader>

      <CardContent>
        <SetupFieldGrid
          fields={PROFILE_FIELDS}
          values={form.values}
          isEditing={form.isEditing}
          onChange={(key, value) => form.setField(key, value as OrganizationProfile[typeof key])}
        />
      </CardContent>

      {organization && (
        <ConfirmDialog
          open={confirmingRemove}
          title={`Remove "${organization.name}"?`}
          description="The organization and all of its locations will be removed. Organizations that still have users based at them can't be removed."
          confirmLabel="Remove organization"
          isPending={isRemovingOrganization}
          onClose={() => setConfirmingRemove(false)}
          onConfirm={() => removeOrganization(organization.id, onRemoved)}
        />
      )}
    </Card>
  )
}
