import "fake-indexeddb/auto";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteSnapshotDatabase,
  saveSnapshot,
} from "@/features/snapshots/repository";
import {
  connectionDataset,
  connectionSnapshot,
} from "@/test/fixtures/connections";
import { DashboardView } from "./dashboard-view";

describe("DashboardView", () => {
  beforeEach(async () => {
    await deleteSnapshotDatabase();
  });

  it("abre categorias com o snapshot solicitado e mantém contagens indisponíveis", async () => {
    const snapshot = connectionSnapshot({
      following: connectionDataset([], "not_provided"),
    });
    await saveSnapshot(snapshot);
    await saveSnapshot(
      connectionSnapshot({
        id: "mais-recente",
        importedAt: "2026-09-16T10:00:00.000Z",
      }),
    );
    render(<DashboardView initialSnapshotId={snapshot.id} />);
    const card = await screen.findByRole("link", {
      name: "Abrir Conexões mútuas",
    });
    expect(card).toHaveTextContent("Dados não fornecidos");
    expect(card).toHaveAttribute(
      "href",
      `/connections/mutuals?snapshot=${snapshot.id}`,
    );
    expect(
      screen.getByRole("link", { name: "Abrir Seguidores" }),
    ).toHaveTextContent("3");
  });

  it("informa quando não existem snapshots locais", async () => {
    render(<DashboardView />);

    await waitFor(() =>
      expect(
        screen.getByText("Nenhum snapshot disponível"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByText(
        "Importe uma exportação oficial para ver suas conexões neste momento.",
      ),
    ).toBeInTheDocument();
  });
});
