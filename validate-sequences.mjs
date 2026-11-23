import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';
import { docsRoot, walkFiles } from './docs-config.mjs';

// Mermaid flowchart/class/ER parsers use DOMPurify even during syntax checks.
const dom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
const root = docsRoot;
let count = 0;
let failures = 0;
const types = new Map();
async function scan() {
  for (const path of (await walkFiles()).filter((file) => file.toLowerCase().endsWith('.md'))) {
    const tokens = marked.lexer(await readFile(path, 'utf8'));
    const diagrams = [];
    marked.walkTokens(tokens, token => {
      if (token.type === 'code' && token.lang?.trim().split(/\s+/)[0] === 'mermaid') {
        diagrams.push(token.text);
      }
    });
    for (const [index, source] of diagrams.entries()) {
      count += 1;
      try {
        const result = await mermaid.parse(source);
        if (!result) throw new Error('Parser returned no diagram');
        types.set(result.diagramType, (types.get(result.diagramType) || 0) + 1);
      } catch (error) {
        failures += 1;
        console.error(`${relative(root, path)} diagram ${index + 1}: ${error.message}`);
      }
    }
  }
}
try {
  await scan();
  console.log(`Validated ${count - failures}/${count} Mermaid blocks; skipped 0`);
  for (const [type, total] of types) console.log(`  ${type}: ${total}`);
  if (failures) process.exitCode = 1;
} finally { dom.window.close(); }
