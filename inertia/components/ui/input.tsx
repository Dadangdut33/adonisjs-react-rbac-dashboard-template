import { Eye, EyeOff } from 'lucide-react'
import * as React from 'react'
import { cn } from '~/lib/utils'

interface InputProps extends React.ComponentProps<'input'> {
  label?: string
  labelId?: string
  labelClassName?: string
  error?: React.ReactNode
}

function Input({ className, type, label, labelId, labelClassName, error, ...props }: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  const isPassword = type === 'password'
  const actualType = isPassword && showPassword ? 'text' : type

  const input = (
    <div className="space-y-1">
      <div className="relative">
        <input
          id={labelId}
          type={actualType}
          data-slot="input"
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-10 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            className
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff size={16} aria-label="Hide password" />
            ) : (
              <Eye size={16} aria-label="Show password" />
            )}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )

  if (!label) return input

  return (
    <div className="grid gap-2">
      <label
        htmlFor={labelId}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          labelClassName
        )}
      >
        {label}
        {props.required && <span className="text-destructive">*</span>}
      </label>
      {input}
    </div>
  )
}

export { Input }
