import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import AuthShell from "../components/AuthShell"
import LoginForm from "../components/LoginForm"
import RegisterForm from "../components/RegisterForm"

type AuthMode = "login" | "register"

const authModes: Array<{ value: AuthMode; label: string }> = [
  { value: "login", label: "Login" },
  { value: "register", label: "Register" },
]

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>("login")

  return (
    <AuthShell
      header={
        <div className="ml-auto grid grid-cols-2 border border-[#c7dcff] bg-[#eaf3ff] p-1">
          {authModes.map((authMode) => (
            <Button
              key={authMode.value}
              type="button"
              variant={mode === authMode.value ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 min-w-24",
                mode === authMode.value && "bg-[#1d4ed8] text-white hover:bg-[#1e40af]",
                mode !== authMode.value && "bg-transparent text-[#315173] hover:bg-[#dbeafe]"
              )}
              onClick={() => setMode(authMode.value)}
            >
              {authMode.label}
            </Button>
          ))}
        </div>
      }
    >
      {mode === "login" ? <LoginForm /> : <RegisterForm />}
    </AuthShell>
  )
}

export default AuthPage
