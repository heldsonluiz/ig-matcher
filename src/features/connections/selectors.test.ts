import {
  connectionDataset,
  connectionSnapshot,
} from "@/test/fixtures/connections";
import {
  filterAndSortProfiles,
  selectConnections,
  relationshipLabels,
  isConnectionCategory,
} from "./selectors";

describe("connection selectors", () => {
  it("seleciona solicitações enviadas independentemente de seguidores e recebidas", () => {
    const snapshot = connectionSnapshot({
      followers: connectionDataset([], "invalid"),
      following: connectionDataset([], "not_provided"),
      pendingSentRequests: connectionDataset(["pedido_enviado"]),
      pendingReceivedRequests: connectionDataset(["pedido_recebido"]),
    });
    expect(selectConnections(snapshot, "pending-sent")).toBe(
      snapshot.pendingSentRequests,
    );
    expect(
      relationshipLabels(snapshot, "pending-sent").get("pedido_enviado"),
    ).toBe("Solicitação pendente");
    expect(
      relationshipLabels(snapshot, "pending-sent").has("pedido_recebido"),
    ).toBe(false);
  });
  it("seleciona as cinco categorias sem misturar conjuntos", () => {
    const snapshot = connectionSnapshot();
    expect(selectConnections(snapshot, "followers").profiles).toHaveLength(3);
    expect(selectConnections(snapshot, "following").profiles).toHaveLength(2);
    expect(
      selectConnections(snapshot, "mutuals").profiles.map((p) => p.username),
    ).toEqual(["ana_ficticia"]);
    expect(
      selectConnections(snapshot, "not-following-back").profiles.map(
        (p) => p.username,
      ),
    ).toEqual(["duda_ficticia"]);
    expect(
      selectConnections(snapshot, "not-followed-back").profiles.map(
        (p) => p.username,
      ),
    ).toEqual(["bia_ficticia", "caio_ficticio"]);
    expect(isConnectionCategory("toString")).toBe(false);
  });
  it("distingue vazio, ausente e inválido nas listas derivadas", () => {
    expect(
      selectConnections(
        connectionSnapshot({ following: connectionDataset([]) }),
        "mutuals",
      ).status,
    ).toBe("empty");
    for (const status of ["invalid", "not_provided"] as const) {
      const snapshot = connectionSnapshot({
        following: connectionDataset([], status),
      });
      expect(selectConnections(snapshot, "mutuals").status).toBe(status);
      expect(selectConnections(snapshot, "followers").profiles).toHaveLength(3);
      expect(
        relationshipLabels(snapshot, "followers").get("ana_ficticia"),
      ).toBe("Relação indisponível");
    }
  });
  it("busca sem diferenciar caixa ou @ e não modifica a origem", () => {
    const profiles = connectionDataset(["bia", "ana", "caio"]).profiles;
    expect(
      filterAndSortProfiles(profiles, " @ANA ", "az").map((p) => p.username),
    ).toEqual(["ana"]);
    expect(
      filterAndSortProfiles(profiles, "", "az").map((p) => p.username),
    ).toEqual(["ana", "bia", "caio"]);
    expect(
      filterAndSortProfiles(profiles, "", "za").map((p) => p.username),
    ).toEqual(["caio", "bia", "ana"]);
    expect(profiles[0].username).toBe("bia");
  });
  it("ordena datas nas duas direções com ausentes por último", () => {
    const profiles = connectionDataset([
      "sem_data",
      "antigo",
      "recente",
    ]).profiles;
    expect(
      filterAndSortProfiles(profiles, "", "oldest").map((p) => p.username),
    ).toEqual(["antigo", "recente", "sem_data"]);
    expect(
      filterAndSortProfiles(profiles, "", "newest").map((p) => p.username),
    ).toEqual(["recente", "antigo", "sem_data"]);
  });
});
