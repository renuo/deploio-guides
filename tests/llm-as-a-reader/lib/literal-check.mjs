import assert from "node:assert/strict";

const SHORT_FLAGS = { p: "project", o: "output", a: "application-name", t: "type", A: "all-projects", w: "watch" };
const BOOLEAN_FLAGS = new Set([
  "all-projects",
  "basic-auth",
  "basic-auth-credentials",
  "change-basic-auth-password",
  "dns",
  "follow",
  "force",
  "help",
  "print-credentials",
  "print-token",
  "public-read",
  "pull-image",
  "retry-release",
  "skip-repo-access-check",
  "start",
  "verbose",
  "wait",
  "watch",
]);
const GENERIC_NAMES = new Set(["my-app", "myapp", "my-project", "org-my-project"]);
// The verification project is preset, so naming it explicitly is not a deviation.
const NEUTRAL_FLAGS = new Set(["project"]);

export function isPlaceholder(value) {
  return (
    GENERIC_NAMES.has(value) ||
    /\{[^}]*\}|<[^>]+>|\bMY_[A-Z0-9_]+|\$|x{4,}/.test(value)
  );
}

export function parseNctl(words) {
  assert.equal(words[0], "nctl", `expected an nctl command, got: ${words.join(" ")}`);

  const positional = [];
  const flags = [];
  let rest = [];
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (word === "--") {
      rest = words.slice(i + 1);
      break;
    }
    const flag = word.match(/^--?([^=]+)(?:=(.*))?$/s);
    if (!flag || word === "-") {
      positional.push(word);
      continue;
    }
    const name = SHORT_FLAGS[flag[1]] ?? flag[1];
    if (flag[2] !== undefined) flags.push({ name, value: flag[2] });
    else if (!BOOLEAN_FLAGS.has(name) && i + 1 < words.length && !words[i + 1].startsWith("-")) {
      flags.push({ name, value: words[++i] });
    } else flags.push({ name, value: null });
  }

  return { identity: positional.slice(0, 2).join(" "), positional: positional.slice(2), flags, rest };
}

export function differences(guide, executed) {
  assert.equal(guide.identity, executed.identity, "only commands of the same kind are comparable");
  const found = [];

  const length = Math.max(guide.positional.length, executed.positional.length);
  for (let i = 0; i < length; i++) {
    const wanted = guide.positional[i];
    const got = executed.positional[i];
    if (wanted === undefined) found.push(`added argument "${got}"`);
    else if (got === undefined) found.push(`left out argument "${wanted}"`);
    else if (!isPlaceholder(wanted) && wanted !== got) found.push(`argument "${wanted}" became "${got}"`);
  }

  for (const { name, value } of guide.flags) {
    if (NEUTRAL_FLAGS.has(name)) continue;
    const match = executed.flags.find((flag) => flag.name === name);
    if (!match) found.push(`left out --${name}`);
    else if (value !== null && !isPlaceholder(value) && value !== match.value) {
      found.push(`--${name}="${value}" became --${name}="${match.value}"`);
    }
  }
  for (const { name } of executed.flags) {
    if (NEUTRAL_FLAGS.has(name)) continue;
    if (!guide.flags.some((flag) => flag.name === name)) found.push(`added --${name}`);
  }

  const wantedRest = guide.rest.join(" ");
  const gotRest = executed.rest.join(" ");
  if (!isPlaceholder(wantedRest) && wantedRest !== gotRest) found.push(`command "${wantedRest}" became "${gotRest}"`);

  return found;
}

// guideCommands: [{ guide, lineNumber, text, words }] from nctlCommands()
// calls: [{ argv, exit, refused }] as written by the nctl shim
export function literalCheck(guideCommands, calls) {
  const executed = calls
    .filter((call) => !call.refused)
    .map((call) => ({ call, parsed: parseNctl(["nctl", ...call.argv]) }));
  const used = new Set();

  const commands = guideCommands.map(({ guide, lineNumber, text, words }) => {
    const wanted = parseNctl(words);
    let best = null;
    for (const candidate of executed) {
      if (candidate.parsed.identity !== wanted.identity) continue;
      const found = differences(wanted, candidate.parsed);
      if (!best || found.length < best.differences.length) best = { candidate, differences: found };
    }
    if (!best) return { guide, lineNumber, text, status: "not-run", differences: [], ran: null };

    used.add(best.candidate);
    return {
      guide,
      lineNumber,
      text,
      status: best.differences.length === 0 ? "as-written" : "adapted",
      differences: best.differences,
      ran: { argv: best.candidate.call.argv, exit: best.candidate.call.exit },
    };
  });

  const seen = new Set();
  const unguided = [];
  for (const candidate of executed) {
    const key = candidate.call.argv.join("\u0000");
    if (used.has(candidate) || seen.has(key)) continue;
    seen.add(key);
    unguided.push({ argv: candidate.call.argv, exit: candidate.call.exit });
  }

  const refused = calls.filter((call) => call.refused).map(({ argv, refused }) => ({ argv, refused }));

  return { commands, unguided, refused };
}
