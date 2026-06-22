import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, UserPlus } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useApiMutation } from "@/services/useApiMutation"
import { registerSchema, type RegisterFormValues } from "../schema/authSchema"
import AuthTextField from "./AuthTextField"

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  })

  const registerMutation = useApiMutation<RegisterFormValues, NoResponse>({
    onSuccess: (response) => {
      toast.success(response.message || "Account created successfully")
      reset()
    },
  })

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate({
      endpoint: "/register",
      method: "POST",
      body: values,
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-1">
        <div className="flex size-9 items-center justify-center border border-[#c7dcff] bg-[#eaf3ff] text-[#1d4ed8]">
          <UserPlus className="size-4" weight="bold" />
        </div>
        <h1 className="text-2xl font-semibold tracking-normal">Join the marketplace</h1>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          Create a hiring or service-provider profile to post jobs, submit proposals, and build trusted work history.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AuthTextField
          id="register-name"
          label="Name"
          placeholder="Zin Min Latt"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <AuthTextField
          id="register-email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthTextField
          id="register-password"
          label="Password"
          type="password"
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <AuthTextField
          id="register-password-confirmation"
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
        disabled={registerMutation.isPending}
      >
        <span className="flex items-center gap-2">
          <UserPlus className="size-4" weight="bold" />
          {registerMutation.isPending ? "Creating account..." : "Create account"}
        </span>
        <ArrowRight className="size-4" weight="bold" />
      </Button>
    </form>
  )
}

export default RegisterForm
