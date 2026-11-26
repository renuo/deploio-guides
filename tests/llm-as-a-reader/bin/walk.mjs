#!/usr/bin/env node
// Lets the walker agent follow one journey on Deploio and records the evidence.
// Usage: walk.mjs <journey> [--out <dir>]

import assert from "node:assert/strict";
import { execFile, execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { parseArgs, promisify } from "node:util";
import { walkerPrompt } from "../lib/compose.mjs";
import { createdApps, probeApps, readCalls, staticEvidence } from "../lib/evidence.mjs";
import { DOCS, loadJourney, loadPrompt, readGuide, ROOT } from "../lib/journeys.mjs";
import { redact, redactDeep, secretsFromEnv } from "../lib/redact.mjs";

const SHIM_DIR = join(ROOT, "shim");
const AGENT_ENV_EXCLUDES = ["OPENAI_*", "CODEX_*", "GH_*", "GITHUB_TOKEN", "ACTIONS_*", "NCTL_API_*"];

const { positionals, values } = parseArgs({ allowPositionals: true, options: { out: { type: "string" } } });
const [slug] = positionals;
assert.ok(slug, "usage: walk.mjs <journey> [--out <dir>]");
const project = requiredEnv("LLM_READER_PROJECT");
const organization = requiredEnv("LLM_READER_ORGANIZATION");
const model = requiredEnv("LLM_READER_WALKER_MODEL");

const journey = loadJourney(slug);
const out = resolve(values.out ?? join(ROOT, "results", slug));
mkdirSync(out, { recursive: true });
const workspace = mkdtempSync(join(tmpdir(), `llm-as-a-reader-${slug}-`));
const raw = mkdtempSync(join(tmpdir(), `llm-as-a-reader-${slug}-raw-`));
const files = {
  nctlLog: join(raw, "nctl.jsonl"),
  transcript: join(raw, "transcript.jsonl"),
  stderr: join(raw, "codex.stderr"),
  lastMessage: join(raw, "walker-result.json"),
};

const realNctl = execFileSync("bash", ["-c", "command -v nctl"], { encoding: "utf8" }).trim();
assert.notEqual(realpathSync(realNctl), realpathSync(join(SHIM_DIR, "nctl")), "the nctl shim must not be on PATH yet");

const guideTexts = Object.fromEntries(journey.guides.map((guide) => [guide, readGuide(guide)]));
const prompt = walkerPrompt({ reader: loadPrompt("reader"), journey, guideTexts, project, organization, workspace, docs: DOCS });

console.log(`${slug}: walking ${journey.guides.length} guides in ${project} with ${model}, at most ${journey.timeoutMinutes} minutes`);
const startedAt = new Date();
const { exitCode, timedOut } = await runCodex();
const minutes = Math.round((Date.now() - startedAt.getTime()) / 60_000);
const outcome = timedOut ? "timed-out" : exitCode === 0 ? "completed" : "failed";

const calls = readCalls(files.nctlLog);
const runNctl = promisify(execFile);
const nctl = async (args) => (await runNctl(realNctl, [...args, "-p", project], { maxBuffer: 10 * 1024 * 1024 })).stdout;
const evidence = { ...staticEvidence(journey, guideTexts, calls), probes: await probeApps(createdApps(calls), { nctl }) };

// The repository is public and so are its workflow artifacts: only redacted files leave the runner.
const secrets = secretsFromEnv(process.env);
const write = (name, value) => writeFileSync(join(out, name), typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`);
write("meta.json", { journey: slug, guides: journey.guides, project, walkerModel: model, timeoutMinutes: journey.timeoutMinutes, outcome, exitCode, minutes, startedAt });
write("evidence.json", redactDeep(evidence, secrets));
write("walker-result.json", redactDeep(readWalkerResult(), secrets));
for (const file of [files.nctlLog, files.transcript, files.stderr]) {
  if (existsSync(file)) write(basename(file), redact(readFileSync(file, "utf8"), secrets));
}

console.log(`${slug}: walker ${outcome} after ${minutes} minutes with ${calls.length} nctl calls, ${evidence.probes.length} apps probed`);

function requiredEnv(name) {
  assert.ok(process.env[name], `${name} must be set`);
  return process.env[name];
}

function runCodex() {
  const args = [
    "exec",
    "--json",
    "--ephemeral",
    "--ignore-user-config",
    "--skip-git-repo-check",
    // The CI runner is the sandbox; the agent needs the network for nctl, git and curl.
    "--dangerously-bypass-approvals-and-sandbox",
    "--model", model,
    "--cd", workspace,
    "--output-schema", join(ROOT, "schemas", "walker-result.json"),
    "--output-last-message", files.lastMessage,
    "-c", 'shell_environment_policy.inherit="all"',
    "-c", `shell_environment_policy.exclude=${JSON.stringify(AGENT_ENV_EXCLUDES)}`,
    "-",
  ];
  const env = {
    ...process.env,
    PATH: `${SHIM_DIR}:${process.env.PATH}`,
    LLM_READER_REAL_NCTL: realNctl,
    LLM_READER_NCTL_LOG: files.nctlLog,
  };

  return new Promise((resolvePromise, reject) => {
    const child = spawn("codex", args, { env, stdio: ["pipe", openSync(files.transcript, "w"), openSync(files.stderr, "w")] });
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 10_000).unref();
    }, journey.timeoutMinutes * 60_000);
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolvePromise({ exitCode: code, timedOut });
    });
    child.stdin.end(prompt);
  });
}

function readWalkerResult() {
  if (!existsSync(files.lastMessage)) return null;
  try {
    return JSON.parse(readFileSync(files.lastMessage, "utf8"));
  } catch {
    return null;
  }
}
