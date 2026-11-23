import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { openApiPath, toolRoot } from './docs-config.mjs';

const spec = openApiPath();
if (spec) {
  const cli = resolve(toolRoot, 'node_modules/@redocly/cli/bin/cli.js');
  const result = spawnSync(process.execPath, [cli, 'lint', spec, '--config', resolve(toolRoot, 'redocly.yaml')],
    { cwd: toolRoot, stdio: 'inherit', env: { ...process.env, REDOCLY_TELEMETRY: 'off' } });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
