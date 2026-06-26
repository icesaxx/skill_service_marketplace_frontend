import { useState } from "react"
import { Outlet } from "react-router-dom"
import BuyerHeader from "@/components/buyer/BuyerHeader"
import BuyerSidebar from "@/components/buyer/BuyerSidebar"

const BuyerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <BuyerHeader onOpenSidebar={() => setSidebarOpen(true)} />
      <main className="px-4 py-6 sm:px-6 lg:pl-[308px] lg:pr-8">
        <Outlet />
      </main>
    </div>
  )
}

export default BuyerLayout
