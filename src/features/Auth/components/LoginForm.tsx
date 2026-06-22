import Cookies from "js-cookie"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, LockKey, SignIn } from "@phosphor-icons/react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useApiMutation } from "@/services/useApiMutation"
import { useAuthStore } from "@/stores/userStore"
import { loginSchema, type LoginFormValues } from "../schema/authSchema"
import AuthTextField from "./AuthTextField"

type AuthUser = {
  id: number
  typ?: string
  role?: string
  name: string
  email: string
  profile_bio?: string | null
  profile?: string
  sub?: string
  created_at?: string
  updated_at?: string
}

type LoginResponse = {
  token?: string
  data?: AuthUser
}

const LoginForm = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const loginMutation = useApiMutation<LoginFormValues, LoginResponse>({
    onSuccess: (response) => {
      // API returns: { success, message, token, data: { id, name, email, role, ... } }
      const token = response.token
      const user = response.data as AuthUser | undefined
      const role = (user?.role ?? "").toLowerCase()

      if (token) {
        Cookies.set("ssm_token", token)
      }

      if (user) {
        setUser(user)
      }

      toast.success(response.message || "Signed in successfully")

      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true })
        return
      }

      if (role === "buyer") {
        navigate("/buyer/dashboard", { replace: true })
        return
      }

      if (role === "seller") {
        navigate("/seller/dashboard", { replace: true })
        return
      }

      navigate("/auth", { replace: true })
    },
    onError: () => {
      toast.error("Login failed. Please check your credentials.")
    },
  })

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate({
      endpoint: "/login",
      method: "POST",
      body: values,
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-1">
        <div className="flex size-9 items-center justify-center border border-[#c7dcff] bg-[#eaf3ff] text-[#1d4ed8]">
          <SignIn className="size-4" weight="bold" />
        </div>
        <h1 className="text-2xl font-semibold tracking-normal">Continue your work</h1>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Sign in to review job posts, proposals, contracts, and messages from your marketplace workspace.
        </p>
      </div>

      <div className="space-y-4">
        <AuthTextField
          id="login-email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthTextField
          id="login-password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input className="size-3.5 border border-input accent-foreground" type="checkbox" />
          Remember me
        </label>
        <button className="font-medium text-foreground underline-offset-4 hover:underline" type="button">
          Forgot password?
        </button>
      </div>

      <Button
        className="h-10 w-full justify-between bg-[#1d4ed8] px-3 text-white hover:bg-[#1e40af]"
        type="submit"
        disabled={loginMutation.isPending}
      >
        <span className="flex items-center gap-2">
          <LockKey className="size-4" weight="bold" />
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </span>
        <ArrowRight className="size-4" weight="bold" />
      </Button>
    </form>
  )
}

export default LoginForm
