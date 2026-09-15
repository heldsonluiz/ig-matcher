"use client";

import { useState } from "react";
import { deleteSnapshotDatabase } from "@/features/snapshots/repository";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";

export function ClearLocalData() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function clearData() {
    if (confirmation !== "APAGAR") return;
    setBusy(true);
    setError(false);
    try {
      await deleteSnapshotDatabase();
      window.location.replace("/");
    } catch {
      setBusy(false);
      setError(true);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setConfirmation("");
          setError(false);
          setOpen(true);
        }}
      >
        <Trash aria-hidden="true" />
        Apagar dados locais
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!busy) setOpen(next);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogTitle>Apagar todos os dados locais?</DialogTitle>
          <DialogDescription>
            A importação atual será apagada deste navegador. Seu ZIP original
            não será alterado. Esta ação não pode ser desfeita.
          </DialogDescription>
          <label htmlFor="clear-confirmation" className="text-sm font-medium">
            Digite APAGAR para confirmar
          </label>
          <Input
            id="clear-confirmation"
            value={confirmation}
            disabled={busy}
            autoComplete="off"
            onChange={(event) => setConfirmation(event.target.value)}
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              Não foi possível apagar todos os dados locais. Tente novamente.
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={busy || confirmation !== "APAGAR"}
              onClick={() => void clearData()}
            >
              {busy ? "Apagando..." : "Apagar definitivamente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
