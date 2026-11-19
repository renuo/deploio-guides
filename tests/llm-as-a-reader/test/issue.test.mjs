import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { issueTitle, MAX_BODY_LENGTH, readState, renderIssue } from "../lib/issue.mjs";

const links = {
  run: "https://github.com/renuo/deploio-guides/actions/runs/1",
  guide: (guide, line) => `https://github.com/renuo/deploio-guides/blob/abc/docs/${guide}${line ? `#L${line}` : ""}`,
};
const models = { walker: "walker-model", judge: "judge-model" };
const reviews = [
  {
    journey: "static-pages",
    outcome: "completed",
    minutes: 12,
    guides: [
      {
        guide: "static-pages/quick-start.md",
        verdict: "broken",
        summary: "The React example fails as written.",
        findings: [{ line: 38, severity: "blocker", problem: "The backslash is missing.", suggestion: "End line 38 with `\\`." }],
      },
      { guide: "static-pages/static-site-generators.md", verdict: "pass", summary: "Smooth.", findings: [] },
    ],
  },
];

describe("issueTitle", () => {
  it("names the month", () => assert.equal(issueTitle("2026-12"), "Guide walkthrough 2026-12"));
  it("refuses anything but a month", () => assert.throws(() => issueTitle("December"), /month must look like/));
});

describe("renderIssue", () => {
  const body = renderIssue({
    month: "2026-12",
    reviews,
    notWalked: { "user-guide/faq.md": "Questions and answers without a story to follow." },
    previous: { number: 160, state: { month: "2026-11", verdicts: { "static-pages/quick-start.md": "pass" } } },
    links,
    models,
  });

  it("starts with the run, the models and last month's issue", () => {
    assert.match(body, /\[Workflow run\]\(https:\/\/github\.com\/renuo\/deploio-guides\/actions\/runs\/1\) · walker `walker-model` · judge `judge-model`/);
    assert.match(body, /Last month: #160/);
  });

  it("compares every guide's verdict with last month", () => {
    assert.match(body, /\| \[static-pages\/quick-start\.md\]\(.*\/docs\/static-pages\/quick-start\.md\) \| ❌ broken \| ✅ pass \|/);
    assert.match(body, /\| \[static-pages\/static-site-generators\.md\]\(.*\) \| ✅ pass \| – \|/);
  });

  it("has a section per guide with linked findings and suggestions", () => {
    assert.match(body, /## static-pages\/quick-start\.md\n\n❌ broken · journey `static-pages`/);
    assert.match(body, /- \*\*blocker\*\* \[line 38\]\(.*quick-start\.md#L38\): The backslash is missing\.\n  Suggestion: End line 38 with `\\`\./);
  });

  it("says so when not run in a workflow", () => {
    const local = renderIssue({ month: "2026-12", reviews, notWalked: {}, previous: null, links: { ...links, run: null }, models });

    assert.match(local, /^An AI reader.*\n\nLocal run · walker/);
  });

  it("lists the pages not walked with their reason", () => {
    assert.match(body, /## Not walked\n- `user-guide\/faq\.md`: Questions and answers without a story to follow\./);
  });

  it("stores this month's verdicts for next month", () => {
    assert.deepEqual(readState(body), {
      month: "2026-12",
      verdicts: { "static-pages/quick-start.md": "broken", "static-pages/static-site-generators.md": "pass" },
    });
  });

  it("drops suggestions when the body would exceed GitHub's limit", () => {
    const long = "x".repeat(400);
    const many = [{ ...reviews[0], guides: [{ ...reviews[0].guides[0], findings: Array.from({ length: 200 }, () => ({ line: 1, severity: "nit", problem: "p", suggestion: long })) }] }];

    const compact = renderIssue({ month: "2026-12", reviews: many, notWalked: {}, previous: null, links, models });

    assert.ok(compact.length <= MAX_BODY_LENGTH);
    assert.doesNotMatch(compact, /Suggestion:/);
  });
});

describe("readState", () => {
  it("returns nothing for an issue without state", () => assert.equal(readState("just text"), null));
});
