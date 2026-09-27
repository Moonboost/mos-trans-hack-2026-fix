import * as React from "react";
import { cn } from "@/lib/utils";

export function AuthInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={cn(
        "h-9 w-full rounded-md border border-(--outline) bg-(--card) px-3 text-[13px] text-(--on-bg-high) placeholder:text-(--on-bg-low)",
        "transition-colors outline-none",
        "focus:border-(--on-bg-high) focus:ring-2 focus:ring-(--state-focus)",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    />
  );
}

export function AuthLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      {...props}
      className={cn(
        "block text-[12px] font-medium text-(--on-bg-medium) mb-1.5",
        className
      )}
    />
  );
}

export function AuthError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 text-[12px] text-(--error) leading-snug">{children}</p>
  );
}

export function AuthSubmit({
  loading,
  children,
  ...props
}: React.ComponentProps<"button"> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "h-9 w-full rounded-md bg-(--on-bg-high) text-(--bg) text-[13px] font-medium",
        "transition-colors hover:opacity-90 active:translate-y-[0.5px]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        props.className
      )}
    >
      {loading ? "Подождите…" : children}
    </button>
  );
}
