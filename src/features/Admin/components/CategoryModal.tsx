import { useState, useEffect, useRef } from "react"
import { X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type Category = {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

type CategoryModalProps = {
  category: Category | null
  open: boolean
  onClose: () => void
  onSave: (categoryId?: number, name?: string) => void
  isSaving: boolean
  mode: "create" | "edit"
}

const CategoryModal = ({ category, open, onClose, onSave, isSaving, mode }: CategoryModalProps) => {
  const [name, setName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (category && mode === "edit") {
      setName(category.name)
    } else {
      setName("")
    }
  }, [category, mode])

  useEffect(() => {
    if (open) {
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

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (mode === "edit" && category) {
      onSave(category.id, trimmed)
    } else {
      onSave(undefined, trimmed)
    }
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
            <h2 className="text-lg font-semibold text-foreground">
              {mode === "create" ? "Create Category" : "Edit Category"}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {mode === "create"
                ? "Add a new service category."
                : "Update the category name."}
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
          {/* Name field */}
          <div className="space-y-1.5">
            <label
              htmlFor="category-name"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Category Name
            </label>
            <input
              ref={inputRef}
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="h-10 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
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
                  {mode === "create" ? "Creating..." : "Saving..."}
                </div>
              ) : mode === "create" ? (
                "Create Category"
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

export default CategoryModal