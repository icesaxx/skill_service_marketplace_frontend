import { useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  FileText,
  Image,
  Plus,
  Tag,
  X,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useApiQuery } from "@/services/useApiQuery"
import { useApiMutation } from "@/services/useApiMutation"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"

interface Category {
  id: number
  name: string
}

type CategoriesResponse = Category[] | { categories?: Category[] }

interface ServiceEditData {
  id: number
  user_id: number
  category_id?: number | string | null
  category?: Category | null
  title: string
  description: string
  price: string
  estimated_days: string
  tags: string[]
  image: string | null
  image_url: string | null
  is_active: boolean
  status: string
  average_rating: number
  total_reviews: number
  saved_count: number
  bookings: {
    total: number
    pending: number
    accepted: number
    in_progress: number
    completed: number
    rejected: number
    cancelled: number
  }
  reviews: any[]
  created_at: string
  updated_at: string
}

const SellerServiceEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tagInput, setTagInput] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    estimated_days: "",
    category_id: "",
    tags: [] as string[],
    image: null as File | null,
  })

  const { data, isLoading, isError } = useApiQuery<never, ServiceEditData>({
    endpoint: `/seller/services/show/${id}`,
    queryKey: [`/seller/services/show/${id}`],
  })

  const { data: categoriesData } = useApiQuery<never, CategoriesResponse>({
    endpoint: "/categories",
    queryKey: ["/categories"],
  })

  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories ?? []

  const updateMutation = useApiMutation({
    onSuccess: () => {
      navigate(`/seller/services/${id}`)
    },
  })

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title,
        description: data.description ?? "",
        price: data.price ?? "",
        estimated_days: data.estimated_days ?? "",
        category_id: String(data.category_id ?? data.category?.id ?? ""),
        tags: Array.isArray(data.tags) ? data.tags : [],
        image: null,
      })
    }
  }, [data])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({
        ...formData,
        image: file,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = new FormData()
    submitData.append("service_id", id || "")
    submitData.append("title", formData.title)
    submitData.append("description", formData.description)
    submitData.append("price", formData.price)
    submitData.append("estimated_days", formData.estimated_days)
    submitData.append("category_id", formData.category_id.toString())
    
    // Append tags as array with numeric keys (tags[0], tags[1], etc.)
    formData.tags.forEach((tag, index) => {
      submitData.append(`tags[${index}]`, tag)
    })
    
    if (formData.image) {
      submitData.append("image", formData.image)
    }

    updateMutation.mutate({
      endpoint: `/seller/services/update`,
      method: "POST",
      body: submitData,
    })
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20">
            <Briefcase className="w-8 h-8 text-red-500" weight="bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Failed to load service</h3>
            <p className="text-sm text-muted-foreground mt-1">Something went wrong while fetching service details.</p>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/seller/services">
              <ArrowLeft size={17} weight="bold" />
              Back to Services
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-xl">
          <Link to={`/seller/services/${id}`}>
            <ArrowLeft size={20} weight="bold" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Service</h1>
          <p className="text-sm text-muted-foreground mt-1">Update your service information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Service Title</label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="Enter service title"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Price ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Estimated Days</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        name="estimated_days"
                        value={formData.estimated_days}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="e.g., 3 days"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                    placeholder="Describe your service..."
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Tags</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="Add a tag"
                    />
                  </div>
                  <Button type="button" variant="outline" className="rounded-xl" onClick={handleAddTag}>
                    <Plus size={17} weight="bold" />
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-300"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Service Image</h2>
              <div className="space-y-4">
                {data?.image_url && !formData.image && (
                  <div className="overflow-hidden rounded-xl border border-border">
                    <img src={data.image_url} alt={data.title} className="h-48 w-full object-cover" />
                  </div>
                )}
                {formData.image && (
                  <div className="overflow-hidden rounded-xl border border-border">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}
                <div className="relative">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/50 px-4 py-8 text-sm text-muted-foreground hover:border-cyan-400 hover:bg-cyan-500/5 transition-colors"
                  >
                    <Image size={20} weight="duotone" />
                    {formData.image ? "Change Image" : "Upload Image *"}
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: 800x600px, max 2MB
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button asChild variant="outline" type="button" className="rounded-xl">
            <Link to={`/seller/services/${id}`}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            className="rounded-xl bg-cyan-600 hover:bg-cyan-700"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SellerServiceEditPage