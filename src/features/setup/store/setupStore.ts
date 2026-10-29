import { create } from 'zustand'
import type { BusinessDetails, CompanyProfile } from '../types'
import { businessDetails as initialBusinessDetails, companyProfile as initialCompanyProfile } from '@/mock/setup'

interface SetupState {
  companyProfile: CompanyProfile
  businessDetails: BusinessDetails

  updateCompanyProfile: (profile: CompanyProfile) => void
  updateBusinessDetails: (details: BusinessDetails) => void
}

export const useSetupStore = create<SetupState>((set) => ({
  companyProfile: initialCompanyProfile,
  businessDetails: initialBusinessDetails,

  updateCompanyProfile: (companyProfile) => set({ companyProfile }),
  updateBusinessDetails: (businessDetails) => set({ businessDetails }),
}))
