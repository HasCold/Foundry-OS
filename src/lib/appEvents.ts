import { createEventBus } from './eventBus'
import type { AppEvents } from '@/types/events'

/** The single app-wide event bus instance. See `eventBus.ts` for the rationale. */
export const appEvents = createEventBus<AppEvents>()
