import { type ComponentProps } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AuthTextFieldProps = ComponentProps<"input"> & {
  id: string
  label: string
  placeholder: string
  error?: string
}

const AuthTextField = ({
  id,
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  error,
  ...props
}: AuthTextFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default AuthTextField
