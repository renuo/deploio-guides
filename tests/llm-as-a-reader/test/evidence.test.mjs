import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createdApps, probeApps, staticEvidence } from "../lib/evidence.mjs";

describe("createdApps", () => {
  it("names apps created or copied successfully", () => {
    const calls = [
      { argv: ["create", "app", "go-app", "--git-url=https://example.com"], exit: 0 },
      { argv: ["copy", "app", "go-app", "--target-name=go-copy"], exit: 0 },
      { argv: ["create", "app", "failed-app"], exit: 1 },
      { argv: ["create", "app", "refused-app", "-p", "other"], exit: 126, refused: "other project" },
      { argv: ["get", "app", "go-app"], exit: 0 },
    ];

    assert.deepEqual(createdApps(calls), ["go-app", "go-copy"]);
  });
});

describe("staticEvidence", () => {
  it("lints the journey's guides and checks their commands against the calls", () => {
    const journey = { slug: "go", guides: ["go/quick-start.md"] };
    const guideTexts = { "go/quick-start.md": ["```bash", "nctl create app go \\", "  --git-url=https://example.com", "--port=8080", "```"].join("\n") };
    const calls = [{ argv: ["create", "app", "go", "--git-url=https://example.com"], exit: 0 }];

    const { lint, literal } = staticEvidence(journey, guideTexts, calls);

    assert.deepEqual(lint.map(({ guide, lineNumber, rule }) => ({ guide, lineNumber, rule })), [
      { guide: "go/quick-start.md", lineNumber: 4, rule: "dangling-flag" },
    ]);
    assert.deepEqual(literal.commands.map(({ guide, lineNumber, status }) => ({ guide, lineNumber, status })), [
      { guide: "go/quick-start.md", lineNumber: 2, status: "as-written" },
    ]);
  });
});

describe("probeApps", () => {
  const fakeNctl = (answers) => async (args) => {
    const answer = answers[args.slice(0, 2).join(" ")];
    if (answer instanceof Error) throw answer;
    return JSON.stringify(answer);
  };

  it("reports URL, latest release status and HTTP status", async () => {
    const nctl = fakeNctl({
      "get app": { status: { atProvider: { defaultURLs: ["https://go-abc.deploio.app"] } } },
      "get releases": [{ status: { atProvider: { releaseStatus: "available" } } }],
    });
    const fetchImpl = async (url) => ({ status: url === "https://go-abc.deploio.app" ? 200 : 404 });

    assert.deepEqual(await probeApps(["go"], { nctl, fetchImpl }), [
      { app: "go", url: "https://go-abc.deploio.app", release: "available", http: 200 },
    ]);
  });

  it("reports an app that does not answer", async () => {
    const nctl = fakeNctl({
      "get app": { status: { atProvider: { defaultURLs: ["https://go-abc.deploio.app"] } } },
      "get releases": [],
    });
    const fetchImpl = async () => {
      throw Object.assign(new Error("timeout"), { name: "TimeoutError" });
    };

    assert.deepEqual(await probeApps(["go"], { nctl, fetchImpl }), [
      { app: "go", url: "https://go-abc.deploio.app", release: null, http: "no answer (TimeoutError)" },
    ]);
  });

  it("reports an app nctl cannot show", async () => {
    const nctl = fakeNctl({ "get app": new Error("not found\nmore") });

    assert.deepEqual(await probeApps(["gone"], { nctl }), [{ app: "gone", error: "could not be inspected: not found" }]);
  });
});
