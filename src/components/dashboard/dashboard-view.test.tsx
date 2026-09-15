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

  it("abre categorias com o snapshot solicitado e mantem contagens indisponiveis", async () => {
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
      name: "Abrir Conexoes mutuas",
    });
    expect(card).toHaveTextContent("Dados nao fornecidos");
    expect(card).toHaveAttribute(
      "href",
      `/connections/mutuals?snapshot=${snapshot.id}`,
    );
    expect(
      screen.getByRole("link", { name: "Abrir Seguidores" }),
    ).toHaveTextContent("3");
  });

  it("informa quando nao existem snapshots locais", async () => {
    render(<DashboardView />);

    await waitFor(() =>
      expect(
        screen.getByText("Nenhum snapshot disponivel"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByText(
        "Importe uma exportacao oficial para ver suas conexoes neste momento.",
      ),
    ).toBeInTheDocument();
  });
});
