import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const skillsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../skills");

export async function discoverSkillNames() {
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const names = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      if ((await stat(resolve(skillsRoot, entry.name, "SKILL.md"))).isFile()) {
        names.push(entry.name);
      }
    } catch {}
  }

  return names.sort();
}

function skillPath(name) {
  if (
    typeof name !== "string" ||
    !name ||
    name === "." ||
    name === ".." ||
    name.includes("/") ||
    name.includes("\\") ||
    name.includes(":") ||
    name.includes("\0")
  ) {
    throw new Error("Invalid skill name");
  }

  const path = resolve(skillsRoot, name, "SKILL.md");
  if (!path.startsWith(`${skillsRoot}${sep}`)) throw new Error("Invalid skill name");
  return path;
}

export async function loadSkill(name) {
  const path = skillPath(name);
  const names = await discoverSkillNames();
  if (!names.includes(name)) throw new Error(`Unknown skill: ${name}`);
  return readFile(path, "utf8");
}
