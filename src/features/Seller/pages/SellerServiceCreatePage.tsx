import { Link, useNavigate } from "react-router-dom"
import {
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
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

interface Category {
  id: number
  name: string
}

type CategoriesResponse = Category[] | { categories?: Category[] }

const SellerServiceCreatePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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

  const { data: categoriesData } = useApiQuery<never, { id: number; name: string }[]>({
    endpoint: "/categories",
    queryKey: ["/categories"],
  })

  const categories = categoriesData ?? []

  const createMutation = useApiMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/seller/services"] })
      navigate("/seller/services")
    },
  })

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

    createMutation.mutate({
      endpoint: `/seller/services`,
      method: "POST",
      body: submitData,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-xl">
          <Link to="/seller/services">
            <FileText size={20} weight="bold" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Service</h1>
          <p className="text-sm text-muted-foreground mt-1">Add a new service to your offerings</p>
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
                    {categories.map((category: { id: number; name: string }) => (
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
                <Link to="/seller/services">Cancel</Link>
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-cyan-600 hover:bg-cyan-700"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Service"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SellerServiceCreatePage