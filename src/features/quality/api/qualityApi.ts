import type { DefectLog, QualityHold } from '@/types'
import { mockNetwork } from '@/lib/mock-async'
import { useQualityStore } from '../store/qualityStore'

export const qualityApi = {
  fetchHolds: () => mockNetwork(() => useQualityStore.getState().holds),

  logDefect: (args: { holdId: string; defect: Omit<DefectLog, 'id' | 'productionOrderId' | 'loggedAt'> }) =>
    mockNetwork(() => {
      useQualityStore.getState().logDefect(args.holdId, args.defect)
      return true
    }),

  resolveHold: (args: { holdId: string; decision: 'approved' | 'rejected'; disposition: QualityHold['disposition']; resolvedBy: string }) =>
    mockNetwork(() => {
      useQualityStore.getState().resolveHold(args.holdId, args.decision, args.disposition, args.resolvedBy)
      return true
    }),
}
