import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-accent-700 text-white hover:bg-accent-800",
  secondary: "border border-border-strong bg-surface text-text hover:bg-neutral-100",
  danger: "bg-danger-700 text-white hover:bg-danger-800",
  ghost: "text-text-secondary hover:bg-neutral-100 hover:text-text",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className ?? ""}`} {...rest} />;
}

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className ?? ""}`} {...rest}>
      {children}
    </Link>
  );
}
