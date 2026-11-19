import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPlaceholder, literalCheck, parseNctl } from "../lib/literal-check.mjs";

describe("isPlaceholder", () => {
  for (const value of ["{APP_NAME}", "MY_RAILS_APP_NAME", "<name>", "$DEPLOIO_APP_NAME", "my-app", "SECRET_KEY_BASE=$(rails secret)"]) {
    it(`treats ${value} as a placeholder`, () => assert.equal(isPlaceholder(value), true));
  }

  for (const value of ["static-html", "heroku", "https://github.com/ninech/deploio-examples"]) {
    it(`treats ${value} as literal`, () => assert.equal(isPlaceholder(value), false));
  }
});

describe("parseNctl", () => {
  it("separates identity, arguments, flags and the command after --", () => {
    assert.deepEqual(parseNctl(["nctl", "exec", "app", "shop", "-p", "acme-shop", "--", "bundle", "exec", "rails", "db:migrate"]), {
      identity: "exec app",
      positional: ["shop"],
      flags: [{ name: "project", value: "acme-shop" }],
      rest: ["bundle", "exec", "rails", "db:migrate"],
    });
  });

  it("does not take the next word as value of a boolean flag", () => {
    assert.deepEqual(parseNctl(["nctl", "logs", "app", "--follow", "shop"]).positional, ["shop"]);
  });

  it("takes the next word as value of a flag written with a space", () => {
    assert.deepEqual(parseNctl(["nctl", "create", "kvs", "cache", "--project", "acme-shop"]).flags, [
      { name: "project", value: "acme-shop" },
    ]);
  });
});

describe("literalCheck", () => {
  const guideCommand = {
    guide: "static-pages/quick-start.md",
    lineNumber: 36,
    text: "nctl create app static-react --git-url=https://github.com/ninech/deploio-examples --git-sub-path=heroku-stack/static/react",
    words: [
      "nctl",
      "create",
      "app",
      "static-react",
      "--git-url=https://github.com/ninech/deploio-examples",
      "--git-sub-path=heroku-stack/static/react",
    ],
  };

  it("marks a command run exactly as in the guide as written", () => {
    const calls = [{ argv: guideCommand.words.slice(1), exit: 0 }];

    assert.deepEqual(literalCheck([guideCommand], calls).commands, [
      { ...withoutWords(guideCommand), status: "as-written", differences: [], ran: { argv: guideCommand.words.slice(1), exit: 0 } },
    ]);
  });

  it("reports a flag the reader had to add as adapted", () => {
    const argv = [...guideCommand.words.slice(1), "--buildpack-stack=heroku"];

    const [result] = literalCheck([guideCommand], [{ argv, exit: 0 }]).commands;

    assert.equal(result.status, "adapted");
    assert.deepEqual(result.differences, ["added --buildpack-stack"]);
  });

  it("does not count naming the preset project as a deviation", () => {
    const argv = [...guideCommand.words.slice(1), "--project=renuotest-deploio-guides-verification-2026-12-01"];

    assert.equal(literalCheck([guideCommand], [{ argv, exit: 0 }]).commands[0].status, "as-written");
  });

  it("accepts any value where the guide shows a placeholder", () => {
    const placeholder = {
      guide: "ruby/database.md",
      lineNumber: 50,
      text: "nctl create postgresdatabase {NAME}",
      words: ["nctl", "create", "postgresdatabase", "{NAME}"],
    };

    const [result] = literalCheck([placeholder], [{ argv: ["create", "postgresdatabase", "ruby-db"], exit: 0 }]).commands;

    assert.equal(result.status, "as-written");
  });

  it("picks the closest of several attempts", () => {
    const calls = [
      { argv: ["create", "app", "static-react", "--git-url=https://example.com/other"], exit: 1 },
      { argv: guideCommand.words.slice(1), exit: 0 },
    ];

    const [result] = literalCheck([guideCommand], calls).commands;

    assert.equal(result.status, "as-written");
    assert.equal(result.ran.exit, 0);
  });

  it("marks a command nobody ran as not run", () => {
    assert.equal(literalCheck([guideCommand], []).commands[0].status, "not-run");
  });

  it("lists calls that match no guide command once as unguided", () => {
    const calls = [
      { argv: ["get", "app", "static-react", "-o", "json"], exit: 0 },
      { argv: ["get", "app", "static-react", "-o", "json"], exit: 0 },
    ];

    assert.deepEqual(literalCheck([guideCommand], calls).unguided, [{ argv: ["get", "app", "static-react", "-o", "json"], exit: 0 }]);
  });

  it("lists refused calls separately and never matches them", () => {
    const calls = [{ argv: guideCommand.words.slice(1), exit: 126, refused: "test" }];

    const result = literalCheck([guideCommand], calls);

    assert.equal(result.commands[0].status, "not-run");
    assert.deepEqual(result.refused, [{ argv: guideCommand.words.slice(1), refused: "test" }]);
  });
});

function withoutWords({ words, ...rest }) {
  return rest;
}
