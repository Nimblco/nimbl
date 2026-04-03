#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { execSync, execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

// 🎨 Minimalist ANSI color palette
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
};

// Files shared by every install regardless of tool selection
const SHARED_PATHS = [
  "AGENTS.md",
  ".editorconfig",
  "docs/ai",
  "docs/plans",
  "docs/specs",
  "docs/product",
  "scripts/bootstrap.ps1",
  "scripts/bootstrap.sh",
  "scripts/check.ps1",
  "scripts/check.sh",
  "scripts/workflow.mjs",
  "scripts/workflow-lib.mjs",
  "skills",
];

// Per-tool adapter paths — only copied when the tool is selected
const ADAPTER_PATHS = {
  claude:      ["CLAUDE.md", ".claude", ".claude-plugin"],
  copilot:     [".github/copilot-instructions.md", ".github/instructions", ".github/prompts", ".vscode/extensions.json"],
  cursor:      [".cursor"],
  windsurf:    [".windsurfrules"],
  aider:       [".aider.conf.yml"],
  continue:    [".continue"],
  gemini:      ["GEMINI.md"],
  antigravity: [".agent"],
  codex:       [], // reads AGENTS.md natively — already in SHARED_PATHS
};

const ALL_TOOLS = Object.keys(ADAPTER_PATHS);

