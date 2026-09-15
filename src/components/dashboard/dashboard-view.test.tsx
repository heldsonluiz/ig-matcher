import "fake-indexeddb/auto";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { deleteSnapshotDatabase } from "@/features/snapshots/repository";
import { DashboardView } from "./dashboard-view";

describe("DashboardView", () => {
  beforeEach(async () => {
    await deleteSnapshotDatabase();
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
