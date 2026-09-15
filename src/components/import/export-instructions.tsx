import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileArchive,
  Info,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const helpUrl =
  "https://www.facebook.com/help/instagram/181231772500920?utm_source=chatgpt.com";

export function ExportInstructions({
  showBackLink = true,
}: {
  showBackLink?: boolean;
}) {
  return (
    <div className="space-y-8">
      {showBackLink ? (
        <Link
          href="/"
          className={buttonVariants({ variant: "ghost", className: "-ml-3" })}
        >
          <ArrowLeft aria-hidden="true" />
          Voltar ao início
        </Link>
      ) : null}

      <Card className="border-primary/20 bg-card/80">
        <CardHeader className="border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:size-12 sm:rounded-2xl">
              <FileArchive aria-hidden="true" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">
              Como gerar o arquivo do Instagram
            </CardTitle>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Faça este procedimento pelo aplicativo do Instagram. Os nomes dos
            menus podem variar um pouco conforme o sistema e a versão do
            aplicativo.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <ol className="space-y-5">
            {[
              <>
                Abra seu <strong>perfil</strong>.
              </>,
              <>
                Toque no menu <strong>☰</strong>.
              </>,
              <>
                Entre em <strong>Central de Contas</strong>.
              </>,
              <>
                Abra <strong>Suas informações e permissões</strong>.
              </>,
              <>
                Toque em <strong>Exportar suas informações</strong>.
              </>,
              <>
                Selecione <strong>Criar exportação</strong>.
              </>,
              <>Escolha sua conta do Instagram.</>,
              <>
                Selecione <strong>Exportar para o dispositivo</strong>.
              </>,
              <>
                Entre em <strong>Personalizar informações</strong>.
              </>,
              <>Desmarque todas as categorias.</>,
              <>
                Em <strong>Conexões</strong>, marque apenas{" "}
                <strong>Seguidores e seguindo</strong>.
              </>,
            ].map((step, index) => (
              <li
                key={index}
                className="flex gap-4 text-sm leading-6 text-foreground"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-xl border border-border/70 bg-muted/40 p-5">
            <h2 className="font-semibold">Configure a exportação</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li className="flex gap-3">
                <CheckCircle2
                  className="mt-1 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>
                  Intervalo de datas:{" "}
                  <strong className="text-foreground">Todo o período</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2
                  className="mt-1 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>
                  Formato: <strong className="text-foreground">JSON</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2
                  className="mt-1 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>
                  Qualidade da mídia:{" "}
                  <strong className="text-foreground">Baixa</strong>, pois a
                  aplicação não usará mídias
                </span>
              </li>
            </ul>
          </div>

          <ol start={13} className="mt-6 space-y-5">
            <li className="flex gap-4 text-sm leading-6 text-foreground">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                13
              </span>
              <span className="pt-0.5">
                Toque em <strong>Iniciar exportação</strong> ou{" "}
                <strong>Criar arquivos</strong>.
              </span>
            </li>
          </ol>

          <div className="mt-8 flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm leading-6 text-muted-foreground">
            <Info
              className="mt-1 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p>
              A Meta pode pedir sua senha para confirmar a solicitação. O
              processamento pode levar alguns minutos ou algumas horas. Quando
              estiver pronto, você receberá uma notificação ou e-mail. O
              download será feito pela mesma área da Central de Contas.
            </p>
          </div>

          <p className="mt-6 text-sm leading-6 text-muted-foreground">
            Esse é o procedimento indicado pela{" "}
            <a
              href={helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              Central de Ajuda do Instagram
              <ExternalLink
                className="ml-1 inline size-3.5"
                aria-hidden="true"
              />
            </a>
            .
          </p>
        </CardContent>
      </Card>

      <Link
        href="/import"
        className={buttonVariants({
          size: "lg",
          className: "w-full sm:w-auto",
        })}
      >
        Ir para Importação
      </Link>
    </div>
  );
}
