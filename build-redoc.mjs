import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { openApiPath, toolRoot } from './docs-config.mjs';

const output = resolve(toolRoot, 'public/redoc.html');
await rm(output, { force: true });
const spec = openApiPath();
if (spec) {
  await mkdir(resolve(toolRoot, 'public'), { recursive: true });
  const cli = resolve(toolRoot, 'node_modules/@redocly/cli/bin/cli.js');
  const result = spawnSync(process.execPath, [cli, 'build-docs', spec,
    '--config', resolve(toolRoot, 'redocly.yaml'), '--inlineBundle',
    '--title', process.env.DOCS_TITLE || 'API Reference', '--output', output],
  { cwd: toolRoot, stdio: 'inherit', env: { ...process.env, REDOCLY_TELEMETRY: 'off' } });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
