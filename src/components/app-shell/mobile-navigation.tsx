"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, FileUp, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ClearLocalData } from "./clear-local-data";
import { ProjectActions } from "./project-actions";

const navigation = [
  { href: "/import", label: "Importação", icon: FileUp },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Abrir menu"
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden="true" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-4 translate-y-0" showCloseButton>
          <DialogTitle>Menu</DialogTitle>
          <nav aria-label="Menu móvel" className="grid gap-2">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-lg border px-3 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Icon className="size-4 text-primary" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div
            role="group"
            aria-label="Ações do menu"
            className="flex flex-col items-stretch border-t pt-3 [&>div]:w-full [&_button]:w-full [&_button]:justify-start"
          >
            <ProjectActions />
            <ClearLocalData />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
