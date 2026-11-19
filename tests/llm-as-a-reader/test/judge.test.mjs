import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { askJudge, reviewsFor, verdictOf } from "../lib/judge.mjs";

const blocker = { line: 38, severity: "blocker", problem: "missing backslash", suggestion: "add it" };
const nit = { line: 3, severity: "nit", problem: "typo", suggestion: "fix it" };

describe("verdictOf", () => {
  it("passes a guide without findings", () => assert.equal(verdictOf({ reached: true, findings: [] }), "pass"));
  it("asks for changes on any finding, even a nit", () => assert.equal(verdictOf({ reached: true, findings: [nit] }), "needs-changes"));
  it("calls a guide with a blocker broken", () => assert.equal(verdictOf({ reached: true, findings: [nit, blocker] }), "broken"));
  it("marks a guide the walker never got to", () => assert.equal(verdictOf({ reached: false, findings: [blocker] }), "not-reached"));
});

describe("reviewsFor", () => {
  it("returns one review per guide in journey order and marks missing ones", () => {
    const answer = { guides: [{ guide: "b.md", reached: true, summary: "fine", findings: [] }] };

    assert.deepEqual(reviewsFor(["a.md", "b.md"], answer), [
      { guide: "a.md", verdict: "not-judged", summary: "The judge gave no review for this guide.", findings: [] },
      { guide: "b.md", verdict: "pass", summary: "fine", findings: [] },
    ]);
  });
});

describe("askJudge", () => {
  const answer = { guides: [{ guide: "a.md", reached: true, summary: "fine", findings: [] }] };
  const completed = {
    status: "completed",
    output: [
      { type: "reasoning", summary: [] },
      { type: "message", content: [{ type: "output_text", text: JSON.stringify(answer) }] },
    ],
  };
  const respond = (status, body) => async (url, request) => {
    respond.request = { url, ...request, body: JSON.parse(request.body) };
    return { ok: status < 400, status, json: async () => body };
  };

  it("sends instructions, evidence and a strict schema limited to the journey's guides, without storing it", async () => {
    const fetchImpl = respond(200, completed);

    const result = await askJudge({ instructions: "judge", input: "evidence", guides: ["a.md"], model: "m", apiKey: "k", fetchImpl });

    assert.deepEqual(result, answer);
    assert.equal(respond.request.url, "https://api.openai.com/v1/responses");
    assert.equal(respond.request.headers.Authorization, "Bearer k");
    assert.equal(respond.request.body.store, false);
    assert.equal(respond.request.body.text.format.strict, true);
    assert.deepEqual(respond.request.body.text.format.schema.properties.guides.items.properties.guide.enum, ["a.md"]);
  });

  it("fails with OpenAI's message on an error", async () => {
    const fetchImpl = respond(429, { error: { message: "quota exceeded" } });

    await assert.rejects(
      askJudge({ instructions: "", input: "", guides: ["a.md"], model: "m", apiKey: "k", fetchImpl }),
      /OpenAI answered 429: quota exceeded/,
    );
  });

  it("fails on an incomplete answer", async () => {
    const fetchImpl = respond(200, { status: "incomplete", incomplete_details: { reason: "max_output_tokens" }, output: [] });

    await assert.rejects(
      askJudge({ instructions: "", input: "", guides: ["a.md"], model: "m", apiKey: "k", fetchImpl }),
      /incomplete.*max_output_tokens/,
    );
  });

  it("refuses to run without a model", async () => {
    await assert.rejects(askJudge({ instructions: "", input: "", guides: [], model: "", apiKey: "k" }), /needs a model/);
  });
});
