import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import {
  User,
  MapPin,
  Phone,
  Envelope,
  Camera,
  BuildingOffice,
  Briefcase,
  PencilSimple,
  Check,
  X,
  CircleNotch,
} from "@phosphor-icons/react"
import { toast } from "sonner"
import api from "@/provider/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApiQuery } from "@/services/useApiQuery"
import { useAuthStore } from "@/stores/userStore"
import { Skeleton } from "@/components/ui/skeleton"

interface SellerProfile {
  id: number
  name: string
  email: string
  role: string
  status: string
  phone_number: string | null
  company_name: string | null
  position: string | null
  address: string | null
  avatar: string | null
  avatar_url: string | null
  cover_photo: string | null
  cover_photo_url: string | null
  bio: string | null
  is_approved: boolean
  approval_status: string
  created_at: string
  updated_at: string
}

type SellerProfileData = SellerProfile | {
  data?: SellerProfile
  user?: SellerProfile
  profile?: SellerProfile
}

const getProfileFromResponse = (data: SellerProfileData | undefined) => {
  if (!data) return undefined
  if ("name" in data) return data
  return data.data ?? data.user ?? data.profile
}

const profileEndpoints = {
  update: "/profile/update",
  deleteDetails: "/profile/delete-details",
}

const SellerProfilePage = () => {
  const { user, setUser } = useAuthStore()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, isError, refetch } = useApiQuery<never, SellerProfileData>({
    endpoint: "/profile",
    raw: true,
    queryKey: ["/profile"],
  })

  const profile = getProfileFromResponse(data)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [position, setPosition] = useState("")
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
    setCompanyName(profile.company_name ?? "")
    setPosition(profile.position ?? "")
    setAddress(profile.address ?? "")
    setBio(profile.bio ?? "")
    setAvatarPreview(profile.avatar_url ?? null)
    setCoverPreview(profile.cover_photo_url ?? null)
    setIsDirty(false)
  }, [profile])

  const markDirty = () => setIsDirty(true)

  const validateImageFile = (file: File, event: ChangeEvent<HTMLInputElement>) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      event.target.value = ""
      return false
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.")
      event.target.value = ""
      return false
    }

    return true
  }

  const handleAvatarSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!validateImageFile(file, event)) return

    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    markDirty()
  }

  const handleCoverSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!validateImageFile(file, event)) return

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
    formData.append("company_name", companyName)
    formData.append("position", position)
    formData.append("address", address)
    formData.append("bio", bio)
    if (avatarFile) formData.append("avatar", avatarFile)
    if (coverFile) {
      formData.append("cover_photo", coverFile)
      formData.append("cover", coverFile)
    }

    try {
      setIsSaving(true)
      const response = await api.post(profileEndpoints.update, formData)
      const updatedProfile = getProfileFromResponse(response.data as SellerProfileData)

      toast.success(response.data?.message || "Profile updated successfully")
      setIsDirty(false)
      setAvatarFile(null)
      setCoverFile(null)
      if (avatarInputRef.current) avatarInputRef.current.value = ""
      if (coverInputRef.current) coverInputRef.current.value = ""

      if (updatedProfile) {
        setUser({
          ...(user ?? {}),
          id: updatedProfile.id ?? user?.id,
          name: updatedProfile.name,
          email: updatedProfile.email,
          role: updatedProfile.role ?? user?.role,
        })
      }

      const refetchedProfile = getProfileFromResponse((await refetch()).data)
      if (refetchedProfile?.cover_photo_url) {
        setCoverPreview(refetchedProfile.cover_photo_url)
      }
      if (refetchedProfile?.avatar_url) {
        setAvatarPreview(refetchedProfile.avatar_url)
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteDetails = async (field: "avatar" | "cover_photo") => {
    if (field === "avatar" && avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview)
      setAvatarPreview(profile?.avatar_url ?? null)
      setAvatarFile(null)
      if (avatarInputRef.current) avatarInputRef.current.value = ""
      setIsDirty(false)
      return
    }

    if (field === "cover_photo" && coverPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview)
      setCoverPreview(profile?.cover_photo_url ?? null)
      setCoverFile(null)
      if (coverInputRef.current) coverInputRef.current.value = ""
      setIsDirty(false)
      return
    }

    try {
      setDeletingField(field)
      const response = await api.post(profileEndpoints.deleteDetails, {
        [field]: true,
        ...(field === "cover_photo" ? { cover: true } : {}),
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20">
            <User className="w-8 h-8 text-red-500" weight="bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Failed to load profile</h3>
            <p className="text-sm text-muted-foreground mt-1">Something went wrong while fetching your profile.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal information and preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Header with Cover */}
          <div className="relative">
            {/* Cover Photo */}
            <div className="relative h-32 overflow-hidden rounded-xl bg-cyan-600/10">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="pointer-events-none h-full w-full object-cover" />
              ) : null}
              <label
                htmlFor="seller-cover-photo"
                className="absolute inset-0 z-10 cursor-pointer"
              >
                <span className="absolute bottom-3 right-3 inline-flex size-8 items-center justify-center rounded-full bg-cyan-600 text-white shadow-sm transition-colors hover:bg-cyan-700">
                  <Camera size={15} weight="bold" />
                </span>
              </label>
              {coverPreview && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    handleDeleteDetails("cover_photo")
                  }}
                  disabled={deletingField === "cover_photo"}
                  className="absolute bottom-3 right-14 z-20 inline-flex size-8 items-center justify-center rounded-full bg-destructive/90 text-white shadow-sm transition-colors hover:bg-destructive disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Delete cover photo"
                >
                  {deletingField === "cover_photo" ? (
                    <CircleNotch size={15} className="animate-spin" weight="bold" />
                  ) : (
                    <X size={15} weight="bold" />
                  )}
                </button>
              )}
              <input id="seller-cover-photo" ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
            </div>

            {/* Avatar */}
            <div className="relative -mt-10 mb-4 flex justify-center">
              <div className="relative">
                <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-cyan-500/10 text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={name || "Seller"} className="h-full w-full object-cover" />
                  ) : (
                    name?.charAt(0)?.toUpperCase() || "S"
                  )}
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full bg-cyan-600 hover:bg-cyan-700"
                  aria-label="Update avatar"
                >
                  <Camera size={15} weight="bold" />
                </Button>
                {avatarPreview && (
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
                      <X size={15} weight="bold" />
                    )}
                  </Button>
                )}
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
              </div>
            </div>

            {/* Name and Status */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">{name || "Seller"}</h2>
              <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
              {profile?.approval_status && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                  {profile.approval_status}
                </span>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Full Name</label>
                <div className="relative">
                  <User size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      markDirty()
                    }}
                    className="rounded-xl pl-9"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Email</label>
                <div className="relative">
                  <Envelope size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      markDirty()
                    }}
                    className="rounded-xl pl-9"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone</label>
                <div className="relative">
                  <Phone size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="tel"
                    name="phone_number"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value)
                      markDirty()
                    }}
                    className="rounded-xl pl-9"
                    placeholder="+95..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Company Name</label>
                <div className="relative">
                  <BuildingOffice size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="company_name"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value)
                      markDirty()
                    }}
                    className="rounded-xl pl-9"
                    placeholder="Your company"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Position</label>
                <div className="relative">
                  <Briefcase size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="position"
                    value={position}
                    onChange={(e) => {
                      setPosition(e.target.value)
                      markDirty()
                    }}
                    className="rounded-xl pl-9"
                    placeholder="Your position"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Location</label>
                <div className="relative">
                  <MapPin size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value)
                      markDirty()
                    }}
                    className="rounded-xl pl-9"
                    placeholder="City, country"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Bio</label>
              <textarea
                name="bio"
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value)
                  markDirty()
                }}
                rows={4}
                placeholder="Tell buyers about yourself and your expertise..."
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              {isDirty ? (
                <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <PencilSimple size={12} weight="bold" />
                  Unsaved changes
                </span>
              ) : null}
              <Button type="submit" disabled={isSaving || !isDirty} className="rounded-xl bg-cyan-600 hover:bg-cyan-700">
                {isSaving ? (
                  <>
                    <CircleNotch size={16} className="animate-spin" weight="bold" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} weight="bold" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SellerProfilePage
