export interface OrderService {
  id: number
  category_id: number
  title: string
  description: string
  price: string
  estimated_days: string
  tags: string[]
  image: string | null
  image_url: string | null
}

export interface OrderSeller {
  id: number
  name: string
  email: string
  role: string
  status: string
  phone_number?: string | null
  company_name?: string | null
  position?: string | null
  address?: string | null
  avatar?: string | null
  avatar_url?: string | null
  cover_photo?: string | null
  cover_photo_url?: string | null
  bio?: string | null
  is_approved: boolean
  approval_status: string
  created_at: string
  updated_at: string
}

export interface BuyerOrder {
  id: number
  service_id: number
  buyer_id: number
  seller_id: number
  status: "pending" | "in-progress" | "delivered" | "completed" | "revision" | "cancelled"
  payment_method?: string | null
  payment_status?: string | null
  payment_proof?: string | null
  payment_proof_url?: string | null
  buyer_accepted_at?: string | null
  paid_at?: string | null
  due_date: string
  order_note?: string
  service: OrderService
  seller: OrderSeller
  review: unknown | null
  created_at: string
  updated_at: string
}
