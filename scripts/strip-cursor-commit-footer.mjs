#!/usr/bin/env node
/**
 * Removes Cursor IDE attribution from commit messages (hook + filter-branch).
 * Catches common variants: "Made-with: Cursor", "Made-with: Cursor terminal", etc.
 */
import fs from "node:fs";

const path = process.argv[2];
const input = path ? fs.readFileSync(path, "utf8") : fs.readFileSync(0, "utf8");

const isCursorAttributionLine = (line) => {
  const t = line.trim();
  if (/^made-with:\s*cursor/i.test(t)) return true;
  if (/^co-authored-by:\s*cursor\b/i.test(t)) return true;
  if (/^signed-off-by:\s*cursor\b/i.test(t)) return true;
  return false;
};

const lines = input.split(/\r?\n/);
const out = lines.filter((line) => !isCursorAttributionLine(line));

let text = out.join("\n");
text = text.replace(/\n{3,}/g, "\n\n").replace(/\s*$/, "\n");

if (path) fs.writeFileSync(path, text);
else process.stdout.write(text);
