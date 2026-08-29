export const dynamic = 'force-dynamic';

export function GET(): Response {
  return new Response(null, {
    headers: {
      'Cache-Control': 'no-store',
    },
    status: 204,
  });
}
