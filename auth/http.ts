import { NextResponse } from 'next/server';

export function assertSameOrigin(request: Request) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new Error('Cross-site request rejected.');
  }

  const origin = request.headers.get('origin');
  if (!origin) {
    return;
  }

  const forwardedHost =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!forwardedHost || new URL(origin).host !== forwardedHost) {
    throw new Error('Request origin rejected.');
  }
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function readJsonObject(request: Request) {
  const body: unknown = await request.json();
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Expected a JSON object.');
  }

  return body as Record<string, unknown>;
}
