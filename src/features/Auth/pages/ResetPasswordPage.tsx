import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Key, LockKey } from "@phosphor-icons/react"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useApiMutation } from "@/services/useApiMutation"
import AuthShell from "../components/AuthShell"
import AuthTextField from "../components/AuthTextField"
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schema/authSchema"

type ResetPasswordLocationState = {
  email?: string
}

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const emailFromState = (location.state as ResetPasswordLocationState | null)?.email ?? ""
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromState,
      token: "",
      password: "",
      password_confirmation: "",
    },
  })

  const resetPasswordMutation = useApiMutation<ResetPasswordFormValues, NoResponse>({
    onSuccess: (response) => {
      toast.success(response.message || "Password reset successfully. Please login again.")
      navigate("/auth", { replace: true })
    },
    onError: () => {
      toast.error("Unable to reset password. Please check your token and try again.")
    },
  })

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetPasswordMutation.mutate({
      endpoint: "/reset-password",
      method: "POST",
      body: values,
    })
  }

  return (
    <AuthShell
      header={
        <Button asChild variant="ghost" size="sm" className="ml-auto text-[#315173] hover:bg-[#dbeafe]">
          <Link to="/forgot-password">
            <ArrowLeft className="size-4" weight="bold" />
            Back
          </Link>
        </Button>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1">
          <div className="flex size-9 items-center justify-center border border-[#c7dcff] bg-[#eaf3ff] text-[#1d4ed8]">
            <LockKey className="size-4" weight="bold" />
          </div>
          <h1 className="text-2xl font-semibold tracking-normal">Create a new password</h1>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Paste the token from your email, set a new password, then sign in with your updated credentials.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthTextField
            id="reset-email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <AuthTextField
            id="reset-token"
            label="Reset token"
            placeholder="Paste token"
            autoComplete="one-time-code"
            error={errors.token?.message}
            {...register("token")}
          />
          <AuthTextField
            id="reset-password"
            label="New password"
            type="password"
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <AuthTextField
            id="reset-password-confirmation"
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={errors.password_confirmation?.message}
            {...register("password_confirmation")}
          />
        </div>

        <Button
          className="h-10 w-full justify-between bg-[#1d4ed8] px-3 text-white hover:bg-[#1e40af]"
          type="submit"
          disabled={resetPasswordMutation.isPending}
        >
          <span className="flex items-center gap-2">
            <Key className="size-4" weight="bold" />
            {resetPasswordMutation.isPending ? "Updating password..." : "Reset password"}
          </span>
          <ArrowRight className="size-4" weight="bold" />
        </Button>
      </form>
    </AuthShell>
  )
}

export default ResetPasswordPage
