import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const shim = fileURLToPath(new URL("../shim/nctl", import.meta.url));
const project = "renuotest-deploio-guides-verification-2026-12-01";

function runShim(args, { realExit = 0 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "nctl-shim-"));
  const realNctl = join(dir, "real-nctl");
  writeFileSync(realNctl, `#!/usr/bin/env bash\necho "real nctl $*"\nexit ${realExit}\n`);
  chmodSync(realNctl, 0o755);
  const log = join(dir, "nctl.jsonl");

  const result = spawnSync(shim, args, {
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      LLM_READER_REAL_NCTL: realNctl,
      LLM_READER_NCTL_LOG: log,
      LLM_READER_PROJECT: project,
      LLM_READER_ORGANIZATION: "renuotest",
    },
  });
  let entries = [];
  try {
    entries = readFileSync(log, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
  } catch {}
  return { status: result.status, stdout: result.stdout, stderr: result.stderr, entries };
}

describe("nctl shim", () => {
  it("passes the call through and logs arguments and exit code", () => {
    const { status, stdout, entries } = runShim(["create", "app", "shop", "--env=A=1;B=2"]);

    assert.equal(status, 0);
    assert.equal(stdout, "real nctl create app shop --env=A=1;B=2\n");
    assert.deepEqual(entries.map(({ argv, exit }) => ({ argv, exit })), [
      { argv: ["create", "app", "shop", "--env=A=1;B=2"], exit: 0 },
    ]);
  });

  it("keeps the exit code of the real nctl", () => {
    const { status, entries } = runShim(["get", "app", "missing"], { realExit: 3 });

    assert.equal(status, 3);
    assert.equal(entries[0].exit, 3);
  });

  for (const args of [["get", "apps", "-p", project], ["get", "apps", `--project=${project}`], ["get", "apps", "--project", "deploio-guides-verification-2026-12-01"]]) {
    it(`allows the verification project: ${args.slice(2).join(" ")}`, () => {
      assert.equal(runShim(args).status, 0);
    });
  }

  for (const args of [["get", "apps", "-p", "renuotest-deploio-documentation"], ["delete", "app", "x", "--project=renuotest"], ["get", "apps", "-prenuotest"]]) {
    it(`refuses another project: ${args.slice(2).join(" ")}`, () => {
      const { status, stdout, entries } = runShim(args);

      assert.equal(status, 126);
      assert.equal(stdout, "");
      assert.match(entries[0].refused, /only the project/);
    });
  }

  for (const args of [["auth", "login"], ["create", "project", "mine"], ["delete", "project", project, "--force"], ["auth", "set-project", "renuotest"], ["apply", "-f", "egress.yaml"], ["delete", "app", "x", "-A"]]) {
    it(`refuses ${args.join(" ")}`, () => {
      const { status, entries } = runShim(args);

      assert.equal(status, 126);
      assert.equal(entries.length, 1);
      assert.ok(entries[0].refused);
    });
  }

  it("allows listing across projects", () => {
    assert.equal(runShim(["get", "apps", "-A", "-o", "no-header"]).status, 0);
  });

  it("does not inspect arguments after --", () => {
    assert.equal(runShim(["exec", "app", "shop", "--", "env", "-p", "other"]).status, 0);
  });
});
