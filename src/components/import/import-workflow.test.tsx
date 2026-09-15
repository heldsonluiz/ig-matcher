import JSZip from "jszip";
import "fake-indexeddb/auto";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  deleteSnapshotDatabase,
  saveSnapshot,
  getCurrentSnapshot,
} from "@/features/snapshots/repository";
import { connectionSnapshot } from "@/test/fixtures/connections";
import { ImportWorkflow } from "./import-workflow";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

async function createFixtureZip(): Promise<File> {
  const zip = new JSZip();
  zip.file(
    "connections/followers_and_following/followers.json",
    JSON.stringify([
      {
        string_list_data: [
          {
            href: "https://www.instagram.com/perfil_ficticio/",
            value: "perfil_ficticio",
            timestamp: 1700000000,
          },
        ],
      },
    ]),
  );
  const bytes = await zip.generateAsync({ type: "uint8array" });
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  return new File([buffer], "instagram-export-ficticio.zip", {
    type: "application/zip",
  });
}

describe("ImportWorkflow", () => {
  beforeEach(async () => {
    pushMock.mockClear();
    await deleteSnapshotDatabase();
  });

  it("preserva os dados ao cancelar e substitui somente após confirmar", async () => {
    const user = userEvent.setup();
    const current = connectionSnapshot({ sourceFileName: "atual.zip" });
    await saveSnapshot(current);
    render(<ImportWorkflow />);
    await user.upload(
      screen.getByLabelText("Arquivo ZIP"),
      await createFixtureZip(),
    );
    await user.click(
      await screen.findByRole("button", { name: "Confirmar resumo" }),
    );
    expect(await screen.findByRole("dialog")).toHaveTextContent("atual.zip");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect((await getCurrentSnapshot())?.id).toBe(current.id);
    await user.click(screen.getByRole("button", { name: "Confirmar resumo" }));
    await user.click(
      await screen.findByRole("button", {
        name: "Substituir importação",
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
    expect((await getCurrentSnapshot())?.sourceFileName).toBe(
      "instagram-export-ficticio.zip",
    );
    expect((await getCurrentSnapshot())?.id).not.toBe(current.id);
  });
  it("processa um ZIP fictício e exibe o resumo para confirmação", async () => {
    const user = userEvent.setup();
    render(<ImportWorkflow />);
    const file = await createFixtureZip();

    await user.upload(screen.getByLabelText("Arquivo ZIP"), file);

    await waitFor(() =>
      expect(screen.getByText("Revise sua importação")).toBeInTheDocument(),
    );
    expect(
      screen.getByText("instagram-export-ficticio.zip · 1 KB"),
    ).toBeInTheDocument();
    expect(screen.getByText("Seguidores")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar resumo" }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
  });

  it("rejeita arquivos que não são ZIP", async () => {
    render(<ImportWorkflow />);

    const file = new File(["dados"], "dados.txt", { type: "text/plain" });
    fireEvent.drop(
      screen.getByRole("button", { name: "Selecionar arquivo ZIP" }),
      {
        dataTransfer: { files: [file] },
      },
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Selecione um arquivo com extensão .zip.",
      ),
    );
  });
});
