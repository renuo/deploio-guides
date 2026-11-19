import { existsSync, readFileSync } from "node:fs";
import { lintGuide, nctlCommands } from "./guide-commands.mjs";
import { literalCheck, parseNctl } from "./literal-check.mjs";

export function readCalls(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

export function createdApps(calls) {
  const names = new Set();
  for (const call of calls) {
    if (call.refused || call.exit !== 0) continue;
    const { identity, positional, flags } = parseNctl(["nctl", ...call.argv]);
    if (identity === "create app" || identity === "create application") names.add(positional[0]);
    if (identity === "copy app" || identity === "copy application") {
      const target = flags.find((flag) => flag.name === "target-name");
      if (target?.value) names.add(target.value);
    }
  }
  return [...names].filter(Boolean);
}

export function staticEvidence(journey, guideTexts, calls) {
  const lint = journey.guides.flatMap((guide) => lintGuide(guideTexts[guide]).map((finding) => ({ guide, ...finding })));
  const guideCommands = journey.guides.flatMap((guide) => nctlCommands(guideTexts[guide]).map((command) => ({ guide, ...command })));
  return { lint, literal: literalCheck(guideCommands, calls) };
}

// nctl(args) runs the real nctl in the verification project and resolves to its stdout.
// The JSON shapes follow bin/deploy_review_app.
export async function probeApps(apps, { nctl, fetchImpl = fetch, timeoutMs = 20_000 }) {
  const probes = [];
  for (const app of apps) {
    try {
      const details = JSON.parse(await nctl(["get", "app", app, "-o", "json"]));
      const url = details?.status?.atProvider?.defaultURLs?.[0] ?? null;
      const releases = JSON.parse(await nctl(["get", "releases", "-a", app, "-o", "json"]));
      const release = releases?.[0]?.status?.atProvider?.releaseStatus ?? null;
      let http = null;
      if (url) {
        try {
          http = (await fetchImpl(url, { redirect: "manual", signal: AbortSignal.timeout(timeoutMs) })).status;
        } catch (error) {
          http = `no answer (${error.name})`;
        }
      }
      probes.push({ app, url, release, http });
    } catch (error) {
      probes.push({ app, error: `could not be inspected: ${error.message.split("\n")[0]}` });
    }
  }
  return probes;
}
