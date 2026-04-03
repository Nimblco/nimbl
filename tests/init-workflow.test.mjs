import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INIT_SCRIPT = path.join(__dirname, "../scripts/init-workflow.mjs");

const tempDirs = [];
process.on("exit", () => {
  for (const dir of tempDirs) {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

function makeTempDir() {
  const dir = mkdtempSync(path.join(tmpdir(), "init-workflow-test-"));
  tempDirs.push(dir);
  return dir;
}

async function loadInitModule() {
  const url = pathToFileURL(INIT_SCRIPT);
  return await import(`${url.href}?cacheBust=${randomUUID()}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// resolveCorePaths — pure function
// ─────────────────────────────────────────────────────────────────────────────

test("resolveCorePaths: empty array returns only shared paths", async () => {
  const { resolveCorePaths, SHARED_PATHS } = await loadInitModule();
  const result = resolveCorePaths([]);
  assert.deepEqual(result, SHARED_PATHS);
});

test("resolveCorePaths: claude tool includes CLAUDE.md and .claude", async () => {
  const { resolveCorePaths } = await loadInitModule();
  const result = resolveCorePaths(["claude"]);
  assert.ok(result.includes("CLAUDE.md"), "should include CLAUDE.md");
  assert.ok(result.includes(".claude"), "should include .claude");
});

test("resolveCorePaths: claude selection excludes cursor adapter files", async () => {
  const { resolveCorePaths } = await loadInitModule();
  const result = resolveCorePaths(["claude"]);
  assert.ok(!result.includes(".cursor"), "should not include .cursor");
  assert.ok(!result.includes(".windsurfrules"), "should not include .windsurfrules");
});

test("resolveCorePaths: all tools includes every adapter path", async () => {
  const { resolveCorePaths, ALL_TOOLS, ADAPTER_PATHS } = await loadInitModule();
  const result = resolveCorePaths(ALL_TOOLS);
  for (const [tool, paths] of Object.entries(ADAPTER_PATHS)) {
    for (const p of paths) {
      assert.ok(result.includes(p), `missing adapter path '${p}' for tool '${tool}'`);
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// injectGitignoreEntries
// ─────────────────────────────────────────────────────────────────────────────

test("injectGitignoreEntries: creates .gitignore with marker and entries when missing", async () => {
  const { injectGitignoreEntries } = await loadInitModule();
  const targetRoot = makeTempDir();
  await injectGitignoreEntries(targetRoot);
  const gitignorePath = path.join(targetRoot, ".gitignore");
  assert.ok(existsSync(gitignorePath), "should create .gitignore");
  const content = readFileSync(gitignorePath, "utf-8");
  assert.ok(content.includes("# AI Workflow"), "should include marker");
  assert.ok(content.includes("docs/ai/handoffs/"), "should include handoffs entry");
  assert.ok(content.includes("tmp/"), "should include tmp/ entry");
});

test("injectGitignoreEntries: appends entries to existing .gitignore without marker", async () => {
  const { injectGitignoreEntries } = await loadInitModule();
  const targetRoot = makeTempDir();
  const gitignorePath = path.join(targetRoot, ".gitignore");
  writeFileSync(gitignorePath, "node_modules/\n.env\n");
  await injectGitignoreEntries(targetRoot);
  const content = readFileSync(gitignorePath, "utf-8");
  assert.ok(content.includes("node_modules/"), "should preserve existing entries");
  assert.ok(content.includes("docs/ai/handoffs/"), "should add handoffs entry");
  assert.ok(content.includes("tmp/"), "should add tmp/ entry");
});

test("injectGitignoreEntries: does not duplicate when all entries already present", async () => {
  const { injectGitignoreEntries } = await loadInitModule();
  const targetRoot = makeTempDir();
  const gitignorePath = path.join(targetRoot, ".gitignore");
  writeFileSync(gitignorePath, "# AI Workflow\ndocs/ai/handoffs/\ntmp/\n");
  await injectGitignoreEntries(targetRoot);
  const content = readFileSync(gitignorePath, "utf-8");
  const handoffsCount = (content.match(/docs\/ai\/handoffs\//g) ?? []).length;
  const tmpCount = (content.match(/\btmp\/\n/g) ?? []).length;
  assert.equal(handoffsCount, 1, "should not duplicate handoffs entry");
  assert.equal(tmpCount, 1, "should not duplicate tmp/ entry");
});

test("injectGitignoreEntries: adds missing entry when marker exists (OPS-3)", async () => {
  const { injectGitignoreEntries } = await loadInitModule();
  const targetRoot = makeTempDir();
  const gitignorePath = path.join(targetRoot, ".gitignore");
  // Has marker + handoffs but is missing tmp/
  writeFileSync(gitignorePath, "# AI Workflow\ndocs/ai/handoffs/\n");
  await injectGitignoreEntries(targetRoot);
  const content = readFileSync(gitignorePath, "utf-8");
  assert.ok(content.includes("tmp/"), "should add missing tmp/ entry even when marker exists");
  const handoffsCount = (content.match(/docs\/ai\/handoffs\//g) ?? []).length;
  assert.equal(handoffsCount, 1, "should not duplicate the existing handoffs entry");
});

// ─────────────────────────────────────────────────────────────────────────────
// injectScriptsToPackageJson
// ─────────────────────────────────────────────────────────────────────────────

test("injectScriptsToPackageJson: skips silently when no package.json", async () => {
  const { injectScriptsToPackageJson } = await loadInitModule();
  const targetRoot = makeTempDir();
  // Should not throw
  await injectScriptsToPackageJson(targetRoot);
  assert.ok(!existsSync(path.join(targetRoot, "package.json")), "should not create package.json");
});

test("injectScriptsToPackageJson: adds workflow script when missing", async () => {
  const { injectScriptsToPackageJson } = await loadInitModule();
  const targetRoot = makeTempDir();
  writeFileSync(path.join(targetRoot, "package.json"), JSON.stringify({ name: "test" }, null, 2));
  await injectScriptsToPackageJson(targetRoot);
  const pkg = JSON.parse(readFileSync(path.join(targetRoot, "package.json"), "utf-8"));
  assert.ok(pkg.scripts?.workflow, "should add workflow script");
  assert.ok(pkg.scripts.workflow.includes("workflow.mjs"), "should reference workflow.mjs");
});

test("injectScriptsToPackageJson: preserves original JSON indentation", async () => {
  const { injectScriptsToPackageJson } = await loadInitModule();
  const targetRoot = makeTempDir();
  // Write with 4-space indent
  writeFileSync(path.join(targetRoot, "package.json"), JSON.stringify({ name: "test" }, null, 4));
  await injectScriptsToPackageJson(targetRoot);
  const raw = readFileSync(path.join(targetRoot, "package.json"), "utf-8");
  // 4-space indent means top-level keys are indented 4 spaces
  assert.ok(
    raw.includes('    "name"') || raw.includes('    "scripts"'),
    "should preserve 4-space indentation"
  );
});

test("injectScriptsToPackageJson: does not overwrite existing workflow script", async () => {
  const { injectScriptsToPackageJson } = await loadInitModule();
  const targetRoot = makeTempDir();
  const original = { name: "test", scripts: { workflow: "my-custom-command" } };
  writeFileSync(path.join(targetRoot, "package.json"), JSON.stringify(original, null, 2));
  await injectScriptsToPackageJson(targetRoot);
  const pkg = JSON.parse(readFileSync(path.join(targetRoot, "package.json"), "utf-8"));
  assert.equal(pkg.scripts.workflow, "my-custom-command", "should not overwrite existing workflow script");
});

// ─────────────────────────────────────────────────────────────────────────────
// injectGitHook
// ─────────────────────────────────────────────────────────────────────────────

test("injectGitHook: skips when no .git/hooks directory", async () => {
  const { injectGitHook } = await loadInitModule();
  const targetRoot = makeTempDir();
  // No .git/hooks created
  await injectGitHook(targetRoot, "pnpm");
  assert.ok(
    !existsSync(path.join(targetRoot, ".git", "hooks", "pre-commit")),
    "should not create hook when .git/hooks is absent"
  );
});

test("injectGitHook: creates pre-commit hook with idempotency marker", async () => {
  const { injectGitHook } = await loadInitModule();
  const targetRoot = makeTempDir();
  mkdirSync(path.join(targetRoot, ".git", "hooks"), { recursive: true });
  await injectGitHook(targetRoot, "pnpm");
  const hookPath = path.join(targetRoot, ".git", "hooks", "pre-commit");
  assert.ok(existsSync(hookPath), "should create pre-commit hook");
  const content = readFileSync(hookPath, "utf-8");
  assert.ok(content.includes("# nimblco-workflow-check"), "should include idempotency marker");
  assert.ok(content.startsWith("#!/bin/sh"), "should start with shebang");
});

test("injectGitHook: is idempotent — does not double-inject marker", async () => {
  const { injectGitHook } = await loadInitModule();
  const targetRoot = makeTempDir();
  mkdirSync(path.join(targetRoot, ".git", "hooks"), { recursive: true });
  await injectGitHook(targetRoot, "pnpm");
  await injectGitHook(targetRoot, "pnpm");
  const content = readFileSync(path.join(targetRoot, ".git", "hooks", "pre-commit"), "utf-8");
  const markerCount = (content.match(/# nimblco-workflow-check/g) ?? []).length;
  assert.equal(markerCount, 1, "idempotency marker should appear exactly once");
});

test("injectGitHook: appends to existing hook without overwriting it", async () => {
  const { injectGitHook } = await loadInitModule();
  const targetRoot = makeTempDir();
  mkdirSync(path.join(targetRoot, ".git", "hooks"), { recursive: true });
  const hookPath = path.join(targetRoot, ".git", "hooks", "pre-commit");
  writeFileSync(hookPath, "#!/bin/sh\necho 'existing hook'\n");
  await injectGitHook(targetRoot, "pnpm");
  const content = readFileSync(hookPath, "utf-8");
  assert.ok(content.includes("existing hook"), "should preserve existing hook content");
  assert.ok(content.includes("# nimblco-workflow-check"), "should append workflow check marker");
});

// ─────────────────────────────────────────────────────────────────────────────
// CLI integration — subprocess
// ─────────────────────────────────────────────────────────────────────────────

test("--tools= with invalid-only tools exits with code 1", () => {
  let exitCode = 0;
  try {
    execFileSync(process.execPath, [INIT_SCRIPT, "--tools=invalidtool", "some-dir"], {
      encoding: "utf-8",
      stdio: "pipe",
    });
  } catch (err) {
    exitCode = err.status ?? 1;
  }
  assert.equal(exitCode, 1, "should exit with code 1 for all-invalid tools");
});

test("--tools= with at least one valid tool does not exit early with code 1", () => {
  // Providing valid tools with --yes and a temp dir should not exit 1 due to tool validation
  // (the script may still exit 0 after install, or error for other reasons — we only check it
  // does NOT error at the tool-validation stage, i.e. exit code is not 1 from that path)
  const targetRoot = makeTempDir();
  let exitCode = null;
  let stderr = "";
  try {
    execFileSync(
      process.execPath,
      [INIT_SCRIPT, targetRoot, "--yes", "--tools=codex"],
      { encoding: "utf-8", stdio: "pipe" }
    );
    exitCode = 0;
  } catch (err) {
    exitCode = err.status ?? 1;
    stderr = err.stderr ?? "";
  }
  // Should not fail with "no valid tools" error message
  assert.ok(
    !stderr.includes("no valid tools specified"),
    "should not error with 'no valid tools' message"
  );
  assert.equal(exitCode, 0, "should exit 0 when valid tools are provided");
});
