import { expect, test } from "@playwright/test";
import JSZip from "jszip";
import { version } from "../../package.json";

test("mantém apenas a importação atual e apaga dados mediante confirmação", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const zip = new JSZip();
  zip.file(
    "followers.json",
    JSON.stringify([
      {
        string_list_data: [
          {
            value: "perfil_ficticio",
            href: "https://www.instagram.com/perfil_ficticio/",
            timestamp: 1700000000,
          },
        ],
      },
    ]),
  );
  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  await page.goto("/import");
  await expect(page.getByText(`Unveil · v${version}`)).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegação principal" }),
  ).not.toContainText("Configurações");
  await page.getByLabel("Arquivo ZIP", { exact: true }).setInputFiles({
    name: "primeiro.zip",
    mimeType: "application/zip",
    buffer,
  });
  await page.getByRole("button", { name: "Confirmar resumo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/import");
  await page.getByLabel("Arquivo ZIP", { exact: true }).setInputFiles({
    name: "segundo.zip",
    mimeType: "application/zip",
    buffer,
  });
  await page.getByRole("button", { name: "Confirmar resumo" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("primeiro.zip");
  await expect(dialog).toContainText("Este arquivo contém os mesmos dados");
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.goto("/dashboard");
  await expect(page.getByText("primeiro.zip", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Escolher", { exact: true })).toHaveCount(0);
  await page.goto("/import");
  await page.getByLabel("Arquivo ZIP", { exact: true }).setInputFiles({
    name: "segundo.zip",
    mimeType: "application/zip",
    buffer,
  });
  await page.getByRole("button", { name: "Confirmar resumo" }).click();
  await dialog
    .getByRole("button", { name: "Substituir importação", exact: true })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.reload();
  await expect(page.getByText("segundo.zip", { exact: true })).toBeVisible();
  const count = await page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const request = indexedDB.open("instagram-matcher");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const total = db
            .transaction("snapshots")
            .objectStore("snapshots")
            .count();
          total.onsuccess = () => {
            resolve(total.result);
            db.close();
          };
        };
      }),
  );
  expect(count).toBe(1);
  await page.evaluate(() => localStorage.setItem("unrelated-key", "keep"));
  const headerActions = page.getByRole("group", { name: "Ações do projeto" });
  await headerActions
    .getByRole("button", { name: "Apagar dados locais" })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Apagar definitivamente" }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.getByText("segundo.zip", { exact: true })).toBeVisible();
  await headerActions
    .getByRole("button", { name: "Apagar dados locais" })
    .click();
  await page.getByLabel("Digite APAGAR para confirmar").fill("APAGAR");
  await dialog.getByRole("button", { name: "Apagar definitivamente" }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => localStorage.getItem("unrelated-key"))).toBe(
    "keep",
  );
  await page.goto("/dashboard");
  await expect(page.getByText("Nenhuma importação disponível")).toBeVisible();
  expect(errors).toEqual([]);
});
