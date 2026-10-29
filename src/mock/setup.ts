import type { BusinessDetails, CompanyProfile } from '@/features/setup/types'

export const companyProfile: CompanyProfile = {
  companyName: 'FoundryOS Manufacturing',
  companyCode: 'FOS-001',
  industry: 'Manufacturing',
  fiscalYear: 'January – December 2026',
  baseCurrency: 'USD',
  timeZone: 'Asia/Karachi (PKT)',
}

export const businessDetails: BusinessDetails = {
  legalBusinessName: 'FoundryOS Manufacturing (Demo)',
  businessType: 'Private Limited Company (Demo)',
  registrationNumber: 'DEMO-REG-001',
  taxIdentificationNumber: 'DEMO-TAX-001',
  businessEmail: 'info@example.com',
  contactNumber: '+92 300 0000000',
  website: 'https://example.com',
  addressLine: '123 Industrial Area (Demo)',
  city: 'Lahore',
  stateProvince: 'Punjab',
  country: 'Pakistan',
  postalCode: '54000',
}
