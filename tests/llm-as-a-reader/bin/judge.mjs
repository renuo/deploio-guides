#!/usr/bin/env node
// Judges every walked journey in a results directory and writes review.json next to its evidence.
// Usage: judge.mjs <results-dir>

import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { judgeInput } from "../lib/compose.mjs";
import { askJudge, notJudged, reviewsFor } from "../lib/judge.mjs";
import { loadJourney, loadPrompt, readGuide } from "../lib/journeys.mjs";
import { redactDeep, secretsFromEnv } from "../lib/redact.mjs";

const [resultsDir] = process.argv.slice(2);
assert.ok(resultsDir, "usage: judge.mjs <results-dir>");
const model = process.env.LLM_READER_JUDGE_MODEL;
const apiKey = process.env.OPENAI_API_KEY;
const instructions = loadPrompt("judge");
const secrets = secretsFromEnv(process.env);

for (const dir of readdirSync(resultsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  const path = join(resultsDir, dir.name);
  if (!existsSync(join(path, "meta.json"))) continue;
  const read = (name) => JSON.parse(readFileSync(join(path, name), "utf8"));
  const meta = read("meta.json");
  const journey = loadJourney(meta.journey);
  const guideTexts = Object.fromEntries(journey.guides.map((guide) => [guide, readGuide(guide)]));
  const input = judgeInput({ journey, guideTexts, meta, evidence: read("evidence.json"), walkerResult: read("walker-result.json") });

  let guides;
  try {
    guides = reviewsFor(journey.guides, await askJudge({ instructions, input, guides: journey.guides, model, apiKey }));
  } catch (error) {
    const reason = error.cause ? `${error.message} (${error.cause.message})` : error.message;
    console.error(`${journey.slug}: ${reason}`);
    guides = journey.guides.map((guide) => notJudged(guide, `The judge failed: ${reason}`));
  }

  const review = { journey: journey.slug, outcome: meta.outcome, minutes: meta.minutes, walkerModel: meta.walkerModel, judgeModel: model, guides };
  writeFileSync(join(path, "review.json"), `${JSON.stringify(redactDeep(review, secrets), null, 2)}\n`);
  console.log(`${journey.slug}: ${guides.map(({ guide, verdict }) => `${guide} ${verdict}`).join(", ")}`);
}
