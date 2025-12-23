import Link from "next/link";

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-5">{children}</div>;
}

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
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
  const cls =
    variant === "primary"
      ? "bg-white text-black hover:bg-white/90"
      : "bg-white/5 text-white hover:bg-white/10 border border-white/10";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm transition ${cls}`}
    >
      {children}
    </Link>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:bg-white/[0.06] transition">
      {children}
    </div>
  );
}
