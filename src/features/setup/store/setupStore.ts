import { create } from 'zustand'
import type { BusinessDetails, LocationInput, Organization, OrganizationLocation, OrganizationProfile } from '../types'
import {
  businessDetails as initialBusinessDetails,
  locations as initialLocations,
  organizations as initialOrganizations,
} from '@/mock/setup'
import { nextId } from '@/lib/utils'

interface SetupState {
  organizations: Organization[]
  businessDetails: BusinessDetails
  locations: OrganizationLocation[]

  /** Returns the new organization's id so the screen can switch to it. */
  addOrganization: (profile: OrganizationProfile) => string
  updateOrganization: (organizationId: string, profile: OrganizationProfile) => void
  /** Removes the organization together with its locations. The company always keeps at least one. */
  removeOrganization: (organizationId: string) => void

  updateBusinessDetails: (details: BusinessDetails) => void

  /** The first location an organization adds becomes its primary one automatically. */
  addLocation: (organizationId: string, input: LocationInput) => void
  updateLocation: (locationId: string, input: LocationInput) => void
  /** The primary location can't be removed — make another one primary first. */
  removeLocation: (locationId: string) => void
  setPrimaryLocation: (locationId: string) => void
}

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/** Throws a user-facing message if the profile is incomplete or clashes with another organization. */
function assertValidOrganization(profile: OrganizationProfile, organizations: Organization[], selfId: string | null) {
  if (!profile.name.trim() || !profile.code.trim()) throw new Error('Organization name and code are required.')
  if (!profile.fiscalYearStart || !profile.fiscalYearEnd || profile.fiscalYearStart >= profile.fiscalYearEnd) {
    throw new Error('Fiscal year must end after it starts.')
  }
  const others = organizations.filter((o) => o.id !== selfId)
  const nameClash = others.find((o) => sameText(o.name, profile.name))
  if (nameClash) throw new Error(`An organization named "${nameClash.name}" already exists.`)
  const codeClash = others.find((o) => sameText(o.code, profile.code))
  if (codeClash) throw new Error(`Code ${codeClash.code} is already used by ${codeClash.name}.`)
}

/** Throws a user-facing message if the location is incomplete or its name clashes within its organization. */
function assertValidLocation(input: LocationInput, siblings: OrganizationLocation[], selfId: string | null) {
  if (!input.name.trim()) throw new Error('Location name is required.')
  if (!input.city.trim() || !input.country.trim()) throw new Error('City and country are required.')
  const clash = siblings.find((l) => l.id !== selfId && sameText(l.name, input.name))
  if (clash) throw new Error(`This organization already has a location named "${clash.name}".`)
}

const trimProfile = (profile: OrganizationProfile): OrganizationProfile => ({
  ...profile,
  name: profile.name.trim(),
  code: profile.code.trim(),
  timeZone: profile.timeZone.trim(),
})

const trimLocation = (input: LocationInput): LocationInput => ({
  ...input,
  name: input.name.trim(),
  addressLine: input.addressLine.trim(),
  city: input.city.trim(),
  stateProvince: input.stateProvince.trim(),
  country: input.country.trim(),
  postalCode: input.postalCode.trim(),
  contactNumber: input.contactNumber.trim(),
})

function findOrThrow<T extends { id: string }>(items: T[], id: string, kind: string): T {
  const item = items.find((i) => i.id === id)
  if (!item) throw new Error(`${kind} not found.`)
  return item
}

export const useSetupStore = create<SetupState>((set, get) => ({
  organizations: initialOrganizations,
  businessDetails: initialBusinessDetails,
  locations: initialLocations,

  addOrganization: (profile) => {
    assertValidOrganization(profile, get().organizations, null)
    const organization: Organization = { id: nextId('org'), ...trimProfile(profile) }
    set((state) => ({ organizations: [...state.organizations, organization] }))
    return organization.id
  },

  updateOrganization: (organizationId, profile) => {
    findOrThrow(get().organizations, organizationId, 'Organization')
    assertValidOrganization(profile, get().organizations, organizationId)
    set((state) => ({
      organizations: state.organizations.map((o) => (o.id === organizationId ? { ...o, ...trimProfile(profile) } : o)),
    }))
  },

  removeOrganization: (organizationId) => {
    findOrThrow(get().organizations, organizationId, 'Organization')
    if (get().organizations.length === 1) throw new Error('The company needs at least one organization.')
    set((state) => ({
      organizations: state.organizations.filter((o) => o.id !== organizationId),
      locations: state.locations.filter((l) => l.organizationId !== organizationId),
    }))
  },

  updateBusinessDetails: (businessDetails) => set({ businessDetails }),

  addLocation: (organizationId, input) => {
    findOrThrow(get().organizations, organizationId, 'Organization')
    const siblings = get().locations.filter((l) => l.organizationId === organizationId)
    assertValidLocation(input, siblings, null)
    const location: OrganizationLocation = { id: nextId('loc'), organizationId, ...trimLocation(input), isPrimary: siblings.length === 0 }
    set((state) => ({ locations: [...state.locations, location] }))
  },

  updateLocation: (locationId, input) => {
    const location = findOrThrow(get().locations, locationId, 'Location')
    assertValidLocation(input, get().locations.filter((l) => l.organizationId === location.organizationId), locationId)
    set((state) => ({ locations: state.locations.map((l) => (l.id === locationId ? { ...l, ...trimLocation(input) } : l)) }))
  },

  removeLocation: (locationId) => {
    const location = findOrThrow(get().locations, locationId, 'Location')
    if (location.isPrimary) throw new Error(`"${location.name}" is the primary location. Make another location primary before removing it.`)
    set((state) => ({ locations: state.locations.filter((l) => l.id !== locationId) }))
  },

  setPrimaryLocation: (locationId) => {
    const { organizationId } = findOrThrow(get().locations, locationId, 'Location')
    set((state) => ({
      locations: state.locations.map((l) => (l.organizationId === organizationId ? { ...l, isPrimary: l.id === locationId } : l)),
    }))
  },
}))
