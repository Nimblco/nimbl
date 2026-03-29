import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const TASKS_DIRECTORY = path.join("docs", "ai", "tasks");
const HANDOFFS_DIRECTORY = path.join("docs", "ai", "handoffs");
const TASKS_ARCHIVE_DIRECTORY = path.join(TASKS_DIRECTORY, "archive");
const SPECS_DIRECTORY = path.join("docs", "specs");
const SPECS_ARCHIVE_DIRECTORY = path.join(SPECS_DIRECTORY, "archive");
const PLANS_DIRECTORY = path.join("docs", "plans");
const PLANS_ARCHIVE_DIRECTORY = path.join(PLANS_DIRECTORY, "archive");
const IGNORED_TASK_FILES = new Set(["README.md", "TEMPLATE.md"]);
const SCAFFOLD_ARTIFACT_MODES = new Set(["task", "bundle"]);
const TARGET_ADAPTERS = {
  codex: null,
  claude: "CLAUDE.md",
  gemini: "GEMINI.md",
  copilot: ".github/copilot-instructions.md",
};

class WorkflowError extends Error {}

function toRepoPath(value) {
  return value.split(path.sep).join("/");
}

function cleanFieldValue(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withoutBackticks =
    trimmed.startsWith("`") && trimmed.endsWith("`")
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  if (!withoutBackticks || /^(none|n\/a)$/i.test(withoutBackticks)) {
    return null;
  }

  return withoutBackticks;
}

function formatPromptFiles(items) {
  return items.join(", ");
}

function formatDateStamp(now) {
  return now.toISOString().slice(0, 10);
}

