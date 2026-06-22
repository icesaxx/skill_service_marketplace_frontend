import { RouterProvider } from "react-router-dom"

import { Toaster } from "@/components/ui/sonner"
import router from "./routers/router.tsx"

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
