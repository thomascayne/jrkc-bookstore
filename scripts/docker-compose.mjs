import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  appendFileSync,
  chmodSync,
  existsSync,
  readFileSync,
} from 'node:fs';

import { findAvailablePort } from './detect-port.mjs';

const databasePasswordNames = [
  'POSTGRES_OWNER_PASSWORD',
  'POSTGRES_PASSWORD',
];
const generatedEnvironmentFile = '.env.docker.local';
const localDatabaseName = 'jrkc_bookstore';
const productionEnvironmentFile = '.env.production';
const containerPort = 3100;
const defaultHostPort = 3100;
const dockerExecutable = process.platform === 'win32' ? 'docker.exe' : 'docker';
const publicUrl = 'https://bookstore.thomascayne.com';
const supportedCommands = new Set(['build', 'config', 'port', 'up']);

function composeEnvironmentFiles() {
  return [productionEnvironmentFile, generatedEnvironmentFile].filter((filePath) =>
    existsSync(filePath),
  );
}

function generatePassword() {
  return randomBytes(32).toString('base64url');
}

function parseEnvironmentFile(filePath) {
  if (!existsSync(filePath)) return {};

  const parsedEnvironment = {};
  for (const sourceLine of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (!line || line.startsWith('#')) continue;

    const assignment = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!assignment) continue;

    const [, name, rawValue] = assignment;
    const isQuoted =
      rawValue.length >= 2 &&
      ((rawValue.startsWith('"') && rawValue.endsWith('"')) ||
        (rawValue.startsWith("'") && rawValue.endsWith("'")));
    parsedEnvironment[name] = isQuoted ? rawValue.slice(1, -1) : rawValue;
  }

  return parsedEnvironment;
}

function effectiveEnvironment(environmentFiles) {
  const combinedEnvironment = {};
  for (const environmentFile of environmentFiles) {
    Object.assign(combinedEnvironment, parseEnvironmentFile(environmentFile));
  }

  for (const [name, value] of Object.entries(process.env)) {
    if (value !== undefined) combinedEnvironment[name] = value;
  }

  return combinedEnvironment;
}

function appendGeneratedDatabaseSettings(
  missingPasswordNames,
  includeDatabaseName,
) {
  const fileExists = existsSync(generatedEnvironmentFile);
  const existingContents = fileExists
    ? readFileSync(generatedEnvironmentFile, 'utf8')
    : '';
  const separator = existingContents && !existingContents.endsWith('\n') ? '\n' : '';
  const generatedLines = missingPasswordNames.map(
    (passwordName) => `${passwordName}=${generatePassword()}`,
  );
  if (includeDatabaseName) {
    generatedLines.push(`POSTGRES_DB=${localDatabaseName}`);
  }

  appendFileSync(
    generatedEnvironmentFile,
    `${separator}${generatedLines.join('\n')}\n`,
    { encoding: 'utf8', mode: 0o600 },
  );
  chmodSync(generatedEnvironmentFile, 0o600);
  console.log(
    `Generated missing local PostgreSQL settings in ${generatedEnvironmentFile} (ignored by Git).`,
  );
}

function ensurePersistentDatabaseCredentials() {
  const generatedEnvironment = parseEnvironmentFile(generatedEnvironmentFile);
  const missingPasswordNames = databasePasswordNames.filter(
    (passwordName) => !generatedEnvironment[passwordName],
  );
  const includeDatabaseName = !generatedEnvironment.POSTGRES_DB;

  if (missingPasswordNames.length > 0 || includeDatabaseName) {
    appendGeneratedDatabaseSettings(missingPasswordNames, includeDatabaseName);
  }

  return composeEnvironmentFiles();
}

function localRuntimeEnvironment(hostPort) {
  const generatedEnvironment = parseEnvironmentFile(generatedEnvironmentFile);
  const ownerPassword = generatedEnvironment.POSTGRES_OWNER_PASSWORD;
  const appPassword = generatedEnvironment.POSTGRES_PASSWORD;
  const databaseName = generatedEnvironment.POSTGRES_DB || localDatabaseName;
  if (!ownerPassword || !appPassword) {
    throw new Error(
      `Local PostgreSQL credentials are missing from ${generatedEnvironmentFile}.`,
    );
  }

  return {
    ...process.env,
    BOOKSTORE_HOST_PORT: String(hostPort),
    POSTGRES_DB: databaseName,
    POSTGRES_OWNER_PASSWORD: ownerPassword,
    POSTGRES_PASSWORD: appPassword,
  };
}

