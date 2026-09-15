import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/app-shell/app-shell";

describe("AppShell", () => {
  it("exibe a navegação principal e o conteúdo da página", () => {
    render(
      <AppShell>
        <main>Conteúdo de teste</main>
      </AppShell>,
    );

    expect(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Importação" })).toHaveAttribute(
      "href",
      "/import",
    );
    expect(screen.getByText("Conteúdo de teste")).toBeInTheDocument();
  });
});
