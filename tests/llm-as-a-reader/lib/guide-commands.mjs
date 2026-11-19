import { gluedSemicolons, shellSegments } from "./shell.mjs";

const SHELL_LANGUAGES = new Set(["bash", "sh", "shell", "zsh"]);
const OPENING_FENCE = /^(\s*)(`{3,}|~{3,})\s*([\w-]*)/;

export function shellBlocks(markdown) {
  const blocks = [];
  let open = null;

  markdown.split("\n").forEach((text, index) => {
    const lineNumber = index + 1;
    if (!open) {
      const match = text.match(OPENING_FENCE);
      if (match) open = { indent: match[1].length, fence: match[2], language: match[3].toLowerCase(), lines: [] };
      return;
    }
    const trimmed = text.trim();
    if (trimmed.startsWith(open.fence) && trimmed.replaceAll(open.fence[0], "") === "") {
      if (SHELL_LANGUAGES.has(open.language)) blocks.push({ language: open.language, lines: open.lines });
      open = null;
      return;
    }
    const indent = Math.min(open.indent, text.match(/^\s*/)[0].length);
    open.lines.push({ lineNumber, text: text.slice(indent) });
  });

  return blocks;
}

// Joins backslash continuations exactly like bash: only a backslash as the very
// last character continues the line.
export function shellCommands(block) {
  const commands = [];
  let pending = null;

  for (const { lineNumber, text } of block.lines) {
    if (pending === null && (text.trim() === "" || text.trim().startsWith("#"))) continue;
    const continues = text.endsWith("\\");
    const piece = continues ? text.slice(0, -1) : text;
    if (pending === null) pending = { lineNumber, lastLineNumber: lineNumber, text: piece };
    else {
      pending.text += ` ${piece.trim()}`;
      pending.lastLineNumber = lineNumber;
    }
    if (!continues) {
      commands.push(pending);
      pending = null;
    }
  }
  if (pending !== null) commands.push(pending);

  return commands;
}

export function lintGuide(markdown) {
  const findings = [];

  for (const block of shellBlocks(markdown)) {
    for (const { lineNumber, text } of block.lines) {
      if (/\\[ \t]+$/.test(text)) {
        findings.push({
          lineNumber,
          rule: "whitespace-after-backslash",
          message: "Whitespace after the trailing `\\` ends the command here instead of continuing it.",
        });
      }
    }
    const commands = shellCommands(block);
    commands.forEach((command, index) => {
      const previous = commands[index - 1];
      if (isFlag(command.text) && previous && !isFlag(previous.text)) {
        findings.push({
          lineNumber: command.lineNumber,
          rule: "dangling-flag",
          message: "This line starts with a flag, but the line before does not end with `\\`, so the shell runs it as a separate command.",
        });
      }
      if (gluedSemicolons(command.text).length > 0) {
        findings.push({
          lineNumber: command.lineNumber,
          rule: "unquoted-semicolon",
          message: "An unquoted `;` splits this into several shell commands. Quote the value that contains it.",
        });
      }
    });
  }

  return findings;
}

function isFlag(text) {
  return /^--?[A-Za-z]/.test(text.trim());
}

export function nctlCommands(markdown) {
  const found = [];
  for (const block of shellBlocks(markdown)) {
    for (const command of shellCommands(block)) {
      for (const words of shellSegments(command.text)) {
        if (words[0] === "nctl") found.push({ lineNumber: command.lineNumber, text: command.text.trim(), words });
      }
    }
  }
  return found;
}
