import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const hooksPath = '.githooks';

if (!existsSync(hooksPath)) {
  throw new Error(`Git hooks directory does not exist: ${hooksPath}`);
}

const configurationResult = spawnSync(
  'git',
  ['config', '--local', 'core.hooksPath', hooksPath],
  { encoding: 'utf8', stdio: 'pipe' },
);

if (configurationResult.error) {
  throw configurationResult.error;
}

if (configurationResult.status !== 0) {
  throw new Error(
    configurationResult.stderr.trim() || 'Unable to configure repository Git hooks.',
  );
}

console.log(`Git hooks enabled for this clone through ${hooksPath}.`);
