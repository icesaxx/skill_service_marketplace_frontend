export const dashboardAccent = {
  admin: {
    text: "text-blue-600 dark:text-blue-400",
    textStrong: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    softBg: "bg-blue-500/10",
    borderHover: "hover:border-blue-200 dark:hover:border-blue-800/50",
  },
  buyer: {
    text: "text-emerald-600 dark:text-emerald-400",
    textStrong: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    softBg: "bg-emerald-500/10",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  seller: {
    text: "text-cyan-600 dark:text-cyan-400",
    textStrong: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    softBg: "bg-cyan-500/10",
    borderHover: "hover:border-cyan-300 dark:hover:border-cyan-700",
  },
} as const

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  done: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",

  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  unpaid: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  delivered: "bg-amber-500/10 text-amber-700 dark:text-amber-300",

  accepted: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "in-progress": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-300",

  inactive: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  refunded: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  unknown: "bg-slate-500/10 text-slate-700 dark:text-slate-300",

  revision: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-300",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-300",
  canceled: "bg-red-500/10 text-red-700 dark:text-red-300",
  failed: "bg-red-500/10 text-red-700 dark:text-red-300",
  banned: "bg-red-500/10 text-red-700 dark:text-red-300",
}

export const getStatusColor = (status: string | null | undefined) => {
  const key = status?.toLowerCase().replace(/\s+/g, "_") ?? "unknown"
  return statusColors[key] ?? statusColors.unknown
}

export const getStatusTextColor = (status: string | null | undefined) => {
  return getStatusColor(status)
    .replace(/bg-[^\s]+/g, "")
    .trim()
}
