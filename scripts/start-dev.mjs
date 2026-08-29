import { spawn } from 'node:child_process';

import { findAvailablePort } from './detect-port.mjs';

const defaultNextPort = 3000;
const nextCliPath = './node_modules/next/dist/bin/next';

const preferredPort = Number.parseInt(process.env.PORT ?? String(defaultNextPort), 10);
const availablePort = await findAvailablePort(preferredPort);

console.log(`JRKC Bookstore development URL: http://localhost:${availablePort}`);

const nextProcess = spawn(
  process.execPath,
  [nextCliPath, 'dev', '--port', String(availablePort)],
  {
    env: {
      ...process.env,
      PORT: String(availablePort),
    },
    stdio: 'inherit',
  },
);

nextProcess.once('error', (error) => {
  console.error(`Failed to start Next.js: ${error.message}`);
  process.exitCode = 1;
});

nextProcess.once('exit', (exitCode, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = exitCode ?? 1;
});
