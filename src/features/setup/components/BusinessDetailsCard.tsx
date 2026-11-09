import { Building2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Can } from '@/features/rbac/components/Can'
import { useSetup } from '../hooks/useSetup'
import { useEditableForm } from '../hooks/useEditableForm'
import type { BusinessDetails, Organization, SetupFieldDef } from '../types'
import { SetupFieldGrid } from './SetupFieldGrid'
import { EditActions } from './EditActions'

const BUSINESS_FIELDS: SetupFieldDef<BusinessDetails>[] = [
  { key: 'legalBusinessName', label: 'Legal Business Name' },
  { key: 'businessType', label: 'Business Type' },
  { key: 'registrationNumber', label: 'Registration Number' },
  { key: 'taxIdentificationNumber', label: 'NTN (Tax ID)' },
  { key: 'salesTaxRegistrationNumber', label: 'STRN (Sales Tax Registration No.)' },
  { key: 'businessEmail', label: 'Business Email' },
  { key: 'contactNumber', label: 'Contact Number' },
  { key: 'website', label: 'Website' },
]

/** One organization's business details, with its own Edit / Save. */
export function BusinessDetailsCard({ organization }: { organization: Organization }) {
  const { businessDetailsOf, updateBusinessDetails, isSavingBusinessDetails } = useSetup()
  const form = useEditableForm(businessDetailsOf(organization.id))
  // A newly created organization starts with every field blank.
  const isEmpty = Object.values(form.values).every((value) => !value.trim())

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Business Information</CardTitle>
            <CardDescription className="mt-1">
              {isEmpty && !form.isEditing
                ? `No details yet for ${organization.name} — click Edit to add them.`
                : `Registration and contact information for ${organization.name}.`}
            </CardDescription>
          </div>
        </div>
        <Can resource="setup.businessDetails" action="write">
          <div className="flex shrink-0 items-center gap-2">
            <EditActions
              isEditing={form.isEditing}
              isDirty={form.isDirty}
              isSaving={isSavingBusinessDetails}
              onEdit={form.startEditing}
              onCancel={form.cancelEditing}
              onSave={() => updateBusinessDetails(organization.id, form.values, form.cancelEditing)}
            />
          </div>
        </Can>
      </CardHeader>

      <CardContent>
        <SetupFieldGrid
          fields={BUSINESS_FIELDS}
          values={form.values}
          isEditing={form.isEditing}
          onChange={(key, value) => form.setField(key, value)}
        />
      </CardContent>
    </Card>
  )
}
