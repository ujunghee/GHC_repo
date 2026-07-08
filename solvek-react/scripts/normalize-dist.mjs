import { copyFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const distDir = resolve("dist");
const rootIndex = join(distDir, "index.html");

async function findIndexFile(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isFile() && entry.name === "index.html") return entryPath;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const found = await findIndexFile(join(directory, entry.name));
    if (found) return found;
  }

  return null;
}

const builtIndex = await findIndexFile(distDir);

if (!builtIndex) {
  throw new Error("Parcel build did not create an index.html file.");
}

if (builtIndex !== rootIndex) {
  await copyFile(builtIndex, rootIndex);
}

console.log(`Normalized dist index from ${builtIndex}`);
