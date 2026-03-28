import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const repoRoot = process.cwd();
const templatePath = path.join(repoRoot, "docs", "ai", "skills", "TEMPLATE.md");
const skillIndexPath = path.join(repoRoot, "docs", "ai", "skills", "index.md");
const skillsDir = path.join(repoRoot, "docs", "ai", "skills");

function printUsage() {
  console.log("Usage:");
  console.log("  pnpm run new skill <skill-name> [--summary \"...\"] [--dry-run]");
  console.log("  pnpm run new skill");
}

function toSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toTitle(value) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function escapeInline(value) {
  return value.replace(/`/g, "\\`");
}

function buildSkillContent(template, slug, summary) {
  const title = toTitle(slug);
  return template
    .replace(/^name: Skill Name$/m, `name: ${title}`)
    .replace(/^summary: One-line description of what this skill helps with\.$/m, `summary: ${summary}`)
    .replace(/^  - situation 1$/m, "  - replace with a real usage condition")
    .replace(/^  - situation 2$/m, "  - replace with another real usage condition")
    .replace(/^    - keyword 1$/m, `    - ${slug}`)
    .replace(/^    - keyword 2$/m, "    - replace-me")
    .replace(/^    - path\/or\/glob$/m, "    - replace/with/path/or/glob")
    .replace(/^# Skill Name$/m, `# ${title}`)
    .replace(/^Describe the outcome this skill is trying to produce\.$/m, "Describe the outcome this skill should produce in this repo.")
    .replace(/^1\. Step one\.$/m, "1. Replace this with the first real step.")
    .replace(/^2\. Step two\.$/m, "2. Replace this with the second real step.")
    .replace(/^3\. Step three\.$/m, "3. Replace this with the third real step.")
    .replace(/^- guardrail 1$/m, "- replace with the first real guardrail")
    .replace(/^- guardrail 2$/m, "- replace with the second real guardrail")
    .replace(/^- validation expectation 1$/m, "- replace with the main validation expectation")
    .replace(/^- validation expectation 2$/m, "- replace with a secondary validation expectation");
}

function buildIndexEntry(slug, summary) {
  return [
    `### \`${slug}\``,
    "",
    `- file: \`docs/ai/skills/${slug}.md\``,
    `- use when: ${summary}`,
    `- keywords: \`${slug}\`, \`replace-me\``,
    "- files: `replace/with/path/or/glob`",
    "",
  ].join("\n");
}

async function promptForName() {
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question("Skill name: ");
    return answer;
  } finally {
    rl.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const target = args[0];

  if (!target) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (target !== "skill") {
    console.error(`Unsupported scaffold target: ${target}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  const dryRun = args.includes("--dry-run");
  const summaryFlagIndex = args.indexOf("--summary");
  const rawSummary =
    summaryFlagIndex >= 0 && args[summaryFlagIndex + 1]
      ? args[summaryFlagIndex + 1].trim()
      : "replace with a short summary of when to use this skill";

  const candidateName = args.find((arg, index) => {
    if (index === 0) {
      return false;
    }
    if (arg === "--dry-run" || arg === "--summary") {
      return false;
    }
    if (summaryFlagIndex >= 0 && index === summaryFlagIndex + 1) {
      return false;
    }
    return !arg.startsWith("--");
  });

  const providedName = candidateName ?? (await promptForName());
  const slug = toSlug(providedName ?? "");

  if (!slug) {
    console.error("A non-empty skill name is required.");
    process.exitCode = 1;
    return;
  }

  const skillPath = path.join(skillsDir, `${slug}.md`);
  const template = await readFile(templatePath, "utf8");
  const currentIndex = await readFile(skillIndexPath, "utf8");

  if (currentIndex.includes(`### \`${slug}\``)) {
    console.error(`Skill index already contains \`${slug}\`.`);
    process.exitCode = 1;
    return;
  }

  try {
    await readFile(skillPath, "utf8");
    console.error(`Skill file already exists: ${path.relative(repoRoot, skillPath)}`);
    process.exitCode = 1;
    return;
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      throw error;
    }
  }

  const skillContent = buildSkillContent(template, slug, rawSummary);
  const indexContent = `${currentIndex.trimEnd()}\n\n${buildIndexEntry(slug, escapeInline(rawSummary))}`;

  if (dryRun) {
    console.log(`[dry-run] Would create ${path.relative(repoRoot, skillPath)}`);
    console.log(`[dry-run] Would append skill entry to ${path.relative(repoRoot, skillIndexPath)}`);
    return;
  }

  await writeFile(skillPath, skillContent, "utf8");
  await writeFile(skillIndexPath, indexContent, "utf8");

  console.log(`Created ${path.relative(repoRoot, skillPath)}`);
  console.log(`Updated ${path.relative(repoRoot, skillIndexPath)}`);
  console.log("Next step: replace the placeholder trigger and workflow text with repo-specific guidance.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
