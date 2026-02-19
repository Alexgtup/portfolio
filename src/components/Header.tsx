import Link from "next/link";
import { site } from "@/data/site";
import { OpenCmdKButton } from "@/components/OpenCmdKButton";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-sm text-white/70 hover:text-white transition no-underline">
    {children}
  </Link>
);

export function Header() {
  const tg = `https://t.me/${site.contacts.telegram.replace("@", "")}`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur border-b border-white/10 bg-black/25">
      <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight no-underline">
          {site.name}<span className="text-white/50">.</span>
        </Link>

        <div className="hidden sm:flex items-center gap-3">
          <nav className="flex items-center gap-6">
            <NavLink href="/projects">Проекты</NavLink>
          </nav>

          <OpenCmdKButton />

          <a
            href={tg}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm transition active:scale-[0.99] bg-white/5 text-white hover:bg-white/10 border border-white/10 no-underline"
          >
            Написать
          </a>
        </div>
      </div>
      <div className="h-px hairline opacity-60" />
    </header>
  );
}
