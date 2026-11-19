import assert from "node:assert/strict";

export function numbered(text) {
  return text
    .split("\n")
    .map((line, index) => `${String(index + 1).padStart(4)} | ${line}`)
    .join("\n");
}

// Values are inserted once and never scanned again, so guide text containing
// {{ ... }} (VitePress templates) stays untouched.
export function fill(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    assert.ok(key in values, `no value for {{${key}}}`);
    return values[key];
  });
}

function guidesSection(journey, guideTexts) {
  return journey.guides
    .map((guide) => {
      assert.ok(guide in guideTexts, `missing text of ${guide}`);
      return `### ${guide}\n\n${numbered(guideTexts[guide])}`;
    })
    .join("\n\n");
}

export function walkerPrompt({ reader, journey, guideTexts, project, organization, workspace, docs }) {
  const values = { project, organization, workspace, docs, journey: journey.slug };
  return fill(reader, { ...values, prompt: fill(journey.prompt, values), guides: guidesSection(journey, guideTexts) });
}

const OUTCOMES = {
  completed: () => "The walker finished on its own.",
  "timed-out": (meta) => `The walker was stopped after the time limit of ${meta.timeoutMinutes} minutes.`,
  failed: (meta) => `The walker crashed with exit code ${meta.exitCode}.`,
};

function shellLine(argv) {
  return `\`nctl ${argv.map((word) => (/[\s"'$;|&]/.test(word) ? JSON.stringify(word) : word)).join(" ")}\``;
}

function list(items, render) {
  return items.length === 0 ? "(none)" : items.map((item) => `- ${render(item)}`).join("\n");
}

// Everything but the guide texts must already be redacted. The walker's
// narrative is deliberately absent: only its structured claims are passed on.
export function judgeInput({ journey, guideTexts, meta, evidence, walkerResult }) {
  assert.ok(OUTCOMES[meta.outcome], `unknown walker outcome ${meta.outcome}`);
  const { literal, lint, probes } = evidence;

  return [
    `# Journey: ${journey.slug}`,
    OUTCOMES[meta.outcome](meta),
    "## Guides",
    guidesSection(journey, guideTexts),
    "## 1. Lint",
    list(lint, (finding) => `${finding.guide}:${finding.lineNumber} ${finding.rule}: ${finding.message}`),
    "## 2. Literal check",
    list(literal.commands, (command) => {
      const where = `${command.guide}:${command.lineNumber}`;
      if (command.status === "not-run") return `${where} not run: \`${command.text}\``;
      const result = `exit ${command.ran.exit}`;
      if (command.status === "as-written") return `${where} as written, ${result}: \`${command.text}\``;
      return `${where} adapted (${command.differences.join("; ")}), ${result}: ran ${shellLine(command.ran.argv)}`;
    }),
    "## 3. Unguided nctl calls",
    list(literal.unguided, (call) => `${shellLine(call.argv)}, exit ${call.exit}`),
    "## 4. Refused nctl calls",
    list(literal.refused, (call) => `${shellLine(call.argv)}: ${call.refused}`),
    "## 5. Probes",
    list(probes, (probe) =>
      probe.error
        ? `app ${probe.app}: ${probe.error}`
        : `app ${probe.app}: release ${probe.release ?? "unknown"}, ${probe.url ?? "no URL"} answered ${probe.http ?? "nothing"}`,
    ),
    "## 6. The walker's report (claims)",
    walkerResult ? `\`\`\`json\n${JSON.stringify(walkerResult, null, 2)}\n\`\`\`` : "(the walker gave no report)",
  ].join("\n\n");
}
