import type { ProductionOrder } from '@/types'

export const productionOrders: ProductionOrder[] = [
  {
    id: 'po-1001', orderNumber: 'PO-1001', productId: 'fg-servo-drive', productName: 'Industrial Servo Motor Drive', productSku: 'FG-SMD-1000',
    quantityOrdered: 60, quantityCompleted: 0, quantityScrapped: 0, status: 'planned', priority: 'high',
    productionLine: 'Line A – Assembly', machineId: 'mch-3', scheduledStart: '2026-08-24T08:00:00Z', scheduledEnd: '2026-08-26T16:00:00Z',
    standardCost: 118.9, actualCost: 0,
  },
  {
    id: 'po-1002', orderNumber: 'PO-1002', productId: 'sa-motor-housing', productName: 'Motor Housing Assembly', productSku: 'SA-MHA-300',
    quantityOrdered: 80, quantityCompleted: 0, quantityScrapped: 0, status: 'planned', priority: 'normal',
    productionLine: 'Line B – Machining', machineId: 'mch-1', scheduledStart: '2026-08-23T08:00:00Z', scheduledEnd: '2026-08-25T12:00:00Z',
    standardCost: 38.6, actualCost: 0,
  },
  {
    id: 'po-1003', orderNumber: 'PO-1003', productId: 'fg-gearbox', productName: 'Precision Gearbox Unit', productSku: 'FG-PGU-2200',
    quantityOrdered: 40, quantityCompleted: 0, quantityScrapped: 0, status: 'planned', priority: 'critical',
    productionLine: 'Line C – Fabrication', machineId: 'mch-5', scheduledStart: '2026-08-25T06:00:00Z', scheduledEnd: '2026-08-28T18:00:00Z',
    standardCost: 96.2, actualCost: 0,
  },
  {
    id: 'po-1004', orderNumber: 'PO-1004', productId: 'fg-sensor-enclosure', productName: 'Smart Sensor Enclosure', productSku: 'FG-SSE-500',
    quantityOrdered: 150, quantityCompleted: 0, quantityScrapped: 0, status: 'planned', priority: 'normal',
    productionLine: 'Line D – Packaging', machineId: 'mch-7', scheduledStart: '2026-08-24T08:00:00Z', scheduledEnd: '2026-08-25T20:00:00Z',
    standardCost: 14.3, actualCost: 0,
  },
  {
    id: 'po-2001', orderNumber: 'PO-2001', productId: 'sa-pcb-module', productName: 'PCB Control Module', productSku: 'SA-PCM-200',
    quantityOrdered: 100, quantityCompleted: 58, quantityScrapped: 3, status: 'in_progress', priority: 'high',
    productionLine: 'Line A – Assembly', machineId: 'mch-3', scheduledStart: '2026-08-21T08:00:00Z', scheduledEnd: '2026-08-23T16:00:00Z',
    actualStart: '2026-08-21T08:10:00Z', standardCost: 42.1, actualCost: 43.9,
  },
  {
    id: 'po-2002', orderNumber: 'PO-2002', productId: 'sa-gear-cluster', productName: 'Gear Cluster Assembly', productSku: 'SA-GCA-400',
    quantityOrdered: 50, quantityCompleted: 22, quantityScrapped: 1, status: 'in_progress', priority: 'critical',
    productionLine: 'Line B – Machining', machineId: 'mch-1', scheduledStart: '2026-08-20T06:00:00Z', scheduledEnd: '2026-08-24T18:00:00Z',
    actualStart: '2026-08-20T06:20:00Z', standardCost: 33.4, actualCost: 35.1,
  },
  {
    id: 'po-2003', orderNumber: 'PO-2003', productId: 'fg-servo-drive', productName: 'Industrial Servo Motor Drive', productSku: 'FG-SMD-1000',
    quantityOrdered: 45, quantityCompleted: 30, quantityScrapped: 2, status: 'in_progress', priority: 'high',
    productionLine: 'Line A – Assembly', machineId: 'mch-4', scheduledStart: '2026-08-19T08:00:00Z', scheduledEnd: '2026-08-22T20:00:00Z',
    actualStart: '2026-08-19T08:00:00Z', standardCost: 118.9, actualCost: 124.6,
  },
  {
    id: 'po-2004', orderNumber: 'PO-2004', productId: 'sa-sensor-board', productName: 'Sensor PCB Sub-Assembly', productSku: 'SA-SPB-100',
    quantityOrdered: 200, quantityCompleted: 140, quantityScrapped: 4, status: 'in_progress', priority: 'normal',
    productionLine: 'Line A – Assembly', machineId: 'mch-4', scheduledStart: '2026-08-21T08:00:00Z', scheduledEnd: '2026-08-22T18:00:00Z',
    actualStart: '2026-08-21T08:05:00Z', standardCost: 6.9, actualCost: 7.2,
  },
  {
    id: 'po-3001', orderNumber: 'PO-3001', productId: 'fg-gearbox', productName: 'Precision Gearbox Unit', productSku: 'FG-PGU-2200',
    quantityOrdered: 30, quantityCompleted: 18, quantityScrapped: 6, status: 'quality_hold', priority: 'high',
    productionLine: 'Line C – Fabrication', machineId: 'mch-5', scheduledStart: '2026-08-17T06:00:00Z', scheduledEnd: '2026-08-19T18:00:00Z',
    actualStart: '2026-08-17T06:30:00Z', standardCost: 96.2, actualCost: 108.4,
    qualityHoldReason: 'Gear cluster backlash exceeds tolerance on sample audit',
  },
  {
    id: 'po-3002', orderNumber: 'PO-3002', productId: 'sa-pcb-module', productName: 'PCB Control Module', productSku: 'SA-PCM-200',
    quantityOrdered: 80, quantityCompleted: 80, quantityScrapped: 5, status: 'quality_hold', priority: 'normal',
    productionLine: 'Line A – Assembly', machineId: 'mch-3', scheduledStart: '2026-08-15T08:00:00Z', scheduledEnd: '2026-08-16T16:00:00Z',
    actualStart: '2026-08-15T08:00:00Z', actualEnd: '2026-08-16T15:40:00Z', standardCost: 42.1, actualCost: 44.8,
    qualityHoldReason: 'Solder bridging detected on IGBT footprint during AOI',
  },
  {
    id: 'co-4001', orderNumber: 'PO-4001', productId: 'fg-sensor-enclosure', productName: 'Smart Sensor Enclosure', productSku: 'FG-SSE-500',
    quantityOrdered: 200, quantityCompleted: 197, quantityScrapped: 3, status: 'completed', priority: 'normal',
    productionLine: 'Line D – Packaging', machineId: 'mch-7', scheduledStart: '2026-08-12T08:00:00Z', scheduledEnd: '2026-08-13T18:00:00Z',
    actualStart: '2026-08-12T08:00:00Z', actualEnd: '2026-08-13T17:20:00Z', standardCost: 14.3, actualCost: 14.6,
  },
  {
    id: 'co-4002', orderNumber: 'PO-4002', productId: 'fg-servo-drive', productName: 'Industrial Servo Motor Drive', productSku: 'FG-SMD-1000',
    quantityOrdered: 50, quantityCompleted: 48, quantityScrapped: 2, status: 'completed', priority: 'high',
    productionLine: 'Line A – Assembly', machineId: 'mch-3', scheduledStart: '2026-08-10T08:00:00Z', scheduledEnd: '2026-08-12T16:00:00Z',
    actualStart: '2026-08-10T08:00:00Z', actualEnd: '2026-08-12T14:55:00Z', standardCost: 118.9, actualCost: 121.2,
  },
  {
    id: 'co-4003', orderNumber: 'PO-4003', productId: 'fg-gearbox', productName: 'Precision Gearbox Unit', productSku: 'FG-PGU-2200',
    quantityOrdered: 35, quantityCompleted: 35, quantityScrapped: 0, status: 'completed', priority: 'normal',
    productionLine: 'Line C – Fabrication', machineId: 'mch-5', scheduledStart: '2026-08-07T06:00:00Z', scheduledEnd: '2026-08-09T18:00:00Z',
    actualStart: '2026-08-07T06:15:00Z', actualEnd: '2026-08-09T17:00:00Z', standardCost: 96.2, actualCost: 95.4,
  },
  {
    id: 'co-4004', orderNumber: 'PO-4004', productId: 'sa-motor-housing', productName: 'Motor Housing Assembly', productSku: 'SA-MHA-300',
    quantityOrdered: 90, quantityCompleted: 88, quantityScrapped: 2, status: 'completed', priority: 'normal',
    productionLine: 'Line B – Machining', machineId: 'mch-2', scheduledStart: '2026-08-05T08:00:00Z', scheduledEnd: '2026-08-07T16:00:00Z',
    actualStart: '2026-08-05T08:00:00Z', actualEnd: '2026-08-07T15:10:00Z', standardCost: 38.6, actualCost: 39.0,
  },
  {
    id: 'co-4005', orderNumber: 'PO-4005', productId: 'fg-sensor-enclosure', productName: 'Smart Sensor Enclosure', productSku: 'FG-SSE-500',
    quantityOrdered: 180, quantityCompleted: 175, quantityScrapped: 5, status: 'completed', priority: 'low',
    productionLine: 'Line D – Packaging', machineId: 'mch-8', scheduledStart: '2026-08-02T08:00:00Z', scheduledEnd: '2026-08-03T16:00:00Z',
    actualStart: '2026-08-02T08:00:00Z', actualEnd: '2026-08-03T15:40:00Z', standardCost: 14.3, actualCost: 14.1,
  },
  {
    id: 'co-4006', orderNumber: 'PO-4006', productId: 'sa-gear-cluster', productName: 'Gear Cluster Assembly', productSku: 'SA-GCA-400',
    quantityOrdered: 40, quantityCompleted: 33, quantityScrapped: 7, status: 'cancelled', priority: 'low',
    productionLine: 'Line B – Machining', machineId: 'mch-1', scheduledStart: '2026-07-29T08:00:00Z', scheduledEnd: '2026-07-31T16:00:00Z',
    actualStart: '2026-07-29T08:00:00Z', standardCost: 33.4, actualCost: 40.2,
  },
]
