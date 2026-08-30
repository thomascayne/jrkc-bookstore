import { checkDatabaseConnection } from '@/db/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const release = process.env.BOOKSTORE_RELEASE_COMMIT ?? 'local';
  const expectedRelease = request.headers.get('x-expected-bookstore-release');

  if (expectedRelease && expectedRelease !== release) {
    return Response.json(
      {
        database: 'unchecked',
        expectedRelease,
        release,
        status: 'release-mismatch',
      },
      {
        headers: { 'Cache-Control': 'no-store' },
        status: 409,
      },
    );
  }

  try {
    await checkDatabaseConnection();

    return Response.json(
      {
        database: 'available',
        release,
        status: 'ok',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json(
      {
        database: 'unavailable',
        release,
        status: 'degraded',
      },
      {
        headers: { 'Cache-Control': 'no-store' },
        status: 503,
      },
    );
  }
}
