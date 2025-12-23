import Link from "next/link";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="text-sm text-white/70 hover:text-white transition"
  >
    {children}
  </Link>
);

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur border-b border-white/10 bg-black/30">
      <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          Alex<span className="text-white/50">.</span>
        </Link>
        <nav className="flex items-center gap-6">
          <NavLink href="/projects">Проекты</NavLink>
          <NavLink href="/contact">Контакты</NavLink>
        </nav>
      </div>
    </header>
  );
}
