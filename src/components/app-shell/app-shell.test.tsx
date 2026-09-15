import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/app-shell/app-shell";

describe("AppShell", () => {
  it("exibe a navegacao principal e o conteudo da pagina", () => {
    render(
      <AppShell>
        <main>Conteudo de teste</main>
      </AppShell>,
    );

    expect(
      screen.getByRole("navigation", { name: "Navegacao principal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Importacao" })).toHaveAttribute(
      "href",
      "/import",
    );
    expect(screen.getByText("Conteudo de teste")).toBeInTheDocument();
  });
});
