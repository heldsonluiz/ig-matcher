import {
  deduplicateProfiles,
  normalizeProfile,
  normalizeUsername,
} from "./normalize-entry";
import type { InstagramProfile } from "./types";

const profile = (
  username: string,
  timestamp: number | null = null,
): InstagramProfile => ({
  username,
  profileUrl: `https://www.instagram.com/${username.replace(/^@/, "")}/`,
  timestamp,
});

describe("username normalization", () => {
  it("remove espacos, arroba inicial e diferencas de maiusculas", () => {
    expect(normalizeUsername("  @Conta_Ficticia  ")).toBe("conta_ficticia");
  });

  it("normaliza o username dentro do perfil", () => {
    expect(
      normalizeProfile({
        username: " @LunaMar_Ficticia ",
        profileUrl: "https://www.instagram.com/lunamar_ficticia/",
        timestamp: 1700000000,
      }),
    ).toEqual({
      username: "lunamar_ficticia",
      profileUrl: "https://www.instagram.com/lunamar_ficticia/",
      timestamp: 1700000000,
    });
  });
});

describe("profile deduplication", () => {
  it("remove duplicatas usando username normalizado e preserva a primeira entrada", () => {
    const result = deduplicateProfiles([
      profile("@LunaMar_Ficticia", 1700000000),
      profile(" lunamar_ficticia ", 1700000100),
      profile("caionuvem_ficticio", 1700000200),
    ]);

    expect(result).toEqual({
      profiles: [
        {
          username: "lunamar_ficticia",
          profileUrl: "https://www.instagram.com/LunaMar_Ficticia/",
          timestamp: 1700000000,
        },
        {
          username: "caionuvem_ficticio",
          profileUrl: "https://www.instagram.com/caionuvem_ficticio/",
          timestamp: 1700000200,
        },
      ],
      duplicatesRemoved: 1,
    });
  });

  it("nao conta usernames vazios como perfis validos", () => {
    const result = deduplicateProfiles([
      profile("   "),
      profile("@perfil_ficticio"),
    ]);

    expect(result.profiles).toHaveLength(1);
    expect(result.duplicatesRemoved).toBe(0);
  });
});
