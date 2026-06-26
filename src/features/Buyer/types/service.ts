export interface BuyerServiceResponse {
  id: number
  user_id: number
  category_id: number
  title: string
  description: string
  price: string
  estimated_days: string
  tags: string[]
  image: string
  created_at: string
  updated_at: string
  average_rating: number
  total_reviews: number
  image_url: string
  reviews: unknown[]
}