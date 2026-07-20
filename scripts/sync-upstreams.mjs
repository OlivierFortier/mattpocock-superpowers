import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const plugin = path.join(root, "plugins", "matt-workflow");
const skillsRoot = path.join(plugin, "skills");
const lock = JSON.parse(await readFile(path.join(root, "upstreams.lock.json"), "utf8"));

const mattSkills = [
  ["setup-matt-pocock-skills", "skills/engineering/setup-matt-pocock-skills"],
  ["grill-with-docs", "skills/engineering/grill-with-docs"],
  ["grilling", "skills/productivity/grilling"],
  ["domain-modeling", "skills/engineering/domain-modeling"],
  ["handoff", "skills/productivity/handoff"],
  ["prototype", "skills/engineering/prototype"],
  ["wayfinder", "skills/engineering/wayfinder"],
  ["research", "skills/engineering/research"],
  ["to-spec", "skills/engineering/to-spec"],
  ["to-tickets", "skills/engineering/to-tickets"],
  ["implement", "skills/engineering/implement"],
  ["tdd", "skills/engineering/tdd"],
  ["code-review", "skills/engineering/code-review"],
  ["batch-grill-me", "skills/in-progress/batch-grill-me"],
  ["wizard", "skills/in-progress/wizard"],
  ["to-questionnaire", "skills/in-progress/to-questionnaire"],
  ["loop-me", "skills/in-progress/loop-me"],
];

const superpowersSkills = [
  ["using-git-worktrees", "skills/using-git-worktrees"],
  ["finishing-a-development-branch", "skills/finishing-a-development-branch"],
];

const experimental = new Set(["batch-grill-me", "wizard", "to-questionnaire", "loop-me"]);
const allSkillNames = [...mattSkills, ...superpowersSkills].map(([name]) => name).sort((a, b) => b.length - a.length);
const generatedAgentMetadata = {
  "using-git-worktrees": ["Using Git Worktrees", "Create or reuse an isolated Git worktree"],
  "finishing-a-development-branch": ["Finish Development Branch", "Safely finish and integrate a development branch"],
};

function parseArgs(argv) {
  const options = { check: false, mattSource: null, superpowersSource: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--check") options.check = true;
    else if (arg === "--matt-source") options.mattSource = argv[++i];
    else if (arg === "--superpowers-source") options.superpowersSource = argv[++i];
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  return options;
}

function assertInside(child, parent) {
  const relative = path.relative(parent, child);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing unsafe destination: ${child}`);
  }
}

async function checkout(name, config, override, cleanup) {
  let source;
  if (override) {
    source = path.resolve(override);
  } else {
    source = await mkdtemp(path.join(tmpdir(), `matt-workflow-${name}-`));
    cleanup.push(source);
    await exec("git", ["clone", "--quiet", "--filter=blob:none", "--no-checkout", config.repository, source]);
    await exec("git", ["-C", source, "checkout", "--quiet", "--detach", config.commit]);
  }

  const { stdout } = await exec("git", ["-C", source, "rev-parse", "HEAD"]);
  if (stdout.trim() !== config.commit) {
    throw new Error(`${name} is at ${stdout.trim()}, expected ${config.commit}`);
  }
  if (config.tagObject) {
    const tag = await exec("git", ["-C", source, "rev-parse", config.ref]);
    if (tag.stdout.trim() !== config.tagObject) {
      throw new Error(`${name} tag ${config.ref} is ${tag.stdout.trim()}, expected ${config.tagObject}`);
    }
  }
  const dirty = await exec("git", ["-C", source, "status", "--porcelain", "--untracked-files=no"]);
  if (dirty.stdout.trim()) throw new Error(`${name} has tracked local changes; use a clean checkout`);
  return source;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseYamlScalar(value, label) {
  const scalar = value.trim();
  if (scalar.startsWith('"')) return JSON.parse(scalar);
  if (scalar.startsWith("'") && scalar.endsWith("'")) return scalar.slice(1, -1).replaceAll("''", "'");
  if (scalar) return scalar;
  throw new Error(`${label} must not be empty`);
}

async function readHumanSummary(directory, name) {
  const agentFile = path.join(directory, "agents", "openai.yaml");
  try {
    const yaml = await readFile(agentFile, "utf8");
    const match = yaml.match(/^\s*short_description:\s*(.+?)\s*$/m);
    if (!match) throw new Error(`${name} is missing interface.short_description`);
    return parseYamlScalar(match[1], `${name} short_description`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const metadata = generatedAgentMetadata[name];
    if (!metadata) throw new Error(`${name} is missing agents/openai.yaml`);
    return metadata[1];
  }
}

function normalizeFrontmatter(text, expectedName, humanSummary) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error("SKILL.md is missing YAML frontmatter");
  const lines = match[1].split(/\r?\n/);
  const name = lines.find((line) => line.startsWith("name:"));
  const description = lines.find((line) => line.startsWith("description:"));
  if (!name || !description) throw new Error("SKILL.md frontmatter needs name and description");
  if (name.slice(5).trim() !== expectedName) throw new Error(`${expectedName} has mismatched skill metadata`);
  return `---\n${name}\ndescription: ${JSON.stringify(humanSummary)}\n---\n${text.slice(match[0].length)}`;
}

function qualifySkillReferences(text) {
  let output = text;
  for (const name of allSkillNames) {
    const escaped = escapeRegex(name);
    output = output.replace(
      new RegExp(`/${escaped}\\b`, "g"),
      () => `[$matt-workflow:${name}](../${name}/SKILL.md)`,
    );
    output = output.replace(new RegExp("`" + escaped + "`", "g"), () => "`$matt-workflow:" + name + "`");
  }
  return output;
}

function adaptSetup(text) {
  const original = text;
  text = text.replace(
    "- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited (see step 4 for selection rules)",
    "- The `## Agent skills` block to add to the existing repo instruction file, preferring `AGENTS.md` in Codex (see step 4)",
  );
  text = text.replace(
    "- If `CLAUDE.md` exists, edit it.\n- Else if `AGENTS.md` exists, edit it.\n- If neither exists, ask the user which one to create — don't pick for them.\n\nNever create `AGENTS.md` when `CLAUDE.md` already exists (or vice versa) — always edit the one that's already there.",
    "- If `AGENTS.md` exists, edit it.\n- Else if `CLAUDE.md` exists, edit it.\n- If neither exists, propose creating `AGENTS.md` and include it in the write-confirmation gate.\n\nPrefer repo-specific `AGENTS.md` in Codex. Never create a second instruction file when either one already exists.",
  );
  if (text === original) throw new Error("The Codex AGENTS.md setup patch no longer matches upstream");
  return text;
}

