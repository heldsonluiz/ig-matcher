import { expect, test } from "@playwright/test";

test("apresenta a home e a navegacao principal", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Veja suas conexoes com mais clareza." }),
  ).toBeVisible();
  await expect(
    page.getByText("Nenhum login ou senha do Instagram sera solicitado."),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegacao principal" }),
  ).toContainText("Importacao");

  await page.getByRole("link", { name: "Importacao" }).click();
  await expect(page).toHaveURL(/\/import$/);
  await expect(
    page.getByRole("heading", { name: "Importe sua exportacao" }),
  ).toBeVisible();
});