function resolveCorePaths(selectedTools) {
  const adapterFiles = selectedTools.flatMap((t) => ADAPTER_PATHS[t] ?? []);
  return [...SHARED_PATHS, ...adapterFiles];
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function printBanner() {
  console.log("");
  console.log(`${c.cyan}${c.bold}  █████╗  ██████╗ ███████╗███╗   ██╗████████╗██╗ ██████╗`);
  console.log(` ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██║██╔════╝`);
  console.log(` ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██║██║     `);
  console.log(` ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║██║     `);
  console.log(` ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║╚██████╗`);
  console.log(` ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝ ╚═════╝${c.reset}`);
  console.log("");
  console.log(`      ${c.bold}✦  W O R K F L O W   S C A F F O L D E R  ✦${c.reset}`);
  console.log("");
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function autoDetectEcosystem(targetRoot) {
  let ecosystem = { type: "Unknown", run: "npm run dev", test: "npm test", mgr: "npm" };
  try {
    const files = await fs.readdir(targetRoot);
    const hasFile = (name) => files.includes(name);
    const hasExt = (ext) => files.some(f => f.endsWith(ext));

    if (hasFile("package.json")) {
      if (hasFile("pnpm-lock.yaml")) ecosystem = { type: "Node.js (pnpm)", run: "pnpm dev", test: "pnpm test", mgr: "pnpm" };
      else if (hasFile("yarn.lock")) ecosystem = { type: "Node.js (Yarn)", run: "yarn dev", test: "yarn test", mgr: "yarn" };
      else ecosystem = { type: "Node.js (npm)", run: "npm run dev", test: "npm test", mgr: "npm" };
    } else if (hasFile("pyproject.toml") || hasFile("requirements.txt")) {
      ecosystem = { type: "Python", run: "python main.py", test: "pytest", mgr: "none (node directly)" };
    } else if (hasFile("go.mod")) {
      ecosystem = { type: "Go", run: "go run .", test: "go test ./...", mgr: "none (node directly)" };
    } else if (hasFile("Cargo.toml")) {
      ecosystem = { type: "Rust", run: "cargo run", test: "cargo test", mgr: "none (node directly)" };
    } else if (hasFile("pom.xml")) {
      ecosystem = { type: "Java (Maven)", run: "mvn spring-boot:run", test: "mvn test", mgr: "none (node directly)" };
    } else if (hasFile("build.gradle") || hasFile("build.gradle.kts")) {
      ecosystem = { type: "Java/Kotlin (Gradle)", run: "./gradlew bootRun", test: "./gradlew test", mgr: "none (node directly)" };
    } else if (hasFile("composer.json")) {
      ecosystem = { type: "PHP", run: "php artisan serve", test: "php artisan test", mgr: "none (node directly)" };
    } else if (hasExt(".sln") || hasExt(".csproj")) {
      ecosystem = { type: ".NET (C#)", run: "dotnet run", test: "dotnet test", mgr: "none (node directly)" };
    } else if (hasFile("Gemfile")) {
      ecosystem = { type: "Ruby", run: "bundle exec rails s", test: "bundle exec rspec", mgr: "none (node directly)" };
    } else if (hasFile("mix.exs")) {
      ecosystem = { type: "Elixir", run: "mix run", test: "mix test", mgr: "none (node directly)" };
    } else if (hasFile("pubspec.yaml")) {
      ecosystem = { type: "Dart/Flutter", run: "flutter run", test: "flutter test", mgr: "none (node directly)" };
    } else if (hasFile("Package.swift")) {
      ecosystem = { type: "Swift", run: "swift run", test: "swift test", mgr: "none (node directly)" };
    } else if (hasFile("CMakeLists.txt")) {
      ecosystem = { type: "C++ (CMake)", run: "make", test: "make test", mgr: "none (node directly)" };
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Ecosystem auto-detection failed: ${err.message}${c.reset}`);
  }
  return ecosystem;
}

async function copyLayer(targetDir, force = false, nonInteractive = false, includeArchives = false, selectedToolsArg = null) {
  const targetRoot = path.resolve(process.cwd(), targetDir);
  const startTime = Date.now();

  if (targetRoot === REPO_ROOT) {
    console.error("");
    console.error(`  ${c.red}✖ Cannot initialize the workflow layer inside the starter repository itself.${c.reset}`);
    process.exit(1);
  }

  // CLI Header
  printBanner();
  console.log(`  ${c.dim}Target Repository:${c.reset}  ${targetRoot}`);
  console.log("");

  // INTERACTIVE PROMPTS
  console.log(`  ${c.dim}Let's configure the AI's understanding of this new repo:${c.reset}`);
  const defaultName = path.basename(targetRoot);
  const ecosystem = await autoDetectEcosystem(targetRoot);

  if (ecosystem.type !== "Unknown") {
    console.log(`  ${c.dim}Auto-detected ecosystem:${c.reset} ${c.yellow}${ecosystem.type}${c.reset}`);
    console.log("");
  }

  let projectName = defaultName;
  let projectDesc = ecosystem.type !== "Unknown" ? `${ecosystem.type} Application` : "A new project managed by an agentic workflow layer.";
  let runCmd = ecosystem.run;
  let testCmd = ecosystem.test;
  let pkgMgr = ecosystem.mgr;
  let skillsDir = ".agent/skills";
  let selectedTools = selectedToolsArg ?? [...ALL_TOOLS];

  // Single readline interface shared across both interactive sections
  const rl = !nonInteractive ? readline.createInterface({ input, output }) : null;

  if (!nonInteractive) {
    const rawName = await rl.question(`  ${c.cyan}?${c.reset} Project Name ${c.dim}(${defaultName})${c.reset}: `);
    projectName = rawName.trim() || defaultName;

    const defaultDesc = ecosystem.type !== "Unknown" ? `${ecosystem.type} Application` : "A new project managed by an agentic workflow layer.";
    const rawDesc = await rl.question(`  ${c.cyan}?${c.reset} Brief description ${c.dim}(${defaultDesc})${c.reset}: `);
    projectDesc = rawDesc.trim() || defaultDesc;

    const rawRunCmd = await rl.question(`  ${c.cyan}?${c.reset} Primary run/dev command ${c.dim}(${ecosystem.run})${c.reset}: `);
    runCmd = rawRunCmd.trim() || ecosystem.run;
    
    const rawTestCmd = await rl.question(`  ${c.cyan}?${c.reset} Primary test/lint command ${c.dim}(${ecosystem.test})${c.reset}: `);
    testCmd = rawTestCmd.trim() || ecosystem.test;

    const rawPkgMgr = await rl.question(`  ${c.cyan}?${c.reset} Package manager to invoke workflow scripts ${c.dim}(${ecosystem.mgr})${c.reset}: `);
    const inputtedPkgMgr = rawPkgMgr.trim() || ecosystem.mgr;
    const ALLOWED_PKG_MANAGERS = new Set(["pnpm", "npm", "yarn", "bun", "none", "node directly"]);
    pkgMgr = ALLOWED_PKG_MANAGERS.has(inputtedPkgMgr) ? inputtedPkgMgr : ecosystem.mgr;

    const rawSkillsDir = await rl.question(`  ${c.cyan}?${c.reset} Directory for custom AI skills/prompts ${c.dim}(.agent/skills)${c.reset}: `);
    skillsDir = rawSkillsDir.trim() || ".agent/skills";

    // Tool selection — only ask if not already specified via --tools flag
    if (!selectedToolsArg) {
      const TOOL_DISPLAY = {
        claude: "Claude Code", copilot: "GitHub Copilot", cursor: "Cursor",
        windsurf: "Windsurf", aider: "Aider", continue: "Continue",
        gemini: "Gemini CLI", antigravity: "Antigravity", codex: "Codex",
      };
      console.log(`
  ${c.cyan}?${c.reset} Which AI tools does your team use?`);
      console.log(`  ${c.dim}Enter comma-separated keys, or press Enter for all.${c.reset}`);
      ALL_TOOLS.forEach((t, i) => {
        const recommended = ["claude", "copilot", "cursor"].includes(t);
        console.log(`  ${c.dim}${String(i + 1).padStart(2)}.${c.reset} ${t.padEnd(12)} ${TOOL_DISPLAY[t]}${recommended ? ` ${c.yellow}(recommended)${c.reset}` : ""}`);
      });
      const rawTools = await rl.question(`  ${c.cyan}>${c.reset} `);
      if (rawTools.trim()) {
        const parsed = rawTools.split(",").map(t => t.trim().toLowerCase()).filter(t => ALL_TOOLS.includes(t));
        selectedTools = parsed.length > 0 ? parsed : [...ALL_TOOLS];
      }
      console.log(`  ${c.dim}Installing adapters for: ${selectedTools.join(", ")}${c.reset}`);
    }
  }
  console.log("");

  await fs.mkdir(targetRoot, { recursive: true });

  console.log("");
  console.log(`  ${c.bold}Executing Scaffold Phase:${c.reset}`);
  
  let copiedCount = 0;
  let skippedCount = 0;

  await sleep(100);
  console.log(`  ${c.green}✔${c.reset} [1/4] Resolved target directories`);

  for (const relPath of resolveCorePaths(selectedTools)) {
    const srcPath = path.join(REPO_ROOT, relPath);
    const destPath = path.join(targetRoot, relPath);

    if (!(await pathExists(srcPath))) continue;

    const destExists = await pathExists(destPath);

    try {
      const stats = await fs.stat(srcPath);
      if (stats.isDirectory()) {
        // When the source is a directory, merge its contents into the destination.
        // If --force is passed and the destination exists, remove it first for a clean copy.
        if (destExists && force) {
          try {
            await fs.rm(destPath, { recursive: true, force: true });
          } catch (e) {
            // ignore remove errors and continue with copyDirectory which will merge
          }
        }
        await copyDirectory(srcPath, destPath, { includeArchives });
        copiedCount++;
      } else {
        // For individual files, only overwrite when --force is used.
        if (destExists && !force) {
          skippedCount++;
          continue;
        }
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.copyFile(srcPath, destPath);
        copiedCount++;
      }
    } catch (err) {
      console.warn(`  ${c.yellow}⚠ Failed to copy ${relPath}: ${err.message}${c.reset}`);
    }
  }
  await sleep(200);
  console.log(`  ${c.green}✔${c.reset} [2/4] Copied core AI playbooks`);

  await injectScriptsToPackageJson(targetRoot);
  await injectGithubAction(targetRoot, pkgMgr);
  await injectGitHook(targetRoot, pkgMgr);
  await sleep(100);
  console.log(`  ${c.green}✔${c.reset} [3/4] Injected automation scripts, Git Hooks, & CI/CD`);

  await customizeAiContext(targetRoot, projectName, projectDesc, skillsDir);
  await customizeAiCommands(targetRoot, runCmd, testCmd, pkgMgr);
  await customizeArchitecture(targetRoot, projectName);
  await customizeArchitectureFlows(targetRoot);
  await customizeFutureWork(targetRoot);
  await customizeDecisions(targetRoot);
  await customizeQuickstart(targetRoot, pkgMgr);
  await customizePortability(targetRoot);
  await customizeToolSupportMatrix(targetRoot);
  await scaffoldSkillsDirectory(targetRoot, skillsDir);
  await injectGitignoreEntries(targetRoot);
  await replaceWorkflowReferences(targetRoot, pkgMgr);
  await sleep(100);
  console.log(`  ${c.green}✔${c.reset} [4/4] Generated custom contexts & commands`);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // SUMMARY
  console.log("");
  console.log(`${c.cyan}  ────────────────────────────────────────────────────────${c.reset}`);
  console.log("");
  
  if (copiedCount === 0 && skippedCount > 0) {
    console.log(`  ${c.yellow}✦ Target repository was already initialized. (${duration}s)${c.reset}`);
    console.log(`  ${c.dim}Use --force to gently overwrite existing files if needed.${c.reset}`);
    console.log("");
  } else {
    console.log(`  ${c.green}${c.bold}✦ Successfully injected workflow layer in ${duration}s!${c.reset}`);
    console.log("");
  }

  console.log(`  ${c.bold}Next Steps:${c.reset}`);
  console.log(`  ${c.dim}1.${c.reset} Open the target repo cleanly in your IDE.`);
  
  if (!nonInteractive) {
    console.log("");
    const doFirstTask = await rl.question(`  ${c.cyan}?${c.reset} Do you want to scaffold your first AI task right now? ${c.dim}(y/N)${c.reset}: `);
    
    if (doFirstTask.toLowerCase() === 'y' || doFirstTask.toLowerCase() === 'yes') {
      const taskName = await rl.question(`  ${c.cyan}?${c.reset} What are you going to build? ${c.dim}(e.g., 'Add user authentication')${c.reset}: `);
      const safeTopic = taskName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || "initial-task";
      
      console.log(`\n  ${c.dim}Building your first task via internal workflow engine...${c.reset}`);
      try {
        const isDirectNode = pkgMgr.includes("node directly") || pkgMgr === "none";
        if (isDirectNode) {
          execFileSync("node", ["./scripts/workflow.mjs", "scaffold", "--slug", safeTopic, "--artifacts", "bundle"], { cwd: targetRoot, stdio: "ignore" });
        } else {
          const [bin, ...binArgs] = pkgMgr === "npm" ? ["npm", "run", "workflow", "--"] : [pkgMgr, "workflow"];
          execFileSync(bin, [...binArgs, "scaffold", "--slug", safeTopic, "--artifacts", "bundle"], { cwd: targetRoot, stdio: "ignore" });
        }
        console.log(`  ${c.green}✔ First task scaffolded successfully!${c.reset}\n`);
      } catch (e) {
        console.log(`  ${c.red}✖ Failed to scaffold automatically: ${e.message}${c.reset}\n`);
      }
    }
    rl.close();
  }

  console.log(`  ${c.dim}2.${c.reset} Tell your AI agent (Claude Code, Antigravity, Copilot):`);
  console.log(`     ${c.green}"Read AGENTS.md, check active tasks, and let's get to work"${c.reset}`);
  console.log("");
}

async function customizeAiContext(targetRoot, title, description, skillsDir) {
  const contextPath = path.join(targetRoot, "docs/ai/project-context.md");
  
  try {
    if (await pathExists(contextPath)) {
      const customContent = `# Project Context

Use this file for durable product context that every agent should understand before making changes.

## Summary

- **Project Name**: ${title}
- **Description**: ${description}

## Key Facts

- (Add product notes here)
- (Add architectural decisions or rules of thumb here)

## Notes for coding agents

- **Custom AI Skills**: Located in \`${skillsDir}/\`
- (Add preferred languages, frameworks, or deployment targets here)
`;
      await fs.writeFile(contextPath, customContent, "utf-8");
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to customize docs/ai/project-context.md: ${err.message}${c.reset}`);
  }
}

async function customizeAiCommands(targetRoot, runCmd, testCmd, pkgMgr) {
  const commandsPath = path.join(targetRoot, "docs/ai/commands.md");
  
  try {
    if (await pathExists(commandsPath)) {
      const isDirectNode = pkgMgr.includes("node directly") || pkgMgr === "none";
      const scriptPrefix = isDirectNode ? "node ./scripts/workflow.mjs" : (pkgMgr === "npm" ? "npm run workflow --" : `${pkgMgr} workflow`);
      const customContent = `# Commands

Use this file as the single place to document the best-known commands for this repository.
Subagent roles will execute these commands instead of guessing.

## Validation checks

- PowerShell: \`./scripts/check.ps1\`
- Bash: \`./scripts/check.sh\`

## Application Commands

- **Run / Dev**: \`${runCmd}\`
- **Test / Lint**: \`${testCmd}\`

## Agentic Workflow Commands

These commands manage your active AI task state.

- \`${scriptPrefix} scaffold --slug <topic> --artifacts bundle\` (Create aligned task, spec, and plan files)
- \`${scriptPrefix} scaffold --slug <topic> --artifacts task\` (Create a task brief only)
- \`${scriptPrefix} check\` (Validate task brief fields and linked workflow files)
- \`${scriptPrefix} pack\` (Create a portable markdown handoff pack)
- \`${scriptPrefix} status\` (Check active task)
- \`${scriptPrefix} resume\` (Resume active task)
- \`${scriptPrefix} handoff --to claude\` (Handoff task)
- \`${scriptPrefix} finalize\` (Complete and archive task)
`;
      await fs.writeFile(commandsPath, customContent, "utf-8");
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to customize docs/ai/commands.md: ${err.message}${c.reset}`);
  }
}

async function customizeArchitecture(targetRoot, projectName) {
  const filePath = path.join(targetRoot, "docs/ai/architecture.md");
  try {
    if (await pathExists(filePath)) {
      const content = `# Architecture Notes

Use this file to describe the current system shape, major module boundaries, and the conventions that matter when changing the codebase.

Keep it current enough that a new agent can understand where things live, what belongs where, and what should not be coupled together without reading the whole repo.

## System overview

- entry points: (describe your application's entry points)
- main modules: (describe your key modules or packages)
- shared libraries or packages: (list shared code)
- external services: (list APIs, databases, or third-party services)

## Boundaries

- (Describe module boundaries and coupling rules)
- Doc templates (\`docs/specs/TEMPLATE.md\`, \`docs/plans/TEMPLATE.md\`, \`docs/ai/tasks/TEMPLATE.md\`) must stay in sync with the scaffold output
- Tool adapter files (\`.claude/\`, \`.github/\`, \`.agent/\`, \`CLAUDE.md\`, \`GEMINI.md\`) must stay thin — they point back to \`AGENTS.md\` and shared docs rather than duplicating guidance

## Data flow and key interfaces

See [\`docs/ai/architecture-flows.md\`](./architecture-flows.md) for detailed command flows and interface contracts.
`;
      await fs.writeFile(filePath, content, "utf-8");
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to customize docs/ai/architecture.md: ${err.message}${c.reset}`);
  }
}

async function customizeArchitectureFlows(targetRoot) {
  const filePath = path.join(targetRoot, "docs/ai/architecture-flows.md");
  try {
    if (await pathExists(filePath)) {
      const content = `# Architecture — Data Flows and Key Interfaces

Read this file only when implementing or debugging a specific workflow CLI command. For module boundaries and conventions, see [\`docs/ai/architecture.md\`](./architecture.md).

## Data flows

- **Scaffold flow**: \`pnpm workflow scaffold --slug <topic> --artifacts bundle\` → writes dated task brief + spec + plan to \`docs/ai/tasks/\`, \`docs/specs/\`, \`docs/plans/\`
- **Check flow**: \`pnpm workflow check\` → reads active task brief, checks required fields and linked file existence, exits 0 or 1
- **Pack flow**: \`pnpm workflow pack\` → reads task brief + git status + optional git diff → writes a markdown handoff pack to \`docs/ai/handoffs/\`
- **Finalize flow**: \`pnpm workflow finalize\` → validates task brief → moves task + spec + plan to their respective \`archive/\` subdirectories, rewrites internal links

## Key interfaces

- Task brief markdown schema: fields parsed from \`- key: value\` bullet lines under \`##\` heading sections
- \`CORE_PATHS\` array — defines exactly what the installer copies; must stay in sync with what the workflow CLI expects to find

## Application-specific flows

(Add your application's key data flows and interfaces here)
`;
      await fs.writeFile(filePath, content, "utf-8");
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to customize docs/ai/architecture-flows.md: ${err.message}${c.reset}`);
  }
}

async function customizeFutureWork(targetRoot) {
  const filePath = path.join(targetRoot, "docs/ai/future-work.md");
  try {
    if (await pathExists(filePath)) {
      const content = `# Future Work

Use this file for known gaps, deferred improvements, and follow-up work that is intentionally not part of the current task.

Keep entries short, actionable, and grouped by theme.

## Product

- (Add deferred product features or improvements here)

## Developer experience

- (Add tooling, workflow, or DX improvements here)

## Operations

- (Add deployment, monitoring, or infrastructure improvements here)

## Usage notes

- Review this file when planning improvements.
- Prefer moving active work into a spec, plan, and task brief when it becomes implementation work.
`;
      await fs.writeFile(filePath, content, "utf-8");
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to customize docs/ai/future-work.md: ${err.message}${c.reset}`);
  }
}

async function customizeDecisions(targetRoot) {
  const filePath = path.join(targetRoot, "docs/ai/decisions.md");
  try {
    if (await pathExists(filePath)) {
      const content = `# Engineering Decisions

Use this file for durable decisions that affect how the product or repository should evolve.

Keep entries short, specific, and ordered with the newest decision at the top.

## What belongs here

- workflow continuity rules that should stay true across tasks and tool switches
- durable repo-level decisions about validation, packaging, or workspace structure
- product architecture choices that future contributors could reverse incorrectly without context

## Template

### Decision title

- date:
- status:
- context:
- decision:
- consequences:

## Notes

- Prefer a new entry when a decision would otherwise be easy to forget or reverse incorrectly.
- Use \`accepted\`, \`superseded\`, or \`rejected\` for status values if the team wants a simple lifecycle.
- Avoid recording temporary implementation details here unless they have long-term value.
- Link to a spec or plan when the decision came out of a larger design discussion.
`;
      await fs.writeFile(filePath, content, "utf-8");
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to customize docs/ai/decisions.md: ${err.message}${c.reset}`);
  }
}

async function customizeQuickstart(targetRoot, pkgMgr) {
  const filePath = path.join(targetRoot, "docs/ai/quickstart.md");
  try {
    if (await pathExists(filePath)) {
      const isDirectNode = pkgMgr.includes("node directly") || pkgMgr === "none";
      let prefix;
      if (isDirectNode) {
        prefix = "node ./scripts/workflow.mjs";
      } else if (pkgMgr === "npm") {
        prefix = "npm run workflow --";
      } else {
        prefix = `${pkgMgr} workflow`;
      }
      const content = `# Quickstart

Use this page as the shortest path from an idea to a finished workflow bundle.

Start with \`${prefix} scaffold\` when you need a new task brief, spec, or plan. The templates in \`docs/specs/TEMPLATE.md\`, \`docs/plans/TEMPLATE.md\`, and \`docs/ai/tasks/\` define the structure the scaffold mirrors.

## 1. Create the artifacts

1. Run \`${prefix} scaffold --slug <topic> --artifacts bundle\` when the work changes behavior, architecture, workflow, or spans multiple steps.
2. Run \`${prefix} scaffold --slug <topic> --artifacts task\` when the work only needs a task brief.
3. Fill in the generated files so the current work has a real summary, scope, next action, and validation notes.

## 2. Keep them aligned

- The spec says what should change and why.
- The plan says how the work will be carried out.
- The task brief says what is happening now and what another agent needs to know to continue.
- Use explicit \`none\` values for intentionally omitted spec or plan links so later tools do not have to infer intent.

If the scope changes, update all three artifacts together so the bundle stays easy to resume.

## 3. Validate the work

Run \`${prefix} check\` before handoff so missing fields or broken linked paths fail early. Then use the commands listed in \`docs/ai/commands.md\` for code validation. Start with the smallest useful check, then run the stronger repo checks before handoff.

Typical flow:

- run \`${prefix} check\`
- run focused tests or checks for the files you changed
- run the repository validation command set
- fix any failures before marking the task ready

## 4. Export for another tool when needed

When another LLM or IDE needs to continue the work, generate a portable markdown handoff pack:

- run \`${prefix} pack\`
- add \`--to gemini\` or \`--to claude\` for a tool-specific prompt block
- add \`--stdout\` when you want to paste the pack directly without writing a file
- add \`--include-diff\` only when the receiving tool really needs patch-level context

The default pack path is \`docs/ai/handoffs/\`.

## 5. Finalize the bundle

When the work is complete:

1. Make sure the task brief is marked complete and the final status is accurate.
2. Confirm the linked spec and plan reflect the final outcome.
3. Run \`${prefix} finalize --task <path-to-completed-task-brief>\` or the matching fallback command from \`docs/ai/commands.md\` when more than one task brief exists.
`;
      await fs.writeFile(filePath, content, "utf-8");
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to customize docs/ai/quickstart.md: ${err.message}${c.reset}`);
  }
}

async function customizePortability(targetRoot) {
  const filePath = path.join(targetRoot, "docs/ai/portability.md");
  try {
    if (await pathExists(filePath)) {
      let content = await fs.readFile(filePath, "utf-8");
      content = content.replace(/`package\.json` and `pnpm-workspace\.yaml`/g, "`package.json`");
      await fs.writeFile(filePath, content, "utf-8");
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to customize docs/ai/portability.md: ${err.message}${c.reset}`);
  }
}

async function customizeToolSupportMatrix(targetRoot) {
  const filePath = path.join(targetRoot, "docs/ai/tool-support-matrix.md");
  try {
    if (await pathExists(filePath)) {
      let content = await fs.readFile(filePath, "utf-8");
      content = content.replace(/`package\.json` and `pnpm-workspace\.yaml`[^`\n]*/g, "`package.json`: the default workspace root");
      await fs.writeFile(filePath, content, "utf-8");
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to customize docs/ai/tool-support-matrix.md: ${err.message}${c.reset}`);
  }
}

async function injectGitignoreEntries(targetRoot) {
  const gitignorePath = path.join(targetRoot, ".gitignore");
  const marker = "# AI Workflow";
  const managedEntries = ["docs/ai/handoffs/", "tmp/"];

  try {
    let existing = "";
    if (await pathExists(gitignorePath)) {
      existing = await fs.readFile(gitignorePath, "utf-8");
    }

    const missing = managedEntries.filter(e => !existing.includes(e));
    if (missing.length === 0) return; // all entries already present

    if (existing.includes(marker)) {
      // Block exists — append only the missing entries after the existing block
      // Find the end of the marker block and splice in new entries there
      const markerIdx = existing.indexOf(marker);
      const afterMarker = existing.indexOf("\n", markerIdx);
      // Find next blank line or EOF after the marker to know where block ends
      const afterBlock = existing.indexOf("\n\n", afterMarker + 1);
      const insertAt = afterBlock === -1 ? existing.length : afterBlock;
      const toInsert = "\n" + missing.join("\n");
      existing = existing.slice(0, insertAt) + toInsert + existing.slice(insertAt);
    } else {
      // No marker yet — append a new block
      const block = ["\n", marker, ...managedEntries, ""].join("\n");
      existing = existing + block;
    }
    await fs.writeFile(gitignorePath, existing, "utf-8");
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to update .gitignore: ${err.message}${c.reset}`);
  }
}

// Directories to scan for hardcoded pnpm workflow references
const WORKFLOW_REF_DIRS = [
  ".agent",
  ".claude",
  ".github/instructions",
  ".github/prompts",
  "docs/ai",
  "docs/specs",
  "docs/plans",
];

async function replaceWorkflowReferences(targetRoot, pkgMgr) {
  const isDirectNode = pkgMgr.includes("node directly") || pkgMgr === "none";
  let replacement;
  if (isDirectNode) {
    replacement = "node ./scripts/workflow.mjs";
  } else if (pkgMgr === "npm") {
    replacement = "npm run workflow --";
  } else {
    replacement = `${pkgMgr} workflow`;
  }

  // If the default is already pnpm, nothing to replace
  if (replacement === "pnpm workflow") return;

  for (const dir of WORKFLOW_REF_DIRS) {
    const dirPath = path.join(targetRoot, dir);
    if (!(await pathExists(dirPath))) continue;
    await replaceInDirectory(dirPath, /pnpm workflow/g, replacement);
  }

  // Also replace in top-level adapter files
  const WORKFLOW_REF_FILES = [
    "CLAUDE.md",
    "GEMINI.md",
    "AGENTS.md",
    ".github/copilot-instructions.md",
  ];
  for (const relFile of WORKFLOW_REF_FILES) {
    const filePath = path.join(targetRoot, relFile);
    if (!(await pathExists(filePath))) continue;
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const updated = content.replace(/pnpm workflow/g, replacement);
      if (updated !== content) {
        await fs.writeFile(filePath, updated, "utf-8");
      }
    } catch { /* skip unreadable files */ }
  }
}

async function replaceInDirectory(dirPath, pattern, replacement) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await replaceInDirectory(fullPath, pattern, replacement);
    } else if (entry.name.endsWith(".md")) {
      try {
        const content = await fs.readFile(fullPath, "utf-8");
        const updated = content.replace(pattern, replacement);
        if (updated !== content) {
          await fs.writeFile(fullPath, updated, "utf-8");
        }
      } catch { /* skip unreadable files */ }
    }
  }
}

async function copyDirectory(src, dest, { includeArchives = false } = {}) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.name === ".git" || entry.name === "node_modules") continue;

    // Skip archive directories unless explicitly requested
    if (entry.name === "archive" && entry.isDirectory() && !includeArchives) {
      // Only copy the empty archive dir with a .gitkeep so the structure exists
      await fs.mkdir(destPath, { recursive: true });
      const gitkeepPath = path.join(destPath, ".gitkeep");
      try { await fs.writeFile(gitkeepPath, "", "utf-8"); } catch { /* ignore */ }
      continue;
    }

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, { includeArchives });
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function injectScriptsToPackageJson(targetRoot) {
  const pkgPath = path.join(targetRoot, "package.json");
  if (!(await pathExists(pkgPath))) return;

  try {
    const content = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(content);

    let changed = false;
    if (!pkg.scripts) pkg.scripts = {};

    if (!pkg.scripts.workflow) {
      pkg.scripts.workflow = "node ./scripts/workflow.mjs";
      changed = true;
    }

    if (changed) {
      // Detect indentation from original file so we don't reformat the user's package.json
      const indentMatch = content.match(/^(\s+)"/m);
      const indent = indentMatch ? indentMatch[1] : "  ";
      await fs.writeFile(pkgPath, JSON.stringify(pkg, null, indent) + "\n");
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to inject scripts into package.json: ${err.message}${c.reset}`);
  }
}

async function scaffoldSkillsDirectory(targetRoot, skillsDir) {
  try {
    const fullSkillsPath = path.join(targetRoot, skillsDir);
    await fs.mkdir(fullSkillsPath, { recursive: true });
    
    const readmePath = path.join(fullSkillsPath, "README.md");
    if (!(await pathExists(readmePath))) {
      const readmeContent = `# AI Skills Directory

Store your custom AI skills, prompts, and tool instructions here.

## How to add a new skill

1. Create a markdown file for your skill (e.g. \`create-database-migration.md\`).
2. Add your instructions and constraints.
3. Your agent can read these files to execute specific tasks repeatedly with identical context.
`;
      await fs.writeFile(readmePath, readmeContent, "utf-8");
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to scaffold AI skills directory at ${skillsDir}: ${err.message}${c.reset}`);
  }
}

async function injectGithubAction(targetRoot, pkgMgr) {
  try {
    const actionDir = path.join(targetRoot, ".github/workflows");
    await fs.mkdir(actionDir, { recursive: true });
    
    const actionPath = path.join(actionDir, "ai-workflow-check.yml");
    const scriptPrefix = pkgMgr.includes("node") || pkgMgr === "none" ? "node ./scripts/workflow.mjs" : (pkgMgr === "npm" ? "npm run workflow --" : `${pkgMgr} workflow`);

    const actionContent = `name: AI Workflow Validation

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  validate-ai-tasks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
      - name: Validate AI Task Artifacts
        run: |
          ${scriptPrefix} check
`;
    await fs.writeFile(actionPath, actionContent, "utf-8");
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to inject GitHub Action: ${err.message}${c.reset}`);
  }
}

async function injectGitHook(targetRoot, pkgMgr) {
  try {
    const gitHooksDir = path.join(targetRoot, ".git/hooks");
    if (!(await pathExists(gitHooksDir))) return; // Only inject if git is initialized

    const preCommitPath = path.join(gitHooksDir, "pre-commit");
    const isDirectNode = pkgMgr.includes("node") || pkgMgr === "none";
    const scriptPrefix = isDirectNode ? "node ./scripts/workflow.mjs" : (pkgMgr === "npm" ? "npm run" : pkgMgr) + " workflow";

    const MARKER = "# nimblco-workflow-check";

    // Don't inject if already present
    if (await pathExists(preCommitPath)) {
      const existing = await fs.readFile(preCommitPath, "utf-8");
      if (existing.includes(MARKER)) return;
    }

    const nimblcoHook = `
${MARKER}
echo "[AI Pre-commit Hook]: Validating agentic workflow artifacts..."

# Load nvm/fnm if available so node is on PATH in non-interactive shells
if [ -s "$HOME/.nvm/nvm.sh" ]; then . "$HOME/.nvm/nvm.sh"; fi
if command -v fnm >/dev/null 2>&1; then eval "$(fnm env)"; fi

# Check if Node is installed so we don't break non-JS repos
if command -v node >/dev/null 2>&1; then
  ${scriptPrefix} check
  if [ $? -ne 0 ]; then
    echo ""
    echo "\\x1b[31m✖ AI Workflow Validation failed. Please fix your task brief or spec.\\x1b[0m"
    echo "Run '${scriptPrefix} check' to see the errors."
    exit 1
  fi
else
  echo "[AI Pre-commit Hook]: Node.js not detected on PATH. Skipping AI artifact validation."
  echo "If you use nvm or fnm, ensure your shell profile exports node to non-interactive shells."
fi
`;

    if (await pathExists(preCommitPath)) {
      // Append to existing hook
      const existing = await fs.readFile(preCommitPath, "utf-8");
      await fs.writeFile(preCommitPath, existing.trimEnd() + "\n" + nimblcoHook, { encoding: "utf-8", mode: 0o755 });
    } else {
      await fs.writeFile(preCommitPath, `#!/bin/sh\n${nimblcoHook}`, { encoding: "utf-8", mode: 0o755 });
    }
  } catch (err) {
    console.warn(`  ${c.yellow}⚠ Failed to inject Git Hook: ${err.message}${c.reset}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  let targetDir = null;
  let force = false;
  let nonInteractive = false;
  let includeArchives = false;
  let selectedTools = null; // null = ask interactively

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      printBanner();
      console.log(`  Extracts the intelligent workflow configuration from`);
      console.log(`  the starter repo and effortlessly injects it into`);
      console.log(`  any existing codebase.`);
      console.log("");
      console.log(`  ${c.dim}USAGE${c.reset}`);
      console.log(`    $ node scripts/init-workflow.mjs ${c.green}<target-directory>${c.reset}`);
      console.log("");
      console.log(`  ${c.dim}OPTIONS${c.reset}`);
      console.log(`    ${c.bold}-f, --force${c.reset}              Overwrite existing files`);
      console.log(`    ${c.bold}-y, --yes${c.reset}                Accept all defaults (non-interactive)`);
      console.log(`    ${c.bold}--include-archives${c.reset}       Copy archived tasks/plans/specs history`);
      console.log(`    ${c.bold}--tools=<list>${c.reset}           Comma-separated AI tools to install adapters for`);
      console.log(`    ${c.dim}                         Options: ${ALL_TOOLS.join(", ")}${c.reset}`);
      console.log(`    ${c.dim}                         Recommended: claude, copilot, cursor${c.reset}`);
      console.log(`    ${c.bold}-h, --help${c.reset}               Show this help menu`);
      console.log("");
      process.exit(0);
    } else if (arg === "--force" || arg === "-f") {
      force = true;
      if (!nonInteractive) {
        console.warn(`  ${"\x1b[33m"}⚠ --force: existing workflow files will be overwritten.${"\x1b[0m"}`);
      }
    } else if (arg === "--yes" || arg === "-y") {
      nonInteractive = true;
    } else if (arg === "--include-archives") {
      includeArchives = true;
    } else if (arg.startsWith("--tools=")) {
      const toolList = arg.slice("--tools=".length).split(",").map(t => t.trim().toLowerCase());
      selectedTools = toolList.filter(t => ALL_TOOLS.includes(t));
      if (selectedTools.length === 0) {
        console.error(`  ${"\x1b[31m"}✖ --tools: no valid tools specified. Options: ${ALL_TOOLS.join(", ")}${"\x1b[0m"}`);
        process.exit(1);
      }
    } else if (!arg.startsWith("-")) {
      targetDir = arg;
    }
  }

  if (!targetDir) {
    console.error("");
    console.error(`  ${c.red}✖ Missing target directory.${c.reset}`);
    console.log("");
    console.log(`  ${c.bold}USAGE${c.reset}`);
    console.log(`    node scripts/init-workflow.mjs ${c.green}<target-directory>${c.reset}`);
    console.log("");
    process.exit(1);
  }

  await copyLayer(targetDir, force, nonInteractive, includeArchives, selectedTools);
}

// Allow importing this module in tests without triggering the interactive CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error("");
    console.error(`  ${c.red}✖ Fatal Error:${c.reset} ${err.message}`);
    console.error("");
    process.exit(1);
  });
}

export {
  resolveCorePaths,
  injectGitignoreEntries,
  injectScriptsToPackageJson,
  injectGitHook,
  ALL_TOOLS,
  ADAPTER_PATHS,
  SHARED_PATHS,
};
