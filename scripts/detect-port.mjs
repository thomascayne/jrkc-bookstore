import net from 'node:net';

const defaultHost = '127.0.0.1';
const defaultMaximumAttempts = 50;

export function isPortAvailable(port, host = defaultHost) {
  return new Promise((resolve) => {
    const probeServer = net.createServer();

    probeServer.once('error', () => resolve(false));
    probeServer.once('listening', () => {
      probeServer.close(() => resolve(true));
    });
    probeServer.listen(port, host);
  });
}

export async function findAvailablePort(
  preferredPort = 3000,
  { host = defaultHost, maximumAttempts = defaultMaximumAttempts } = {},
) {
  if (!Number.isInteger(preferredPort) || preferredPort < 1 || preferredPort > 65535) {
    throw new RangeError('The preferred port must be an integer from 1 through 65535.');
  }

  for (let attemptIndex = 0; attemptIndex < maximumAttempts; attemptIndex += 1) {
    const candidatePort = preferredPort + attemptIndex;

    if (candidatePort > 65535) {
      break;
    }

    if (await isPortAvailable(candidatePort, host)) {
      if (candidatePort !== preferredPort) {
        console.warn(`Port ${preferredPort} is busy; using ${candidatePort}.`);
      }

      return candidatePort;
    }
  }

  const finalPort = Math.min(preferredPort + maximumAttempts - 1, 65535);
  throw new Error(`No available port found from ${preferredPort} through ${finalPort}.`);
}
