import { useState, useRef, useEffect } from "react"
import { useApiQuery } from "@/services/useApiQuery"
import { useApiMutation } from "@/services/useApiMutation"
import { toast } from "sonner"
import {
    User,
    Envelope,
    Camera,
    CircleNotch,
    CheckCircle,
    PencilSimple,
    IdentificationBadge,
    Trash,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/provider/axios"

interface AdminProfile {
    name: string
    email: string
    role: string
    avatar: string | null
    avatar_url: string | null
    cover_photo: string | null
    cover_photo_url: string | null
}

const AdminProfilePage = () => {
    const { data: profile, isLoading, isError, refetch } = useApiQuery({
        endpoint: "/admin/profile",
        queryKey: ["admin-profile"],
    })

    const user = profile as AdminProfile | undefined

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [isDirty, setIsDirty] = useState(false)

    const avatarInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    // Sync form with fetched data
    useEffect(() => {
        if (user) {
            setName(user.name)
            setEmail(user.email)
            setAvatarPreview(user.avatar_url)
            setCoverPreview(user.cover_photo_url)
        }
    }, [user])

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
        setIsDirty(true)
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
        setIsDirty(true)
    }

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            setAvatarPreview(URL.createObjectURL(file))
            setIsDirty(true)
        }
    }

    const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setCoverFile(file)
            setCoverPreview(URL.createObjectURL(file))
            setIsDirty(true)
        }
    }

    const updateMutation = useApiMutation({
        onSuccess: (response) => {
            toast.success(response?.message || "Profile updated successfully")
            setIsDirty(false)
            setAvatarFile(null)
            setCoverFile(null)
            refetch()
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to update profile")
        },
    })

    const handleDeleteCover = async () => {
        try {
            const res = await api.post("/admin/profile/delete-details", { cover_photo: true })
            toast.success(res.data?.message || "Cover photo removed")
            setCoverPreview(null)
            setCoverFile(null)
            refetch()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            toast.error(error?.response?.data?.message || "Failed to remove cover photo")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append("name", name)
        formData.append("email", email)
        if (avatarFile) formData.append("avatar", avatarFile)
        if (coverFile) formData.append("cover_photo", coverFile)

        try {
            const res = await api.post("/admin/profile/update", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            toast.success(res.data?.message || "Profile updated successfully")
            setIsDirty(false)
            setAvatarFile(null)
            setCoverFile(null)
            refetch()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            toast.error(error?.response?.data?.message || "Failed to update profile")
        }
    }

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
                {/* Cover Skeleton */}
                <div className="h-48 sm:h-56 rounded-2xl bg-gray-200 dark:bg-gray-700" />
                {/* Avatar Skeleton */}
                <div className="flex justify-center -mt-16">
                    <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-background" />
                </div>
                {/* Form Skeleton */}
                <div className="space-y-5 px-4 sm:px-6">
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg ml-auto" />
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20">
                        <CircleNotch className="w-8 h-8 text-red-500" weight="bold" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Failed to load profile
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Please try refreshing the page.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Cover Photo */}
            <div className="relative h-48 sm:h-56 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 dark:from-blue-600 dark:via-indigo-700 dark:to-purple-800 overflow-hidden">
                {coverPreview && (
                    <img
                        src={coverPreview}
                        alt="Cover"
                        className="w-full h-full object-cover pointer-events-none"
                    />
                )}
                <label
                    htmlFor="cover-upload"
                    className="absolute inset-0 w-full h-full cursor-pointer z-10"
                >
                    <span className="absolute bottom-3 right-3 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/80 transition-all duration-200 select-none pointer-events-none">
                        <Camera size={16} weight="bold" />
                        Change Cover
                    </span>
                </label>
                {coverPreview && (
                    <button
                        type="button"
                        onClick={handleDeleteCover}
                        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/70 backdrop-blur-sm text-white text-xs font-medium hover:bg-red-600/80 transition-all duration-200 cursor-pointer"
                    >
                        <Trash size={14} weight="bold" />
                        Delete
                    </button>
                )}
                <input
                    ref={coverInputRef}
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverSelect}
                />
            </div>

            {/* Avatar */}
            <div className="flex justify-center -mt-14 relative z-10">
                <div className="relative group">
                    <div className="w-28 h-28 rounded-full bg-white dark:bg-gray-800 border-4 border-background shadow-lg flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-12 h-12 text-gray-400" weight="thin" />
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-primary/90"
                    >
                        <Camera size={14} weight="bold" />
                    </button>
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarSelect}
                    />
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Name & Email */}
                <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-5">
                    <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                        <IdentificationBadge className="w-5 h-5 text-primary" weight="duotone" />
                        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            Personal Information
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm">
                                Full Name
                            </Label>
                            <div className="relative">
                                <User
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                    weight="bold"
                                />
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={handleNameChange}
                                    className="pl-9"
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Envelope
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                    weight="bold"
                                />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className="pl-9"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Role Display */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                                {user?.role || "Admin"}
                            </span>
                            <span>— You have full administrative access</span>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3">
                    {isDirty && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <PencilSimple size={12} weight="bold" />
                            Unsaved changes
                        </span>
                    )}
                    <Button
                        type="submit"
                        disabled={updateMutation.isPending || !isDirty}
                        className="min-w-[140px]"
                    >
                        {updateMutation.isPending ? (
                            <>
                                <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" weight="bold" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default AdminProfilePage