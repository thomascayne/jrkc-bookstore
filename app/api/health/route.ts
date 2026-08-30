import { checkDatabaseConnection } from '@/db/client';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    await checkDatabaseConnection();

    return new Response(null, {
      headers: {
        'Cache-Control': 'no-store',
      },
      status: 204,
    });
  } catch {
    return new Response(null, {
      headers: {
        'Cache-Control': 'no-store',
      },
      status: 503,
    });
  }
}
