export interface ServiceSeller {
  id: number
  name: string
  email: string
  role: string
  avatar: string | null
  avatar_url: string | null
  cover_photo: string | null
  cover_photo_url: string | null
  bio: string | null
}

export interface ServiceCategory {
  id: number
  name: string
}

export interface ServiceReview {
  id: number
  booking_id: number
  buyer_id: number
  seller_id: number
  buyer?: {
    id: number
    name: string
    email?: string
    avatar_url?: string | null
  }
  buyer_name?: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
  laravel_through_key: number
}

export interface BuyerServiceDetailResponse {
  id: number
  user_id: number
  seller: ServiceSeller
  category: ServiceCategory
  title: string
  description: string
  price: string
  estimated_days: string
  tags: string[]
  image: string | null
  image_url: string | null
  average_rating: number
  total_reviews: number
  reviews: ServiceReview[]
  is_saved: boolean
  created_at: string
  updated_at: string
}
