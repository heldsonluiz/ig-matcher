import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionHref = "/import",
  actionLabel = "Ir para importacao",
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="border-dashed bg-card/70">
      <CardContent className="flex flex-col items-start gap-4 p-6 sm:p-8">
        <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Construction className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <Link
          href={actionHref}
          className={buttonVariants({ variant: "outline" })}
        >
          {actionLabel}
          <ArrowRight aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
