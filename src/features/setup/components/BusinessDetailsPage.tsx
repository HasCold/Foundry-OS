import { Building2, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSetup } from '../hooks/useSetup'
import { useEditableForm } from '../hooks/useEditableForm'
import type { BusinessDetails, SetupFieldDef } from '../types'
import { SetupFieldGrid } from './SetupFieldGrid'
import { EditActions } from './EditActions'
import { Can } from '@/features/rbac/components/Can'

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

const ADDRESS_FIELDS: SetupFieldDef<BusinessDetails>[] = [
  { key: 'addressLine', label: 'Address Line' },
  { key: 'city', label: 'City' },
  { key: 'stateProvince', label: 'State / Province' },
  { key: 'country', label: 'Country' },
  { key: 'postalCode', label: 'Postal Code' },
]

export function BusinessDetailsPage() {
  const { businessDetails, updateBusinessDetails, isSavingBusinessDetails } = useSetup()
  const form = useEditableForm(businessDetails)

  const fieldGridProps = {
    values: form.values,
    isEditing: form.isEditing,
    onChange: (key: keyof BusinessDetails, value: string) => form.setField(key, value),
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Business Details"
        description="View your organization's business, registration and contact details."
        actions={
          <Can resource="setup.businessDetails" action="write">
            <EditActions
              isEditing={form.isEditing}
              isDirty={form.isDirty}
              isSaving={isSavingBusinessDetails}
              onEdit={form.startEditing}
              onCancel={form.cancelEditing}
              onSave={() => updateBusinessDetails(form.values, form.cancelEditing)}
            />
          </Can>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Business Information</CardTitle>
              <CardDescription className="mt-1">Company registration and contact information.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <SetupFieldGrid fields={BUSINESS_FIELDS} {...fieldGridProps} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Business Address</CardTitle>
              <CardDescription className="mt-1">Registered business location and mailing address.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <SetupFieldGrid fields={ADDRESS_FIELDS} {...fieldGridProps} />
        </CardContent>
      </Card>
    </div>
  )
}
