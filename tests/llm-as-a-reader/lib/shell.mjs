const OPERATORS = new Set(["|", ";", "&"]);

// Splits one shell command line into simple commands (separated by |, ||, &&, ;)
// and their words, the way bash would read it. Redirections are dropped.
export function shellSegments(line) {
  const segments = [];
  let words = [];
  let word = null;
  let quote = null;
  let substitution = 0;
  let dropNextWord = false;

  const endWord = () => {
    if (word === null) return;
    if (dropNextWord) dropNextWord = false;
    else words.push(word);
    word = null;
  };
  const endSegment = () => {
    endWord();
    if (words.length > 0) segments.push(words);
    words = [];
  };

  for (let i = 0; i < line.length; i++) {
    const c = line[i];

    if (substitution > 0) {
      word += c;
      if (c === "(") substitution++;
      if (c === ")") substitution--;
      continue;
    }
    if (c === "$" && line[i + 1] === "(") {
      word = (word ?? "") + "$(";
      substitution = 1;
      i++;
      continue;
    }
    if (quote) {
      if (c === quote) quote = null;
      else if (c === "\\" && quote === '"' && i + 1 < line.length) word += line[++i];
      else word += c;
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      word = word ?? "";
      continue;
    }
    if (c === "\\" && i + 1 < line.length) {
      word = (word ?? "") + line[++i];
      continue;
    }
    if (/\s/.test(c)) {
      endWord();
      continue;
    }
    if (c === "#" && word === null) break;
    if (c === ">" || c === "<") {
      if (word !== null && /^\d+$/.test(word)) word = null;
      endWord();
      while (line[i + 1] === ">" || line[i + 1] === "&") i++;
      dropNextWord = true;
      continue;
    }
    if (OPERATORS.has(c)) {
      while (OPERATORS.has(line[i + 1])) i++;
      endSegment();
      continue;
    }
    word = (word ?? "") + c;
  }
  endSegment();
  return segments;
}

// Positions of `;` that bash treats as a command separator although no
// whitespace surrounds it, e.g. --env=A=1;B=2 – almost always a quoting mistake.
export function gluedSemicolons(line) {
  const positions = [];
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === quote) quote = null;
      else if (c === "\\" && quote === '"') i++;
      continue;
    }
    if (c === "'" || c === '"') quote = c;
    else if (c === "\\") i++;
    else if (c === "#" && (i === 0 || /\s/.test(line[i - 1]))) break;
    else if (c === ";" && i > 0 && !/\s/.test(line[i - 1]) && i + 1 < line.length && !/\s/.test(line[i + 1])) {
      positions.push(i);
    }
  }
  return positions;
}
