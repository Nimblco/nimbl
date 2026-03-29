#!/usr/bin/env node

import { runCli } from "./workflow-lib.mjs";

const result = runCli(process.argv.slice(2), { repoRoot: process.cwd() });

if (result.stdout) {
  process.stdout.write(result.stdout.endsWith("\n") ? result.stdout : `${result.stdout}\n`);
}

if (result.stderr) {
  process.stderr.write(result.stderr.endsWith("\n") ? result.stderr : `${result.stderr}\n`);
}

process.exitCode = result.exitCode;
