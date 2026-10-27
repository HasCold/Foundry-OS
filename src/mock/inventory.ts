import type { InventoryItem, Lot } from '@/types'

let lotCounter = 1
function lot(partial: Omit<Lot, 'id' | 'lotNumber'> & { lotNumber?: string }): Lot {
  lotCounter += 1
  return {
    id: `lot-${lotCounter}`,
    lotNumber: partial.lotNumber ?? `LOT-${2600 + lotCounter}`,
    ...partial,
  }
}

export const inventoryItems: InventoryItem[] = [
  // --- Raw materials: Servo Drive tree -------------------------------------
  {
    id: 'inv-rm-pcb-06', sku: 'RM-PCB-06', name: 'FR4 PCB Blank, 6-Layer', category: 'Electronics', uom: 'ea', type: 'raw_material',
    onHand: 420, reserved: 180, onOrder: 200, safetyStock: 300, reorderPoint: 400, reorderQuantity: 500,
    unitCost: 8.4, leadTimeDays: 12, preferredSupplierId: 'sup-2', warehouseLocation: 'WH1-A03',
    isSerialized: false,
    lots: [
      lot({ quantity: 220, receivedDate: '2026-08-02', supplier: 'Pacific Circuit Supply', qualityStatus: 'released', warehouseLocation: 'WH1-A03' }),
      lot({ quantity: 200, receivedDate: '2026-08-14', supplier: 'Pacific Circuit Supply', qualityStatus: 'released', warehouseLocation: 'WH1-A03' }),
    ],
  },
  {
    id: 'inv-rm-mcu', sku: 'RM-MCU-32F', name: 'Motor Control MCU, 32-bit', category: 'Electronics', uom: 'ea', type: 'raw_material',
    onHand: 96, reserved: 140, onOrder: 0, safetyStock: 150, reorderPoint: 200, reorderQuantity: 400,
    unitCost: 4.9, leadTimeDays: 21, preferredSupplierId: 'sup-2', warehouseLocation: 'WH1-A05',
    isSerialized: true,
    lots: [lot({ quantity: 96, receivedDate: '2026-07-28', supplier: 'Pacific Circuit Supply', qualityStatus: 'released', warehouseLocation: 'WH1-A05', serialNumbers: Array.from({ length: 8 }, (_, i) => `SN-MCU-${1000 + i}`) })],
  },
  {
    id: 'inv-rm-igbt', sku: 'RM-IGBT-600', name: 'IGBT Power Module 600V', category: 'Electronics', uom: 'ea', type: 'raw_material',
    onHand: 210, reserved: 300, onOrder: 300, safetyStock: 250, reorderPoint: 350, reorderQuantity: 600,
    unitCost: 6.2, leadTimeDays: 18, preferredSupplierId: 'sup-2', warehouseLocation: 'WH1-A06',
    isSerialized: false,
    lots: [lot({ quantity: 210, receivedDate: '2026-08-10', supplier: 'Pacific Circuit Supply', qualityStatus: 'released', warehouseLocation: 'WH1-A06' })],
  },
  {
    id: 'inv-rm-cap450', sku: 'RM-CAP-450', name: 'Electrolytic Capacitor 450V 220uF', category: 'Electronics', uom: 'ea', type: 'raw_material',
    onHand: 980, reserved: 420, onOrder: 0, safetyStock: 500, reorderPoint: 700, reorderQuantity: 1200,
    unitCost: 1.1, leadTimeDays: 10, preferredSupplierId: 'sup-2', warehouseLocation: 'WH1-A07',
    isSerialized: false,
    lots: [lot({ quantity: 980, receivedDate: '2026-08-05', supplier: 'Pacific Circuit Supply', qualityStatus: 'released', warehouseLocation: 'WH1-A07' })],
  },
  {
    id: 'inv-rm-conn12', sku: 'RM-CONN-12P', name: 'Molex Header Connector 12-pin', category: 'Electronics', uom: 'ea', type: 'raw_material',
    onHand: 640, reserved: 140, onOrder: 0, safetyStock: 300, reorderPoint: 400, reorderQuantity: 800,
    unitCost: 0.65, leadTimeDays: 8, preferredSupplierId: 'sup-2', warehouseLocation: 'WH1-A08',
    isSerialized: false,
    lots: [lot({ quantity: 640, receivedDate: '2026-08-11', supplier: 'Pacific Circuit Supply', qualityStatus: 'released', warehouseLocation: 'WH1-A08' })],
  },
  {
    id: 'inv-rm-alu-hsg', sku: 'RM-ALU-HSG', name: 'Die-Cast Aluminum Housing', category: 'Electronics', uom: 'ea', type: 'raw_material',
    onHand: 145, reserved: 110, onOrder: 100, safetyStock: 120, reorderPoint: 160, reorderQuantity: 300,
    unitCost: 14.2, leadTimeDays: 15, preferredSupplierId: 'sup-1', warehouseLocation: 'WH1-B01',
    isSerialized: false,
    lots: [lot({ quantity: 145, receivedDate: '2026-08-06', supplier: 'Meridian Metals Co.', qualityStatus: 'released', warehouseLocation: 'WH1-B01' })],
  },
  {
    id: 'inv-rm-bearing', sku: 'RM-BRG-6203', name: 'Sealed Ball Bearing 6203', category: 'Electronics', uom: 'ea', type: 'raw_material',
    onHand: 500, reserved: 220, onOrder: 0, safetyStock: 200, reorderPoint: 300, reorderQuantity: 600,
    unitCost: 3.1, leadTimeDays: 6, preferredSupplierId: 'sup-4', warehouseLocation: 'WH1-B02',
    isSerialized: false,
    lots: [lot({ quantity: 500, receivedDate: '2026-08-13', supplier: 'Summit Fastener & Hardware', qualityStatus: 'released', warehouseLocation: 'WH1-B02' })],
  },
  {
    id: 'inv-rm-shaft', sku: 'RM-SHF-08', name: 'Precision Steel Shaft', category: 'Electronics', uom: 'ea', type: 'raw_material',
    onHand: 130, reserved: 95, onOrder: 0, safetyStock: 100, reorderPoint: 140, reorderQuantity: 250,
    unitCost: 7.8, leadTimeDays: 14, preferredSupplierId: 'sup-5', warehouseLocation: 'WH1-B03',
    isSerialized: false,
    lots: [lot({ quantity: 130, receivedDate: '2026-08-07', supplier: 'Vertex Precision Machining', qualityStatus: 'released', warehouseLocation: 'WH1-B03' })],
  },
  {
    id: 'inv-rm-fast-m4', sku: 'RM-FAST-M4', name: 'M4 Hex Socket Screw', category: 'Electronics', uom: 'ea', type: 'raw_material',
    onHand: 8400, reserved: 1600, onOrder: 0, safetyStock: 3000, reorderPoint: 5000, reorderQuantity: 10000,
    unitCost: 0.08, leadTimeDays: 4, preferredSupplierId: 'sup-4', warehouseLocation: 'WH1-C01',
    isSerialized: false,
    lots: [lot({ quantity: 8400, receivedDate: '2026-08-15', supplier: 'Summit Fastener & Hardware', qualityStatus: 'released', warehouseLocation: 'WH1-C01' })],
  },
  {
    id: 'inv-rm-cap-end', sku: 'RM-CAP-END', name: 'Stamped Steel End Cap', category: 'Electronics', uom: 'ea', type: 'raw_material',
    onHand: 260, reserved: 130, onOrder: 0, safetyStock: 150, reorderPoint: 220, reorderQuantity: 400,
    unitCost: 2.35, leadTimeDays: 9, preferredSupplierId: 'sup-1', warehouseLocation: 'WH1-C02',
    isSerialized: false,
    lots: [lot({ quantity: 260, receivedDate: '2026-08-09', supplier: 'Meridian Metals Co.', qualityStatus: 'released', warehouseLocation: 'WH1-C02' })],
  },
  // --- Raw materials: Gearbox tree ------------------------------------------
  {
    id: 'inv-rm-gear24', sku: 'RM-GEAR-24T', name: 'Hardened Spur Gear 24T', category: 'Automotive', uom: 'ea', type: 'raw_material',
    onHand: 88, reserved: 120, onOrder: 150, safetyStock: 100, reorderPoint: 140, reorderQuantity: 300,
    unitCost: 11.5, leadTimeDays: 16, preferredSupplierId: 'sup-5', warehouseLocation: 'WH2-A01',
    isSerialized: false,
    lots: [lot({ quantity: 88, receivedDate: '2026-08-04', supplier: 'Vertex Precision Machining', qualityStatus: 'released', warehouseLocation: 'WH2-A01' })],
  },
  {
    id: 'inv-rm-gear12', sku: 'RM-GEAR-12T', name: 'Pinion Gear 12T', category: 'Automotive', uom: 'ea', type: 'raw_material',
    onHand: 140, reserved: 70, onOrder: 0, safetyStock: 90, reorderPoint: 120, reorderQuantity: 250,
    unitCost: 6.7, leadTimeDays: 16, preferredSupplierId: 'sup-5', warehouseLocation: 'WH2-A02',
    isSerialized: false,
    lots: [lot({ quantity: 140, receivedDate: '2026-08-03', supplier: 'Vertex Precision Machining', qualityStatus: 'released', warehouseLocation: 'WH2-A02' })],
  },
  {
    id: 'inv-rm-seal-vt', sku: 'RM-SEAL-VT', name: 'Viton Oil Seal', category: 'Automotive', uom: 'ea', type: 'raw_material',
    onHand: 310, reserved: 140, onOrder: 0, safetyStock: 150, reorderPoint: 220, reorderQuantity: 400,
    unitCost: 1.9, leadTimeDays: 10, preferredSupplierId: 'sup-3', warehouseLocation: 'WH2-A03',
    isSerialized: false,
    lots: [lot({ quantity: 310, receivedDate: '2026-08-08', supplier: 'Continental Polymer Works', qualityStatus: 'released', warehouseLocation: 'WH2-A03' })],
  },
  {
    id: 'inv-rm-cast-di', sku: 'RM-CAST-DI', name: 'Ductile Iron Gearbox Casing', category: 'Automotive', uom: 'ea', type: 'raw_material',
    onHand: 42, reserved: 65, onOrder: 0, safetyStock: 60, reorderPoint: 90, reorderQuantity: 150,
    unitCost: 22.4, leadTimeDays: 20, preferredSupplierId: 'sup-1', warehouseLocation: 'WH2-B01',
    isSerialized: false,
    lots: [lot({ quantity: 42, receivedDate: '2026-07-30', supplier: 'Meridian Metals Co.', qualityStatus: 'released', warehouseLocation: 'WH2-B01' })],
  },
  {
    id: 'inv-rm-oil-7590', sku: 'RM-OIL-7590', name: 'Synthetic Gear Oil 75W-90', category: 'Automotive', uom: 'L', type: 'raw_material',
    onHand: 210, reserved: 40, onOrder: 0, safetyStock: 80, reorderPoint: 120, reorderQuantity: 300,
    unitCost: 9.8, leadTimeDays: 7, preferredSupplierId: 'sup-6', warehouseLocation: 'WH2-B02',
    isSerialized: false,
    lots: [lot({ quantity: 210, receivedDate: '2026-08-12', supplier: 'NovaChem Coatings & Adhesives', qualityStatus: 'released', warehouseLocation: 'WH2-B02' })],
  },
  // --- Raw materials: Sensor Enclosure tree ----------------------------------
  {
    id: 'inv-rm-abs-shl', sku: 'RM-ABS-SHL', name: 'ABS Injection-Molded Shell', category: 'Consumer Goods', uom: 'ea', type: 'raw_material',
    onHand: 520, reserved: 260, onOrder: 0, safetyStock: 300, reorderPoint: 420, reorderQuantity: 800,
    unitCost: 3.6, leadTimeDays: 11, preferredSupplierId: 'sup-3', warehouseLocation: 'WH2-C01',
    isSerialized: false,
    lots: [lot({ quantity: 520, receivedDate: '2026-08-09', supplier: 'Continental Polymer Works', qualityStatus: 'released', warehouseLocation: 'WH2-C01' })],
  },
  {
    id: 'inv-rm-gsk-ip67', sku: 'RM-GSK-IP67', name: 'Silicone IP67 Gasket', category: 'Consumer Goods', uom: 'ea', type: 'raw_material',
    onHand: 610, reserved: 220, onOrder: 0, safetyStock: 250, reorderPoint: 380, reorderQuantity: 700,
    unitCost: 0.9, leadTimeDays: 9, preferredSupplierId: 'sup-6', warehouseLocation: 'WH2-C02',
    isSerialized: false,
    lots: [lot({ quantity: 610, receivedDate: '2026-08-10', supplier: 'NovaChem Coatings & Adhesives', qualityStatus: 'released', warehouseLocation: 'WH2-C02' })],
  },
  {
    id: 'inv-rm-pcb02', sku: 'RM-PCB-02', name: 'FR4 PCB Blank, 2-Layer', category: 'Consumer Goods', uom: 'ea', type: 'raw_material',
    onHand: 380, reserved: 190, onOrder: 0, safetyStock: 200, reorderPoint: 300, reorderQuantity: 600,
    unitCost: 2.1, leadTimeDays: 10, preferredSupplierId: 'sup-2', warehouseLocation: 'WH2-C03',
    isSerialized: false,
    lots: [lot({ quantity: 380, receivedDate: '2026-08-11', supplier: 'Pacific Circuit Supply', qualityStatus: 'released', warehouseLocation: 'WH2-C03' })],
  },
  {
    id: 'inv-rm-ntc', sku: 'RM-NTC-10K', name: 'NTC Thermistor Sensor', category: 'Consumer Goods', uom: 'ea', type: 'raw_material',
    onHand: 900, reserved: 210, onOrder: 0, safetyStock: 300, reorderPoint: 450, reorderQuantity: 900,
    unitCost: 0.55, leadTimeDays: 8, preferredSupplierId: 'sup-2', warehouseLocation: 'WH2-C04',
    isSerialized: false,
    lots: [lot({ quantity: 900, receivedDate: '2026-08-13', supplier: 'Pacific Circuit Supply', qualityStatus: 'released', warehouseLocation: 'WH2-C04' })],
  },
  {
    id: 'inv-rm-ble50', sku: 'RM-BLE-50', name: 'BLE 5.0 Radio Module', category: 'Consumer Goods', uom: 'ea', type: 'raw_material',
    onHand: 60, reserved: 190, onOrder: 0, safetyStock: 150, reorderPoint: 220, reorderQuantity: 500,
    unitCost: 3.2, leadTimeDays: 24, preferredSupplierId: 'sup-2', warehouseLocation: 'WH2-C05',
    isSerialized: true,
    lots: [lot({ quantity: 60, receivedDate: '2026-07-25', supplier: 'Pacific Circuit Supply', qualityStatus: 'released', warehouseLocation: 'WH2-C05', serialNumbers: Array.from({ length: 6 }, (_, i) => `SN-BLE-${2000 + i}`) })],
  },
  // --- Sub-assemblies (semi-finished stock) ---------------------------------
  {
    id: 'inv-sa-pcm', sku: 'SA-PCM-200', name: 'PCB Control Module', category: 'Electronics', uom: 'ea', type: 'sub_assembly',
    onHand: 65, reserved: 40, onOrder: 0, safetyStock: 40, reorderPoint: 60, reorderQuantity: 100,
    unitCost: 42.1, leadTimeDays: 5, preferredSupplierId: 'sup-2', warehouseLocation: 'WH1-D01',
    isSerialized: true,
    lots: [lot({ quantity: 65, receivedDate: '2026-08-17', supplier: 'In-house (SMT Line)', qualityStatus: 'released', warehouseLocation: 'WH1-D01', serialNumbers: Array.from({ length: 5 }, (_, i) => `SN-PCM-${3000 + i}`) })],
  },
  {
    id: 'inv-sa-mha', sku: 'SA-MHA-300', name: 'Motor Housing Assembly', category: 'Electronics', uom: 'ea', type: 'sub_assembly',
    onHand: 30, reserved: 45, onOrder: 0, safetyStock: 30, reorderPoint: 45, reorderQuantity: 80,
    unitCost: 38.6, leadTimeDays: 6, preferredSupplierId: 'sup-1', warehouseLocation: 'WH1-D02',
    isSerialized: false,
    lots: [lot({ quantity: 30, receivedDate: '2026-08-16', supplier: 'In-house (Machining Cell 1)', qualityStatus: 'released', warehouseLocation: 'WH1-D02' })],
  },
  {
    id: 'inv-sa-gca', sku: 'SA-GCA-400', name: 'Gear Cluster Assembly', category: 'Automotive', uom: 'ea', type: 'sub_assembly',
    onHand: 18, reserved: 25, onOrder: 0, safetyStock: 20, reorderPoint: 30, reorderQuantity: 60,
    unitCost: 33.4, leadTimeDays: 8, preferredSupplierId: 'sup-5', warehouseLocation: 'WH2-D01',
    isSerialized: false,
    lots: [lot({ quantity: 18, receivedDate: '2026-08-15', supplier: 'In-house (Machining Cell 2)', qualityStatus: 'quarantine', warehouseLocation: 'WH2-D01' })],
  },
  {
    id: 'inv-sa-spb', sku: 'SA-SPB-100', name: 'Sensor PCB Sub-Assembly', category: 'Consumer Goods', uom: 'ea', type: 'sub_assembly',
    onHand: 55, reserved: 30, onOrder: 0, safetyStock: 35, reorderPoint: 50, reorderQuantity: 100,
    unitCost: 6.9, leadTimeDays: 5, preferredSupplierId: 'sup-2', warehouseLocation: 'WH2-D02',
    isSerialized: false,
    lots: [lot({ quantity: 55, receivedDate: '2026-08-18', supplier: 'In-house (SMT Line)', qualityStatus: 'released', warehouseLocation: 'WH2-D02' })],
  },
  // --- Finished goods --------------------------------------------------------
  {
    id: 'inv-fg-smd', sku: 'FG-SMD-1000', name: 'Industrial Servo Motor Drive', category: 'Electronics', uom: 'ea', type: 'finished_good',
    onHand: 24, reserved: 18, onOrder: 0, safetyStock: 15, reorderPoint: 25, reorderQuantity: 50,
    unitCost: 118.9, leadTimeDays: 3, preferredSupplierId: 'sup-1', warehouseLocation: 'WH3-FG01',
    isSerialized: true,
    lots: [lot({ quantity: 24, receivedDate: '2026-08-19', supplier: 'In-house (Final Assembly)', qualityStatus: 'released', warehouseLocation: 'WH3-FG01', serialNumbers: Array.from({ length: 4 }, (_, i) => `SN-SMD-${4000 + i}`) })],
  },
  {
    id: 'inv-fg-gearbox', sku: 'FG-PGU-2200', name: 'Precision Gearbox Unit', category: 'Automotive', uom: 'ea', type: 'finished_good',
    onHand: 12, reserved: 16, onOrder: 0, safetyStock: 12, reorderPoint: 18, reorderQuantity: 40,
    unitCost: 96.2, leadTimeDays: 4, preferredSupplierId: 'sup-5', warehouseLocation: 'WH3-FG02',
    isSerialized: false,
    lots: [lot({ quantity: 12, receivedDate: '2026-08-18', supplier: 'In-house (Final Assembly)', qualityStatus: 'released', warehouseLocation: 'WH3-FG02' })],
  },
  {
    id: 'inv-fg-sensor', sku: 'FG-SSE-500', name: 'Smart Sensor Enclosure', category: 'Industrial Equipment', uom: 'ea', type: 'finished_good',
    onHand: 88, reserved: 40, onOrder: 0, safetyStock: 40, reorderPoint: 60, reorderQuantity: 150,
    unitCost: 14.3, leadTimeDays: 3, preferredSupplierId: 'sup-3', warehouseLocation: 'WH3-FG03',
    isSerialized: false,
    lots: [lot({ quantity: 88, receivedDate: '2026-08-20', supplier: 'In-house (Final Assembly)', qualityStatus: 'released', warehouseLocation: 'WH3-FG03' })],
  },
]
