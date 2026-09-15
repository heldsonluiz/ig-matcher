import followersFixture from "@/test/fixtures/followers.json";
import followingFixture from "@/test/fixtures/following.json";
import invalidFixture from "@/test/fixtures/invalid-export.json";
import { parseExportFiles, parseExportText } from "./parse-export";

describe("Instagram export parser", () => {
  it("parseia uma lista na raiz e normaliza os perfis", () => {
    const result = parseExportText(
      JSON.stringify(followersFixture),
      "followers.json",
      "followers",
    );

    expect(result.dataset.status).toBe("available");
    expect(result.dataset.profiles).toHaveLength(2);
    expect(result.dataset.profiles[0]).toEqual({
      username: "lunamar_ficticia",
      profileUrl: "https://www.instagram.com/lunamar_ficticia/",
      timestamp: 1700000000,
    });
  });

  it("parseia o envelope relationships_following", () => {
    const result = parseExportText(
      JSON.stringify(followingFixture),
      "following.json",
      "following",
    );

    expect(result.dataset.status).toBe("available");
    expect(result.dataset.profiles.map(({ username }) => username)).toEqual([
      "lunamar_ficticia",
      "ivocaderno_ficticio",
    ]);
  });

  it("usa o caminho do href quando following não fornece value", () => {
    const result = parseExportText(
      JSON.stringify({
        relationships_following: [
          {
            title: "",
            string_list_data: [
              {
                href: "https://www.instagram.com/_u/perfil_sem_value",
                timestamp: 1700000000,
              },
            ],
          },
        ],
      }),
      "following.json",
      "following",
    );

    expect(result.dataset.profiles[0].username).toBe("perfil_sem_value");
  });

  it("não transforma o segmento _u em username compartilhado", () => {
    const result = parseExportText(
      JSON.stringify({
        relationships_following: [
          {
            title: "primeiro",
            string_list_data: [
              { href: "https://www.instagram.com/_u/primeiro" },
            ],
          },
          {
            title: "segundo",
            string_list_data: [
              { href: "https://www.instagram.com/_u/segundo" },
            ],
          },
        ],
      }),
      "following.json",
      "following",
    );

    expect(result.dataset.profiles.map(({ username }) => username)).toEqual([
      "primeiro",
      "segundo",
    ]);
  });

  it("parseia solicitações no formato label_values", () => {
    const result = parseExportText(
      JSON.stringify([
        {
          timestamp: 1700000000,
          label_values: [
            { label: "Nome", value: "Perfil Fictício" },
            { label: "Nome de usuário", value: "@perfil_ficticio" },
            {
              label: "URL",
              value: "https://www.instagram.com/perfil_ficticio/",
            },
          ],
          media: [],
          fbid: "fixture-id",
        },
      ]),
      "pending_follow_requests.json",
      "pending_sent_requests",
    );

    expect(result.dataset.profiles).toEqual([
      {
        username: "perfil_ficticio",
        profileUrl: "https://www.instagram.com/perfil_ficticio/",
        timestamp: 1700000000,
      },
    ]);
  });

  it("classifica JSON inválido como invalid", () => {
    const result = parseExportText("{nao-json", "followers.json", "followers");

    expect(result.dataset.status).toBe("invalid");
    expect(result.dataset.warnings).toEqual([
      "O arquivo JSON não pôde ser lido.",
    ]);
  });

  it("classifica entradas reconhecíveis mas inválidas como invalid", () => {
    const result = parseExportText(
      JSON.stringify(invalidFixture),
      "followers.json",
      "followers",
    );

    expect(result.dataset.status).toBe("invalid");
    expect(result.dataset.warnings).toHaveLength(1);
  });

  it("preserva entradas válidas quando uma entrada do mesmo arquivo é inválida", () => {
    const payload = [
      followersFixture[0],
      {
        title: "Entrada quebrada",
        string_list_data: [{ value: "" }],
      },
    ];
    const result = parseExportText(
      JSON.stringify(payload),
      "followers.json",
      "followers",
    );

    expect(result.dataset.status).toBe("available");
    expect(result.dataset.profiles).toHaveLength(1);
    expect(result.dataset.warnings).toHaveLength(1);
  });

  it("agrega partes e remove duplicatas entre arquivos", () => {
    const result = parseExportFiles([
      {
        sourceFile: "followers.json",
        kind: "followers",
        text: JSON.stringify([followersFixture[0]]),
      },
      {
        sourceFile: "followers_1.json",
        kind: "followers",
        text: JSON.stringify([followersFixture[0], followersFixture[1]]),
      },
    ]);

    expect(result.dataset.status).toBe("available");
    expect(result.dataset.profiles).toHaveLength(2);
    expect(result.duplicatesRemoved).toBe(1);
  });

  it("distingue conjunto ausente de conjunto vazio", () => {
    const missing = parseExportFiles([]);
    const empty = parseExportFiles([
      { sourceFile: "followers.json", kind: "followers", text: "[]" },
    ]);

    expect(missing.dataset.status).toBe("not_provided");
    expect(empty.dataset.status).toBe("empty");
  });
});
