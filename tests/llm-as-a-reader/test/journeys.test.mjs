import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { coverage, docPages, loadJourneys, loadNotWalked, parseJourney } from "../lib/journeys.mjs";

describe("parseJourney", () => {
  it("reads guides, timeout and prompt", () => {
    const source = ["---", "guides:", "  - go/quick-start.md", "timeout_minutes: 20", "---", "", "You are a Go developer."].join("\n");

    assert.deepEqual(parseJourney("go", source), {
      slug: "go",
      guides: ["go/quick-start.md"],
      timeoutMinutes: 20,
      prompt: "You are a Go developer.",
    });
  });

  it("refuses a prompt without guides", () => {
    const source = ["---", "timeout_minutes: 20", "---", "You are a Go developer."].join("\n");

    assert.throws(() => parseJourney("go", source), /needs a non-empty "guides" list/);
  });

  it("refuses a journey name that cannot be used in resource names", () => {
    assert.throws(() => parseJourney("Go_Guides", "---\n---\n"), /lowercase letters/);
  });
});

describe("coverage", () => {
  const journeys = [{ slug: "go", guides: ["go/quick-start.md"] }];

  it("is complete when every page is walked or has a reason not to be", () => {
    const result = coverage({ pages: ["go/quick-start.md", "user-guide/faq.md"], journeys, notWalked: { "user-guide/faq.md": "prose" } });

    assert.deepEqual(result, { unaccounted: [], doubled: [], unknown: [] });
  });

  it("names a page nobody decided about", () => {
    const result = coverage({ pages: ["go/quick-start.md", "go/database.md"], journeys, notWalked: {} });

    assert.deepEqual(result.unaccounted, ["go/database.md"]);
  });

  it("names a page claimed twice", () => {
    const result = coverage({ pages: ["go/quick-start.md"], journeys, notWalked: { "go/quick-start.md": "prose" } });

    assert.deepEqual(result.doubled, [{ page: "go/quick-start.md", by: ["prompts/go.md", "not-walked.yml"] }]);
  });

  it("names a guide that does not exist", () => {
    const result = coverage({ pages: [], journeys, notWalked: {} });

    assert.deepEqual(result.unknown, ["go/quick-start.md"]);
  });
});

describe("this repository", () => {
  it("walks every published page or says why not", () => {
    const result = coverage({ pages: docPages(), journeys: loadJourneys(), notWalked: loadNotWalked() });

    assert.deepEqual(result, { unaccounted: [], doubled: [], unknown: [] });
  });
});
