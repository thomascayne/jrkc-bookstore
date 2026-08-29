import { spawnSync } from 'node:child_process';

const composeEnvironmentFile = '.env.production';
const containerPort = 3100;
const defaultHostPort = 3100;
const dockerExecutable = process.platform === 'win32' ? 'docker.exe' : 'docker';
const publicUrl = 'https://bookstore.thomascayne.com';
const supportedCommands = new Set(['build', 'config', 'port', 'up']);

function getHostPort() {
  const configuredPort = process.env.BOOKSTORE_HOST_PORT;

  if (!configuredPort) {
    return defaultHostPort;
  }

  const parsedPort = Number(configuredPort);

  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error(
      `BOOKSTORE_HOST_PORT must be an integer from 1 through 65535; received "${configuredPort}".`,
    );
  }

  return parsedPort;
}

function printPortSummary(hostPort, command) {
  console.log('JRKC Bookstore Docker ports');
  console.log(`  Container: ${containerPort}`);
  console.log(`  Oracle host: 127.0.0.1:${hostPort}`);
  console.log(`  Published mapping: 127.0.0.1:${hostPort} -> container:${containerPort}`);
  console.log(`  Oracle upstream: http://127.0.0.1:${hostPort}`);
  console.log(`  Public URL through Caddy: ${publicUrl}`);

  if (command === 'build') {
    console.log('  Note: docker:build creates the image; docker:up publishes the host port.');
  }
}

function runCompose(argumentsList, captureOutput = false) {
  const executionResult = spawnSync(
    dockerExecutable,
    ['compose', '--env-file', composeEnvironmentFile, ...argumentsList],
    {
      encoding: 'utf8',
      env: process.env,
      stdio: captureOutput ? 'pipe' : 'inherit',
    },
  );

  if (executionResult.error) {
    throw executionResult.error;
  }

  if (executionResult.status !== 0) {
    if (captureOutput && executionResult.stderr) {
      process.stderr.write(executionResult.stderr);
    }

    process.exit(executionResult.status ?? 1);
  }

  return captureOutput ? executionResult.stdout.trim() : '';
}

try {
  const command = process.argv[2];

  if (!command || !supportedCommands.has(command)) {
    throw new Error(`Expected one of: ${[...supportedCommands].join(', ')}.`);
  }

  const hostPort = getHostPort();
  printPortSummary(hostPort, command);

  if (command === 'port') {
    process.exit(0);
  }

  if (command === 'build') {
    runCompose(['build']);
  }

  if (command === 'config') {
    runCompose(['config', '--quiet']);
  }

  if (command === 'up') {
    runCompose(['up', '--detach']);
    const publishedBinding = runCompose(['port', 'bookstore', String(containerPort)], true);
    console.log(`Docker confirmed: ${publishedBinding || `127.0.0.1:${hostPort}`}`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Docker command failed: ${message}`);
  process.exit(1);
}
