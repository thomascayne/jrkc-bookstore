import { createServer } from 'https';
import fs from 'fs';
import next from 'next';
import path from 'path'; // <-- Importing the 'path' module
import { parse } from 'url';

import { findAvailablePort } from './scripts/detect-port.mjs';

const dev = process.env.NODE_ENV !== 'production';
const preferredPort = Number.parseInt(process.env.PORT ?? '3000', 10);
const port = await findAvailablePort(preferredPort);
const app = next({ dev, hostname: 'localhost', port });
const handle = app.getRequestHandler();

await app.prepare();

createServer(
  {
    cert: fs.readFileSync(path.join(process.cwd(), 'localhost.pem')),
    key: fs.readFileSync(path.join(process.cwd(), 'localhost-key.pem')),
  },
  (request, response) => {
    const parsedUrl = parse(request.url ?? '/', true);
    handle(request, response, parsedUrl);
  },
).listen(port, '127.0.0.1', (error) => {
  if (error) {
    throw error;
  }

  console.log(`> Ready on https://localhost:${port}`);
});
