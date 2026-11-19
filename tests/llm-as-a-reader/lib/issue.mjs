import assert from "node:assert/strict";

export const LABEL = "llm-as-a-reader";
export const MAX_BODY_LENGTH = 65_000;

const VERDICTS = {
  pass: "✅ pass",
  "needs-changes": "✏️ needs changes",
  broken: "❌ broken",
  "not-reached": "⏭️ not reached",
  "not-judged": "⚠️ not judged",
};
const OUTCOMES = { completed: "completed", "timed-out": "stopped at the time limit", failed: "crashed", missing: "left no results" };
const STATE = /<!-- llm-as-a-reader-state: (\{.*\}) -->/;

export function issueTitle(month) {
  assert.match(month, /^\d{4}-\d{2}$/, "month must look like 2026-12");
  return `Guide walkthrough ${month}`;
}

export function readState(body) {
  const match = body?.match(STATE);
  return match ? JSON.parse(match[1]) : null;
}

// reviews: [{ journey, outcome, minutes, guides: [{ guide, verdict, summary, findings }] }]
// links: { run, guide(guide, line) }
export function renderIssue({ month, reviews, notWalked, previous, links, models }, { compact = false } = {}) {
  const lastMonth = previous?.state?.verdicts ?? {};
  const guides = reviews.flatMap((review) => review.guides.map((guide) => ({ ...guide, journey: review.journey })));
  for (const { verdict } of guides) assert.ok(VERDICTS[verdict], `unknown verdict ${verdict}`);

  const intro = [
    `An AI reader followed the Deploio guides on a real Deploio account, and a second model judged the guides by what happened.`,
    `${links.run ? `[Workflow run](${links.run})` : "Local run"} · walker \`${models.walker}\` · judge \`${models.judge}\``,
    previous ? `Last month: #${previous.number}` : null,
  ].filter(Boolean);

  const overview = [
    "## Overview",
    "| Guide | Verdict | Last month |",
    "| --- | --- | --- |",
    ...guides.map(
      ({ guide, verdict }) =>
        `| [${guide}](${links.guide(guide)}) | ${VERDICTS[verdict]} | ${lastMonth[guide] ? VERDICTS[lastMonth[guide]] ?? lastMonth[guide] : "–"} |`,
    ),
  ];

  const journeys = [
    "## Journeys",
    "| Journey | Walker | Minutes |",
    "| --- | --- | --- |",
    ...reviews.map(({ journey, outcome, minutes }) => `| \`${journey}\` | ${OUTCOMES[outcome] ?? outcome} | ${minutes ?? "–"} |`),
  ];

  const sections = guides.map(({ guide, journey, verdict, summary, findings }) =>
    [
      `## ${guide}`,
      `${VERDICTS[verdict]} · journey \`${journey}\` · [open guide](${links.guide(guide)})`,
      summary,
      ...findings.map(({ line, severity, problem, suggestion }) => {
        const where = line ? ` [line ${line}](${links.guide(guide, line)})` : "";
        const lines = [`- **${severity}**${where}: ${problem}`];
        if (!compact) lines.push(`  Suggestion: ${suggestion}`);
        return lines.join("\n");
      }),
    ].join("\n\n"),
  );

  const skipped = ["## Not walked", ...Object.entries(notWalked).map(([page, reason]) => `- \`${page}\`: ${reason}`)];

  const state = { month, verdicts: Object.fromEntries(guides.map(({ guide, verdict }) => [guide, verdict])) };

  const body = [
    intro.join("\n\n"),
    overview.join("\n"),
    journeys.join("\n"),
    ...sections,
    skipped.join("\n"),
    `<!-- llm-as-a-reader-state: ${JSON.stringify(state)} -->`,
  ].join("\n\n");

  if (body.length <= MAX_BODY_LENGTH) return body;
  assert.ok(!compact, `the issue body is ${body.length} characters even without suggestions; GitHub allows 65536`);
  return renderIssue({ month, reviews, notWalked, previous, links, models }, { compact: true });
}
