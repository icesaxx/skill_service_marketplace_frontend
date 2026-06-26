import { useState } from "react"
import { Outlet } from "react-router-dom"
import SellerHeader from "@/components/seller/SellerHeader"
import SellerSidebar from "@/components/seller/SellerSidebar"

const SellerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <SellerHeader onOpenSidebar={() => setSidebarOpen(true)} />
      <main className="px-4 py-6 sm:px-6 lg:pl-[308px] lg:pr-8">
        <Outlet />
      </main>
    </div>
  )
}

export default SellerLayout