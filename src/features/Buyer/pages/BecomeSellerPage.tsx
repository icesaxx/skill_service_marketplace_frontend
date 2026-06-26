import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react"
import {
  Briefcase,
  Buildings,
  Camera,
  FileText,
  ImageSquare,
  MapPin,
  Phone,
  SpinnerGap,
  Storefront,
  UploadSimple,
  UserCircle,
} from "@phosphor-icons/react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/provider/axios"

type SellerRequestForm = {
  phone_number: string
  company_name: string
  position: string
  bio: string
  address: string
  avatar: File | null
  cover_photo: File | null
}

type FileField = "avatar" | "cover_photo"

const initialForm: SellerRequestForm = {
  phone_number: "",
  company_name: "",
  position: "",
  bio: "",
  address: "",
  avatar: null,
  cover_photo: null,
}

const buildSellerRequestPayload = (form: SellerRequestForm) => {
  const payload = new FormData()

  payload.append("phone_number", form.phone_number.trim())
  payload.append("company_name", form.company_name.trim())
  payload.append("position", form.position.trim())
  payload.append("bio", form.bio.trim())
  payload.append("address", form.address.trim())

  if (form.avatar) payload.append("avatar", form.avatar)
  if (form.cover_photo) payload.append("cover_photo", form.cover_photo)

  return payload
}

const fileSizeLabel = (file: File) => {
  const sizeInMb = file.size / (1024 * 1024)
  return `${sizeInMb.toFixed(sizeInMb >= 10 ? 0 : 1)} MB`
}

const BecomeSellerPage = () => {
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<SellerRequestForm>(initialForm)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const sellerRequestMutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const response = await api.post<ApiResponse<unknown>>("/user/submit-seller-request", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    },
    onSuccess: (response) => {
      toast.success(response.message || "Seller request submitted successfully.")
      setForm(initialForm)
      setAvatarPreview(null)
      setCoverPreview(null)
      if (avatarInputRef.current) avatarInputRef.current.value = ""
      if (coverInputRef.current) coverInputRef.current.value = ""
    },
  })

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [avatarPreview, coverPreview])

  const completedFields = useMemo(() => {
    return [
      form.phone_number,
      form.company_name,
      form.position,
      form.bio,
      form.address,
      form.avatar,
      form.cover_photo,
    ].filter(Boolean).length
  }, [form])

  const handleInputChange = (field: Exclude<keyof SellerRequestForm, FileField>, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleFileChange = (field: FileField, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    if (file && !file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      event.target.value = ""
      return
    }

    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.")
      event.target.value = ""
      return
    }

    setForm((current) => ({ ...current, [field]: file }))

    if (field === "avatar") {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      setAvatarPreview(file ? URL.createObjectURL(file) : null)
    } else {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
      setCoverPreview(file ? URL.createObjectURL(file) : null)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !form.phone_number.trim() ||
      !form.company_name.trim() ||
      !form.position.trim() ||
      !form.bio.trim() ||
      !form.address.trim() ||
      !form.avatar ||
      !form.cover_photo
    ) {
      toast.error("Please complete all seller details and upload both images before submitting.")
      return
    }

    sellerRequestMutation.mutate(buildSellerRequestPayload(form))
  }

  const isSubmitting = sellerRequestMutation.isPending

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Seller application</p>
            <h1 className="mt-3 text-2xl font-bold text-foreground">Request to become a seller</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Build a profile admins can review quickly. Add clear contact details, your role, a short bio, and brand images for your future seller storefront.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm">
            <p className="font-semibold text-emerald-700 dark:text-emerald-300">{completedFields}/7 complete</p>
            <p className="mt-1 text-xs text-muted-foreground">Required details and images</p>
          </div>
        </div>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Phone size={17} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
                Phone number
              </span>
              <Input
                className="rounded-xl"
                value={form.phone_number}
                onChange={(event) => handleInputChange("phone_number", event.target.value)}
                placeholder="+95 9..."
                required
              />
            </label>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Buildings size={17} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
                Company name
              </span>
              <Input
                className="rounded-xl"
                value={form.company_name}
                onChange={(event) => handleInputChange("company_name", event.target.value)}
                placeholder="Your studio or company"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Briefcase size={17} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
                Position
              </span>
              <Input
                className="rounded-xl"
                value={form.position}
                onChange={(event) => handleInputChange("position", event.target.value)}
                placeholder="Frontend developer, designer..."
                required
              />
            </label>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPin size={17} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
                Address
              </span>
              <Input
                className="rounded-xl"
                value={form.address}
                onChange={(event) => handleInputChange("address", event.target.value)}
                placeholder="City, country"
                required
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText size={17} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
              Bio
            </span>
            <textarea
              className="min-h-36 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              value={form.bio}
              onChange={(event) => handleInputChange("bio", event.target.value)}
              placeholder="Tell admins what services you provide, your experience, and what buyers can expect."
              required
            />
          </label>

          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <UserCircle size={17} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
                Avatar
              </p>
              <button
                type="button"
                className="mt-2 flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-500/5"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <Camera size={30} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
                    <span className="mt-3 text-sm font-semibold text-foreground">Upload avatar</span>
                    <span className="mt-1 text-xs text-muted-foreground">Square JPG or PNG</span>
                  </>
                )}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleFileChange("avatar", event)} />
              {form.avatar ? <p className="mt-2 truncate text-xs text-muted-foreground">{form.avatar.name} - {fileSizeLabel(form.avatar)}</p> : null}
            </div>

            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ImageSquare size={17} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
                Cover photo
              </p>
              <button
                type="button"
                className="mt-2 flex min-h-52 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-500/5"
                onClick={() => coverInputRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="h-full min-h-52 w-full object-cover" />
                ) : (
                  <>
                    <UploadSimple size={30} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
                    <span className="mt-3 text-sm font-semibold text-foreground">Upload cover photo</span>
                    <span className="mt-1 text-xs text-muted-foreground">Wide JPG or PNG, up to 5 MB</span>
                  </>
                )}
              </button>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleFileChange("cover_photo", event)} />
              {form.cover_photo ? <p className="mt-2 truncate text-xs text-muted-foreground">{form.cover_photo.name} - {fileSizeLabel(form.cover_photo)}</p> : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">
              Admins will review this information before enabling seller access.
            </p>
            <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <SpinnerGap size={17} weight="bold" className="animate-spin" />
                  Submitting
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </section>

      <aside className="space-y-4">
        {[
          { icon: Storefront, title: "Profile review", text: "Admin checks your contact details, seller bio, and storefront images." },
          { icon: Briefcase, title: "Seller access", text: "Approval unlocks seller tools for publishing and managing services." },
          { icon: FileText, title: "Order readiness", text: "A complete profile helps buyers trust your services from the first visit." },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
              <Icon size={24} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
              <h2 className="mt-4 text-sm font-bold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </div>
          )
        })}
      </aside>
    </div>
  )
}

export default BecomeSellerPage
