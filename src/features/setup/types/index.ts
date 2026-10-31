import type { IndustryType } from '@/features/auth/types'

// ---------------------------------------------------------------------------
// Company setup.
//
//   Company (the account that signed up) ──< Organization ──< Location
//
// One company can run several businesses from a single FoundryOS account.
// Each business is an Organization with its own profile (code, currency,
// fiscal year…) and its own sites. Business Details — legal registration
// and contact info — stay at the company level and are shared by all of them.
// ---------------------------------------------------------------------------

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

/** The editable fields of an organization's profile. */
export interface OrganizationProfile {
  name: string
  code: string
  industry: IndustryType
  fiscalYearStart: string
  fiscalYearEnd: string
  baseCurrency: BaseCurrencyCode
  timeZone: string
}

export interface Organization extends OrganizationProfile {
  id: string
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
}

export const LOCATION_TYPES = ['Head Office', 'Manufacturing Plant', 'Warehouse', 'Branch Office', 'Sales Office'] as const
export type LocationType = (typeof LOCATION_TYPES)[number]

/** One physical site an organization operates from. Each organization has exactly one primary location. */
export interface OrganizationLocation {
  id: string
  organizationId: string
  name: string
  type: LocationType
  addressLine: string
  city: string
  stateProvince: string
  country: string
  postalCode: string
  contactNumber: string
  isPrimary: boolean
}

export type LocationInput = Omit<OrganizationLocation, 'id' | 'organizationId' | 'isPrimary'>

/**
 * Describes one input on a setup form. Plain fields render as a text input,
 * `select` fields as a dropdown, and `dateRange` fields pair `key` (start)
 * with `endKey` (end) as two date pickers.
 */
export type SetupFieldDef<T> =
  | { kind?: 'text'; key: keyof T & string; label: string }
  | { kind: 'select'; key: keyof T & string; label: string; options: readonly { value: string; label: string }[] }
  | { kind: 'dateRange'; key: keyof T & string; endKey: keyof T & string; label: string }
