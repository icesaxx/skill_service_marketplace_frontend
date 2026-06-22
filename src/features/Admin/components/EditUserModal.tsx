import { useState, useEffect, useRef } from "react"
import { X, CaretDown } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type User = {
  id: number
  name: string
  email: string
  role: "buyer" | "seller" | "admin"
  status: string
  phone_number: string | null
  company_name: string | null
  position: string | null
  address: string | null
  avatar: string | null
  cover_photo: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

type EditUserModalProps = {
  user: User | null
  open: boolean
  onClose: () => void
  onSave: (user_id: number, name: string, role: string, status: string) => void
  isSaving: boolean
}

const EditUserModal = ({ user, open, onClose, onSave, isSaving }: EditUserModalProps) => {
  const [name, setName] = useState("")
  const [role, setRole] = useState("buyer")
  const [status, setStatus] = useState("active")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setRole(user.role)
      setStatus(user.status.toLowerCase())
    }
  }, [user])

  useEffect(() => {
    if (open) {
      // Focus input after modal animates in
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open || !user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(user.id, trimmed, role, status)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md animate-in",
          "rounded-xl border border-border bg-card p-6 shadow-xl",
          "mx-4",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Edit User</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Update the user's profile information.
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="size-5" weight="bold" />
          </button>
        </div>

        {/* Divider */}
        <div className="mb-5 border-t border-border" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User email (read-only display) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <p className="rounded-lg border border-input bg-muted/50 px-3.5 py-2.5 text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>

          {/* Name field */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-name"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Name
            </label>
            <input
              ref={inputRef}
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter user name"
              className="h-10 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>

          {/* Role field */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-role"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Role
            </label>
            <div className="relative">
              <select
                id="edit-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-input bg-background px-3.5 pr-10 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
              <CaretDown
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                weight="bold"
              />
            </div>
          </div>

          {/* Status field */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-status"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Status
            </label>
            <div className="relative">
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-input bg-background px-3.5 pr-10 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <CaretDown
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                weight="bold"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditUserModal