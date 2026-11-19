#!/usr/bin/env node
// Renders the monthly issue from the reviews in a results directory.
// Usage: report.mjs <results-dir> --month YYYY-MM --journeys '["go",...]'
//          [--previous-issue N --previous-body FILE] --title-file FILE --body-file FILE

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { issueTitle, readState, renderIssue } from "../lib/issue.mjs";
import { notJudged } from "../lib/judge.mjs";
import { loadJourney, loadNotWalked } from "../lib/journeys.mjs";
import { redactDeep, secretsFromEnv } from "../lib/redact.mjs";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    month: { type: "string" },
    journeys: { type: "string" },
    "previous-issue": { type: "string" },
    "previous-body": { type: "string" },
    "title-file": { type: "string" },
    "body-file": { type: "string" },
  },
});
const [resultsDir] = positionals;
assert.ok(resultsDir && values.month && values.journeys && values["title-file"] && values["body-file"], "see usage at the top of report.mjs");

const reviews = readReviews(resultsDir);
const ordered = JSON.parse(values.journeys).map((slug) => {
  const review = reviews.find((candidate) => candidate.journey === slug);
  if (review) return review;
  const { guides } = loadJourney(slug);
  return { journey: slug, outcome: "missing", minutes: null, guides: guides.map((guide) => notJudged(guide, "The walk left no results.")) };
});

const previous = values["previous-issue"]
  ? { number: values["previous-issue"], state: readState(readFileSync(values["previous-body"], "utf8")) }
  : null;

const repository = `${process.env.GITHUB_SERVER_URL ?? "https://github.com"}/${process.env.GITHUB_REPOSITORY ?? "renuo/deploio-guides"}`;
const sha = process.env.GITHUB_SHA ?? execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const links = {
  run: process.env.GITHUB_RUN_ID ? `${repository}/actions/runs/${process.env.GITHUB_RUN_ID}` : null,
  guide: (guide, line) => `${repository}/blob/${sha}/docs/${guide}${line ? `#L${line}` : ""}`,
};
const models = {
  walker: reviews.find((review) => review.walkerModel)?.walkerModel ?? "unknown",
  judge: reviews.find((review) => review.judgeModel)?.judgeModel ?? "unknown",
};

const body = renderIssue({
  month: values.month,
  reviews: redactDeep(ordered, secretsFromEnv(process.env)),
  notWalked: loadNotWalked(),
  previous,
  links,
  models,
});
writeFileSync(values["title-file"], issueTitle(values.month));
writeFileSync(values["body-file"], body);

function readReviews(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, "review.json")))
    .map((entry) => JSON.parse(readFileSync(join(dir, entry.name, "review.json"), "utf8")));
}
