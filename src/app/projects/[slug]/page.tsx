import { getProject } from "@/lib/projects";
import { Section, H1, Lead, Pill } from "@/components/ui";
import { Gallery } from "@/components/Gallery";

export const runtime = "nodejs";

type Params = { slug: string };

export default async function ProjectPage({
  params,
}: {
  params: Params | Promise<Params>;
}) {
  const { slug } = await Promise.resolve(params);
  const p = await getProject(slug);

  if (!p) {
    return (
      <Section className="pt-10 sm:pt-14">
        <H1>
          Не найдено<span className="text-white/50">.</span>
        </H1>
        <Lead>Проект с таким адресом пока не добавлен.</Lead>
      </Section>
    );
  }

  const images = p.images?.length ? p.images : p.cover ? [p.cover] : [];

  return (
    <Section className="pt-10 sm:pt-14">
      <div className="max-w-5xl">
        <H1>
          {p.title}
          <span className="text-white/50">.</span>
        </H1>

        {p.description ? <Lead>{p.description}</Lead> : null}

        {p.year || p.role ? (
          <div className="mt-4 text-sm text-white/55 flex flex-wrap gap-x-4 gap-y-1">
            {p.year ? <span>{p.year}</span> : null}
            {p.role ? <span>{p.role}</span> : null}
          </div>
        ) : null}

        <Gallery images={images.map((src) => ({ src, alt: p.title }))} />

        <div className="mt-8 flex flex-wrap gap-2">
          {(p.stack ?? []).map((s) => (
            <Pill key={s}>{s}</Pill>
          ))}
        </div>

        {p.links?.length ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {p.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-white/70 hover:text-white transition"
              >
                {l.label} →
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
