import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "yaml";

export const ROOT = new URL("../", import.meta.url).pathname;
export const DOCS = new URL("../../../docs/", import.meta.url).pathname;
export const PROMPTS = join(ROOT, "prompts");

export function parseJourney(slug, source) {
  assert.match(slug, /^[a-z0-9-]+$/, `journey name "${slug}" must be lowercase letters, digits and dashes`);
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(match, `prompts/${slug}.md needs a YAML frontmatter`);
  const meta = parse(match[1]) ?? {};
  assert.ok(Array.isArray(meta.guides) && meta.guides.length > 0, `prompts/${slug}.md needs a non-empty "guides" list`);
  assert.ok(Number.isInteger(meta.timeout_minutes) && meta.timeout_minutes > 0, `prompts/${slug}.md needs "timeout_minutes"`);
  const prompt = match[2].trim();
  assert.ok(prompt.length > 0, `prompts/${slug}.md needs a prompt below the frontmatter`);

  return { slug, guides: meta.guides, timeoutMinutes: meta.timeout_minutes, prompt };
}

export function loadJourneys(promptsDir = PROMPTS) {
  return readdirSync(promptsDir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .sort()
    .map((name) => parseJourney(name.slice(0, -3), readFileSync(join(promptsDir, name), "utf8")));
}

export function loadJourney(slug, promptsDir = PROMPTS) {
  const journey = loadJourneys(promptsDir).find((candidate) => candidate.slug === slug);
  assert.ok(journey, `unknown journey "${slug}"`);
  return journey;
}

export function loadPrompt(name, promptsDir = PROMPTS) {
  return readFileSync(join(promptsDir, `_${name}.md`), "utf8");
}

export function loadNotWalked(file = join(ROOT, "not-walked.yml")) {
  const entries = parse(readFileSync(file, "utf8")) ?? {};
  for (const [page, reason] of Object.entries(entries)) {
    assert.ok(typeof reason === "string" && reason.trim(), `not-walked.yml: ${page} needs a reason`);
  }
  return entries;
}

export function docPages(docsDir = DOCS) {
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      if (entry.name.startsWith(".")) return [];
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return walk(path);
      return entry.name.endsWith(".md") ? [relative(docsDir, path)] : [];
    });
  return walk(docsDir).sort();
}

export function coverage({ pages, journeys, notWalked }) {
  const owners = new Map();
  const claim = (page, owner) => owners.set(page, [...(owners.get(page) ?? []), owner]);
  for (const journey of journeys) for (const guide of journey.guides) claim(guide, `prompts/${journey.slug}.md`);
  for (const page of Object.keys(notWalked)) claim(page, "not-walked.yml");

  return {
    unaccounted: pages.filter((page) => !owners.has(page)),
    doubled: [...owners].filter(([, by]) => by.length > 1).map(([page, by]) => ({ page, by })),
    unknown: [...owners.keys()].filter((page) => !pages.includes(page)),
  };
}

export function readGuide(guide, docsDir = DOCS) {
  return readFileSync(join(docsDir, guide), "utf8");
}
