import { Loader2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditActionsProps {
  isEditing: boolean
  isDirty: boolean
  isSaving: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

/** Edit button in view mode; Cancel + Save while editing. */
export function EditActions({ isEditing, isDirty, isSaving, onEdit, onCancel, onSave }: EditActionsProps) {
  if (!isEditing) {
    return (
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Pencil />
        Edit
      </Button>
    )
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
        Cancel
      </Button>
      <Button size="sm" onClick={onSave} disabled={!isDirty || isSaving}>
        {isSaving && <Loader2 className="animate-spin" />}
        Save changes
      </Button>
    </>
  )
}
