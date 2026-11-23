import { readdir } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

export const toolRoot = import.meta.dirname;
export const docsRoot = resolve(process.env.DOCS_ROOT || resolve(toolRoot, '..'));
export const excludedDirectories = new Set(['node_modules', 'dist', 'public', 'build', '.astro', '.next', 'coverage']);

export function openApiPath() {
  if (!process.env.OPENAPI_SPEC) return undefined;
  const spec = isAbsolute(process.env.OPENAPI_SPEC)
    ? resolve(process.env.OPENAPI_SPEC)
    : resolve(docsRoot, process.env.OPENAPI_SPEC);
  const within = relative(docsRoot, spec);
  if (within === '..' || within.startsWith(`..${sep}`)) throw new Error('OPENAPI_SPEC must be inside DOCS_ROOT');
  return spec;
}

export function includeEntry(path, entry) {
  if (entry.name.startsWith('.')) return false;
  if (entry.isDirectory() && (resolve(path) === toolRoot || excludedDirectories.has(entry.name))) return false;
  return entry.isDirectory() || entry.isFile();
}

export async function walkFiles(directory = docsRoot) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.filter((entry) => includeEntry(resolve(directory, entry.name), entry)).map(async (entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walkFiles(path) : [path];
  }));
  return groups.flat();
}
