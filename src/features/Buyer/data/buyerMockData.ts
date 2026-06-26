export type BuyerService = {
  id: number
  title: string
  seller: string
  category: string
  price: number
  deliveryTime: string
  rating: number
  reviews: number
  image: string
  tags: string[]
  description: string
}

export type BuyerOrder = {
  id: string
  service: string
  seller: string
  status: "in-progress" | "delivered" | "completed" | "revision"
  dueDate: string
  price: number
}

export type BuyerMessage = {
  id: number
  seller: string
  service: string
  preview: string
  time: string
  unread: boolean
}

export type BuyerReview = {
  id: number
  service: string
  seller: string
  rating: number
  comment: string
  date: string
}

export const buyerServices: BuyerService[] = [
  {
    id: 1,
    title: "Modern business landing page",
    seller: "Aung Creative",
    category: "Web Design",
    price: 180000,
    deliveryTime: "5 days",
    rating: 4.9,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    tags: ["Responsive", "Figma", "React"],
    description: "A clean landing page for service businesses, startups, and local brands.",
  },
  {
    id: 2,
    title: "Social media campaign kit",
    seller: "Moe Studio",
    category: "Marketing",
    price: 95000,
    deliveryTime: "3 days",
    rating: 4.8,
    reviews: 84,
    image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&w=900&q=80",
    tags: ["Facebook", "Instagram", "Copywriting"],
    description: "Branded post templates, captions, and ad copy for one focused campaign.",
  },
  {
    id: 3,
    title: "Product photo retouching",
    seller: "Pixel Lab",
    category: "Photography",
    price: 65000,
    deliveryTime: "2 days",
    rating: 4.7,
    reviews: 61,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80",
    tags: ["Ecommerce", "Color", "Background"],
    description: "Polished product images ready for marketplace listings and social posts.",
  },
  {
    id: 4,
    title: "Accounting setup consultation",
    seller: "Thura Finance",
    category: "Business",
    price: 120000,
    deliveryTime: "1 day",
    rating: 4.9,
    reviews: 39,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
    tags: ["Consulting", "Tax", "Templates"],
    description: "A practical setup session for small business expense and revenue tracking.",
  },
]

export const buyerOrders: BuyerOrder[] = [
  {
    id: "ORD-1042",
    service: "Modern business landing page",
    seller: "Aung Creative",
    status: "in-progress",
    dueDate: "Jun 26, 2026",
    price: 180000,
  },
  {
    id: "ORD-1038",
    service: "Social media campaign kit",
    seller: "Moe Studio",
    status: "delivered",
    dueDate: "Jun 22, 2026",
    price: 95000,
  },
  {
    id: "ORD-1029",
    service: "Product photo retouching",
    seller: "Pixel Lab",
    status: "completed",
    dueDate: "Jun 12, 2026",
    price: 65000,
  },
]

export const buyerMessages: BuyerMessage[] = [
  {
    id: 1,
    seller: "Aung Creative",
    service: "Modern business landing page",
    preview: "I shared the first homepage section for your review.",
    time: "10:24 AM",
    unread: true,
  },
  {
    id: 2,
    seller: "Moe Studio",
    service: "Social media campaign kit",
    preview: "The final captions are ready. Please check the tone.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 3,
    seller: "Thura Finance",
    service: "Accounting setup consultation",
    preview: "Send your current sheet when you have time.",
    time: "Jun 20",
    unread: false,
  },
]

export const buyerReviews: BuyerReview[] = [
  {
    id: 1,
    service: "Product photo retouching",
    seller: "Pixel Lab",
    rating: 5,
    comment: "Fast delivery and the photos looked much cleaner for my shop.",
    date: "Jun 14, 2026",
  },
  {
    id: 2,
    service: "Logo cleanup package",
    seller: "Moe Studio",
    rating: 4,
    comment: "Good result after one small revision.",
    date: "May 29, 2026",
  },
]

export const formatMmk = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MMK",
    maximumFractionDigits: 0,
  }).format(amount)
