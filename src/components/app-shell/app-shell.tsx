import Link from "next/link";
import { BarChart3, Clock3, FileUp, Settings2 } from "lucide-react";
import type { ReactNode } from "react";

const navigation = [
  { href: "/import", label: "Importacao", icon: FileUp },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/history", label: "Historico", icon: Clock3 },
  { href: "/settings", label: "Configuracoes", icon: Settings2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="Instagram Matcher, inicio"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-transform group-hover:-rotate-3">
              IM
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-wide">
                Instagram Matcher
              </span>
              <span className="block text-xs text-muted-foreground">
                Instagram, sem login
              </span>
            </span>
          </Link>
          <nav
            aria-label="Navegacao principal"
            className="flex flex-wrap gap-1"
          >
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="min-h-[calc(100vh-89px)]">{children}</div>
      <footer className="border-t border-border/70 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Dados locais. Decisoes claras.</span>
          <span>Nenhum dado e enviado para um servidor.</span>
        </div>
      </footer>
    </div>
  );
}