function addExperimentalNotice(text, name, commit) {
  if (!experimental.has(name)) return text;
  return `${text.trimEnd()}\n\n> **Experimental:** This in-progress skill is pinned at \`${commit}\`. Announce that status before use.\n`;
}

function addSubflowGuard(text) {
  return `${text.trimEnd()}\n\n> **Subflow:** Continue through this skill's completion criterion, then return to the caller.\n`;
}

function addIntegration(text, name) {
  if (name === "to-questionnaire") {
    return `${text.trimEnd()}\n\n## Matt Workflow resume contract\n\nWhen delegated, add a \`## Return context\` section naming the active issue, decision, or spec and the unresolved decision. Report the questionnaire path, pause the workflow, and resume that exact decision when answers arrive.\n`;
  }
  if (name === "wizard") {
    return `${text.trimEnd()}\n\n## Matt Workflow execution contract\n\nWhen delegated, write the wizard to the OS temporary directory unless the user asks to retain it. Return its path and instructions, but never execute it automatically.\n`;
  }
  return text;
}

async function adaptSkill(directory, name, commit) {
  const skillFile = path.join(directory, "SKILL.md");
  const humanSummary = await readHumanSummary(directory, name);
  let text = await readFile(skillFile, "utf8");
  text = normalizeFrontmatter(text, name, humanSummary).replaceAll("\r\n", "\n");
  text = qualifySkillReferences(text);
  if (name === "setup-matt-pocock-skills") text = adaptSetup(text);
  text = addIntegration(text, name);
  text = addExperimentalNotice(text, name, commit);
  text = addSubflowGuard(text);
  await writeFile(skillFile, text, "utf8");

  const agentFile = path.join(directory, "agents", "openai.yaml");
  try {
    let yaml = (await readFile(agentFile, "utf8")).replaceAll("\r\n", "\n");
    if (/allow_implicit_invocation:\s*(?:true|false)/.test(yaml)) {
      yaml = yaml.replace(/allow_implicit_invocation:\s*(?:true|false)/g, "allow_implicit_invocation: false");
    } else if (!/allow_implicit_invocation:/.test(yaml)) {
      yaml = `${yaml.trimEnd()}\npolicy:\n  allow_implicit_invocation: false\n`;
    }
    await writeFile(agentFile, yaml, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const metadata = generatedAgentMetadata[name];
    if (!metadata) throw new Error(`${name} is missing agents/openai.yaml`);
    await mkdir(path.dirname(agentFile), { recursive: true });
    await writeFile(
      agentFile,
      `interface:\n  display_name: ${JSON.stringify(metadata[0])}\n  short_description: ${JSON.stringify(metadata[1])}\n  default_prompt: ${JSON.stringify(`Use $${name} to perform this subflow.`)}\npolicy:\n  allow_implicit_invocation: false\n`,
      "utf8",
    );
  }
}

async function normalizeShellFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await normalizeShellFiles(file);
    else if (entry.name.endsWith(".sh")) {
      const text = await readFile(file, "utf8");
      await writeFile(file, text.replaceAll("\r\n", "\n"), "utf8");
    }
  }
}

