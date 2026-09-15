import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  Download,
  FileArchive,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl">
          <Badge
            variant="secondary"
            className="mb-6 gap-2 px-3 py-1.5 text-xs uppercase tracking-[0.16em]"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            Analise com calma
          </Badge>
          <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl">
            Veja suas conexoes com mais clareza.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Importe o ZIP oficial do Instagram e entenda quem segue voce, quem
            voce segue e o que mudou entre exportacoes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/import"
              className={buttonVariants({ size: "lg", className: "h-11 px-5" })}
            >
              Comecar importacao
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-11 px-5",
              })}
            >
              Abrir ultimo snapshot
            </Link>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Nenhum login ou senha do Instagram sera solicitado.
          </p>
        </div>

        <Card className="border-primary/20 bg-card/80 shadow-xl shadow-primary/5">
          <CardHeader className="border-b border-border/70">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <FileArchive aria-hidden="true" />
            </div>
            <CardTitle className="text-xl">
              Seu arquivo fica no seu dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {[
              "O ZIP sera processado somente no navegador.",
              "Nenhum arquivo ou perfil sera enviado para um servidor.",
              "Os resultados representam o momento da exportacao, sem atualizacao em tempo real.",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 text-sm leading-6 text-muted-foreground"
              >
                <Check
                  className="mt-1 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </div>
            ))}
            <div className="flex items-start gap-3 border-t border-border/70 pt-5 text-sm leading-6 text-muted-foreground">
              <LockKeyhole
                className="mt-1 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>
                O Instagram Matcher nao acessa a conta, nao faz scraping e nao
                executa acoes no Instagram.
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section
        className="mt-20 border-t border-border/70 pt-8"
        aria-labelledby="export-instructions-title"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Antes de importar
          </p>
          <h2
            id="export-instructions-title"
            className="mt-2 text-2xl font-semibold tracking-tight"
          >
            Como obter seu ZIP do Instagram
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            A exportacao e solicitada no proprio Instagram. O Instagram Matcher
            nao acessa sua conta e nunca pede suas credenciais.
          </p>
        </div>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Download,
              title: "Abra a Central de Contas",
              description:
                "No Instagram, abra seu perfil, entre em Configuracoes e acesse a Central de Contas.",
            },
            {
              icon: FileArchive,
              title: "Solicite suas informacoes",
              description:
                "Escolha Suas informacoes e permissoes, depois Baixar suas informacoes. Selecione sua conta e o formato JSON.",
            },
            {
              icon: Clock3,
              title: "Baixe e volte aqui",
              description:
                "Quando a Meta preparar o arquivo, baixe o ZIP oficial e selecione-o na tela de Importacao.",
            },
          ].map(({ icon: Icon, title, description }, index) => (
            <li
              key={title}
              className="relative rounded-xl border border-border/70 bg-card/60 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Passo {index + 1}
                </span>
              </div>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ol>
        <Link
          href="/import/instructions"
          className={buttonVariants({
            variant: "outline",
            className: "mt-6",
          })}
        >
          Ver passo a passo detalhado
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
