export type Project = {
  title: string;
  role: string;
  year: string;
  description: string;
  stack: string[];
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    title: "Warehouse PWA Scanner",
    role: "Full-stack",
    year: "2025",
    description: "PWA для сборки/инвентаризации со сканером и быстрым UI под склад.",
    stack: ["PWA", "GAS", "TypeScript", "Google Sheets"],
    links: [
      { label: "Демо", href: "#" },
      { label: "Кейс", href: "#" },
    ],
  },
  {
    title: "AI Assistant Dashboard",
    role: "Backend + UI",
    year: "2024",
    description: "Панель с агентами и автоматизациями, фокус на скорости и удобстве.",
    stack: ["Next.js", "Postgres", "LLM", "Docker"],
    links: [{ label: "Кейс", href: "#" }],
  },
];
