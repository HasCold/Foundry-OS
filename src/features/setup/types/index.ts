import type { IndustryType } from '@/features/auth/types'

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
  industry: IndustryType
  fiscalYearStart: string
  fiscalYearEnd: string
  baseCurrency: BaseCurrencyCode
  timeZone: string
}

export interface BusinessDetails {
  legalBusinessName: string
  businessType: string
  registrationNumber: string
  /** National Tax Number issued by FBR — the company's income-tax ID. */
  taxIdentificationNumber: string
  /** Sales Tax Registration Number — required on sales-tax invoices alongside the NTN. */
  salesTaxRegistrationNumber: string
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
 * Describes one input on a setup form. Plain fields render as a text input,
 * `select` fields as a dropdown, and `dateRange` fields pair `key` (start)
 * with `endKey` (end) as two date pickers.
 */
export type SetupFieldDef<T> =
  | { kind?: 'text'; key: keyof T & string; label: string }
  | { kind: 'select'; key: keyof T & string; label: string; options: readonly { value: string; label: string }[] }
  | { kind: 'dateRange'; key: keyof T & string; endKey: keyof T & string; label: string }
