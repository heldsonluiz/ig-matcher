"use client";

import { useState } from "react";
import { Check, CircleHelp, Copy, ExternalLink, Heart } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

const pixKey = "89ea2a34-fcba-4b8b-b267-af8341ff4827";
const newIssueUrl = "https://github.com/heldsonluiz/unveil/issues/new";

export function ProjectActions() {
  const [supportOpen, setSupportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  async function copyPixKey() {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setCopyStatus("idle");
          setSupportOpen(true);
        }}
      >
        <Heart aria-hidden="true" />
        Apoiar
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)}>
        <CircleHelp aria-hidden="true" />
        Ajuda
      </Button>

      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent>
          <DialogTitle>Apoie o Unveil</DialogTitle>
          <DialogDescription>
            O Unveil é um projeto open source. Se ele foi útil para você e
            quiser contribuir com qualquer valor, use a chave Pix abaixo.
          </DialogDescription>
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="mb-1 text-xs text-muted-foreground">
              Chave Pix aleatória
            </p>
            <code className="block break-all text-sm text-foreground">
              {pixKey}
            </code>
          </div>
          <div
            aria-live="polite"
            className="min-h-5 text-xs text-muted-foreground"
          >
            {copyStatus === "copied" && "Chave Pix copiada."}
            {copyStatus === "error" &&
              "Não foi possível copiar automaticamente. Selecione a chave acima."}
          </div>
          <DialogFooter>
            <Button onClick={() => void copyPixKey()}>
              {copyStatus === "copied" ? (
                <Check aria-hidden="true" />
              ) : (
                <Copy aria-hidden="true" />
              )}
              {copyStatus === "copied" ? "Chave copiada" : "Copiar chave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogTitle>Ajuda e limitações</DialogTitle>
          <DialogDescription>
            Encontrou um problema? Abra uma issue no GitHub e descreva o que
            aconteceu. Não anexe seu ZIP nem dados pessoais.
          </DialogDescription>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              As contagens refletem o ZIP e podem divergir do Instagram quando
              contas são excluídas, suspensas, desativadas ou mudam de nome.
            </li>
            <li>
              Os dados não são atualizados automaticamente. Importe um ZIP mais
              recente para atualizar a análise.
            </li>
          </ul>
          <DialogFooter>
            <a
              href={newIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants()}
            >
              <ExternalLink aria-hidden="true" />
              Reportar um bug
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
