import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

function writeRepoFile(repoRoot, relativePath, content) {
  const absolutePath = path.join(repoRoot, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
}

function createFixtureRepo({ tasks, spec = true, plan = true }) {
  const repoRoot = mkdtempSync(path.join(tmpdir(), "workflow-cli-"));

  writeRepoFile(repoRoot, "AGENTS.md", "# agents\n");
  writeRepoFile(repoRoot, "docs/ai/commands.md", "# commands\n");
  writeRepoFile(repoRoot, "docs/ai/standards.md", "# standards\n");
  writeRepoFile(repoRoot, "docs/ai/tasks/TEMPLATE.md", "# task template\n");
  writeRepoFile(repoRoot, "docs/specs/TEMPLATE.md", "# spec template\n");
  writeRepoFile(repoRoot, "docs/plans/TEMPLATE.md", "# plan template\n");

  if (spec) {
    writeRepoFile(repoRoot, "docs/specs/2026-03-29-example.md", "# spec\n");
  }

  if (plan) {
    writeRepoFile(repoRoot, "docs/plans/2026-03-29-example.md", "# plan\n");
  }

  for (const [filename, content] of Object.entries(tasks)) {
    writeRepoFile(repoRoot, `docs/ai/tasks/${filename}`, content);
  }

  return repoRoot;
}

function getTaskPaths(repoRoot, filename) {
  return {
    sourcePath: path.join(repoRoot, "docs", "ai", "tasks", filename),
    archivedPath: path.join(repoRoot, "docs", "ai", "tasks", "archive", filename),
  };
}

function getBundlePaths(repoRoot, filename = "2026-03-29-example.md") {
  return {
    taskSourcePath: path.join(repoRoot, "docs", "ai", "tasks", filename),
    taskArchivePath: path.join(repoRoot, "docs", "ai", "tasks", "archive", filename),
    specSourcePath: path.join(repoRoot, "docs", "specs", filename),
    specArchivePath: path.join(repoRoot, "docs", "specs", "archive", filename),
    planSourcePath: path.join(repoRoot, "docs", "plans", filename),
    planArchivePath: path.join(repoRoot, "docs", "plans", "archive", filename),
  };
}

function makeTaskBrief({
  status = "in_progress",
  nextAction = "validate the workflow CLI",
  blockers = "none",
  spec = "`docs/specs/2026-03-29-example.md`",
  plan = "`docs/plans/2026-03-29-example.md`",
  relevantFiles = [],
} = {}) {
  return `# Task Brief

## Summary

- task: example task
- requested outcome: prove the CLI works
- primary constraint: keep it simple

## Linked artifacts

- spec: ${spec}
- plan: ${plan}

## Current state

- status: ${status}
- current owner: codex
- next action: ${nextAction}
- blockers: ${blockers}

${relevantFiles.length > 0 ? `## Relevant files

${relevantFiles.map((file) => `- ${file}`).join("\n")}

` : ""}## Validation

- node --test
- powershell -ExecutionPolicy Bypass -File .\\scripts\\check.ps1
`;
}

function createGitRunner({ status = "", diff = "" } = {}) {
  return (command) => {
    if (command === "git status --short") {
      return status;
    }

    if (command === "git diff --no-ext-diff") {
      return diff;
    }

    throw new Error(`Unexpected command: ${command}`);
  };
}

async function loadWorkflowModule() {
  const moduleUrl = pathToFileURL(path.resolve("scripts/workflow-lib.mjs"));
  return import(`${moduleUrl.href}?cacheBust=${Date.now()}`);
}

test("handoff prints a gemini-ready resume prompt from the active task brief", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": makeTaskBrief(),
    },
  });

  const result = runCli(["handoff", "--to", "gemini"], { repoRoot });

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Target tool: gemini/);
  assert.match(
    result.stdout,
    /Read GEMINI\.md, AGENTS\.md, docs\/ai\/commands\.md, docs\/ai\/standards\.md, and resume from docs\/ai\/tasks\/2026-03-29-example\.md\./,
  );
  assert.match(result.stdout, /docs\/specs\/2026-03-29-example\.md/);
  assert.match(result.stdout, /docs\/plans\/2026-03-29-example\.md/);
  assert.match(result.stdout, /Start at the listed next action: validate the workflow CLI\./);
});

