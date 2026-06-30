import { X, WarningCircle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type User = {
  id: number
  name: string
  email: string
}

type DeleteUserModalProps = {
  user: User | null
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

const DeleteUserModal = ({ user, open, onClose, onConfirm, isDeleting }: DeleteUserModalProps) => {
  if (!open || !user) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (!isDeleting) {
      onConfirm()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleBackdropClick}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={cn(
          "relative z-10 flex w-full max-w-md flex-col",
          "rounded-xl border border-border bg-card shadow-xl",
          "mx-4",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-rose-500/10">
              <WarningCircle className="size-5 text-rose-600 dark:text-rose-400" weight="fill" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Delete User
              </h2>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="size-5" weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-foreground">
            Are you sure you want to delete the user{" "}
            <span className="font-semibold">{user.name}</span>? This will permanently remove the user
            account and all associated data. This action cannot be undone.
          </p>
          <div className="mt-4 rounded-lg bg-rose-500/10 border border-rose-200 dark:border-rose-800 p-3">
            <p className="text-xs text-rose-600 dark:text-rose-400">
              <span className="font-semibold">Warning:</span> All user data including services, orders, and messages will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-3.5">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-rose-600 px-4 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDeleting ? (
              <>
                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteUserModal