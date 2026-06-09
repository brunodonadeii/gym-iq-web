import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = join(process.cwd(), "src");
const scannedExtensions = new Set([".css", ".json", ".ts", ".tsx"]);
const mojibakePatterns = [
  String.fromCharCode(0x00c3),
  String.fromCharCode(0x00c2),
  `${String.fromCharCode(0x00e2)}${String.fromCharCode(0x20ac)}${String.fromCharCode(0x00a2)}`,
  String.fromCharCode(0xfffd),
];

const getExtension = (filePath: string) => {
  const dotIndex = filePath.lastIndexOf(".");

  return dotIndex >= 0 ? filePath.slice(dotIndex) : "";
};

const listSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) return listSourceFiles(entryPath);

    return scannedExtensions.has(getExtension(entryPath)) ? [entryPath] : [];
  });

describe("source text encoding", () => {
  it("does not contain common mojibake sequences", () => {
    const matches = listSourceFiles(sourceRoot).flatMap((filePath) => {
      const content = readFileSync(filePath, "utf8");

      return content
        .split(/\r?\n/)
        .flatMap((line, index) =>
          mojibakePatterns.some((pattern) => line.includes(pattern))
            ? [`${relative(process.cwd(), filePath)}:${index + 1}`]
            : [],
        );
    });

    expect(matches).toEqual([]);
  });
});
