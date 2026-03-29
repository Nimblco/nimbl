import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const TASKS_DIRECTORY = path.join("docs", "ai", "tasks");
const TASKS_ARCHIVE_DIRECTORY = path.join(TASKS_DIRECTORY, "archive");
const SPECS_DIRECTORY = path.join("docs", "specs");
const SPECS_ARCHIVE_DIRECTORY = path.join(SPECS_DIRECTORY, "archive");
const PLANS_DIRECTORY = path.join("docs", "plans");
const PLANS_ARCHIVE_DIRECTORY = path.join(PLANS_DIRECTORY, "archive");
const IGNORED_TASK_FILES = new Set(["README.md", "TEMPLATE.md"]);
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
        let fp = fileMatch[1].trim();
        fp = fp.replace(/`/g, '');
        if (!fp.startsWith("file or directory")) {
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
    "  --help            Show this help text",
  ].join("\n");
}

function parseArguments(argv) {
  let command = null;
  let task = null;
  let target = null;
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

    if (argument.startsWith("--")) {
      throw new WorkflowError(`Unknown option: ${argument}`);
    }

    if (command) {
      throw new WorkflowError(`Unexpected argument: ${argument}`);
    }

    command = argument;
  }

  return { command, task, target, help, copy };
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
      } catch {
        try {
          execSync("xclip -selection clipboard", { input: text });
          return true;
        } catch {
          execSync("xsel --clipboard --input", { input: text });
          return true;
        }
      }
    }
  } catch (error) {
    throw new WorkflowError(`Clipboard command failed: ${error.message}`);
  }
  throw new WorkflowError(`Clipboard support is not available for platform: ${platform}`);
}

export function runCli(argv, { repoRoot = process.cwd(), clipboardWriter = defaultClipboardWriter } = {}) {
  try {
    const { command, task, target, help, copy } = parseArguments(argv);

    if (copy && command !== "handoff" && command !== "resume") {
      throw new WorkflowError("--copy is only supported by handoff and resume commands.");
    }

    if (help || !command) {
      return { exitCode: 0, stdout: renderHelp(), stderr: "" };
    }

    if (target && command !== "handoff") {
      throw new WorkflowError("--to is only supported by the handoff command.");
    }

    if (target && !(target in TARGET_ADAPTERS)) {
      throw new WorkflowError(
        `Unknown target tool: ${target}. Expected one of: ${Object.keys(TARGET_ADAPTERS).join(", ")}`,
      );
    }

    const taskBrief = resolveTaskBrief(repoRoot, task);

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
