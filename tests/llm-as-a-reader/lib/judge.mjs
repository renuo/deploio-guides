import assert from "node:assert/strict";

const RESPONSES_URL = "https://api.openai.com/v1/responses";

export function reviewSchema(guides) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["guides"],
    properties: {
      guides: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["guide", "reached", "summary", "findings"],
          properties: {
            guide: { type: "string", enum: guides },
            reached: { type: "boolean" },
            summary: { type: "string" },
            findings: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["line", "severity", "problem", "suggestion"],
                properties: {
                  line: { type: ["integer", "null"] },
                  severity: { type: "string", enum: ["blocker", "friction", "nit"] },
                  problem: { type: "string" },
                  suggestion: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  };
}

// The verdict follows from the findings, so "pass" always means: no change to the guide text needed.
export function verdictOf({ reached, findings }) {
  if (!reached) return "not-reached";
  if (findings.some((finding) => finding.severity === "blocker")) return "broken";
  if (findings.length > 0) return "needs-changes";
  return "pass";
}

export function reviewsFor(guides, answer) {
  return guides.map((guide) => {
    const reviewed = answer.guides.find((candidate) => candidate.guide === guide);
    if (!reviewed) return notJudged(guide, "The judge gave no review for this guide.");
    return { guide, verdict: verdictOf(reviewed), summary: reviewed.summary, findings: reviewed.findings };
  });
}

export function notJudged(guide, reason) {
  return { guide, verdict: "not-judged", summary: reason, findings: [] };
}

export async function askJudge({ instructions, input, guides, model, apiKey, fetchImpl = fetch }) {
  assert.ok(model, "the judge needs a model (LLM_READER_JUDGE_MODEL)");
  assert.ok(apiKey, "the judge needs OPENAI_API_KEY");

  const response = await fetchImpl(RESPONSES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      instructions,
      input,
      store: false,
      text: { format: { type: "json_schema", name: "guide_review", strict: true, schema: reviewSchema(guides) } },
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`OpenAI answered ${response.status}: ${body?.error?.message ?? "no message"}`);
  assert.equal(body.status, "completed", `the judge's answer is ${body.status}: ${JSON.stringify(body.incomplete_details)}`);

  const content = body.output.filter((item) => item.type === "message").flatMap((item) => item.content);
  const refusal = content.find((part) => part.type === "refusal");
  if (refusal) throw new Error(`the judge refused: ${refusal.refusal}`);
  const text = content.find((part) => part.type === "output_text")?.text;
  assert.ok(text, "the judge's answer contains no text");

  return JSON.parse(text);
}
