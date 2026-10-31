import { mockNetwork } from '@/lib/mock-async'
import type { BusinessDetails, LocationInput, OrganizationProfile } from '../types'
import { useSetupStore } from '../store/setupStore'
import { authorize } from '@/features/rbac/api/authorize'
import { countUsersPlacedAt } from '@/features/rbac/store/rbacStore'

/**
 * Like a foreign-key check on the server: an organization or location that
 * users are still based at can't be deleted out from under them.
 */
function assertNoUsersPlacedAt(target: { organizationId: string } | { locationId: string }, label: string) {
  const count = countUsersPlacedAt(target)
  if (count > 0) throw new Error(`${count} user(s) are still based at ${label}. Move them in User Administration first.`)
}

// Organizations and their locations make up the company profile, so they share its permission.
export const setupApi = {
  addOrganization: (profile: OrganizationProfile) =>
    mockNetwork(() => {
      authorize('setup.companyProfile', 'write')
      return useSetupStore.getState().addOrganization(profile)
    }),

  updateOrganization: (args: { organizationId: string; profile: OrganizationProfile }) =>
    mockNetwork(() => {
      authorize('setup.companyProfile', 'write')
      useSetupStore.getState().updateOrganization(args.organizationId, args.profile)
    }),

  removeOrganization: (organizationId: string) =>
    mockNetwork(() => {
      authorize('setup.companyProfile', 'write')
      assertNoUsersPlacedAt({ organizationId }, 'this organization')
      useSetupStore.getState().removeOrganization(organizationId)
    }),

  updateBusinessDetails: (details: BusinessDetails) =>
    mockNetwork(() => {
      authorize('setup.businessDetails', 'write')
      useSetupStore.getState().updateBusinessDetails(details)
      return true
    }),

  addLocation: (args: { organizationId: string; input: LocationInput }) =>
    mockNetwork(() => {
      authorize('setup.companyProfile', 'write')
      useSetupStore.getState().addLocation(args.organizationId, args.input)
    }),

  updateLocation: (args: { locationId: string; input: LocationInput }) =>
    mockNetwork(() => {
      authorize('setup.companyProfile', 'write')
      useSetupStore.getState().updateLocation(args.locationId, args.input)
    }),

  removeLocation: (locationId: string) =>
    mockNetwork(() => {
      authorize('setup.companyProfile', 'write')
      assertNoUsersPlacedAt({ locationId }, 'this location')
      useSetupStore.getState().removeLocation(locationId)
    }),

  setPrimaryLocation: (locationId: string) =>
    mockNetwork(() => {
      authorize('setup.companyProfile', 'write')
      useSetupStore.getState().setPrimaryLocation(locationId)
    }),
}
