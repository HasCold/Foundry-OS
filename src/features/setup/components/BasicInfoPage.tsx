import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Can } from '@/features/rbac/components/Can'
import { useSetup } from '../hooks/useSetup'
import { OrganizationCard } from './OrganizationCard'
import { LocationsCard } from './LocationsCard'

/** Tab value for the not-yet-saved organization being created. */
const NEW_TAB = 'new'

/**
 * Company Profile: one tab per organization (business) the company runs,
 * each with its own profile and locations, plus "Add organization" to set
 * up another one under the same account.
 */
export function BasicInfoPage() {
  const { organizations } = useSetup()
  const [selected, setSelected] = useState<string>(organizations[0]?.id ?? NEW_TAB)
  const [isCreating, setIsCreating] = useState(false)

  // Fall back to the first organization if the selected one was just removed.
  const isSelectionValid = (selected === NEW_TAB && isCreating) || organizations.some((o) => o.id === selected)
  const activeTab = isSelectionValid ? selected : organizations[0]?.id

  const startCreating = () => {
    setIsCreating(true)
    setSelected(NEW_TAB)
  }
  const stopCreating = (nextTab: string | undefined) => {
    setIsCreating(false)
    setSelected(nextTab ?? organizations[0]?.id ?? NEW_TAB)
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Company Profile"
        description="Every business your company runs from this account, each with its own settings and locations."
        actions={
          <Can resource="setup.companyProfile" action="write">
            <Button size="sm" onClick={startCreating} disabled={isCreating}>
              <Plus />
              Add organization
            </Button>
          </Can>
        }
      />

      <Tabs value={activeTab} onValueChange={setSelected}>
        <TabsList className="h-auto flex-wrap justify-start">
          {organizations.map((o) => (
            <TabsTrigger key={o.id} value={o.id}>
              {o.name}
            </TabsTrigger>
          ))}
          {isCreating && <TabsTrigger value={NEW_TAB}>New organization</TabsTrigger>}
        </TabsList>

        {organizations.map((o) => (
          <TabsContent key={o.id} value={o.id} className="flex flex-col gap-5">
            <OrganizationCard
              organization={o}
              canRemove={organizations.length > 1}
              onCreated={() => {}}
              onCancelCreate={() => {}}
              onRemoved={() => setSelected(organizations.find((other) => other.id !== o.id)?.id ?? NEW_TAB)}
            />
            <LocationsCard organizationId={o.id} />
          </TabsContent>
        ))}

        {isCreating && (
          <TabsContent value={NEW_TAB}>
            <OrganizationCard
              organization={null}
              canRemove={false}
              onCreated={(organizationId) => stopCreating(organizationId)}
              onCancelCreate={() => stopCreating(undefined)}
              onRemoved={() => {}}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
