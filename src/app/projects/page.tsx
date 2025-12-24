import Link from "next/link";
import Image from "next/image";
import { Section, H1, Lead, Card, Pill } from "@/components/ui";
import { getProjects } from "@/lib/projects";

type SP = {
  tag?: string | string[];
  tech?: string | string[];
  q?: string | string[];
};

const pick = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<SP> | SP;
}) {
  const sp = searchParams ? await Promise.resolve(searchParams) : {};
  const tag = pick(sp.tag);
  const tech = pick(sp.tech);
  const q = pick(sp.q).trim().toLowerCase();

  const projects = await getProjects();

  const filtered = projects.filter((p) => {
    const byTag = tag ? (p.tags ?? []).includes(tag) : true;
    const byTech = tech ? (p.stack ?? []).includes(tech) : true;
    const hay = `${p.title ?? ""} ${p.description ?? ""} ${(p.tags ?? []).join(" ")} ${(p.stack ?? []).join(" ")}`.toLowerCase();
    const byQ = q ? hay.includes(q) : true;
    return byTag && byTech && byQ;
  });

  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags ?? []))).sort((a, b) => a.localeCompare(b));
  const allTech = Array.from(new Set(projects.flatMap((p) => p.stack ?? []))).sort((a, b) => a.localeCompare(b));

  const qs = (next: Partial<SP>) => {
    const params = new URLSearchParams();
    const nextTag = next.tag ?? (tag || undefined);
    const nextTech = next.tech ?? (tech || undefined);
    const nextQ = next.q ?? (q || undefined);

    if (nextTag) params.set("tag", String(nextTag));
    if (nextTech) params.set("tech", String(nextTech));
    if (nextQ) params.set("q", String(nextQ));

    const s = params.toString();
    return s ? `/projects?${s}` : `/projects`;
  };

  return (
    <Section className="pt-10 sm:pt-14">
      <div className="max-w-5xl">
        <H1>
          Проекты<span className="text-white/50">.</span>
        </H1>
        <Lead>Скрины, роль, стек и короткий итог - без воды.</Lead>

        <div className="mt-8 grid gap-6">
          <Card className="p-5">
            <div className="grid gap-5">
              <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center">
                <div className="text-sm text-white/70">Поиск</div>
                <Link href="/projects" className="text-sm text-white/60 hover:text-white transition">
                  Сбросить →
                </Link>
              </div>

              <form action="/projects" method="get" className="grid sm:grid-cols-[1fr_auto] gap-3">
                <input type="hidden" name="tag" value={tag} />
                <input type="hidden" name="tech" value={tech} />

                <input
                  defaultValue={q}
                  name="q"
                  placeholder="Поиск по названию / описанию / стеку"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-white/25"
                />
                <button className="rounded-xl px-4 py-2 text-sm bg-white text-black hover:bg-white/90 transition">
                  Найти
                </button>
              </form>

              <div className="grid gap-3">
                <div className="text-sm text-white/70">Теги</div>
                <div className="flex flex-wrap gap-2">
                  <Link href={qs({ tag: "" as any })} className={tag ? "opacity-60 hover:opacity-100 transition" : ""}>
                    <Pill>Все</Pill>
                  </Link>
                  {allTags.map((t) => (
                    <Link key={t} href={qs({ tag: t })} className={tag === t ? "" : "opacity-60 hover:opacity-100 transition"}>
                      <Pill>{t}</Pill>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                <div className="text-sm text-white/70">Технологии</div>
                <div className="flex flex-wrap gap-2">
                  <Link href={qs({ tech: "" as any })} className={tech ? "opacity-60 hover:opacity-100 transition" : ""}>
                    <Pill>Все</Pill>
                  </Link>
                  {allTech.map((t) => (
                    <Link key={t} href={qs({ tech: t })} className={tech === t ? "" : "opacity-60 hover:opacity-100 transition"}>
                      <Pill>{t}</Pill>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4">
            {filtered.map((p) => {
              const cover = p.cover || (p.images?.[0] ?? undefined);

              return (
                <Card key={p.slug} className="p-5">
                  <div className="grid sm:grid-cols-[220px_1fr_auto] gap-5 items-start">
                    {cover ? (
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] aspect-[16/10]">
                        <Image
                          src={cover}
                          alt={p.title}
                          fill
                          sizes="220px"
                          className="object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] aspect-[16/10]" />
                    )}

                    <div className="min-w-0">
                      <div className="text-lg font-semibold">{p.title}</div>
                      {p.description ? <div className="mt-2 text-sm text-white/65">{p.description}</div> : null}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(p.stack ?? []).slice(0, 10).map((s) => (
                          <Pill key={s}>{s}</Pill>
                        ))}
                      </div>
                    </div>

                    <Link href={`/projects/${p.slug}`} className="shrink-0 text-sm text-white/70 hover:text-white transition">
                      Открыть →
                    </Link>
                  </div>
                </Card>
              );
            })}

            {!filtered.length ? (
              <Card className="p-6 text-white/60">Ничего не найдено по текущим фильтрам.</Card>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}
