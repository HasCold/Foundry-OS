import { mockNetwork } from '@/lib/mock-async'
import type { BusinessDetails, CompanyProfile } from '../types'
import { useSetupStore } from '../store/setupStore'
import { authorize } from '@/features/rbac/api/authorize'

export const setupApi = {
  updateCompanyProfile: (profile: CompanyProfile) =>
    mockNetwork(() => {
      authorize('setup.companyProfile', 'write')
      useSetupStore.getState().updateCompanyProfile(profile)
      return true
    }),

  updateBusinessDetails: (details: BusinessDetails) =>
    mockNetwork(() => {
      authorize('setup.businessDetails', 'write')
      useSetupStore.getState().updateBusinessDetails(details)
      return true
    }),
}
