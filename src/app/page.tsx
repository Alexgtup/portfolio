import Image from "next/image";
import Link from "next/link";
import { Section, Kicker, H1, Lead, Pill, GlassCard } from "@/components/ui";
import { site } from "@/data/site";
import { getProjects } from "@/lib/projects";

export default async function Home() {
  const projects = await getProjects();
  const tg = `https://t.me/${site.contacts.telegram.replace("@", "")}`;

  return (
    <>
      <Section className="pt-12 sm:pt-16">
        <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-8 lg:gap-10 items-start">
          {/* Left */}
          <div className="max-w-3xl">
            <Kicker>{site.tagline}</Kicker>

            <H1>
              {site.heroTitle}
              <span className="text-white/50">.</span>
            </H1>

            <Lead>{site.heroLead}</Lead>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm transition active:scale-[0.99] bg-white text-black hover:bg-white/90 no-underline"
              >
                Смотреть проекты
              </Link>

              <a
                href={tg}
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm transition active:scale-[0.99] bg-white/5 text-white hover:bg-white/10 border border-white/10 no-underline"
              >
                Написать
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {site.pills.map((x) => (
                <Pill key={x} href="#projects">{x}</Pill>
              ))}
            </div>

          </div>

          {/* Right */}
          <GlassCard className="lg:sticky lg:top-24">
            <div className="text-sm text-white/55">Технологии</div>

            <div className="mt-4 grid gap-4">
              {Object.entries(site.stack).map(([group, items]) => (
                <div key={group}>
                  <div className="text-xs text-white/45 uppercase tracking-wide">{group}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {items.map((t) => (
                      <Pill key={t} href={`/projects?tech=${encodeURIComponent(t)}`}>{t}</Pill>
                    ))}

                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5 grid grid-cols-3 gap-3">
              {site.stats.map((s) => (
                <div key={s.label}>
                  <div className="text-xs text-white/45">{s.label}</div>
                  <div className="mt-1 text-sm text-white/80">{s.value}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Featured projects */}
        <div className="mt-12 grid md:grid-cols-2 gap-4">
          {projects.slice(0, 2).map((p) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className="no-underline">
              <GlassCard className="p-[1px]">
                <div className="rounded-2xl overflow-hidden">
                  {p.cover ? (
                    <div className="relative h-52">
                      <Image src={p.cover} alt={p.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
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

                    <div className="mt-5 flex flex-wrap gap-2">
                      {(p.stack ?? []).slice(0, 8).map((s) => (
                        <Pill key={s}>{s}</Pill>
                      ))}
                    </div>

                    <div className="mt-6 text-sm text-white/70 hover:text-white transition">
                      Открыть →
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </Section>

      {/* Lower blocks - без англ/SEO/версий */}
      <Section className="pt-0">
        <div className="grid lg:grid-cols-3 gap-4">
          <GlassCard>
            <div className="text-sm text-white/55">Как оформлено</div>
            <div className="mt-2 text-lg font-semibold tracking-tight">Коротко и по делу</div>
            <div className="mt-2 text-sm text-white/70 leading-relaxed">
              Задача, роль, что было важно, скрины и итог - без “воды” и лишних обещаний.
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-sm text-white/55">Что ценю</div>
            <div className="mt-2 text-lg font-semibold tracking-tight">Стабильность</div>
            <div className="mt-2 text-sm text-white/70 leading-relaxed">
              Предсказуемое поведение, аккуратные детали и скорость в реальной работе.
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-sm text-white/55">Формат</div>
            <div className="mt-2 text-lg font-semibold tracking-tight">Проекты, которые живут</div>
            <div className="mt-2 text-sm text-white/70 leading-relaxed">
              Удобно развивать дальше - без переписываний “с нуля” и ломки процессов.
            </div>
          </GlassCard>
        </div>
      </Section>
    </>
  );
}
