import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = path.join(root, "plugins", "matt-workflow");
const skillsRoot = path.join(pluginRoot, "skills");
const copilotManifest = JSON.parse(await readFile(path.join(pluginRoot, "plugin.json"), "utf8"));
assert.equal(copilotManifest.name, "matt-workflow");
assert.equal(copilotManifest.version, "0.1.0");
assert.equal(copilotManifest.skills, "skills/");
assert.equal(copilotManifest.agents, "copilot/agents/");
assert.equal(copilotManifest.license, "MIT");
assert.equal("interface" in copilotManifest, false);
const copilotAgent = (await readFile(path.join(pluginRoot, "copilot", "agents", "matt-workflow.agent.md"), "utf8"))
  .replaceAll("\r\n", "\n");
assert(copilotAgent.startsWith("---\nname: matt-workflow\n"));
assert(copilotAgent.includes("disable-model-invocation: true"));
assert(copilotAgent.includes("$matt-workflow:<skill-name>"));
const skillNames = [
  "batch-grill-me",
  "code-review",
  "domain-modeling",
  "finishing-a-development-branch",
  "grill-with-docs",
  "grilling",
  "handoff",
  "implement",
  "loop-me",
  "prototype",
  "research",
  "setup-matt-pocock-skills",
  "tdd",
  "to-questionnaire",
  "to-spec",
  "to-tickets",
  "using-git-worktrees",
  "using-matt-workflow",
  "wayfinder",
  "wizard",
];
const experimental = ["batch-grill-me", "loop-me", "to-questionnaire", "wizard"];

function parseJsonYamlScalar(line, label) {
  const value = line.slice(line.indexOf(":") + 1).trim();
  assert(value.startsWith('"'), `${label}: expected a quoted scalar`);
  return JSON.parse(value);
}

