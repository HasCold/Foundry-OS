import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { BusinessDetails, LocationInput, OrganizationProfile } from '../types'
import { useSetupStore } from '../store/setupStore'
import { setupApi } from '../api/setupApi'
import { toast } from '@/components/ui/toast-store'

export function useSetup() {
  const organizations = useSetupStore((s) => s.organizations)
  const businessDetails = useSetupStore((s) => s.businessDetails)
  const locations = useSetupStore((s) => s.locations)
  const queryClient = useQueryClient()

  const notify = (title: string) => () => {
    queryClient.invalidateQueries({ queryKey: ['setup'] })
    toast({ title, variant: 'success' })
  }

  const addOrganizationMutation = useMutation({ mutationFn: setupApi.addOrganization, onSuccess: notify('Organization created') })
  const updateOrganizationMutation = useMutation({ mutationFn: setupApi.updateOrganization, onSuccess: notify('Organization updated') })
  const removeOrganizationMutation = useMutation({ mutationFn: setupApi.removeOrganization, onSuccess: notify('Organization removed') })
  const businessMutation = useMutation({ mutationFn: setupApi.updateBusinessDetails, onSuccess: notify('Business details updated') })
  const addLocationMutation = useMutation({ mutationFn: setupApi.addLocation, onSuccess: notify('Location added') })
  const updateLocationMutation = useMutation({ mutationFn: setupApi.updateLocation, onSuccess: notify('Location updated') })
  const removeLocationMutation = useMutation({ mutationFn: setupApi.removeLocation, onSuccess: notify('Location removed') })
  const primaryLocationMutation = useMutation({ mutationFn: setupApi.setPrimaryLocation, onSuccess: notify('Primary location changed') })

  return {
    organizations,
    businessDetails,
    locationsOf: (organizationId: string) => locations.filter((l) => l.organizationId === organizationId),

    // Every save takes an `onSaved` callback so forms close only once the change actually went through.
    addOrganization: (profile: OrganizationProfile, onSaved: (organizationId: string) => void) =>
      addOrganizationMutation.mutate(profile, { onSuccess: onSaved }),
    updateOrganization: (organizationId: string, profile: OrganizationProfile, onSaved: () => void) =>
      updateOrganizationMutation.mutate({ organizationId, profile }, { onSuccess: onSaved }),
    removeOrganization: (organizationId: string, onRemoved: () => void) => removeOrganizationMutation.mutate(organizationId, { onSuccess: onRemoved }),
    isSavingOrganization: addOrganizationMutation.isPending || updateOrganizationMutation.isPending,
    isRemovingOrganization: removeOrganizationMutation.isPending,

    updateBusinessDetails: (details: BusinessDetails, onSaved?: () => void) => businessMutation.mutate(details, { onSuccess: onSaved }),
    isSavingBusinessDetails: businessMutation.isPending,

    // `locationId: null` adds a new location to `organizationId`.
    saveLocation: (organizationId: string, locationId: string | null, input: LocationInput, onSaved: () => void) =>
      locationId
        ? updateLocationMutation.mutate({ locationId, input }, { onSuccess: onSaved })
        : addLocationMutation.mutate({ organizationId, input }, { onSuccess: onSaved }),
    removeLocation: (locationId: string, onRemoved: () => void) => removeLocationMutation.mutate(locationId, { onSuccess: onRemoved }),
    setPrimaryLocation: (locationId: string) => primaryLocationMutation.mutate(locationId),
    isSavingLocation: addLocationMutation.isPending || updateLocationMutation.isPending,
    isRemovingLocation: removeLocationMutation.isPending,
  }
}
