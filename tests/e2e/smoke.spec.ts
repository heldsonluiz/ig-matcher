import { expect, test } from "@playwright/test";

test("mantém a identidade visual no tema escuro", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  const brand = page.getByRole("link", { name: "Unveil, início" });
  const darkIcon = brand.locator('img[src*="icon-dark.png"]');

  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(
    page.getByRole("combobox", { name: "Selecionar tema" }),
  ).toHaveCount(0);
  await expect(darkIcon).toBeVisible();
  await expect(darkIcon).toHaveJSProperty("complete", true);
  await expect(darkIcon).not.toHaveJSProperty("naturalWidth", 0);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/icon-dark.png",
  );
});

test("apresenta a home e a navegação principal", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Veja suas conexões com mais clareza." }),
  ).toBeVisible();
  await expect(
    page.getByText("Nenhum login ou senha do Instagram será solicitado."),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegação principal" }),
  ).toContainText("Importação");

  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Importação", exact: true })
    .click();
  await expect(page).toHaveURL(/\/import$/);
  await expect(
    page.getByRole("heading", { name: "Importe sua exportação" }),
  ).toBeVisible();
});