test("status prints the selected task summary and validation commands", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": makeTaskBrief(),
    },
  });

  const result = runCli(["status"], { repoRoot });

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Task: docs\/ai\/tasks\/2026-03-29-example\.md/);
  assert.match(result.stdout, /Status: in_progress/);
  assert.match(result.stdout, /Next action: validate the workflow CLI/);
  assert.match(result.stdout, /Validation:/);
  assert.match(result.stdout, /- node --test/);
});

test("check fails when a linked plan path is missing", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": makeTaskBrief(),
    },
    plan: false,
  });

  const result = runCli(["check"], { repoRoot });

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /Workflow check failed/);
  assert.match(result.stderr, /Linked plan does not exist: docs\/plans\/2026-03-29-example\.md/);
});

test("check allows a task brief with a linked spec and no plan", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": makeTaskBrief({ plan: "none" }),
    },
    plan: false,
  });

  const result = runCli(["check"], { repoRoot });

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Workflow check passed/);
});

test("check fails when the task brief is missing status and next action", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": `# Task Brief

## Linked artifacts

- spec: none
- plan: none

## Current state

- current owner: codex
- blockers: none
`,
    },
    spec: false,
    plan: false,
  });

  const result = runCli(["check"], { repoRoot });

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /Missing required field: status/);
  assert.match(result.stderr, /Missing required field: next action/);
});

test("check fails when a task brief links a plan without a spec", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": makeTaskBrief({
        spec: "none",
        plan: "`docs/plans/2026-03-29-example.md`",
      }),
    },
    spec: false,
  });

  const result = runCli(["check"], { repoRoot });

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /A linked plan requires a linked spec/);
});

test("check accepts relevant file entries that include descriptions", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": `# Task Brief

## Linked artifacts

- spec: none
- plan: none

## Current state

- status: in_progress
- current owner: codex
- next action: verify the workflow parser
- blockers: none

## Relevant files

- scripts/workflow-lib.mjs: existing workflow CLI implementation
- docs/ai/commands.md: command source of truth
`,
    },
    spec: false,
    plan: false,
  });
  writeRepoFile(repoRoot, "scripts/workflow-lib.mjs", "// workflow cli\n");

  const result = runCli(["check"], { repoRoot });

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Workflow check passed/);
});

test("scaffold creates aligned task, spec, and plan files for a bundle", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {},
    spec: false,
    plan: false,
  });

  const result = runCli(
    ["scaffold", "--slug", "workflow-automation", "--artifacts", "bundle"],
    { repoRoot, now: new Date("2026-03-29T08:00:00Z") },
  );

  const taskPath = path.join(repoRoot, "docs", "ai", "tasks", "2026-03-29-workflow-automation.md");
  const specPath = path.join(repoRoot, "docs", "specs", "2026-03-29-workflow-automation.md");
  const planPath = path.join(repoRoot, "docs", "plans", "2026-03-29-workflow-automation.md");

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Scaffolded workflow artifacts:/);
  assert.equal(existsSync(taskPath), true);
  assert.equal(existsSync(specPath), true);
  assert.equal(existsSync(planPath), true);
  assert.match(readFileSync(taskPath, "utf8"), /spec: `docs\/specs\/2026-03-29-workflow-automation\.md`/);
  assert.match(readFileSync(taskPath, "utf8"), /plan: `docs\/plans\/2026-03-29-workflow-automation\.md`/);
});

test("scaffold can create a task-only artifact set with explicit none links", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {},
    spec: false,
    plan: false,
  });

  const result = runCli(
    ["scaffold", "--slug", "docs-tweak", "--artifacts", "task"],
    { repoRoot, now: new Date("2026-03-29T08:00:00Z") },
  );

  const taskPath = path.join(repoRoot, "docs", "ai", "tasks", "2026-03-29-docs-tweak.md");
  const specPath = path.join(repoRoot, "docs", "specs", "2026-03-29-docs-tweak.md");
  const planPath = path.join(repoRoot, "docs", "plans", "2026-03-29-docs-tweak.md");

  assert.equal(result.exitCode, 0);
  assert.equal(existsSync(taskPath), true);
  assert.equal(existsSync(specPath), false);
  assert.equal(existsSync(planPath), false);
  assert.match(readFileSync(taskPath, "utf8"), /spec: none/);
  assert.match(readFileSync(taskPath, "utf8"), /plan: none/);
});

test("pack writes a default handoff markdown file with changed files and prompt text", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": makeTaskBrief({
        relevantFiles: ["scripts/workflow-lib.mjs: existing workflow CLI implementation"],
      }),
    },
  });

  const result = runCli(["pack"], {
    repoRoot,
    now: new Date("2026-03-29T09:00:00Z"),
    commandRunner: createGitRunner({
      status: " M scripts/workflow-lib.mjs\n?? docs/ai/tasks/2026-03-29-example.md\n",
    }),
  });

  const packPath = path.join(repoRoot, "docs", "ai", "handoffs", "2026-03-29-example-handoff.md");

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Wrote workflow handoff pack:/);
  assert.equal(existsSync(packPath), true);
  assert.match(readFileSync(packPath, "utf8"), /# Workflow Handoff Pack/);
  assert.match(readFileSync(packPath, "utf8"), /docs\/ai\/tasks\/2026-03-29-example\.md/);
  assert.match(readFileSync(packPath, "utf8"), /scripts\/workflow-lib\.mjs/);
  assert.match(readFileSync(packPath, "utf8"), /Read AGENTS\.md/);
});

test("pack --stdout prints the full pack text without writing the default file", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": makeTaskBrief(),
    },
  });

  const result = runCli(["pack", "--stdout"], {
    repoRoot,
    commandRunner: createGitRunner({
      status: " M scripts/workflow-lib.mjs\n",
    }),
  });

  const packPath = path.join(repoRoot, "docs", "ai", "handoffs", "2026-03-29-example-handoff.md");

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /# Workflow Handoff Pack/);
  assert.equal(existsSync(packPath), false);
});

test("pack --copy writes a custom output file and copies the pack text", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": makeTaskBrief(),
    },
  });
  const customPackPath = path.join(repoRoot, "tmp", "example-pack.md");
  let copiedText = null;

  const result = runCli(["pack", "--copy", "--output", "tmp/example-pack.md"], {
    repoRoot,
    clipboardWriter: (text) => {
      copiedText = text;
      return true;
    },
    commandRunner: createGitRunner({
      status: "",
    }),
  });

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Clipboard: copied pack text/);
  assert.equal(existsSync(customPackPath), true);
  assert.match(copiedText, /# Workflow Handoff Pack/);
  assert.equal(copiedText, readFileSync(customPackPath, "utf8"));
});

test("pack --include-diff appends a git diff section and honors target prompts", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": makeTaskBrief(),
    },
  });

  const result = runCli(["pack", "--stdout", "--include-diff", "--to", "gemini"], {
    repoRoot,
    commandRunner: createGitRunner({
      status: " M scripts/workflow-lib.mjs\n",
      diff: "diff --git a/scripts/workflow-lib.mjs b/scripts/workflow-lib.mjs\n+new line\n",
    }),
  });

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /## Prompt/);
  assert.match(result.stdout, /Read GEMINI\.md/);
  assert.match(result.stdout, /## Git Diff/);
  assert.match(result.stdout, /diff --git a\/scripts\/workflow-lib\.mjs/);
});

test("finalize archives a completed task brief, spec, and plan bundle", async () => {
  const { runCli } = await loadWorkflowModule();
  const filename = "2026-03-29-example.md";
  const repoRoot = createFixtureRepo({
    tasks: {
      [filename]: makeTaskBrief({ status: "completed" }),
    },
  });
  const bundlePaths = getBundlePaths(repoRoot, filename);

  const result = runCli(["finalize"], { repoRoot });

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /docs\/ai\/tasks\/archive\/2026-03-29-example\.md/);
  assert.match(result.stdout, /docs\/specs\/archive\/2026-03-29-example\.md/);
  assert.match(result.stdout, /docs\/plans\/archive\/2026-03-29-example\.md/);
  assert.equal(existsSync(bundlePaths.taskSourcePath), false);
  assert.equal(existsSync(bundlePaths.specSourcePath), false);
  assert.equal(existsSync(bundlePaths.planSourcePath), false);
  assert.equal(existsSync(bundlePaths.taskArchivePath), true);
  assert.equal(existsSync(bundlePaths.specArchivePath), true);
  assert.equal(existsSync(bundlePaths.planArchivePath), true);
  assert.match(readFileSync(bundlePaths.taskArchivePath, "utf8"), /status: completed/);
  assert.match(readFileSync(bundlePaths.taskArchivePath, "utf8"), /spec: `docs\/specs\/archive\/2026-03-29-example\.md`/);
  assert.match(readFileSync(bundlePaths.taskArchivePath, "utf8"), /plan: `docs\/plans\/archive\/2026-03-29-example\.md`/);
});

test("finalize fails when the selected task is not completed", async () => {
  const { runCli } = await loadWorkflowModule();
  const filename = "2026-03-29-example.md";
  const repoRoot = createFixtureRepo({
    tasks: {
      [filename]: makeTaskBrief(),
    },
  });
  const bundlePaths = getBundlePaths(repoRoot, filename);

  const result = runCli(["finalize"], { repoRoot });

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /finalize requires a completed task brief/i);
  assert.equal(existsSync(bundlePaths.taskSourcePath), true);
  assert.equal(existsSync(bundlePaths.specSourcePath), true);
  assert.equal(existsSync(bundlePaths.planSourcePath), true);
  assert.equal(existsSync(bundlePaths.taskArchivePath), false);
  assert.equal(existsSync(bundlePaths.specArchivePath), false);
  assert.equal(existsSync(bundlePaths.planArchivePath), false);
});

test("finalize fails when task validation fails", async () => {
  const { runCli } = await loadWorkflowModule();
  const filename = "2026-03-29-example.md";
  const repoRoot = createFixtureRepo({
    tasks: {
      [filename]: makeTaskBrief({ status: "completed" }),
    },
    plan: false,
  });
  const bundlePaths = getBundlePaths(repoRoot, filename);

  const result = runCli(["finalize"], { repoRoot });

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /Workflow check failed:/);
  assert.equal(existsSync(bundlePaths.taskSourcePath), true);
  assert.equal(existsSync(bundlePaths.specSourcePath), true);
  assert.equal(existsSync(bundlePaths.planSourcePath), false);
  assert.equal(existsSync(bundlePaths.taskArchivePath), false);
  assert.equal(existsSync(bundlePaths.specArchivePath), false);
  assert.equal(existsSync(bundlePaths.planArchivePath), false);
});

test("finalize archives a completed task brief plus spec when no plan is linked", async () => {
  const { runCli } = await loadWorkflowModule();
  const filename = "2026-03-29-example.md";
  const repoRoot = createFixtureRepo({
    tasks: {
      [filename]: makeTaskBrief({ status: "completed", plan: "none" }),
    },
    plan: false,
  });
  const bundlePaths = getBundlePaths(repoRoot, filename);

  const result = runCli(["finalize"], { repoRoot });

  assert.equal(result.exitCode, 0);
  assert.equal(existsSync(bundlePaths.taskSourcePath), false);
  assert.equal(existsSync(bundlePaths.specSourcePath), false);
  assert.equal(existsSync(bundlePaths.planSourcePath), false);
  assert.equal(existsSync(bundlePaths.taskArchivePath), true);
  assert.equal(existsSync(bundlePaths.specArchivePath), true);
  assert.equal(existsSync(bundlePaths.planArchivePath), false);
  assert.match(readFileSync(bundlePaths.taskArchivePath, "utf8"), /spec: `docs\/specs\/archive\/2026-03-29-example\.md`/);
  assert.doesNotMatch(readFileSync(bundlePaths.taskArchivePath, "utf8"), /docs\/plans\/archive\/2026-03-29-example\.md/);
});

test("archive moves the same bundle without workflow validation", async () => {
  const { runCli } = await loadWorkflowModule();
  const filename = "2026-03-29-example.md";
  const repoRoot = createFixtureRepo({
    tasks: {
      [filename]: makeTaskBrief({ status: "completed", nextAction: "" }),
    },
  });
  const bundlePaths = getBundlePaths(repoRoot, filename);

  const result = runCli(["archive"], { repoRoot });

  assert.equal(result.exitCode, 0);
  assert.equal(existsSync(bundlePaths.taskSourcePath), false);
  assert.equal(existsSync(bundlePaths.specSourcePath), false);
  assert.equal(existsSync(bundlePaths.planSourcePath), false);
  assert.equal(existsSync(bundlePaths.taskArchivePath), true);
  assert.equal(existsSync(bundlePaths.specArchivePath), true);
  assert.equal(existsSync(bundlePaths.planArchivePath), true);
  assert.match(readFileSync(bundlePaths.taskArchivePath, "utf8"), /spec: `docs\/specs\/archive\/2026-03-29-example\.md`/);
  assert.match(readFileSync(bundlePaths.taskArchivePath, "utf8"), /plan: `docs\/plans\/archive\/2026-03-29-example\.md`/);
});

test("archive fails without moving anything when a linked source file is missing", async () => {
  const { runCli } = await loadWorkflowModule();
  const filename = "2026-03-29-example.md";
  const repoRoot = createFixtureRepo({
    tasks: {
      [filename]: makeTaskBrief({ status: "completed" }),
    },
    spec: false,
  });
  const bundlePaths = getBundlePaths(repoRoot, filename);

  const result = runCli(["archive"], { repoRoot });

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /Linked bundle source does not exist/i);
  assert.equal(existsSync(bundlePaths.taskSourcePath), true);
  assert.equal(existsSync(bundlePaths.specSourcePath), false);
  assert.equal(existsSync(bundlePaths.planSourcePath), true);
  assert.equal(existsSync(bundlePaths.taskArchivePath), false);
  assert.equal(existsSync(bundlePaths.specArchivePath), false);
  assert.equal(existsSync(bundlePaths.planArchivePath), false);
});

test("finalize fails without moving anything when any archive destination already exists", async () => {
  const { runCli } = await loadWorkflowModule();
  const filename = "2026-03-29-example.md";
  const repoRoot = createFixtureRepo({
    tasks: {
      [filename]: makeTaskBrief({ status: "completed" }),
    },
  });
  const bundlePaths = getBundlePaths(repoRoot, filename);
  writeRepoFile(repoRoot, path.join("docs", "specs", "archive", filename), "# archived spec\n");

  const result = runCli(["finalize"], { repoRoot });

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /archive destination already exists/i);
  assert.equal(existsSync(bundlePaths.taskSourcePath), true);
  assert.equal(existsSync(bundlePaths.specSourcePath), true);
  assert.equal(existsSync(bundlePaths.planSourcePath), true);
  assert.equal(existsSync(bundlePaths.taskArchivePath), false);
  assert.equal(existsSync(bundlePaths.specArchivePath), true);
  assert.equal(existsSync(bundlePaths.planArchivePath), false);
});

test("handoff fails clearly when multiple active task briefs exist", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example-a.md": makeTaskBrief({ nextAction: "finish task a" }),
      "2026-03-29-example-b.md": makeTaskBrief({ nextAction: "finish task b" }),
    },
  });

  const result = runCli(["handoff"], { repoRoot });

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /Multiple active task briefs found/);
  assert.match(result.stderr, /Use --task to select one explicitly/);
});

test("handoff --copy writes prompt to the clipboard and prints confirmation", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": makeTaskBrief(),
    },
  });

  let copiedText = null;
  const mockWriter = (text) => {
    copiedText = text;
    return true;
  };

  const result = runCli(["handoff", "--to", "gemini", "--copy"], { repoRoot, clipboardWriter: mockWriter });

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Clipboard: copied prompt text/);
  assert.match(copiedText, /Read GEMINI\.md/);
  assert.ok(!copiedText.includes("Selected task:"));
  assert.ok(!copiedText.includes("Target tool:"));
  assert.ok(!copiedText.includes("Prompt:"));
  assert.equal(copiedText, result.stdout.split("Prompt:\n")[1]);
});

test("resume --copy writes only the prompt text to the clipboard", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": makeTaskBrief(),
    },
  });

  let copiedText = null;
  const mockWriter = (text) => {
    copiedText = text;
    return true;
  };

  const result = runCli(["resume", "--copy"], { repoRoot, clipboardWriter: mockWriter });

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Clipboard: copied prompt text/);
  assert.match(copiedText, /Read AGENTS\.md/);
  assert.ok(!copiedText.includes("Selected task:"));
  assert.ok(!copiedText.includes("Prompt:"));
  assert.equal(copiedText, result.stdout.split("Prompt:\n")[1]);
});

test("copy fails clearly when the clipboard is unavailable", async () => {
  const { runCli } = await loadWorkflowModule();
  const repoRoot = createFixtureRepo({
    tasks: {
      "2026-03-29-example.md": makeTaskBrief(),
    },
  });

  const result = runCli(["resume", "--copy"], {
    repoRoot,
    clipboardWriter: () => {
      throw new Error("Clipboard support is not available for platform: test");
    },
  });

  assert.equal(result.exitCode, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /Clipboard support is not available/);
});

test("status --copy fails clearly because --copy is unsupported", async () => {
  const { runCli } = await loadWorkflowModule();
  const result = runCli(["status", "--copy"], {});
  
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /--copy is only supported by handoff, resume, and pack commands/);
});
