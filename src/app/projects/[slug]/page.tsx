import Image from "next/image";
import { getProject } from "@/lib/projects";
import { Section, H1, Lead, Pill, Card } from "@/components/ui";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProject(slug);

  if (!p) {
    return (
      <Section className="pt-10 sm:pt-14">
        <H1>Не найдено<span className="text-white/50">.</span></H1>
        <Lead>Проект с таким адресом пока не добавлен.</Lead>
      </Section>
    );
  }

  return (
    <Section className="pt-10 sm:pt-14">
      <div className="max-w-4xl">
        <H1>{p.title}<span className="text-white/50">.</span></H1>
        {p.description ? <Lead>{p.description}</Lead> : null}

        {p.cover ? (
          <Card className="mt-10 p-0 overflow-hidden">
            <div className="relative h-[360px]">
              <Image src={p.cover} alt={p.title} fill className="object-cover" />
            </div>
          </Card>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2">
          {(p.stack ?? []).map((s) => <Pill key={s}>{s}</Pill>)}
        </div>

        {p.links?.length ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {p.links.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-white/70 hover:text-white transition">
                {l.label} →
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
