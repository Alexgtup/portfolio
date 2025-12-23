import Link from "next/link";
import Image from "next/image";
import { Section, H1, Lead, Card, Pill } from "@/components/ui";
import { getProjects } from "@/lib/projects";

function pick(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: { tag?: string | string[]; tech?: string | string[]; q?: string | string[] };
}) {
  const tag = pick(searchParams?.tag);
  const tech = pick(searchParams?.tech);
  const q = (pick(searchParams?.q) || "").trim();

  const all = await getProjects();

  // собрать списки фильтров
  const allTags = Array.from(
    new Set(all.flatMap((p) => p.tags ?? []).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "ru"));

  const allTech = Array.from(
    new Set(all.flatMap((p) => p.stack ?? []).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "ru"));

  // фильтрация
  const filtered = all.filter((p) => {
    const okTag = tag ? (p.tags ?? []).includes(tag) : true;
    const okTech = tech ? (p.stack ?? []).includes(tech) : true;
    const hay = `${p.title} ${p.description ?? ""}`.toLowerCase();
    const okQ = q ? hay.includes(q.toLowerCase()) : true;
    return okTag && okTech && okQ;
  });

  const hasFilter = Boolean(tag || tech || q);

  return (
    <Section className="pt-10 sm:pt-14">
      <div className="max-w-4xl">
        <H1>Проекты<span className="text-white/50">.</span></H1>
        <Lead>Фильтры по тегам и технологиям - чтобы заказчик быстро нашёл релевантные примеры.</Lead>

        {/* Search */}
        <form className="mt-6" action="/projects" method="GET">
          {tag ? <input type="hidden" name="tag" value={tag} /> : null}
          {tech ? <input type="hidden" name="tech" value={tech} /> : null}

          <input
            name="q"
            defaultValue={q}
            placeholder="Поиск по названию/описанию…"
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none text-sm"
          />
        </form>

        {/* Active filter line */}
        {hasFilter ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/70">
            <span>Активно:</span>
            {tag ? <Pill active>Тег: {tag}</Pill> : null}
            {tech ? <Pill active>Tech: {tech}</Pill> : null}
            {q ? <Pill active>Поиск: {q}</Pill> : null}
            <a href="/projects" className="text-sm text-white/70 hover:text-white transition no-underline ml-2">
              Сбросить
            </a>
          </div>
        ) : null}

        {/* Tags */}
        {allTags.length ? (
          <div className="mt-8">
            <div className="text-xs text-white/45 uppercase tracking-wide">Теги</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill href="/projects" active={!tag}>Все</Pill>
              {allTags.map((t) => (
                <Pill
                  key={t}
                  href={`/projects?tag=${encodeURIComponent(t)}${tech ? `&tech=${encodeURIComponent(tech)}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  active={tag === t}
                >
                  {t}
                </Pill>
              ))}
            </div>
          </div>
        ) : null}

        {/* Tech */}
        {allTech.length ? (
          <div className="mt-6">
            <div className="text-xs text-white/45 uppercase tracking-wide">Технологии</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill
                href={`/projects${tag ? `?tag=${encodeURIComponent(tag)}` : ""}${q ? `${tag ? "&" : "?"}q=${encodeURIComponent(q)}` : ""}`}
                active={!tech}
              >
                Все
              </Pill>
              {allTech.map((t) => (
                <Pill
                  key={t}
                  href={`/projects?tech=${encodeURIComponent(t)}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  active={tech === t}
                >
                  {t}
                </Pill>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* List */}
      <div className="mt-10 grid lg:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <Link key={p.slug} href={`/projects/${p.slug}`} className="no-underline">
            <Card className="p-0 overflow-hidden">
              {p.cover ? (
                <div className="relative h-48">
                  <Image src={p.cover} alt={p.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>
              ) : null}

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold tracking-tight">{p.title}</div>
                    <div className="mt-1 text-sm text-white/55">{p.role}</div>
                  </div>
                  <div className="text-xs text-white/45 font-mono">{p.year}</div>
                </div>

                <div className="mt-3 text-sm text-white/70 leading-relaxed">{p.description}</div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(p.tags ?? []).slice(0, 6).map((t) => (
                    <Pill key={t} href={`/projects?tag=${encodeURIComponent(t)}`} className="cursor-pointer">
                      {t}
                    </Pill>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(p.stack ?? []).slice(0, 8).map((s) => (
                    <Pill key={s} href={`/projects?tech=${encodeURIComponent(s)}`} className="cursor-pointer">
                      {s}
                    </Pill>
                  ))}
                </div>

                <div className="mt-6 text-sm text-white/70 hover:text-white transition">Открыть →</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 text-sm text-white/60">Ничего не найдено под выбранные фильтры.</div>
      ) : null}
    </Section>
  );
}
