import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, EnvelopeSimple, Key } from "@phosphor-icons/react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useApiMutation } from "@/services/useApiMutation"
import AuthShell from "../components/AuthShell"
import AuthTextField from "../components/AuthTextField"
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schema/authSchema"

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const forgotPasswordMutation = useApiMutation<ForgotPasswordFormValues, NoResponse>({
    onSuccess: (response, payload) => {
      toast.success(response.message || "Password reset token has been sent to your email.")
      navigate("/reset-password", {
        state: { email: payload.body?.email },
      })
    },
  })

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate({
      endpoint: "/forgot-password",
      method: "POST",
      body: values,
    })
  }

  return (
    <AuthShell
      header={
        <Button asChild variant="ghost" size="sm" className="ml-auto text-[#315173] hover:bg-[#dbeafe]">
          <Link to="/auth">
            <ArrowLeft className="size-4" weight="bold" />
            Login
          </Link>
        </Button>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1">
          <div className="flex size-9 items-center justify-center border border-[#c7dcff] bg-[#eaf3ff] text-[#1d4ed8]">
            <EnvelopeSimple className="size-4" weight="bold" />
          </div>
          <h1 className="text-2xl font-semibold tracking-normal">Reset your password</h1>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Enter your account email and we will send a reset token you can use on the next step.
          </p>
        </div>

        <AuthTextField
          id="forgot-email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button
          className="h-10 w-full justify-between bg-[#1d4ed8] px-3 text-white hover:bg-[#1e40af]"
          type="submit"
          disabled={forgotPasswordMutation.isPending}
        >
          <span className="flex items-center gap-2">
            <Key className="size-4" weight="bold" />
            {forgotPasswordMutation.isPending ? "Sending token..." : "Send reset token"}
          </span>
          <ArrowRight className="size-4" weight="bold" />
        </Button>
      </form>
    </AuthShell>
  )
}

export default ForgotPasswordPage