function synchronizeDatabaseCredentials(
  environmentFiles,
  commandEnvironment,
) {
  const synchronizationScript = `
psql \\
  --username "$POSTGRES_USER" \\
  --dbname postgres \\
  --set=ON_ERROR_STOP=1 \\
  --set=app_password="$POSTGRES_APP_PASSWORD" \\
  --set=owner_password="$POSTGRES_PASSWORD" <<'SQL'
ALTER ROLE jrkc_app WITH PASSWORD :'app_password';
ALTER ROLE jrkc_owner WITH PASSWORD :'owner_password';
SQL
`;

  runCompose(
    ['up', '--detach', '--wait', 'database'],
    false,
    environmentFiles,
    commandEnvironment,
  );
  runCompose(
    ['exec', '-T', 'database', 'sh', '-ec', synchronizationScript],
    false,
    environmentFiles,
    commandEnvironment,
  );
}

function interpolationEnvironment(environmentFiles) {
  const commandEnvironment = { ...process.env };
  const configuredEnvironment = effectiveEnvironment(environmentFiles);
  for (const passwordName of databasePasswordNames) {
    if (!configuredEnvironment[passwordName]) {
      commandEnvironment[passwordName] = generatePassword();
    }
  }

  return commandEnvironment;
}

function appendLocalSetting(name, value) {
  const fileExists = existsSync(generatedEnvironmentFile);
  const existingContents = fileExists
    ? readFileSync(generatedEnvironmentFile, 'utf8')
    : '';
  const separator = existingContents && !existingContents.endsWith('\n') ? '\n' : '';
  appendFileSync(generatedEnvironmentFile, `${separator}${name}=${value}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
  chmodSync(generatedEnvironmentFile, 0o600);
}

async function getHostPort(command) {
  const generatedEnvironment = parseEnvironmentFile(generatedEnvironmentFile);
  const configuredPort =
    process.env.BOOKSTORE_HOST_PORT || generatedEnvironment.BOOKSTORE_HOST_PORT;

  if (!configuredPort) {
    if (command !== 'up') return defaultHostPort;

    const availablePort = await findAvailablePort(defaultHostPort);
    appendLocalSetting('BOOKSTORE_HOST_PORT', availablePort);
    console.log(
      `Saved local Docker port ${availablePort} in ${generatedEnvironmentFile}.`,
    );
    return availablePort;
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

function runCompose(
  argumentsList,
  captureOutput = false,
  environmentFiles = composeEnvironmentFiles(),
  commandEnvironment = process.env,
) {
  const environmentArguments = environmentFiles.flatMap((environmentFile) => [
    '--env-file',
    environmentFile,
  ]);
  const executionResult = spawnSync(
    dockerExecutable,
    ['compose', ...environmentArguments, ...argumentsList],
    {
      encoding: 'utf8',
      env: commandEnvironment,
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

  const hostPort = await getHostPort(command);
  printPortSummary(hostPort, command);

  if (command === 'port') {
    process.exit(0);
  }

  if (command === 'build') {
    const environmentFiles = composeEnvironmentFiles();
    runCompose(
      ['build'],
      false,
      environmentFiles,
      interpolationEnvironment(environmentFiles),
    );
  }

  if (command === 'config') {
    const environmentFiles = composeEnvironmentFiles();
    runCompose(
      ['config', '--quiet'],
      false,
      environmentFiles,
      interpolationEnvironment(environmentFiles),
    );
  }

  if (command === 'up') {
    const environmentFiles = ensurePersistentDatabaseCredentials();
    const commandEnvironment = localRuntimeEnvironment(hostPort);
    synchronizeDatabaseCredentials(environmentFiles, commandEnvironment);
    runCompose(['up', '--detach'], false, environmentFiles, commandEnvironment);
    const publishedBinding = runCompose(
      ['port', 'bookstore', String(containerPort)],
      true,
      environmentFiles,
      commandEnvironment,
    );
    console.log(`Docker confirmed: ${publishedBinding || `127.0.0.1:${hostPort}`}`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Docker command failed: ${message}`);
  process.exit(1);
}
