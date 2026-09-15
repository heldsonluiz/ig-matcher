import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectActions } from "./project-actions";

it("exibe a chave Pix e confirma a cópia", async () => {
  const user = userEvent.setup();
  render(<ProjectActions />);

  await user.click(screen.getByRole("button", { name: "Apoiar" }));
  expect(
    screen.getByText("89ea2a34-fcba-4b8b-b267-af8341ff4827"),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Copiar chave" }));
  expect(await screen.findByText("Chave Pix copiada.")).toBeInTheDocument();
});

it("explica as limitações e oferece o formulário de issue", async () => {
  const user = userEvent.setup();
  render(<ProjectActions />);

  await user.click(screen.getByRole("button", { name: "Ajuda" }));
  expect(
    screen.getByText(/não são atualizados automaticamente/i),
  ).toBeVisible();
  expect(screen.getByRole("link", { name: "Reportar um bug" })).toHaveAttribute(
    "href",
    "https://github.com/heldsonluiz/unveil/issues/new",
  );
});