const manifest = JSON.parse(await readFile(path.join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"));
assert.equal(manifest.name, "matt-workflow");
assert.match(manifest.version, /^0\.1\.0(?:\+codex\.[a-zA-Z0-9.-]+)?$/);
assert.equal(manifest.skills, "./skills/");
assert.equal(manifest.license, "MIT");
assert.deepEqual(manifest.interface.capabilities, ["Interactive", "Read", "Write"]);
assert.equal(manifest.interface.defaultPrompt.length, 3);
assert.equal("apps" in manifest, false);
assert.equal("mcpServers" in manifest, false);
assert.equal("hooks" in manifest, false);

const marketplace = JSON.parse(await readFile(path.join(root, ".agents", "plugins", "marketplace.json"), "utf8"));
assert.equal(marketplace.name, "matt-workflow-dev");
assert.deepEqual(marketplace.plugins[0], {
  name: "matt-workflow",
  source: { source: "local", path: "./plugins/matt-workflow" },
  policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
  category: "Developer Tools",
});
const copilotMarketplace = JSON.parse(await readFile(path.join(root, ".github", "plugin", "marketplace.json"), "utf8"));
assert.equal(copilotMarketplace.name, "matt-workflow-marketplace");
assert.equal(copilotMarketplace.owner.name, "Olivier Fortier");
assert.deepEqual(copilotMarketplace.plugins[0], {
  name: "matt-workflow",
  description: "A guided software-delivery workflow built from Matt Pocock's skills and Superpowers worktree discipline.",
  version: "0.1.0",
  source: "./plugins/matt-workflow",
  author: {
    name: "Olivier Fortier",
    email: "olivier.fortier@outlook.com",
    url: "https://github.com/OlivierFortier",
  },
  license: "MIT",
  keywords: ["engineering", "workflow", "skills", "tdd", "code-review"],
  category: "Developer Tools",
});

const claudeManifest = JSON.parse(await readFile(path.join(pluginRoot, ".claude-plugin", "plugin.json"), "utf8"));
assert.equal(claudeManifest.name, "matt-workflow");
assert.equal(claudeManifest.version, "0.1.0");
assert.equal(claudeManifest.skills, "./skills/");
assert.deepEqual(claudeManifest.agents, ["./claude/agents/matt-workflow.md"]);
assert.equal(claudeManifest.license, "MIT");
const claudeAgent = (await readFile(path.join(pluginRoot, "claude", "agents", "matt-workflow.md"), "utf8"))
  .replaceAll("\r\n", "\n");
assert(claudeAgent.startsWith("---\nname: matt-workflow\n"));
assert(claudeAgent.includes("using-matt-workflow"));
assert(!claudeAgent.includes("disable-model-invocation:"));
assert(!claudeAgent.includes("user-invocable:"));

const claudeMarketplace = JSON.parse(await readFile(path.join(root, ".claude-plugin", "marketplace.json"), "utf8"));
assert.equal(claudeMarketplace.name, "matt-workflow-marketplace");
assert.equal(claudeMarketplace.plugins.length, 1);
assert.equal(claudeMarketplace.plugins[0].name, "matt-workflow");
assert.equal(claudeMarketplace.plugins[0].source, "./plugins/matt-workflow");

const piPackage = JSON.parse(await readFile(path.join(pluginRoot, "package.json"), "utf8"));
assert.equal(piPackage.name, "matt-workflow");
assert.equal(piPackage.keywords.includes("pi-package"), true);
assert.deepEqual(piPackage.pi, { skills: ["./skills"] });
assert.equal(piPackage.main, "./opencode/index.ts");
assert.deepEqual(piPackage.dependencies, { "@opencode-ai/plugin": "1.18.4" });

const opencodeLoader = (await readFile(path.join(pluginRoot, "opencode", "skill-loader.mjs"), "utf8"))
  .replaceAll("\r\n", "\n");
const opencodeEntrypoint = (await readFile(path.join(pluginRoot, "opencode", "index.ts"), "utf8"))
  .replaceAll("\r\n", "\n");
assert(opencodeLoader.includes("export async function discoverSkillNames"));
assert(opencodeLoader.includes("export async function loadSkill"));
assert(opencodeEntrypoint.includes("matt_workflow_skill"));
assert(opencodeEntrypoint.includes("@opencode-ai/plugin"));
const { discoverSkillNames, loadSkill } = await import(
  pathToFileURL(path.join(pluginRoot, "opencode", "skill-loader.mjs")).href,
);
assert.deepEqual(await discoverSkillNames(), skillNames);
assert.equal(await loadSkill("using-matt-workflow"), await readFile(path.join(skillsRoot, "using-matt-workflow", "SKILL.md"), "utf8"));
await assert.rejects(() => loadSkill("missing-skill"), /Unknown skill/);
await assert.rejects(() => loadSkill("..\\package.json"), /Invalid skill name/);

const actualSkills = (await readdir(skillsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
assert.deepEqual(actualSkills, skillNames);

for (const name of skillNames) {
  const skill = (await readFile(path.join(skillsRoot, name, "SKILL.md"), "utf8")).replaceAll("\r\n", "\n");
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);
  assert(frontmatter, `${name}: invalid frontmatter`);
  const keys = frontmatter[1].split("\n").map((line) => line.split(":", 1)[0]);
  const expectedKeys = name === "using-matt-workflow"
    ? ["name", "description"]
    : ["name", "description", "disable-model-invocation"];
  assert.deepEqual(keys, expectedKeys, `${name}: invalid Copilot skill frontmatter`);
  assert.equal(frontmatter[1].split("\n")[0], `name: ${name}`);
  if (name !== "using-matt-workflow") {
    assert.match(frontmatter[1], /disable-model-invocation: true/);
  }
  assert(!skill.includes("[TODO"), `${name}: unresolved TODO placeholder`);

  if (name !== "using-matt-workflow") {
    assert(!skill.includes("## Matt Workflow boundary"), `${name}: duplicated router boundary`);
    assert(
      skill.includes("**Subflow:** Continue through this skill's completion criterion, then return to the caller."),
      `${name}: missing concise subflow guard`,
    );
  }
  for (const target of skillNames) {
    assert(!new RegExp(`(?<!\\.\\.)/${target}\\b`).test(skill), `${name}: unqualified /${target} reference`);
  }

  const agentMetadata = path.join(skillsRoot, name, "agents", "openai.yaml");
  const yaml = await readFile(agentMetadata, "utf8");
  if (name === "using-matt-workflow") {
    assert(/allow_implicit_invocation:\s*true/.test(yaml), `${name}: router must be implicit`);
  } else {
    assert(/allow_implicit_invocation:\s*false/.test(yaml), `${name}: component must be explicit-only`);
    const description = parseJsonYamlScalar(
      frontmatter[1].split("\n").find((line) => line.startsWith("description:")),
      `${name} description`,
    );
    const summaryLine = yaml.split("\n").find((line) => /^\s*short_description:/.test(line));
    assert(summaryLine, `${name}: missing short_description`);
    assert.equal(description, parseJsonYamlScalar(summaryLine, `${name} short_description`));
    assert(description.length <= 80, `${name}: user-facing description is too long`);
    assert(!/use when|delegat|directly requested/i.test(description), `${name}: description leaks model trigger prose`);
  }
}

for (const name of experimental) {
  const skill = await readFile(path.join(skillsRoot, name, "SKILL.md"), "utf8");
  assert(skill.includes("**Experimental:**"), `${name}: missing experimental notice`);
  assert(skill.includes("This in-progress skill is pinned at"), `${name}: missing pinned status`);
}

const router = await readFile(path.join(skillsRoot, "using-matt-workflow", "SKILL.md"), "utf8");
for (const route of ["delivery", "wayfinder", "workflow-design", "manual-wizard", "questionnaire"]) {
  assert(router.includes(route), `router: missing ${route} route`);
}
for (const field of ["Route:", "Experimental capability:", "Next gate:", "Writes:"]) {
  assert(router.includes(field), `router: missing ${field} contract`);
}
for (const rule of ["Plan Mode", "fresh implementation subagent", "sequentially", "whole-spec review"]) {
  assert(router.includes(rule), `router: missing ${rule} rule`);
}
assert(router.includes("Only `using-matt-workflow` is implicit"));
assert(router.includes("## Completion criteria"));
for (const rule of [
  "## Control mode",
  "human-in-the-loop",
  "autonomous",
  "explicitly asks",
  "self-approve",
  "without pausing",
  "take precedence over component instructions to ask, confirm, or wait",
  "leave the tested, committed feature branch and worktree intact",
  "unavailable credentials",
  "stakeholder answers",
  "irreversible or high-risk external action",
  "## Autonomous Wayfinder",
  "one ticket per fresh agent",
  "until the frontier and fog are empty",
  "route the completed spec through `$matt-workflow:to-tickets` and delivery",
  "Before either delivery implementation path",
]) {
  assert(router.includes(rule), `router: missing autonomous-mode rule: ${rule}`);
}
assert(router.includes("Next gate: none — autonomous mode explicitly authorized"));
assert(router.includes("Human-in-the-loop is the default"));

const setup = await readFile(path.join(skillsRoot, "setup-matt-pocock-skills", "SKILL.md"), "utf8");
assert(setup.indexOf("If `AGENTS.md` exists") < setup.indexOf("Else if `CLAUDE.md` exists"));
const questionnaire = await readFile(path.join(skillsRoot, "to-questionnaire", "SKILL.md"), "utf8");
assert(questionnaire.includes("## Return context"));
const wizard = await readFile(path.join(skillsRoot, "wizard", "SKILL.md"), "utf8");
assert(wizard.includes("OS temporary directory") && wizard.includes("never execute it automatically"));
const loop = await readFile(path.join(skillsRoot, "loop-me", "SKILL.md"), "utf8");
assert(loop.includes("workflows/") && loop.includes("NOTES.md"));

const lock = JSON.parse(await readFile(path.join(root, "upstreams.lock.json"), "utf8"));
assert.equal(lock["mattpocock-skills"].commit, "9603c1cc8118d08bc1b3bf34cf714f62178dea3b");
assert.equal(lock.superpowers.tagObject, "c984ea2e7aeffdcc865784fd6c5e3ab75da0209a");
assert.equal(lock.superpowers.commit, "d884ae04edebef577e82ff7c4e143debd0bbec99");
await access(path.join(pluginRoot, "third-party", "mattpocock-skills.LICENSE"));
await access(path.join(pluginRoot, "third-party", "superpowers.LICENSE"));
const wizardTemplate = await readFile(path.join(skillsRoot, "wizard", "template.sh"), "utf8");
assert(!wizardTemplate.includes("\r"), "wizard template must use LF line endings");
assert((await readFile(path.join(root, ".gitattributes"), "utf8")).includes("*.sh text eol=lf"));

for (const script of ["install-skills.sh", "install-skills.ps1"]) {
  const source = await readFile(path.join(root, "scripts", script), "utf8");
  assert(source.includes("skills add"), `${script}: missing skills CLI install`);
  assert(source.includes("OlivierFortier/mattpocock-superpowers"), `${script}: must install from the public repository`);
  assert(source.includes("--all"), `${script}: must install all skills`);
  assert(source.includes("--copy"), `${script}: must use portable copied files`);
  assert(source.includes("--global"), `${script}: must install globally`);
  assert(!/pi\s+install|pi\.cmd|opencode/i.test(source), `${script}: must remain host-agnostic`);
}
for (const script of ["install-pi-opencode.mjs", "install-pi-opencode.sh", "install-pi-opencode.ps1"]) {
  await assert.rejects(access(path.join(root, "scripts", script)));
}

console.log(`Structural checks passed (${skillNames.length} skills).`);
