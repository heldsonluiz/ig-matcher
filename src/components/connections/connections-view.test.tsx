import "fake-indexeddb/auto";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as repository from "@/features/snapshots/repository";
import {
  connectionDataset,
  connectionSnapshot,
} from "@/test/fixtures/connections";
import { ConnectionsView } from "./connections-view";

beforeEach(async () => {
  await repository.deleteSnapshotDatabase();
});
afterEach(() => {
  vi.restoreAllMocks();
});

it("busca, pagina e abre links seguros no snapshot solicitado", async () => {
  const user = userEvent.setup();
  const usernames = Array.from(
    { length: 51 },
    (_, i) => `perfil_${String(i).padStart(2, "0")}`,
  );
  const snapshot = connectionSnapshot({
    followers: connectionDataset(usernames),
  });
  snapshot.followers.profiles[0].profileUrl = "javascript:alert(1)";
  await repository.saveSnapshot(snapshot);
  await repository.saveSnapshot(
    connectionSnapshot({ id: "newer", importedAt: "2026-09-16T10:00:00.000Z" }),
  );
  render(<ConnectionsView category="followers" snapshotId={snapshot.id} />);
  const list = await screen.findByRole("list", { name: "Perfis" });
  expect(within(list).getAllByRole("listitem")).toHaveLength(50);
  const link = screen.getByRole("link", {
    name: "Abrir perfil de @perfil_00 (nova aba)",
  });
  expect(link).toHaveAttribute("href", "https://www.instagram.com/perfil_00/");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await user.click(screen.getByRole("button", { name: "Proxima" }));
  expect(within(list).getAllByRole("listitem")).toHaveLength(1);
  await user.type(
    screen.getByLabelText("Buscar por nome de usuario"),
    "@PERFIL_00",
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "1 de 51 perfis · Pagina 1 de 1",
  );
  await user.clear(screen.getByLabelText("Buscar por nome de usuario"));
  await user.type(
    screen.getByLabelText("Buscar por nome de usuario"),
    "inexistente",
  );
  expect(
    screen.getByText("Nenhum perfil corresponde a busca."),
  ).toBeInTheDocument();
});

it.each([
  ["empty", "Nenhum perfil encontrado nesta lista da exportacao."],
  ["not_provided", "O Instagram nao forneceu"],
  ["invalid", "Os dados necessarios para esta lista sao invalidos"],
] as const)("informa dataset %s", async (status, message) => {
  const snapshot = connectionSnapshot({
    followers: connectionDataset([], status),
  });
  await repository.saveSnapshot(snapshot);
  render(<ConnectionsView category="followers" snapshotId={snapshot.id} />);
  expect(await screen.findByText(new RegExp(message))).toBeInTheDocument();
});

it("nao troca silenciosamente um snapshot excluido pelo mais recente", async () => {
  await repository.saveSnapshot(connectionSnapshot());
  render(<ConnectionsView category="followers" snapshotId="excluido" />);
  expect(
    await screen.findByText("Snapshot nao encontrado"),
  ).toBeInTheDocument();
});

it("permite tentar novamente apos erro de leitura", async () => {
  const user = userEvent.setup();
  const snapshot = await repository.saveSnapshot(connectionSnapshot());
  vi.spyOn(repository, "getSnapshot").mockRejectedValueOnce(
    new Error("storage"),
  );
  render(<ConnectionsView category="followers" snapshotId={snapshot.id} />);
  await user.click(
    await screen.findByRole("button", { name: "Tentar novamente" }),
  );
  expect(
    await screen.findByRole("list", { name: "Perfis" }),
  ).toBeInTheDocument();
});
