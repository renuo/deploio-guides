import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lintGuide, nctlCommands, shellBlocks, shellCommands } from "../lib/guide-commands.mjs";
import { shellSegments } from "../lib/shell.mjs";

describe("shellSegments", () => {
  it("splits words and keeps quoted values together", () => {
    assert.deepEqual(shellSegments(`nctl update app shop --env="A=1 2;B=3"`), [
      ["nctl", "update", "app", "shop", "--env=A=1 2;B=3"],
    ]);
  });

  it("keeps a command substitution as one word", () => {
    assert.deepEqual(shellSegments(`nctl create app shop --env="SECRET_KEY_BASE=$(rails secret)"`), [
      ["nctl", "create", "app", "shop", "--env=SECRET_KEY_BASE=$(rails secret)"],
    ]);
  });

  it("splits at pipes, || and && and drops redirections", () => {
    assert.deepEqual(shellSegments(`nctl get app shop >/dev/null 2>&1 || nctl copy app base && echo done | tee log`), [
      ["nctl", "get", "app", "shop"],
      ["nctl", "copy", "app", "base"],
      ["echo", "done"],
      ["tee", "log"],
    ]);
  });

  it("splits at an unquoted semicolon like bash does", () => {
    assert.deepEqual(shellSegments(`nctl update app shop --env=A:"1";B:"2"`), [
      ["nctl", "update", "app", "shop", "--env=A:1"],
      ["B:2"],
    ]);
  });

  it("ignores trailing comments", () => {
    assert.deepEqual(shellSegments(`--buildpack-stack=heroku # notice the stack`), [["--buildpack-stack=heroku"]]);
  });
});

describe("shellBlocks", () => {
  it("returns shell blocks with their guide line numbers", () => {
    const markdown = ["# Title", "", "```bash", "nctl get apps", "```", "", "```yaml", "a: b", "```"].join("\n");

    assert.deepEqual(shellBlocks(markdown), [{ language: "bash", lines: [{ lineNumber: 4, text: "nctl get apps" }] }]);
  });

  it("strips the indentation of blocks inside list items", () => {
    const markdown = ["* plain", "  ```bash", "  nctl get apps", "  ```"].join("\n");

    assert.deepEqual(shellBlocks(markdown)[0].lines, [{ lineNumber: 3, text: "nctl get apps" }]);
  });
});

describe("shellCommands", () => {
  it("joins continuation lines and keeps the first line number", () => {
    const block = {
      lines: [
        { lineNumber: 10, text: "nctl create app shop \\" },
        { lineNumber: 11, text: "  --git-url=https://example.com/shop" },
        { lineNumber: 12, text: "nctl get apps" },
      ],
    };

    assert.deepEqual(
      shellCommands(block).map(({ lineNumber, text }) => ({ lineNumber, text })),
      [
        { lineNumber: 10, text: "nctl create app shop  --git-url=https://example.com/shop" },
        { lineNumber: 12, text: "nctl get apps" },
      ],
    );
  });

  it("does not continue a line whose backslash is followed by whitespace", () => {
    const block = {
      lines: [
        { lineNumber: 1, text: "nctl create app shop \\ " },
        { lineNumber: 2, text: "  --git-url=https://example.com/shop" },
      ],
    };

    assert.equal(shellCommands(block).length, 2);
  });
});

describe("lintGuide", () => {
  it("finds a flag line whose previous line lacks the continuation backslash", () => {
    const markdown = [
      "```bash",
      "nctl create app static-react \\",
      "--git-sub-path=heroku-stack/static/react",
      "--buildpack-stack=heroku # notice the stack",
      "```",
    ].join("\n");

    assert.deepEqual(lintGuide(markdown), [
      {
        lineNumber: 4,
        rule: "dangling-flag",
        message:
          "This line starts with a flag, but the line before does not end with `\\`, so the shell runs it as a separate command.",
      },
    ]);
  });

  it("finds whitespace after a continuation backslash", () => {
    const markdown = ["```bash", "nctl create app shop \\  ", "  --git-url=x", "```"].join("\n");

    assert.deepEqual(
      lintGuide(markdown).map(({ lineNumber, rule }) => ({ lineNumber, rule })),
      [
        { lineNumber: 2, rule: "whitespace-after-backslash" },
        { lineNumber: 3, rule: "dangling-flag" },
      ],
    );
  });

  it("finds an unquoted semicolon glued between two values", () => {
    const markdown = ["```bash", `nctl update app shop --env=A:"1";B:"2"`, "```"].join("\n");

    assert.deepEqual(lintGuide(markdown).map(({ rule }) => rule), ["unquoted-semicolon"]);
  });

  it("accepts a block that only shows a flag to add to some command", () => {
    const markdown = ["```bash", "--build-env=BP_PHP_SERVER=nginx", "```"].join("\n");

    assert.deepEqual(lintGuide(markdown), []);
  });

  it("accepts command output listing items with a dash", () => {
    const markdown = ["```bash", "$ nctl get releases my-app -o yaml", "    - name: scheduled-1", "```"].join("\n");

    assert.deepEqual(lintGuide(markdown), []);
  });

  it("accepts a semicolon inside quotes and separated commands", () => {
    const markdown = ["```bash", `nctl update app shop --env="A=1;B=2"`, "cd shop; ls", "```"].join("\n");

    assert.deepEqual(lintGuide(markdown), []);
  });
});

describe("nctlCommands", () => {
  it("lists nctl invocations including ones after || inside a script", () => {
    const markdown = [
      "```bash",
      `nctl get app "$NAME" -p "$PROJECT" >/dev/null 2>&1 || \\`,
      `nctl copy app "$TEMPLATE" -p "$PROJECT" --start`,
      "echo done",
      "```",
    ].join("\n");

    assert.deepEqual(
      nctlCommands(markdown).map(({ lineNumber, words }) => ({ lineNumber, words })),
      [
        { lineNumber: 2, words: ["nctl", "get", "app", "$NAME", "-p", "$PROJECT"] },
        { lineNumber: 2, words: ["nctl", "copy", "app", "$TEMPLATE", "-p", "$PROJECT", "--start"] },
      ],
    );
  });
});
