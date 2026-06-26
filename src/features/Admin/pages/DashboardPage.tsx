import { useApiQuery } from "@/services/useApiQuery"
import {
    Users,
    BookOpen,
    Wrench,
    CalendarCheck,
    CheckCircle,
    Clock,
    Prohibit,
    ArrowUpRight,
} from "@phosphor-icons/react"
import { dashboardAccent } from "@/lib/colorStyles"

interface DashboardStats {
    users: {
        total: number
        banned: number
        active: number
    }
    categories: { 
        total: number
    }
    services: {
        total: number
    }
    bookings: {
        total: number
        pending: number
        completed: number
    }
}

const StatCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 animate-pulse">
        <div className="flex items-start justify-between">
            <div className="space-y-3">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
    </div>
)

const DashboardPage = () => {
    const { data, isLoading, isError } = useApiQuery({
        endpoint: "/admin/dashboard-stats",
        queryKey: ["dashboard-stats"],
    })

    const stats = data as DashboardStats | undefined

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20">
                        <Prohibit className="w-8 h-8 text-red-500" weight="bold" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Failed to load dashboard
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Something went wrong while fetching your stats.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Overview of your platform statistics
                </p>
            </div>

            {/* Stats Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <StatCardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Users Card */}
                    <div className={`group relative bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 hover:shadow-lg ${dashboardAccent.admin.borderHover} transition-all duration-300`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Total Users
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                    {stats?.users.total ?? 0}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${dashboardAccent.admin.bg} ${dashboardAccent.admin.text} group-hover:scale-110 transition-transform duration-300`}>
                                <Users className="w-6 h-6" weight="duotone" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                                {stats?.users.active ?? 0} Active
                            </span>
                            <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                                <Prohibit className="w-3.5 h-3.5" weight="fill" />
                                {stats?.users.banned ?? 0} Banned
                            </span>
                        </div>
                    </div>

                    {/* Categories Card */}
                    <div className={`group relative bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 hover:shadow-lg ${dashboardAccent.admin.borderHover} transition-all duration-300`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Categories
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                    {stats?.categories.total ?? 0}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${dashboardAccent.admin.bg} ${dashboardAccent.admin.text} group-hover:scale-110 transition-transform duration-300`}>
                                <BookOpen className="w-6 h-6" weight="duotone" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center text-xs text-gray-400 dark:text-gray-500">
                            <ArrowUpRight className="w-3.5 h-3.5 mr-1" weight="bold" />
                            Service categories
                        </div>
                    </div>

                    {/* Services Card */}
                    <div className={`group relative bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 hover:shadow-lg ${dashboardAccent.admin.borderHover} transition-all duration-300`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Services
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                    {stats?.services.total ?? 0}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${dashboardAccent.admin.bg} ${dashboardAccent.admin.text} group-hover:scale-110 transition-transform duration-300`}>
                                <Wrench className="w-6 h-6" weight="duotone" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center text-xs text-gray-400 dark:text-gray-500">
                            <ArrowUpRight className="w-3.5 h-3.5 mr-1" weight="bold" />
                            Available services
                        </div>
                    </div>

                    {/* Bookings Card */}
                    <div className={`group relative bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 hover:shadow-lg ${dashboardAccent.admin.borderHover} transition-all duration-300`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Bookings
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                    {stats?.bookings.total ?? 0}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${dashboardAccent.admin.bg} ${dashboardAccent.admin.text} group-hover:scale-110 transition-transform duration-300`}>
                                <CalendarCheck className="w-6 h-6" weight="duotone" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                                {stats?.bookings.completed ?? 0} Done
                            </span>
                            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                <Clock className="w-3.5 h-3.5" weight="fill" />
                                {stats?.bookings.pending ?? 0} Pending
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Overview Section */}
            {!isLoading && !isError && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* User Activity Summary */}
                    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            User Activity
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Active Users</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                            style={{
                                                width: stats?.users.total
                                                    ? `${(stats.users.active / stats.users.total) * 100}%`
                                                    : "0%",
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[3ch] text-right">
                                        {stats?.users.active ?? 0}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Banned Users</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 rounded-full transition-all duration-500"
                                            style={{
                                                width: stats?.users.total
                                                    ? `${(stats.users.banned / stats.users.total) * 100}%`
                                                    : "0%",
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[3ch] text-right">
                                        {stats?.users.banned ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Status Summary */}
                    <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Booking Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Completed</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                            style={{
                                                width: stats?.bookings.total
                                                    ? `${(stats.bookings.completed / stats.bookings.total) * 100}%`
                                                    : "0%",
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[3ch] text-right">
                                        {stats?.bookings.completed ?? 0}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                            style={{
                                                width: stats?.bookings.total
                                                    ? `${(stats.bookings.pending / stats.bookings.total) * 100}%`
                                                    : "0%",
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[3ch] text-right">
                                        {stats?.bookings.pending ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardPage
