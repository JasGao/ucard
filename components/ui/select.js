import * as React from "react"
import { cn } from "@/lib/utils"

const Select = ({ value, onValueChange, disabled, children }) => (
  <select
    value={value}
    onChange={e => onValueChange(e.target.value)}
    disabled={disabled}
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    )}
  >
    {children}
  </select>
)

const SelectTrigger = React.forwardRef(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>{children}</div>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef((props, ref) => (
  <span ref={ref} {...props} />
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ children, ...props }, ref) => (
  <>{children}</>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ children, ...props }, ref) => (
  <option ref={ref} {...props}>{children}</option>
))
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } 