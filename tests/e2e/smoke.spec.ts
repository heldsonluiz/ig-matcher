import { expect, test } from "@playwright/test";

test("alterna o icone do cabecalho e mantem o favicon escuro", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  const brand = page.getByRole("link", { name: "Instagram Matcher, inicio" });
  const lightIcon = brand.locator('img[src*="icon.png"]');
  const darkIcon = brand.locator('img[src*="icon-dark.png"]');
  const theme = page.getByRole("combobox", { name: "Selecionar tema" });

  await expect(darkIcon).toBeVisible();
  await expect(lightIcon).toBeHidden();
  await theme.click();
  await page.getByRole("option", { name: "Claro", exact: true }).click();
  await expect(lightIcon).toBeVisible();
  await expect(darkIcon).toBeHidden();
  await theme.click();
  await page.getByRole("option", { name: "Escuro", exact: true }).click();
  await expect(darkIcon).toBeVisible();
  await expect(lightIcon).toBeHidden();
  for (const icon of [lightIcon, darkIcon]) {
    await expect(icon).toHaveJSProperty("complete", true);
    await expect(icon).not.toHaveJSProperty("naturalWidth", 0);
  }
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/icon-dark.png",
  );
});

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

  await page
    .getByRole("navigation", { name: "Navegacao principal" })
    .getByRole("link", { name: "Importacao", exact: true })
    .click();
  await expect(page).toHaveURL(/\/import$/);
  await expect(
    page.getByRole("heading", { name: "Importe sua exportacao" }),
  ).toBeVisible();
});
