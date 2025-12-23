import Link from "next/link";
import { cn } from "@/lib/utils";

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-5">{children}</div>;
}

export function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("py-14 sm:py-20", className)}>{children}</section>;
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[rgb(var(--accent))]" />
      {children}
    </div>
  );
}

export function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.02]">
      {children}
    </h1>
  );
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 text-[15px] sm:text-base text-white/70 leading-relaxed">{children}</p>;
}

export function Pill({
  children,
  href,
  active,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  active?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs transition no-underline";
  const normal = "border-white/10 bg-white/5 text-white/70 hover:bg-white/10";
  const on = "border-white/20 bg-white/12 text-white";

  const cls = cn(base, active ? on : normal, className);

  return href ? <a href={href} className={cls}>{children}</a> : <span className={cls}>{children}</span>;
}



export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-sheen rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-soft hover:shadow-glow transition",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm transition active:scale-[0.99]";
  const primary =
    "bg-white text-black hover:bg-white/90";
  const ghost =
    "bg-white/5 text-white hover:bg-white/10 border border-white/10";
  return (
    <Link href={href} className={cn(base, variant === "primary" ? primary : ghost)}>
      {children}
    </Link>
  );
}

export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-white/8 to-transparent shadow-glow",
        className
      )}
    >
      <div className="card-sheen rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        {children}
      </div>
    </div>
  );
}
