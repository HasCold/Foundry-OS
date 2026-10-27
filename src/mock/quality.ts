import type { QualityHold } from '@/types'

export const qualityHolds: QualityHold[] = [
  {
    id: 'qh-1', productionOrderId: 'po-3001', orderNumber: 'PO-3001', productName: 'Precision Gearbox Unit',
    lotId: 'lot-inline-3001', quantityOnHold: 18, reason: 'Gear cluster backlash exceeds tolerance on sample audit',
    raisedAt: '2026-08-19T14:20:00Z', status: 'open',
    defects: [
      { id: 'df-1', productionOrderId: 'po-3001', defectType: 'Dimensional Non-Conformance', quantityAffected: 6, severity: 'major', loggedAt: '2026-08-19T14:25:00Z', loggedBy: 'QA – R. Malik', notes: 'Backlash measured at 0.28mm vs. 0.15mm spec on 6 of 18 sampled units.' },
    ],
  },
  {
    id: 'qh-2', productionOrderId: 'po-3002', orderNumber: 'PO-3002', productName: 'PCB Control Module',
    lotId: 'lot-inline-3002', quantityOnHold: 80, reason: 'Solder bridging detected on IGBT footprint during AOI',
    raisedAt: '2026-08-16T16:05:00Z', status: 'open',
    defects: [
      { id: 'df-2', productionOrderId: 'po-3002', defectType: 'Assembly Misalignment', quantityAffected: 5, severity: 'critical', loggedAt: '2026-08-16T16:10:00Z', loggedBy: 'QA – S. Farooq', notes: 'AOI flagged solder bridges across pins 4-6 on IGBT U3.' },
      { id: 'df-3', productionOrderId: 'po-3002', defectType: 'Electrical Failure', quantityAffected: 2, severity: 'major', loggedAt: '2026-08-16T16:30:00Z', loggedBy: 'QA – S. Farooq', notes: 'Failed in-circuit continuity test post-reflow.' },
    ],
  },
  {
    id: 'qh-3', productionOrderId: 'co-4006', orderNumber: 'PO-4006', productName: 'Gear Cluster Assembly',
    quantityOnHold: 7, reason: 'Surface porosity on hobbed gear teeth', raisedAt: '2026-07-31T11:00:00Z',
    status: 'rejected', resolvedAt: '2026-07-31T17:00:00Z', resolvedBy: 'QA Lead – A. Chaudhry', disposition: 'scrap',
    defects: [
      { id: 'df-4', productionOrderId: 'co-4006', defectType: 'Surface Finish Defect', quantityAffected: 7, severity: 'major', loggedAt: '2026-07-31T11:05:00Z', loggedBy: 'QA – R. Malik', notes: 'Porosity visible on 7 units after hobbing; root cause traced to casting batch.' },
    ],
  },
  {
    id: 'qh-4', productionOrderId: 'co-4002', orderNumber: 'PO-4002', productName: 'Industrial Servo Motor Drive',
    quantityOnHold: 2, reason: 'Cosmetic scuff on end cap finish', raisedAt: '2026-08-12T10:00:00Z',
    status: 'approved', resolvedAt: '2026-08-12T13:00:00Z', resolvedBy: 'QA Lead – A. Chaudhry', disposition: 'use_as_is',
    defects: [
      { id: 'df-5', productionOrderId: 'co-4002', defectType: 'Cosmetic Blemish', quantityAffected: 2, severity: 'minor', loggedAt: '2026-08-12T10:05:00Z', loggedBy: 'QA – S. Farooq', notes: 'Minor scuff, within cosmetic acceptance criteria per waiver W-114.' },
    ],
  },
  {
    id: 'qh-5', productionOrderId: 'co-4004', orderNumber: 'PO-4004', productName: 'Motor Housing Assembly',
    quantityOnHold: 2, reason: 'Missing fastener detected at final inspection', raisedAt: '2026-08-07T09:30:00Z',
    status: 'approved', resolvedAt: '2026-08-07T12:00:00Z', resolvedBy: 'QA Lead – A. Chaudhry', disposition: 'rework',
    defects: [
      { id: 'df-6', productionOrderId: 'co-4004', defectType: 'Missing Component', quantityAffected: 2, severity: 'minor', loggedAt: '2026-08-07T09:35:00Z', loggedBy: 'QA – R. Malik', notes: 'Two units missing one M4 screw; reworked on bench 3.' },
    ],
  },
]
