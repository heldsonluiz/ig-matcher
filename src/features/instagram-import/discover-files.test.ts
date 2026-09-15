import JSZip from "jszip";
import { discoverFiles, ZipImportError } from "./discover-files";

async function createZip(files: Record<string, string>): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(files)) zip.file(name, content);
  return zip.generateAsync({ type: "uint8array" });
}

describe("ZIP file discovery", () => {
  it("finds relevant files by basename across different folders", async () => {
    const input = await createZip({
      "connections/followers_and_following/followers.json": "[]",
      "connections/followers_and_following/followers_1.json": "[]",
      "connections/followers_and_following/following.json": "[]",
      "connections/followers_and_following/pending_follow_requests.json": "[]",
      "connections/followers_and_following/follow_requests_you've_received.json":
        "[]",
      "media/profile.jpg": "ignored",
    });

    const result = await discoverFiles(input);

    expect(result.files.map(({ baseName }) => baseName)).toEqual([
      "followers.json",
      "followers_1.json",
      "following.json",
      "follow_requests_you've_received.json",
      "pending_follow_requests.json",
    ]);
    expect(result.ignoredFiles).toBe(1);
  });

  it("recognizes case variations and reads a discovered file", async () => {
    const input = await createZip({ "Connections/FOLLOWERS_2.JSON": "[1]" });

    const result = await discoverFiles(input);

    expect(result.files[0]).toMatchObject({ kind: "followers", part: 2 });
    await expect(result.files[0].readText()).resolves.toBe("[1]");
  });

  it("rejects an invalid ZIP", async () => {
    await expect(
      discoverFiles(new TextEncoder().encode("not a zip")),
    ).rejects.toBeInstanceOf(ZipImportError);
  });

  it("rejects ZIPs with too many entries", async () => {
    const input = await createZip({ "a.txt": "a", "b.txt": "b" });

    await expect(discoverFiles(input, { maxEntries: 1 })).rejects.toThrow(
      "mais arquivos",
    );
  });

  it("rejects paths that exceed the configured depth", async () => {
    const input = await createZip({ "a/b/c/followers.json": "[]" });

    await expect(discoverFiles(input, { maxPathDepth: 1 })).rejects.toThrow(
      "mais profunda",
    );
  });

  it("rejects relevant files that exceed the per-file limit", async () => {
    const input = await createZip({ "followers.json": "[12345]" });

    await expect(discoverFiles(input, { maxFileBytes: 3 })).rejects.toThrow(
      "excede o limite",
    );
  });
});
