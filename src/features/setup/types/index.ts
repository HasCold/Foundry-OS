/** Currencies an organization can pick as its accounting base currency on the Company Profile page. */
export const BASE_CURRENCIES = [
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'PKR', label: 'PKR - Pakistani Rupee' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'AED', label: 'AED - UAE Dirham' },
  { code: 'SAR', label: 'SAR - Saudi Riyal' },
  { code: 'CNY', label: 'CNY - Chinese Yuan' },
] as const

export type BaseCurrencyCode = (typeof BASE_CURRENCIES)[number]['code']

export interface CompanyProfile {
  companyName: string
  companyCode: string
  industry: string
  fiscalYear: string
  baseCurrency: BaseCurrencyCode
  timeZone: string
}

export interface BusinessDetails {
  legalBusinessName: string
  businessType: string
  registrationNumber: string
  taxIdentificationNumber: string
  businessEmail: string
  contactNumber: string
  website: string
  addressLine: string
  city: string
  stateProvince: string
  country: string
  postalCode: string
}

/**
 * Describes one input on a setup form. `options` turns the field into a
 * dropdown; otherwise it renders as a plain text input.
 */
export interface SetupFieldDef<T> {
  key: keyof T & string
  label: string
  options?: readonly { value: string; label: string }[]
}
