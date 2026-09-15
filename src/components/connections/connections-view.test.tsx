import "fake-indexeddb/auto";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as repository from "@/features/snapshots/repository";
import {
  connectionDataset,
  connectionSnapshot,
} from "@/test/fixtures/connections";
import { ConnectionsView } from "./connections-view";

const scrollIntoViewMock = vi.fn();

beforeEach(async () => {
  scrollIntoViewMock.mockClear();
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoViewMock,
  });
  await repository.deleteSnapshotDatabase();
});
afterEach(() => {
  vi.restoreAllMocks();
});

it.each([
  ["empty", "Nenhuma solicitação recebida encontrada."],
  ["not_provided", "O Instagram não forneceu esses dados nesta exportação."],
  ["invalid", "Os dados necessários para esta lista são inválidos"],
] as const)("informa solicitações recebidas %s", async (status, message) => {
  const snapshot = connectionSnapshot({
    pendingReceivedRequests: connectionDataset([], status),
  });
  await repository.saveSnapshot(snapshot);
  render(
    <ConnectionsView category="pending-received" snapshotId={snapshot.id} />,
  );
  expect(await screen.findByText(new RegExp(message))).toBeInTheDocument();
  expect(screen.getByText(/Esse conjunto é opcional/)).toBeInTheDocument();
});

it.each([
  ["empty", "Nenhuma solicitação pendente encontrada."],
  ["not_provided", "O Instagram não forneceu esses dados nesta exportação."],
  ["invalid", "Os dados necessários para esta lista são inválidos"],
] as const)("informa solicitações enviadas %s", async (status, message) => {
  const snapshot = connectionSnapshot({
    pendingSentRequests: connectionDataset([], status),
  });
  await repository.saveSnapshot(snapshot);
  render(<ConnectionsView category="pending-sent" snapshotId={snapshot.id} />);
  expect(await screen.findByText(new RegExp(message))).toBeInTheDocument();
  expect(
    screen.getByText(/A aplicação não cancela solicitações automaticamente/),
  ).toBeInTheDocument();
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
  render(<ConnectionsView category="followers" snapshotId={snapshot.id} />);
  const table = await screen.findByRole("table", { name: "Perfis" });
  const list = within(table).getAllByRole("rowgroup")[1];
  expect(within(list).getAllByRole("row")).toHaveLength(50);
  const link = screen.getByRole("link", {
    name: "Abrir perfil de @perfil_00 (nova aba)",
  });
  expect(link).toHaveAttribute("href", "https://www.instagram.com/perfil_00/");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await user.click(
    within(
      screen.getByRole("navigation", { name: "Paginação inferior" }),
    ).getByRole("button", { name: "Próxima" }),
  );
  expect(within(list).getAllByRole("row")).toHaveLength(1);
  expect(within(list).getAllByRole("cell")[0]).toHaveTextContent("51");
  expect(scrollIntoViewMock).toHaveBeenCalledWith({
    behavior: "smooth",
    block: "start",
  });
  expect(
    screen.getByRole("navigation", { name: "Paginação inferior" }),
  ).toHaveTextContent("2 / 2");
  await user.type(
    screen.getByLabelText("Buscar por nome de usuário"),
    "@PERFIL_00",
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "1 de 51 perfis · Página 1 de 1",
  );
  await user.clear(screen.getByLabelText("Buscar por nome de usuário"));
  await user.type(
    screen.getByLabelText("Buscar por nome de usuário"),
    "inexistente",
  );
  expect(
    screen.getByText("Nenhum perfil corresponde à busca."),
  ).toBeInTheDocument();
});

it.each([
  ["empty", "Nenhum perfil encontrado nesta lista da exportação."],
  ["not_provided", "O Instagram não forneceu"],
  ["invalid", "Os dados necessários para esta lista são inválidos"],
] as const)("informa dataset %s", async (status, message) => {
  const snapshot = connectionSnapshot({
    followers: connectionDataset([], status),
  });
  await repository.saveSnapshot(snapshot);
  render(<ConnectionsView category="followers" snapshotId={snapshot.id} />);
  expect(await screen.findByText(new RegExp(message))).toBeInTheDocument();
});

it("não troca silenciosamente um snapshot excluido pelo mais recente", async () => {
  await repository.saveSnapshot(connectionSnapshot());
  render(<ConnectionsView category="followers" snapshotId="excluido" />);
  expect(
    await screen.findByText("Importação não encontrada"),
  ).toBeInTheDocument();
});

it("permite tentar novamente após erro de leitura", async () => {
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
    await screen.findByRole("table", { name: "Perfis" }),
  ).toBeInTheDocument();
});
