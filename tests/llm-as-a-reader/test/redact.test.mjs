import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { redact, redactDeep, secretsFromEnv } from "../lib/redact.mjs";

describe("secretsFromEnv", () => {
  it("collects values of secret looking variables", () => {
    const env = { OPENAI_API_KEY: "sk-proj-abcdefgh", GH_TOKEN: "github_pat_12345678", HOME: "/home/runner", SHORT_KEY: "x" };

    assert.deepEqual(secretsFromEnv(env), ["sk-proj-abcdefgh", "github_pat_12345678"]);
  });
});

describe("redact", () => {
  it("removes known secret values wherever they appear", () => {
    assert.equal(redact("token is hunter2hunter2!", ["hunter2hunter2"]), "token is [REDACTED]!");
  });

  it("removes passwords from connection URLs", () => {
    assert.equal(
      redact("DATABASE_URL is postgres://dbadmin:s3cr3tPw@db.example.ch:5432/app"),
      "DATABASE_URL is postgres://dbadmin:[REDACTED]@db.example.ch:5432/app",
    );
  });

  it("removes passwords from URLs with an empty user", () => {
    assert.equal(redact("rediss://:p4ssw0rd@kvs.example.ch:6379"), "rediss://:[REDACTED]@kvs.example.ch:6379");
  });

  it("removes values assigned to secret looking names", () => {
    assert.equal(redact(`--env="SECRET_KEY_BASE=0a1b2c3d4e5f"`), `--env="SECRET_KEY_BASE=[REDACTED]"`);
    assert.equal(redact("password: Tr0ub4dor&3"), "password: [REDACTED]");
  });

  it("keeps placeholders assigned to secret looking names", () => {
    assert.equal(redact(`--env="SECRET_KEY_BASE=$(rails secret)"`), `--env="SECRET_KEY_BASE=$(rails secret)"`);
    assert.equal(redact("STORAGE_KEY={ACCESS KEY}"), "STORAGE_KEY={ACCESS KEY}");
  });

  it("removes long random tokens and private keys", () => {
    const hex = "a".repeat(30) + "0123456789abcdef0123456789";
    assert.equal(redact(`value ${hex} end`), "value [REDACTED] end");
    assert.equal(redact("-----BEGIN OPENSSH PRIVATE KEY-----\nabc\n-----END OPENSSH PRIVATE KEY-----"), "[REDACTED]");
  });

  it("keeps a git SHA in a link and long resource names", () => {
    const text =
      "blob/61b5147a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f/docs/ruby/quick-start.md#L66 renuotest-deploio-guides-verification-2026-12-01";

    assert.equal(redact(text), text);
  });
});

describe("redactDeep", () => {
  it("redacts strings inside nested objects and arrays", () => {
    assert.deepEqual(redactDeep({ argv: ["update", "app", "--env=API_KEY=abcd1234"], exit: 0 }), {
      argv: ["update", "app", "--env=API_KEY=[REDACTED]"],
      exit: 0,
    });
  });
});
