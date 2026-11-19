import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fill, judgeInput, numbered, walkerPrompt } from "../lib/compose.mjs";

const journey = { slug: "go", guides: ["go/quick-start.md"], timeoutMinutes: 30, prompt: "Deploy the example from {{docs}}/go." };
const guideTexts = { "go/quick-start.md": "# Go\nnctl create app go" };

describe("numbered", () => {
  it("prefixes each line with its line number", () => {
    assert.equal(numbered("a\nb"), "   1 | a\n   2 | b");
  });
});

describe("fill", () => {
  it("refuses a template variable without value", () => {
    assert.throws(() => fill("{{missing}}", {}), /no value for \{\{missing\}\}/);
  });

  it("does not fill variables inside inserted values", () => {
    assert.equal(fill("{{a}}", { a: "{{b}}", b: "x" }), "{{b}}");
  });
});

describe("walkerPrompt", () => {
  it("puts situation, journey prompt and numbered guides together", () => {
    const reader = "Project {{project}} in {{organization}}, work in {{workspace}}, prefix {{journey}}-.\n{{prompt}}\n{{guides}}";

    const prompt = walkerPrompt({
      reader,
      journey,
      guideTexts,
      project: "acme-verification",
      organization: "acme",
      workspace: "/tmp/w",
      docs: "/repo/docs",
    });

    assert.equal(
      prompt,
      [
        "Project acme-verification in acme, work in /tmp/w, prefix go-.",
        "Deploy the example from /repo/docs/go.",
        "### go/quick-start.md",
        "",
        "   1 | # Go",
        "   2 | nctl create app go",
      ].join("\n"),
    );
  });
});

describe("judgeInput", () => {
  const evidence = {
    lint: [],
    literal: {
      commands: [
        {
          guide: "go/quick-start.md",
          lineNumber: 2,
          text: "nctl create app go",
          status: "adapted",
          differences: ["added --buildpack-stack"],
          ran: { argv: ["create", "app", "go", "--buildpack-stack=heroku"], exit: 0 },
        },
      ],
      unguided: [{ argv: ["get", "app", "go", "-o", "json"], exit: 0 }],
      refused: [{ argv: ["auth", "login"], refused: "you are already logged in" }],
    },
    probes: [{ app: "go", url: "https://go-abc.deploio.app", release: "available", http: 200 }],
  };

  it("lists the evidence in order of strength and the walker's claims last", () => {
    const input = judgeInput({ journey, guideTexts, meta: { outcome: "completed" }, evidence, walkerResult: { deviations: [] } });

    assert.match(input, /## 1\. Lint\n\n\(none\)/);
    assert.match(input, /go\/quick-start\.md:2 adapted \(added --buildpack-stack\), exit 0: ran `nctl create app go --buildpack-stack=heroku`/);
    assert.match(input, /`nctl get app go -o json`, exit 0/);
    assert.match(input, /`nctl auth login`: you are already logged in/);
    assert.match(input, /app go: release available, https:\/\/go-abc\.deploio\.app answered 200/);
    assert.ok(input.indexOf("## 5. Probes") < input.indexOf("## 6. The walker's report (claims)"));
  });

  it("says when the walker ran out of time", () => {
    const input = judgeInput({ journey, guideTexts, meta: { outcome: "timed-out", timeoutMinutes: 30 }, evidence, walkerResult: null });

    assert.match(input, /stopped after the time limit of 30 minutes/);
    assert.match(input, /\(the walker gave no report\)/);
  });
});
