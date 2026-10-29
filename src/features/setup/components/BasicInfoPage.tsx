import { Info } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSetup } from '../hooks/useSetup'
import { useEditableForm } from '../hooks/useEditableForm'
import { BASE_CURRENCIES, type CompanyProfile, type SetupFieldDef } from '../types'
import { SetupFieldGrid } from './SetupFieldGrid'
import { EditActions } from './EditActions'

const PROFILE_FIELDS: SetupFieldDef<CompanyProfile>[] = [
  { key: 'companyName', label: 'Company Name' },
  { key: 'companyCode', label: 'Company Code' },
  { key: 'industry', label: 'Industry' },
  { key: 'fiscalYear', label: 'Fiscal Year' },
  { key: 'baseCurrency', label: 'Base Currency', options: BASE_CURRENCIES.map((c) => ({ value: c.code, label: c.label })) },
  { key: 'timeZone', label: 'Time Zone' },
]

export function BasicInfoPage() {
  const { companyProfile, updateCompanyProfile, isSavingProfile } = useSetup()
  const form = useEditableForm(companyProfile)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Company Profile"
        description="Manage the basic configuration and general information of your organization."
        actions={
          <EditActions
            isEditing={form.isEditing}
            isDirty={form.isDirty}
            isSaving={isSavingProfile}
            onEdit={form.startEditing}
            onCancel={form.cancelEditing}
            onSave={() => updateCompanyProfile(form.values, form.cancelEditing)}
          />
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription className="mt-1">General company settings and preferences.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <SetupFieldGrid
            fields={PROFILE_FIELDS}
            values={form.values}
            isEditing={form.isEditing}
            onChange={(key, value) => form.setField(key, value as CompanyProfile[typeof key])}
          />
        </CardContent>
      </Card>
    </div>
  )
}
