import { copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { docsRoot, toolRoot, walkFiles } from './docs-config.mjs';

const files = await walkFiles();
if (!files.some((file) => file.toLowerCase().endsWith('.md'))) {
  throw new Error(`No Markdown documents found in ${docsRoot}`);
}
const destination = resolve(toolRoot, 'public/docs');
await rm(destination, { recursive: true, force: true });
for (const file of files.filter((path) => !path.toLowerCase().endsWith('.md'))) {
  const output = resolve(destination, relative(docsRoot, file));
  await mkdir(dirname(output), { recursive: true });
  await copyFile(file, output);
}
