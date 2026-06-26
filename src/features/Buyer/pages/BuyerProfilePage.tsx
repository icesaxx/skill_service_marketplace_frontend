import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { Camera, CheckCircle, CircleNotch, CreditCard, MapPin, PencilSimple, Trash, UserCircle } from "@phosphor-icons/react"
import { toast } from "sonner"
import api from "@/provider/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApiQuery } from "@/services/useApiQuery"
import { useAuthStore } from "@/stores/userStore"
import { Skeleton } from "@/components/ui/skeleton"

interface BuyerProfile {
  id?: number
  name: string
  email: string
  role?: string
  phone_number?: string | null
  address?: string | null
  bio?: string | null
  avatar?: string | null
  avatar_url?: string | null
  cover_photo?: string | null
  cover_photo_url?: string | null
}

type BuyerProfileData = BuyerProfile | {
  data?: BuyerProfile
  user?: BuyerProfile
  profile?: BuyerProfile
}

const getProfileFromResponse = (data: BuyerProfileData | undefined) => {
  if (!data) return undefined
  if ("name" in data) return data
  return data.data ?? data.user ?? data.profile
}

const BuyerProfilePage = () => {
  const { user, setUser } = useAuthStore()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, isError, refetch } = useApiQuery<never, BuyerProfileData>({
    endpoint: "/profile",
    raw: true,
    queryKey: ["/profile"],
  })

  const profile = getProfileFromResponse(data)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")
  const [bio, setBio] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingField, setDeletingField] = useState<"avatar" | "cover_photo" | null>(null)

  useEffect(() => {
    if (!profile) return

    setName(profile.name ?? "")
    setEmail(profile.email ?? "")
    setPhoneNumber(profile.phone_number ?? "")
    setAddress(profile.address ?? "")
    setBio(profile.bio ?? "")
    setAvatarPreview(profile.avatar_url ?? null)
    setCoverPreview(profile.cover_photo_url ?? null)
    setIsDirty(false)
  }, [profile])

  const markDirty = () => setIsDirty(true)

  const handleAvatarSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    markDirty()
  }

  const handleCoverSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview)
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    markDirty()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData()
    formData.append("name", name)
    formData.append("email", email)
    formData.append("phone_number", phoneNumber)
    formData.append("address", address)
    formData.append("bio", bio)
    if (avatarFile) formData.append("avatar", avatarFile)
    if (coverFile) formData.append("cover_photo", coverFile)

    try {
      setIsSaving(true)
      const response = await api.post("/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const updatedProfile = getProfileFromResponse(response.data as BuyerProfileData)

      toast.success(response.data?.message || "Profile updated successfully")
      setIsDirty(false)
      setAvatarFile(null)
      setCoverFile(null)

      if (updatedProfile) {
        setUser({
          ...(user ?? {}),
          id: updatedProfile.id ?? user?.id,
          name: updatedProfile.name,
          email: updatedProfile.email,
          role: updatedProfile.role ?? user?.role,
        })
      }

      refetch()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteDetails = async (field: "avatar" | "cover_photo") => {
    try {
      setDeletingField(field)
      const response = await api.post("/profile/delete-details", {
        [field]: true,
      })

      toast.success(response.data?.message || "Profile image removed")

      if (field === "avatar") {
        if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview)
        setAvatarPreview(null)
        setAvatarFile(null)
        if (avatarInputRef.current) avatarInputRef.current.value = ""
      } else {
        if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview)
        setCoverPreview(null)
        setCoverFile(null)
        if (coverInputRef.current) coverInputRef.current.value = ""
      }

      setIsDirty(false)
      refetch()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Failed to remove profile image")
    } finally {
      setDeletingField(null)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col items-center">
            <Skeleton className="size-24 rounded-full" />
            <Skeleton className="mt-4 h-6 w-32" />
            <Skeleton className="mt-2 h-4 w-44" />
          </div>
          <div className="mt-6 space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </aside>
        <section className="rounded-2xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-6 h-10 w-full" />
          <Skeleton className="mt-4 h-10 w-full" />
          <Skeleton className="mt-4 h-28 w-full" />
        </section>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-red-500">Failed to load profile.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative h-32 bg-emerald-600/10">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" />
          ) : null}
          <Button
            type="button"
            size="icon-sm"
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-3 right-3 rounded-full bg-emerald-600 hover:bg-emerald-700"
            aria-label="Update cover photo"
          >
            <Camera size={15} weight="bold" />
          </Button>
          {coverPreview ? (
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              onClick={() => handleDeleteDetails("cover_photo")}
              disabled={deletingField === "cover_photo"}
              className="absolute right-14 bottom-3 rounded-full"
              aria-label="Delete cover photo"
            >
              {deletingField === "cover_photo" ? (
                <CircleNotch size={15} className="animate-spin" weight="bold" />
              ) : (
                <Trash size={15} weight="bold" />
              )}
            </Button>
          ) : null}
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
        </div>

        <div className="p-5">
          <div className="-mt-14 flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-emerald-500/10 text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={name || "Buyer"} className="h-full w-full object-cover" />
                ) : (
                  name?.charAt(0)?.toUpperCase() || "B"
                )}
              </div>
              <Button
                type="button"
                size="icon-sm"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 rounded-full bg-emerald-600 hover:bg-emerald-700"
                aria-label="Update avatar"
              >
                <Camera size={15} weight="bold" />
              </Button>
              {avatarPreview ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  onClick={() => handleDeleteDetails("avatar")}
                  disabled={deletingField === "avatar"}
                  className="absolute bottom-0 left-0 rounded-full"
                  aria-label="Delete avatar"
                >
                  {deletingField === "avatar" ? (
                    <CircleNotch size={15} className="animate-spin" weight="bold" />
                  ) : (
                    <Trash size={15} weight="bold" />
                  )}
                </Button>
              ) : null}
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
            </div>
            <h1 className="mt-4 text-xl font-bold text-foreground">{name || "Buyer"}</h1>
            <p className="text-sm text-muted-foreground">{email || "buyer@example.com"}</p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
              <UserCircle size={20} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
              <span className="text-sm text-foreground">Buyer account</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
              <CreditCard size={20} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
              <span className="text-sm text-foreground">Payment methods ready</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
              <MapPin size={20} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
              <span className="text-sm text-foreground">{address || "Location not set"}</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-foreground">Profile Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Keep buyer contact details ready for sellers and order updates.</p>
        <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Name</span>
              <Input
                className="rounded-xl"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  markDirty()
                }}
                placeholder="Your name"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Email</span>
              <Input
                className="rounded-xl"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  markDirty()
                }}
                placeholder="you@example.com"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Phone</span>
              <Input
                className="rounded-xl"
                value={phoneNumber}
                onChange={(event) => {
                  setPhoneNumber(event.target.value)
                  markDirty()
                }}
                placeholder="+95..."
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Location</span>
              <Input
                className="rounded-xl"
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value)
                  markDirty()
                }}
                placeholder="City, country"
              />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Buyer notes</span>
            <textarea
              value={bio}
              onChange={(event) => {
                setBio(event.target.value)
                markDirty()
              }}
              className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
              placeholder="Default notes sellers should know about your projects."
            />
          </label>
          <div className="flex items-center justify-end gap-3">
            {isDirty ? (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <PencilSimple size={12} weight="bold" />
                Unsaved changes
              </span>
            ) : null}
            <Button type="submit" disabled={isSaving || !isDirty} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
              {isSaving ? (
                <>
                  <CircleNotch size={16} className="animate-spin" weight="bold" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={16} weight="bold" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default BuyerProfilePage
