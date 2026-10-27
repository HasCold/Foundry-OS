import type { Supplier } from '@/types'

export const suppliers: Supplier[] = [
  { id: 'sup-1', name: 'Meridian Metals Co.', rating: 4.6, onTimeDeliveryPct: 96, leadTimeDays: 7, contact: 'purchasing@meridianmetals.com' },
  { id: 'sup-2', name: 'Pacific Circuit Supply', rating: 4.2, onTimeDeliveryPct: 91, leadTimeDays: 12, contact: 'sales@pacificcircuit.com' },
  { id: 'sup-3', name: 'Continental Polymer Works', rating: 3.9, onTimeDeliveryPct: 87, leadTimeDays: 9, contact: 'orders@continentalpolymer.com' },
  { id: 'sup-4', name: 'Summit Fastener & Hardware', rating: 4.8, onTimeDeliveryPct: 98, leadTimeDays: 4, contact: 'team@summitfastener.com' },
  { id: 'sup-5', name: 'Vertex Precision Machining', rating: 4.4, onTimeDeliveryPct: 93, leadTimeDays: 14, contact: 'quotes@vertexprecision.com' },
  { id: 'sup-6', name: 'NovaChem Coatings & Adhesives', rating: 4.0, onTimeDeliveryPct: 89, leadTimeDays: 10, contact: 'orders@novachem.com' },
]

export const supplierById = (id: string) => suppliers.find((s) => s.id === id)