async function render(source, mappings, destination, commit) {
  for (const [name, relative] of mappings) {
    const from = path.join(source, relative);
    const to = path.join(destination, name);
    if (!(await stat(from)).isDirectory()) throw new Error(`Missing upstream skill: ${relative}`);
    await cp(from, to, { recursive: true });
    await normalizeShellFiles(to);
    await adaptSkill(to, name, commit);
  }
}

async function snapshot(directory, prefix = "") {
  const result = new Map();
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      for (const [key, value] of await snapshot(absolute, relative)) result.set(key, value);
    } else {
      result.set(relative, createHash("sha256").update(await readFile(absolute)).digest("hex"));
    }
  }
  return result;
}

async function compare(expected, actual, label) {
  const [left, right] = await Promise.all([snapshot(expected), snapshot(actual)]);
  const keys = [...new Set([...left.keys(), ...right.keys()])].sort();
  const differences = keys.filter((key) => left.get(key) !== right.get(key));
  if (differences.length) throw new Error(`${label} is out of sync:\n${differences.join("\n")}`);
}

async function replaceDirectory(source, destination) {
  assertInside(destination, skillsRoot);
  await rm(destination, { recursive: true, force: true });
  await cp(source, destination, { recursive: true });
}

const options = parseArgs(process.argv.slice(2));
const cleanup = [];

try {
  const [mattSource, superpowersSource] = await Promise.all([
    checkout("matt", lock["mattpocock-skills"], options.mattSource, cleanup),
    checkout("superpowers", lock.superpowers, options.superpowersSource, cleanup),
  ]);

  await stat(path.join(mattSource, "skills", "engineering", "ask-matt", "SKILL.md"));
  const rendered = await mkdtemp(path.join(tmpdir(), "matt-workflow-rendered-"));
  cleanup.push(rendered);
  await render(mattSource, mattSkills, rendered, lock["mattpocock-skills"].commit);
  await render(superpowersSource, superpowersSkills, rendered, lock.superpowers.commit);

  const renderedLicenses = path.join(rendered, "third-party");
  await mkdir(renderedLicenses);
  await cp(path.join(mattSource, "LICENSE"), path.join(renderedLicenses, "mattpocock-skills.LICENSE"));
  await cp(path.join(superpowersSource, "LICENSE"), path.join(renderedLicenses, "superpowers.LICENSE"));

  if (options.check) {
    for (const [name] of [...mattSkills, ...superpowersSkills]) {
      await compare(path.join(rendered, name), path.join(skillsRoot, name), name);
    }
    await compare(renderedLicenses, path.join(plugin, "third-party"), "third-party licenses");
    console.log("Vendored skills match pinned upstreams.");
  } else {
    await mkdir(skillsRoot, { recursive: true });
    for (const [name] of [...mattSkills, ...superpowersSkills]) {
      await replaceDirectory(path.join(rendered, name), path.join(skillsRoot, name));
    }
    const thirdParty = path.join(plugin, "third-party");
    await rm(thirdParty, { recursive: true, force: true });
    await cp(renderedLicenses, thirdParty, { recursive: true });
    console.log(`Synced ${mattSkills.length + superpowersSkills.length} skills from pinned upstreams.`);
  }
} finally {
  for (const directory of cleanup.reverse()) {
    if (path.basename(directory).startsWith("matt-workflow-")) {
      await rm(directory, { recursive: true, force: true });
    }
  }
}
