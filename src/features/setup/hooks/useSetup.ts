import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { BusinessDetails, CompanyProfile } from '../types'
import { useSetupStore } from '../store/setupStore'
import { setupApi } from '../api/setupApi'
import { toast } from '@/components/ui/toast-store'

export function useSetup() {
  const companyProfile = useSetupStore((s) => s.companyProfile)
  const businessDetails = useSetupStore((s) => s.businessDetails)
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['setup'] })

  const profileMutation = useMutation({
    mutationFn: setupApi.updateCompanyProfile,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Company profile updated', variant: 'success' })
    },
  })

  const businessMutation = useMutation({
    mutationFn: setupApi.updateBusinessDetails,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Business details updated', variant: 'success' })
    },
  })

  return {
    companyProfile,
    businessDetails,
    updateCompanyProfile: (profile: CompanyProfile, onSaved?: () => void) => profileMutation.mutate(profile, { onSuccess: onSaved }),
    updateBusinessDetails: (details: BusinessDetails, onSaved?: () => void) => businessMutation.mutate(details, { onSuccess: onSaved }),
    isSavingProfile: profileMutation.isPending,
    isSavingBusinessDetails: businessMutation.isPending,
  }
}
