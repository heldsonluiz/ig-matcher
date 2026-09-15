import JSZip from "jszip";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportWorkflow } from "./import-workflow";

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
  it("processa um ZIP ficticio e exibe o resumo para confirmacao", async () => {
    const user = userEvent.setup();
    render(<ImportWorkflow />);
    const file = await createFixtureZip();

    await user.upload(screen.getByLabelText("Arquivo ZIP"), file);

    await waitFor(() =>
      expect(screen.getByText("Revise sua importacao")).toBeInTheDocument(),
    );
    expect(
      screen.getByText("instagram-export-ficticio.zip · 1 KB"),
    ).toBeInTheDocument();
    expect(screen.getByText("Seguidores")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar resumo" }));
    expect(screen.getByText("Resumo confirmado")).toBeInTheDocument();
  });

  it("rejeita arquivos que nao sao ZIP", async () => {
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
        "Selecione um arquivo com extensao .zip.",
      ),
    );
  });
});