function formatScaffoldTitle(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeSlug(value) {
  if (!value) {
    return null;
  }

  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");

  return slug || null;
}

function normalizeCommandOutput(value) {
  if (typeof value === "string") {
    return value;
  }

  if (Buffer.isBuffer(value)) {
    return value.toString("utf8");
  }

  return value == null ? "" : String(value);
}

function cleanRelevantFileEntry(value) {
  const withoutBackticks = value.replace(/`/gu, "").trim();

  if (!withoutBackticks || withoutBackticks.startsWith("file or directory")) {
    return null;
  }

  const separatorIndex = withoutBackticks.search(/:(?=\s)/u);

  if (separatorIndex === -1) {
    return withoutBackticks;
  }

  return withoutBackticks.slice(0, separatorIndex).trim();
}

function readTaskBrief(taskPath, repoRoot) {
  const content = fs.readFileSync(taskPath, "utf8");
  const lines = content.split(/\r?\n/u);
  const fields = new Map();
  const validationCommands = [];
  const relevantFiles = [];
  let currentSection = "";

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/u);

    if (headingMatch) {
      currentSection = headingMatch[1].trim().toLowerCase();
      continue;
    }

    const fieldMatch = line.match(/^- ([^:]+):\s*(.*)$/u);

    if (fieldMatch) {
      fields.set(fieldMatch[1].trim().toLowerCase(), cleanFieldValue(fieldMatch[2]));
    }

    if (currentSection === "validation") {
      const validationMatch = line.match(/^- (.+)$/u);

      if (validationMatch) {
        validationCommands.push(validationMatch[1].trim());
      }
    } else if (currentSection === "relevant files") {
      const fileMatch = line.match(/^- (.+)$/u);

      if (fileMatch) {
        const fp = cleanRelevantFileEntry(fileMatch[1]);

        if (fp) {
          relevantFiles.push(fp);
        }
      }
    }
  }

  return {
    absolutePath: taskPath,
    relativePath: toRepoPath(path.relative(repoRoot, taskPath)),
    status: fields.get("status") ?? null,
    nextAction: fields.get("next action") ?? null,
    blockers: fields.get("blockers") ?? null,
    spec: fields.get("spec") ?? null,
    plan: fields.get("plan") ?? null,
    validationCommands,
    relevantFiles,
  };
}

function listTaskBriefs(repoRoot) {
  const tasksRoot = path.join(repoRoot, TASKS_DIRECTORY);

  if (!fs.existsSync(tasksRoot)) {
    throw new WorkflowError(`Task brief directory not found: ${toRepoPath(TASKS_DIRECTORY)}`);
  }

  const taskFiles = fs
    .readdirSync(tasksRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => entry.name.endsWith(".md"))
    .filter((entry) => !IGNORED_TASK_FILES.has(entry.name))
    .map((entry) => path.join(tasksRoot, entry.name));

  return taskFiles.map((taskPath) => readTaskBrief(taskPath, repoRoot));
}

function resolveExplicitTask(repoRoot, taskArgument) {
  const attempts = [
    path.resolve(repoRoot, taskArgument),
    path.join(repoRoot, TASKS_DIRECTORY, taskArgument),
    path.join(repoRoot, TASKS_DIRECTORY, `${taskArgument}.md`),
  ];

  const resolvedPath = attempts.find((candidate) => fs.existsSync(candidate));

  if (!resolvedPath) {
    throw new WorkflowError(`Task brief not found: ${taskArgument}`);
  }

  return readTaskBrief(resolvedPath, repoRoot);
}

function resolveTaskBrief(repoRoot, taskArgument) {
  if (taskArgument) {
    return resolveExplicitTask(repoRoot, taskArgument);
  }

  const taskBriefs = listTaskBriefs(repoRoot);

  if (taskBriefs.length === 0) {
    throw new WorkflowError("No task briefs were found. Create a task brief or pass --task.");
  }

  const activeTasks = taskBriefs.filter((task) => task.status?.toLowerCase() !== "completed");

  if (activeTasks.length === 1) {
    return activeTasks[0];
  }

  if (activeTasks.length > 1) {
    const taskList = activeTasks.map((task) => `- ${task.relativePath}`).join("\n");
    throw new WorkflowError(
      `Multiple active task briefs found:\n${taskList}\nUse --task to select one explicitly.`,
    );
  }

  if (taskBriefs.length === 1) {
    return taskBriefs[0];
  }

  throw new WorkflowError("No active task brief found. Use --task to select one explicitly.");
}

function buildPrompt(taskBrief, target) {
  const promptFiles = [];
  const adapter = target ? TARGET_ADAPTERS[target] : null;

  if (adapter) {
    promptFiles.push(adapter);
  }

  promptFiles.push("AGENTS.md", "docs/ai/commands.md", "docs/ai/standards.md");

  const parts = [
    `Read ${formatPromptFiles(promptFiles)}, and resume from ${taskBrief.relativePath}.`,
  ];

  if (taskBrief.spec && taskBrief.plan) {
    parts.push(
      `Use the linked spec at ${taskBrief.spec} and linked plan at ${taskBrief.plan} as the source of truth.`,
    );
  } else if (taskBrief.spec) {
    parts.push(`Read the linked spec at ${taskBrief.spec}.`);
  } else if (taskBrief.plan) {
    parts.push(`Read the linked plan at ${taskBrief.plan}.`);
  }

  if (taskBrief.status) {
    parts.push(`Current status: ${taskBrief.status}.`);
  }

  if (taskBrief.nextAction) {
    parts.push(`Start at the listed next action: ${taskBrief.nextAction}.`);
  }

  if (taskBrief.blockers) {
    parts.push(`Known blockers: ${taskBrief.blockers}.`);
  }

  if (taskBrief.relevantFiles && taskBrief.relevantFiles.length > 0) {
    parts.push(`Restrict your context to the active task brief and ONLY these files: ${taskBrief.relevantFiles.join(", ")}. Do not scan the entire workspace.`);
  } else {
    parts.push("Restrict your context to the active task brief and its listed relevant files. Do not scan the entire workspace.");
  }

  return parts.join(" ");
}

function renderStatus(taskBrief) {
  const lines = [
    `Task: ${taskBrief.relativePath}`,
    `Status: ${taskBrief.status ?? "missing"}`,
    `Next action: ${taskBrief.nextAction ?? "missing"}`,
    `Blockers: ${taskBrief.blockers ?? "none"}`,
    `Spec: ${taskBrief.spec ?? "none"}`,
    `Plan: ${taskBrief.plan ?? "none"}`,
  ];

  if (taskBrief.relevantFiles && taskBrief.relevantFiles.length > 0) {
    lines.push(`Relevant files: ${taskBrief.relevantFiles.join(", ")}`);
  }

  if (taskBrief.validationCommands.length > 0) {
    lines.push("Validation:");

    for (const command of taskBrief.validationCommands) {
      lines.push(`- ${command}`);
    }
  }

  return lines.join("\n");
}

function resolveLinkedPath(repoRoot, relativeOrAbsolutePath) {
  if (!relativeOrAbsolutePath) {
    return null;
  }

  if (path.isAbsolute(relativeOrAbsolutePath)) {
    return relativeOrAbsolutePath;
  }

  return path.join(repoRoot, relativeOrAbsolutePath);
}

function validateTaskBrief(taskBrief, repoRoot) {
  const issues = [];

  if (!taskBrief.status) {
    issues.push("Missing required field: status");
  }

  if (!taskBrief.nextAction) {
    issues.push("Missing required field: next action");
  }

  if (taskBrief.plan && !taskBrief.spec) {
    issues.push("A linked plan requires a linked spec.");
  }

  if (taskBrief.spec && !fs.existsSync(resolveLinkedPath(repoRoot, taskBrief.spec))) {
    issues.push(`Linked spec does not exist: ${taskBrief.spec}`);
  }

  if (taskBrief.plan && !fs.existsSync(resolveLinkedPath(repoRoot, taskBrief.plan))) {
    issues.push(`Linked plan does not exist: ${taskBrief.plan}`);
  }

  if (taskBrief.relevantFiles && taskBrief.relevantFiles.length > 0) {
    for (const relFile of taskBrief.relevantFiles) {
      if (!fs.existsSync(resolveLinkedPath(repoRoot, relFile))) {
        issues.push(`Listed relevant file or directory does not exist: ${relFile}`);
      }
    }
  }

  return issues;
}

function renderValidationFailure(issues) {
  return ["Workflow check failed:", ...issues.map((issue) => `- ${issue}`)].join("\n");
}

function parseGitStatusLines(output) {
  return normalizeCommandOutput(output)
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

function readGitStatus(repoRoot, commandRunner) {
  try {
    return {
      lines: parseGitStatusLines(commandRunner("git status --short", { cwd: repoRoot })),
      error: null,
    };
  } catch (error) {
    return {
      lines: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function readGitDiff(repoRoot, commandRunner) {
  try {
    const diffText = normalizeCommandOutput(
      commandRunner("git diff --no-ext-diff", { cwd: repoRoot }),
    ).trim();
    return {
      text: diffText,
      error: null,
    };
  } catch (error) {
    return {
      text: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function renderListSection(title, items, emptyMessage) {
  const lines = [`## ${title}`, ""];

  if (items.length === 0) {
    lines.push(`- ${emptyMessage}`);
  } else {
    for (const item of items) {
      lines.push(`- ${item}`);
    }
  }

  lines.push("");
  return lines;
}

function buildPackContent(
  taskBrief,
  { repoRoot, target, commandRunner, includeDiff = false, generatedAt = new Date() },
) {
  const gitStatus = readGitStatus(repoRoot, commandRunner);
  const gitDiff = includeDiff ? readGitDiff(repoRoot, commandRunner) : { text: "", error: null };
  const changedFiles = gitStatus.error
    ? [`unavailable: ${gitStatus.error}`]
    : gitStatus.lines.length > 0
      ? gitStatus.lines
      : ["none detected"];
  const promptText = buildPrompt(taskBrief, target ?? null);
  const lines = [
    "# Workflow Handoff Pack",
    "",
    `Generated: ${generatedAt.toISOString()}`,
    `Target tool: ${target ?? "generic"}`,
    "",
    "## Task State",
    "",
    `- Task brief: ${taskBrief.relativePath}`,
    `- Spec: ${taskBrief.spec ?? "none"}`,
    `- Plan: ${taskBrief.plan ?? "none"}`,
    `- Status: ${taskBrief.status ?? "missing"}`,
    `- Next action: ${taskBrief.nextAction ?? "missing"}`,
    `- Blockers: ${taskBrief.blockers ?? "none"}`,
    "",
    ...renderListSection("Relevant Files", taskBrief.relevantFiles, "none listed"),
    ...renderListSection("Validation", taskBrief.validationCommands, "none listed"),
    ...renderListSection("Changed Files", changedFiles, "none detected"),
    "## Prompt",
    "",
    "```text",
    promptText,
    "```",
    "",
  ];

  if (includeDiff) {
    lines.push("## Git Diff", "");
    if (gitDiff.error) {
      lines.push(`Git diff unavailable: ${gitDiff.error}`, "");
    } else if (!gitDiff.text) {
      lines.push("No diff output.", "");
    } else {
      lines.push("```diff", gitDiff.text, "```", "");
    }
  }

  return lines.join("\n");
}

function resolvePackOutputPath(repoRoot, taskBrief, outputPath) {
  if (outputPath) {
    return path.isAbsolute(outputPath) ? outputPath : path.join(repoRoot, outputPath);
  }

  const filename = `${path.basename(taskBrief.absolutePath, ".md")}-handoff.md`;
  return path.join(repoRoot, HANDOFFS_DIRECTORY, filename);
}

function renderPackSummary(packRelativePath, copied, target) {
  const lines = [
    `Target tool: ${target ?? "generic"}`,
    `Wrote workflow handoff pack: ${packRelativePath}`,
  ];

  if (copied) {
    lines.push("Clipboard: copied pack text");
  }

  return lines.join("\n");
}

function buildScaffoldPaths(repoRoot, slug, artifacts, now) {
  const dateStamp = formatDateStamp(now);
  const basename = `${dateStamp}-${slug}.md`;
  const taskRelativePath = toRepoPath(path.join(TASKS_DIRECTORY, basename));
  const specRelativePath = artifacts === "bundle" ? toRepoPath(path.join(SPECS_DIRECTORY, basename)) : null;
  const planRelativePath = artifacts === "bundle" ? toRepoPath(path.join(PLANS_DIRECTORY, basename)) : null;

  return {
    basename,
    title: formatScaffoldTitle(slug),
    task: {
      relativePath: taskRelativePath,
      absolutePath: path.join(repoRoot, TASKS_DIRECTORY, basename),
    },
    spec: specRelativePath
      ? {
          relativePath: specRelativePath,
          absolutePath: path.join(repoRoot, SPECS_DIRECTORY, basename),
        }
      : null,
    plan: planRelativePath
      ? {
          relativePath: planRelativePath,
          absolutePath: path.join(repoRoot, PLANS_DIRECTORY, basename),
        }
      : null,
  };
}

function renderTaskBriefTemplate({ title, taskPath, specPath, planPath }) {
  return `# Task Brief

## Summary

- task: ${title.toLowerCase()}
- requested outcome:
- primary constraint:

## Linked artifacts

- spec: ${specPath ? `\`${specPath}\`` : "none"}
- plan: ${planPath ? `\`${planPath}\`` : "none"}

## Current state

- status: todo
- current owner: unassigned
- next action: fill in the task summary, scope, and validation details
- blockers: none

## Progress checklist

- [ ] checkpoint 1
- [ ] checkpoint 2

## Scope

- in scope:
- out of scope:

## File ownership

- planner:
- implementer:
- reviewer:
- tester:

## Relevant files

- file or directory 1:
- file or directory 2:

## Acceptance criteria

- criterion 1:
- criterion 2:

## Validation

- command 1:
- command 2:

## Risks or dependencies

- risk 1:
- dependency 1:

## Handoff notes

- notes for the next agent:
`;
}

function renderSpecTemplate({ title, taskPath, planPath }) {
  return `# Spec: ${title.toLowerCase()}

## Purpose

Describe the approved change in one or two sentences.

## Scope

- in scope:
- out of scope:

## Proposed behavior

Describe the behavior, workflow, or architecture change at a level that another agent can implement without guessing.

## Acceptance criteria

- [ ] criterion 1
- [ ] criterion 2

## Constraints

- technical:
- product:
- delivery:

## Risks and open questions

- risk 1:
- question 1:

## Related docs

- plan: ${planPath ? `[${path.basename(planPath)}](../plans/${path.basename(planPath)})` : "none"}
- task brief: [${path.basename(taskPath)}](../ai/tasks/${path.basename(taskPath)})
- product doc: none
`;
}

function renderPlanTemplate({ title, taskPath, specPath }) {
  return `# ${title} Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Summarize the outcome this plan should produce.

**Architecture:** Describe the implementation approach in a few sentences.

**Tech Stack:** List the key technologies and commands involved.

---

## References

- spec: ${specPath ? `[${path.basename(specPath)}](../specs/${path.basename(specPath)})` : "none"}
- task brief: [${path.basename(taskPath)}](../ai/tasks/${path.basename(taskPath)})
- product doc: none

## Steps

- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Validation

- [ ] Run the relevant targeted checks.
- [ ] Run the repo's documented validation command(s) from \`docs/ai/commands.md\`.

## Risks

- risk 1:
- risk 2:

## Handoff notes

- anything the next agent needs to know:
`;
}

function writeScaffoldFile(entry, content, createdEntries, repoRoot) {
  if (fs.existsSync(entry.absolutePath)) {
    throw new WorkflowError(`Scaffold destination already exists: ${entry.relativePath}`);
  }

  fs.mkdirSync(path.dirname(entry.absolutePath), { recursive: true });
  fs.writeFileSync(entry.absolutePath, content);
  createdEntries.push({
    absolutePath: entry.absolutePath,
    relativePath: entry.relativePath,
  });
}

function scaffoldWorkflowArtifacts(repoRoot, { slug, artifacts, now }) {
  const normalizedSlug = normalizeSlug(slug);

  if (!normalizedSlug) {
    throw new WorkflowError("Missing or invalid value for --slug.");
  }

  if (!SCAFFOLD_ARTIFACT_MODES.has(artifacts)) {
    throw new WorkflowError(
      `Unknown value for --artifacts: ${artifacts}. Expected one of: ${[...SCAFFOLD_ARTIFACT_MODES].join(", ")}`,
    );
  }

  const paths = buildScaffoldPaths(repoRoot, normalizedSlug, artifacts, now);
  const createdEntries = [];

  try {
    if (paths.spec) {
      writeScaffoldFile(
        paths.spec,
        renderSpecTemplate({
          title: paths.title,
          taskPath: paths.task.relativePath,
          planPath: paths.plan?.relativePath ?? null,
        }),
        createdEntries,
        repoRoot,
      );
    }

    if (paths.plan) {
      writeScaffoldFile(
        paths.plan,
        renderPlanTemplate({
          title: paths.title,
          taskPath: paths.task.relativePath,
          specPath: paths.spec?.relativePath ?? null,
        }),
        createdEntries,
        repoRoot,
      );
    }

    writeScaffoldFile(
      paths.task,
      renderTaskBriefTemplate({
        title: paths.title,
        taskPath: paths.task.relativePath,
        specPath: paths.spec?.relativePath ?? null,
        planPath: paths.plan?.relativePath ?? null,
      }),
      createdEntries,
      repoRoot,
    );
  } catch (error) {
    for (const entry of createdEntries.slice().reverse()) {
      if (fs.existsSync(entry.absolutePath)) {
        fs.unlinkSync(entry.absolutePath);
      }
    }

    throw error;
  }

  return [
    { label: "Task", path: paths.task.relativePath },
    ...(paths.spec ? [{ label: "Spec", path: paths.spec.relativePath }] : []),
    ...(paths.plan ? [{ label: "Plan", path: paths.plan.relativePath }] : []),
  ];
}

function renderScaffoldSummary(entries) {
  return [
    "Scaffolded workflow artifacts:",
    ...entries.map((entry) => `- ${entry.label}: ${entry.path}`),
  ].join("\n");
}

function resolveTaskBundle(taskBrief, repoRoot) {
  const bundleEntries = [
    {
      key: "task",
      label: "Task",
      sourcePath: taskBrief.absolutePath,
      sourceRelativePath: taskBrief.relativePath,
      destPath: path.join(repoRoot, TASKS_ARCHIVE_DIRECTORY, path.basename(taskBrief.absolutePath)),
      destRelativePath: toRepoPath(
        path.join(TASKS_ARCHIVE_DIRECTORY, path.basename(taskBrief.absolutePath)),
      ),
    },
  ];

  if (taskBrief.spec) {
    const specSourcePath = resolveLinkedPath(repoRoot, taskBrief.spec);
    bundleEntries.push({
      key: "spec",
      label: "Spec",
      sourcePath: specSourcePath,
      sourceRelativePath: toRepoPath(path.relative(repoRoot, specSourcePath)),
      destPath: path.join(repoRoot, SPECS_ARCHIVE_DIRECTORY, path.basename(specSourcePath)),
      destRelativePath: toRepoPath(
        path.join(SPECS_ARCHIVE_DIRECTORY, path.basename(specSourcePath)),
      ),
    });
  }

  if (taskBrief.plan) {
    const planSourcePath = resolveLinkedPath(repoRoot, taskBrief.plan);
    bundleEntries.push({
      key: "plan",
      label: "Plan",
      sourcePath: planSourcePath,
      sourceRelativePath: toRepoPath(path.relative(repoRoot, planSourcePath)),
      destPath: path.join(repoRoot, PLANS_ARCHIVE_DIRECTORY, path.basename(planSourcePath)),
      destRelativePath: toRepoPath(
        path.join(PLANS_ARCHIVE_DIRECTORY, path.basename(planSourcePath)),
      ),
    });
  }

  return bundleEntries;
}

function rewriteArchivedTaskBriefContent(content, replacements) {
  const filteredLines = [];
  let currentSection = "";

  for (const line of content.split(/\r?\n/u)) {
    const headingMatch = line.match(/^##\s+(.+)$/u);

    if (headingMatch) {
      currentSection = headingMatch[1].trim().toLowerCase();
    }

    if (currentSection === "validation" && line.startsWith("- ") && /\bfinalize\b/u.test(line)) {
      continue;
    }

    filteredLines.push(line);
  }

  let rewrittenContent = filteredLines.join("\n");

  for (const replacement of replacements) {
    if (replacement.from && replacement.to && replacement.from !== replacement.to) {
      rewrittenContent = rewrittenContent.split(replacement.from).join(replacement.to);
    }
  }

  return rewrittenContent;
}

function renderArchivedBundleSummary(action, archivedEntries) {
  return [
    `${action} workflow bundle:`,
    ...archivedEntries.map((entry) => `- ${entry.label}: ${entry.path}`),
  ].join("\n");
}

function archiveTaskBundle(taskBrief, repoRoot) {
  const bundleEntries = resolveTaskBundle(taskBrief, repoRoot);
  const archiveDirectories = [...new Set(bundleEntries.map((entry) => path.dirname(entry.destPath)))];

  for (const archiveDirectory of archiveDirectories) {
    if (!fs.existsSync(archiveDirectory)) {
      fs.mkdirSync(archiveDirectory, { recursive: true });
    }
  }

  for (const entry of bundleEntries) {
    if (!fs.existsSync(entry.sourcePath)) {
      throw new WorkflowError(`Linked bundle source does not exist: ${entry.sourceRelativePath}`);
    }

    if (fs.existsSync(entry.destPath)) {
      throw new WorkflowError(`Archive destination already exists: ${entry.destRelativePath}`);
    }
  }

  const taskEntry = bundleEntries.find((entry) => entry.key === "task");
  const taskContent = fs.readFileSync(taskEntry.sourcePath, "utf8");
  const replacements = bundleEntries.map((entry) => ({
    from: entry.sourceRelativePath,
    to: entry.destRelativePath,
  }));
  const moveOrder = bundleEntries
    .slice()
    .sort((left, right) => ["spec", "plan", "task"].indexOf(left.key) - ["spec", "plan", "task"].indexOf(right.key));
  const movedEntries = [];

  try {
    for (const entry of moveOrder) {
      fs.renameSync(entry.sourcePath, entry.destPath);
      movedEntries.push(entry);
    }

    fs.writeFileSync(taskEntry.destPath, rewriteArchivedTaskBriefContent(taskContent, replacements));
  } catch (error) {
    for (const entry of movedEntries.slice().reverse()) {
      if (fs.existsSync(entry.destPath) && !fs.existsSync(entry.sourcePath)) {
        fs.renameSync(entry.destPath, entry.sourcePath);
      }
    }

    throw error instanceof WorkflowError
      ? error
      : new WorkflowError(`Archive bundle failed: ${error.message}`);
  }

  return moveOrder.map((entry) => ({ label: entry.label, path: entry.destRelativePath }));
}

function renderHelp() {
  return [
    "Usage: workflow <command> [options]",
    "",
    "Commands:",
    "  scaffold          Create aligned workflow artifacts for a new task",
    "  pack              Create a portable markdown handoff pack",
    "  handoff           Print a copy-pasteable prompt for the next tool",
    "  resume            Print a generic resume prompt from the selected task brief",
    "  status            Show the selected task brief summary",
    "  check             Validate the selected task brief and linked artifacts",
    "  finalize          Validate and archive a completed workflow bundle",
    "  archive           Archive the selected completed workflow bundle",
    "",
    "Options:",
    "  --task <path>     Use an explicit task brief path or filename",
    "  --to <tool>       Target tool for handoff: codex, claude, gemini, copilot",
    "  --slug <topic>    Topic slug for scaffold, for example workflow-automation",
    "  --artifacts <m>   Artifact set for scaffold: task or bundle",
    "  --output <path>   Output path override for workflow pack",
    "  --stdout          Print the workflow pack instead of writing a file",
    "  --include-diff    Include git diff details in the workflow pack",
    "  --copy            Copy output to clipboard (handoff, resume, pack)",
    "  --help            Show this help text",
  ].join("\n");
}

function parseArguments(argv) {
  let command = null;
  let task = null;
  let target = null;
  let slug = null;
  let artifacts = "bundle";
  let output = null;
  let stdoutMode = false;
  let includeDiff = false;
  let help = false;
  let copy = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help" || argument === "-h") {
      help = true;
      continue;
    }

    if (argument === "--copy") {
      copy = true;
      continue;
    }

    if (argument === "--stdout") {
      stdoutMode = true;
      continue;
    }

    if (argument === "--include-diff") {
      includeDiff = true;
      continue;
    }

    if (argument === "--task") {
      task = argv[index + 1];
      index += 1;

      if (!task) {
        throw new WorkflowError("Missing value for --task.");
      }

      continue;
    }

    if (argument === "--to") {
      target = argv[index + 1];
      index += 1;

      if (!target) {
        throw new WorkflowError("Missing value for --to.");
      }

      continue;
    }

    if (argument === "--slug") {
      slug = argv[index + 1];
      index += 1;

      if (!slug) {
        throw new WorkflowError("Missing value for --slug.");
      }

      continue;
    }

    if (argument === "--artifacts") {
      artifacts = argv[index + 1];
      index += 1;

      if (!artifacts) {
        throw new WorkflowError("Missing value for --artifacts.");
      }

      continue;
    }

    if (argument === "--output") {
      output = argv[index + 1];
      index += 1;

      if (!output) {
        throw new WorkflowError("Missing value for --output.");
      }

      continue;
    }

    if (argument.startsWith("--")) {
      throw new WorkflowError(`Unknown option: ${argument}`);
    }

    if (command) {
      throw new WorkflowError(`Unexpected argument: ${argument}`);
    }

    command = argument;
  }

  return { command, task, target, slug, artifacts, output, stdoutMode, includeDiff, help, copy };
}

function defaultClipboardWriter(text) {
  const platform = process.platform;
  try {
    if (platform === "win32") {
      execSync("clip", { input: text });
      return true;
    }
    if (platform === "darwin") {
      execSync("pbcopy", { input: text });
      return true;
    }
    if (platform === "linux") {
      try {
        execSync("wl-copy", { input: text });
        return true;
      } catch (wlError) {
        try {
          execSync("xclip -selection clipboard", { input: text });
          return true;
        } catch (xclipError) {
          try {
            execSync("xsel --clipboard --input", { input: text });
            return true;
          } catch (xselError) {
            throw new WorkflowError(
              `Clipboard command failed (tried wl-copy, xclip, xsel): ${xselError.message}`,
            );
          }
        }
      }
    }
  } catch (error) {
    throw new WorkflowError(`Clipboard command failed: ${error.message}`);
  }
  throw new WorkflowError(`Clipboard support is not available for platform: ${platform}`);
}

function defaultCommandRunner(command, options = {}) {
  return execSync(command, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

export function runCli(
  argv,
  {
    repoRoot = process.cwd(),
    clipboardWriter = defaultClipboardWriter,
    commandRunner = defaultCommandRunner,
    now = new Date(),
  } = {},
) {
  try {
    const {
      command,
      task,
      target,
      slug,
      artifacts,
      output,
      stdoutMode,
      includeDiff,
      help,
      copy,
    } = parseArguments(argv);

    if (copy && command !== "handoff" && command !== "resume" && command !== "pack") {
      throw new WorkflowError("--copy is only supported by handoff, resume, and pack commands.");
    }

    if (help || !command) {
      return { exitCode: 0, stdout: renderHelp(), stderr: "" };
    }

    if (target && command !== "handoff" && command !== "pack") {
      throw new WorkflowError("--to is only supported by the handoff and pack commands.");
    }

    if (output && command !== "pack") {
      throw new WorkflowError("--output is only supported by the pack command.");
    }

    if (stdoutMode && command !== "pack") {
      throw new WorkflowError("--stdout is only supported by the pack command.");
    }

    if (includeDiff && command !== "pack") {
      throw new WorkflowError("--include-diff is only supported by the pack command.");
    }

    if (target && !(target in TARGET_ADAPTERS)) {
      throw new WorkflowError(
        `Unknown target tool: ${target}. Expected one of: ${Object.keys(TARGET_ADAPTERS).join(", ")}`,
      );
    }

    if (command === "scaffold") {
      if (task) {
        throw new WorkflowError("--task is not supported by the scaffold command.");
      }

      const createdEntries = scaffoldWorkflowArtifacts(repoRoot, {
        slug,
        artifacts,
        now,
      });

      return {
        exitCode: 0,
        stdout: renderScaffoldSummary(createdEntries),
        stderr: "",
      };
    }

    const taskBrief = resolveTaskBrief(repoRoot, task);

    if (command === "pack") {
      if (stdoutMode && output) {
        throw new WorkflowError("--stdout cannot be combined with --output.");
      }

      const packText = buildPackContent(taskBrief, {
        repoRoot,
        target: target ?? null,
        commandRunner,
        includeDiff,
        generatedAt: now,
      });

      if (copy) {
        clipboardWriter(packText);
      }

      if (stdoutMode) {
        return {
          exitCode: 0,
          stdout: packText,
          stderr: "",
        };
      }

      const outputPath = resolvePackOutputPath(repoRoot, taskBrief, output);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, packText);

      return {
        exitCode: 0,
        stdout: renderPackSummary(toRepoPath(path.relative(repoRoot, outputPath)), copy, target ?? null),
        stderr: "",
      };
    }

    if (command === "handoff") {
      const promptText = buildPrompt(taskBrief, target ?? null);
      let confirmation = "";
      
      if (copy) {
        clipboardWriter(promptText);
        confirmation = "\nClipboard: copied prompt text\n";
      }

      return {
        exitCode: 0,
        stdout: [
          `Selected task: ${taskBrief.relativePath}`,
          `Target tool: ${target ?? "generic"}`,
          confirmation,
          "Prompt:",
          promptText,
        ].join("\n"),
        stderr: "",
      };
    }

    if (command === "resume") {
      const promptText = buildPrompt(taskBrief, null);
      let confirmation = "";

      if (copy) {
        clipboardWriter(promptText);
        confirmation = "\nClipboard: copied prompt text\n";
      }

      return {
        exitCode: 0,
        stdout: [
          `Selected task: ${taskBrief.relativePath}`,
          confirmation,
          "Prompt:",
          promptText
        ].join("\n"),
        stderr: "",
      };
    }

    if (command === "status") {
      return {
        exitCode: 0,
        stdout: renderStatus(taskBrief),
        stderr: "",
      };
    }

    if (command === "check") {
      const issues = validateTaskBrief(taskBrief, repoRoot);

      if (issues.length > 0) {
        return {
          exitCode: 1,
          stdout: "",
          stderr: renderValidationFailure(issues),
        };
      }

      return {
        exitCode: 0,
        stdout: `Workflow check passed for ${taskBrief.relativePath}.`,
        stderr: "",
      };
    }

    if (command === "finalize") {
      const issues = validateTaskBrief(taskBrief, repoRoot);

      if (issues.length > 0) {
        return {
          exitCode: 1,
          stdout: "",
          stderr: renderValidationFailure(issues),
        };
      }

      if (taskBrief.status?.toLowerCase() !== "completed") {
        throw new WorkflowError(`Finalize requires a completed task brief: ${taskBrief.relativePath}`);
      }

      const archivedEntries = archiveTaskBundle(taskBrief, repoRoot);

      return {
        exitCode: 0,
        stdout: renderArchivedBundleSummary("Finalized", archivedEntries),
        stderr: "",
      };
    }

    if (command === "archive") {
      if (taskBrief.status?.toLowerCase() !== "completed") {
        throw new WorkflowError(`Cannot archive task because its status is not completed: ${taskBrief.relativePath}`);
      }
      const archivedEntries = archiveTaskBundle(taskBrief, repoRoot);

      return {
        exitCode: 0,
        stdout: renderArchivedBundleSummary("Archived", archivedEntries),
        stderr: "",
      };
    }

    throw new WorkflowError(`Unknown command: ${command}`);
  } catch (error) {
    return {
      exitCode: 1,
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error),
    };
  }
}
