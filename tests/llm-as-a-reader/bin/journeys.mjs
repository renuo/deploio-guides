#!/usr/bin/env node
// Prints the journeys to walk as a JSON array: the given ones, or all.
// Usage: journeys.mjs [name ...]

import assert from "node:assert/strict";
import { loadJourneys } from "../lib/journeys.mjs";

const known = loadJourneys().map(({ slug }) => slug);
const wanted = process.argv.slice(2).flatMap((arg) => arg.split(/[\s,]+/)).filter(Boolean);
for (const slug of wanted) assert.ok(known.includes(slug), `unknown journey "${slug}", known are: ${known.join(", ")}`);

console.log(JSON.stringify(wanted.length > 0 ? wanted : known));
