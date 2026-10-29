import type * as React from 'react'
import type { PermissionAction, ResourceKey } from '../types'
import { usePermissions } from '../hooks/usePermissions'

interface CanProps {
  resource: ResourceKey
  action?: PermissionAction
  children: React.ReactNode
  /** Rendered instead of `children` when the permission is missing. Defaults to nothing. */
  fallback?: React.ReactNode
}

/** Renders its children only if the signed-in user holds `resource:action`. */
export function Can({ resource, action = 'view', children, fallback = null }: CanProps) {
  const { can } = usePermissions()
  return <>{can(resource, action) ? children : fallback}</>
}
