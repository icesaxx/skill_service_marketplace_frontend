export interface BuyerBookingsStats {
  total: number
  pending: number
  accepted: number
  in_progress: number
  completed: number
  rejected: number
  cancelled: number
  active: number
  due_today: number
  overdue: number
}

export interface BuyerReviewsStats {
  given: number
  available_to_review: number
}

export interface BuyerSavedStats {
  total: number
}

export interface BuyerStatsResponse {
  bookings: BuyerBookingsStats
  reviews: BuyerReviewsStats
  saved_services: BuyerSavedStats
  saved_sellers: BuyerSavedStats
}