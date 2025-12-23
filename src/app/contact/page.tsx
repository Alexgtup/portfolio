import { Section, H1, Lead, Card, ButtonLink } from "@/components/ui";
import { site } from "@/data/site";

export default function ContactPage() {
  const { telegram } = site.contacts;

  return (
    <Section className="pt-10 sm:pt-14">
      <div className="max-w-3xl">
        <H1>Контакты<span className="text-white/50">.</span></H1>
        <Lead>Быстрее всего отвечаю в Telegram.</Lead>

        <div className="mt-10">
          <Card>
            <div className="text-sm text-white/55">Telegram</div>
            <div className="mt-2 font-medium">{telegram}</div>
            <div className="mt-4">
              <ButtonLink href={`https://t.me/${telegram.replace("@", "")}`}>Открыть</ButtonLink>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
