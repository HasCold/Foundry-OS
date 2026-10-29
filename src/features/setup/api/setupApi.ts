import { mockNetwork } from '@/lib/mock-async'
import type { BusinessDetails, CompanyProfile } from '../types'
import { useSetupStore } from '../store/setupStore'

export const setupApi = {
  updateCompanyProfile: (profile: CompanyProfile) =>
    mockNetwork(() => {
      useSetupStore.getState().updateCompanyProfile(profile)
      return true
    }),

  updateBusinessDetails: (details: BusinessDetails) =>
    mockNetwork(() => {
      useSetupStore.getState().updateBusinessDetails(details)
      return true
    }),
}
