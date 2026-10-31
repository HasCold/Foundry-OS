import { useState } from 'react'

/**
 * Local view/edit state for a setup form. Holds a draft copy of the saved
 * values while editing, so Cancel can throw changes away without ever
 * touching the store. `startInEditMode` is for create forms, which have no
 * read-only state to fall back to.
 */
export function useEditableForm<T extends object>(saved: T, { startInEditMode = false } = {}) {
  const [draft, setDraft] = useState<T | null>(() => (startInEditMode ? { ...saved } : null))

  const isEditing = draft !== null
  const values = draft ?? saved
  const isDirty = draft !== null && (Object.keys(saved) as (keyof T)[]).some((key) => draft[key] !== saved[key])

  return {
    isEditing,
    isDirty,
    values,
    startEditing: () => setDraft({ ...saved }),
    cancelEditing: () => setDraft(null),
    setField: <K extends keyof T>(key: K, value: T[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d)),
  }
}
