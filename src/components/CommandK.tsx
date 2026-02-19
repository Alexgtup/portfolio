"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

type MiniProject = {
  slug: string;
  title: string;
  description?: string;
};

type Item = { label: string; hint?: string; href: string };

export function CommandK({ projects }: { projects: MiniProject[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const base: Item[] = useMemo(
    () => [
      { label: "Главная", href: "/" },
      { label: "Проекты", href: "/projects", hint: "список + фильтры" },
      { label: "Контакты", href: "/contact", hint: "telegram" },
    ],
    []
  );

  const items: Item[] = useMemo(() => {
    const p = projects.map((x) => ({
      label: x.title,
      hint: x.description || "",
      href: `/projects/${x.slug}`,
    }));
    return [...base, ...p];
  }, [base, projects]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items.slice(0, 12);
    return items
      .filter((it) => `${it.label} ${it.hint ?? ""}`.toLowerCase().includes(s))
      .slice(0, 12);
  }, [items, q]);

  const close = () => {
    setOpen(false);
    setQ("");
    setActive(0);
  };

  const go = (href: string) => {
    close();
    router.push(href);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      const isEsc = e.key === "Escape";

      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (isEsc) close();
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((v) => Math.min(v + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((v) => Math.max(v - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const hit = filtered[active];
        if (hit) go(hit.href);
      }
    };

    const onOpen = () => setOpen(true);

    window.addEventListener("keydown", onKey);
    window.addEventListener("cmdk:open", onOpen as any);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("cmdk:open", onOpen as any);
    };
  }, [open, filtered, active]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  if (!open) return null;

  return (
    <div className="cmdk-overlay" role="dialog" aria-modal="true">
      <button className="cmdk-backdrop" onClick={close} aria-label="close" />

      <div className="cmdk">
        <div className="cmdk-top">
          <Search size={16} className="text-white/60" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="поиск по проектам и страницам"
            className="cmdk-input"
          />
          <div className="cmdk-kbd">esc</div>
        </div>

        <div className="cmdk-list">
          {filtered.map((it, i) => (
            <button
              key={it.href + it.label}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(it.href)}
              className={["cmdk-item", i === active ? "is-active" : ""].join(" ")}
            >
              <div className="min-w-0">
                <div className="cmdk-label">{it.label}</div>
                {it.hint ? <div className="cmdk-hint">{it.hint}</div> : null}
              </div>
              <ArrowRight size={16} className="text-white/55" />
            </button>
          ))}

          {!filtered.length ? (
            <div className="cmdk-empty">ничего не найдено</div>
          ) : null}
        </div>

        <div className="cmdk-bottom">
          <span className="text-white/50 text-xs">cmd+k</span>
          <span className="text-white/35 text-xs">стрелки - enter</span>
        </div>
      </div>
    </div>
  );
}
