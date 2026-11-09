import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSetup } from '../hooks/useSetup'
import { BusinessDetailsCard } from './BusinessDetailsCard'

/**
 * Business Details: one tab per organization, because each business the
 * company runs is its own legal entity with its own registration, tax
 * numbers and contacts. A tab appears as soon as an organization is created
 * in Company Profile, and disappears when it's removed.
 */
export function BusinessDetailsPage() {
  const { organizations } = useSetup()
  const [selected, setSelected] = useState<string | undefined>(organizations[0]?.id)

  // Fall back to the first organization if the selected one was removed meanwhile.
  const activeTab = organizations.some((o) => o.id === selected) ? selected : organizations[0]?.id

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Business Details"
        description="Legal registration, tax numbers and contact details for each organization. Add organizations from Company Profile."
      />

      <Tabs value={activeTab} onValueChange={setSelected}>
        <TabsList className="h-auto flex-wrap justify-start">
          {organizations.map((o) => (
            <TabsTrigger key={o.id} value={o.id}>
              {o.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {organizations.map((o) => (
          <TabsContent key={o.id} value={o.id}>
            <BusinessDetailsCard organization={o} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
