import { expect, test } from "@playwright/test";
import JSZip from "jszip";

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`importa e explora conexões em ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const zip = new JSZip();
    const entry = (username: string, index: number) => ({
      string_list_data: [
        {
          value: username,
          href: `https://www.instagram.com/${username}/`,
          timestamp: 1700000000 + index,
        },
      ],
    });
    const followers = Array.from({ length: 52 }, (_, i) =>
      entry(`ficticio_${String(i).padStart(2, "0")}`, i),
    );
    zip.file(
      "connections/followers_1.json",
      JSON.stringify(followers.slice(0, 30)),
    );
    zip.file("other/followers_2.json", JSON.stringify(followers.slice(30)));
    zip.file(
      "following.json",
      JSON.stringify({
        relationships_following: [
          entry("ficticio_00", 0),
          entry("outro_ficticio", 1),
        ],
      }),
    );
    zip.file(
      "pending_follow_requests.json",
      JSON.stringify({
        relationships_follow_requests_sent: [
          entry("pedido_recente", 2),
          entry("pedido_antigo", 1),
        ],
      }),
    );
    await page.goto("/import");
    await page.getByLabel("Arquivo ZIP", { exact: true }).setInputFiles({
      name: "conexoes-ficticias.zip",
      mimeType: "application/zip",
      buffer: await zip.generateAsync({ type: "nodebuffer" }),
    });
    await page.getByRole("button", { name: "Confirmar resumo" }).click();
    await expect(
      page.getByText("Snapshot salvo localmente neste navegador."),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Navegação principal" })
      .getByRole("link", { name: "Dashboard" })
      .click();
    await expect(
      page.getByRole("link", { name: "Abrir Seguidores", exact: true }),
    ).toContainText("52");
    await page
      .getByRole("link", { name: "Abrir Seguidores", exact: true })
      .click();
    await expect(page).toHaveURL(/\/connections\/followers\?snapshot=/);
    const selectedId = new URL(page.url()).searchParams.get("snapshot");
    expect(selectedId).toBeTruthy();
    const list = page
      .getByRole("table", { name: "Perfis", exact: true })
      .locator("tbody");
    await expect(list.getByRole("row")).toHaveCount(50);
    await page
      .getByRole("navigation", { name: "Paginação superior" })
      .getByRole("button", { name: "Próxima", exact: true })
      .click();
    await expect(list.getByRole("row")).toHaveCount(2);
    await page.getByLabel("Buscar por nome de usuário").fill("@FICTICIO_00");
    await expect(list.getByRole("row")).toHaveCount(1);
    await expect(list).toContainText("Conexão mútua");
    await page.getByLabel("Buscar por nome de usuário").fill("");
    const sort = page.getByRole("combobox", { name: "Ordenar conexões" });
    await sort.click();
    await page
      .getByRole("option", { name: "Data: mais recentes", exact: true })
      .click();
    await expect(list.getByRole("row").first()).toContainText("@ficticio_51");
    await sort.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");
    await expect(sort).toBeFocused();
    const nav = page.getByRole("navigation", {
      name: "Categorias de conexões",
    });
    for (const [label, count] of [
      ["Seguindo", 2],
      ["Conexões mútuas", 1],
      ["Não seguem de volta", 1],
      ["Não sigo de volta", 50],
    ] as const) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(
        page.getByRole("heading", { level: 1, name: label }),
      ).toBeVisible();
      await expect(list.getByRole("row")).toHaveCount(count);
      expect(new URL(page.url()).searchParams.get("snapshot")).toBe(selectedId);
    }
    await page.reload();
    await expect(list.getByRole("row")).toHaveCount(50);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("link", { name: "Voltar ao dashboard" }).click();
    await expect(page.getByLabel("Escolher", { exact: true })).toHaveValue(
      selectedId!,
    );
    await page
      .getByRole("link", { name: "Abrir Solicitações enviadas", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Solicitações enviadas" }),
    ).toBeVisible();
    await expect(list.getByRole("row")).toHaveCount(2);
    await expect(list).toContainText("Solicitação pendente");
    await sort.click();
    await page
      .getByRole("option", { name: "Data: mais antigas", exact: true })
      .click();
    await expect(list.getByRole("row").first()).toContainText("@pedido_antigo");
    await page.getByLabel("Buscar por nome de usuário").fill("pedido_recente");
    await expect(list.getByRole("row")).toHaveCount(1);
    expect(new URL(page.url()).searchParams.get("snapshot")).toBe(selectedId);
    expect(errors).toEqual([]);
  });
}
