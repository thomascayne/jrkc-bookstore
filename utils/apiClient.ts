interface ApiErrorBody {
  error?: string;
}

export async function apiRequest<ResponseBody>(
  input: string,
  init?: RequestInit,
): Promise<ResponseBody> {
  const response = await fetch(input, {
    ...init,
    credentials: 'same-origin',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const body = (await response.json()) as ResponseBody & ApiErrorBody;

  if (!response.ok) {
    throw new Error(body.error || `Request failed with status ${response.status}.`);
  }

  return body;
}
