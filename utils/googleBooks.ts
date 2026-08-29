const defaultGoogleBooksApiUrl =
  'https://www.googleapis.com/books/v1/volumes';

type GoogleBooksQueryValue = boolean | number | string | undefined;

export function createGoogleBooksUrl(
  path = '',
  query: Record<string, GoogleBooksQueryValue> = {},
) {
  const configuredApiUrl =
    process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_URL?.trim();
  const apiUrl = configuredApiUrl || defaultGoogleBooksApiUrl;
  const normalizedApiUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
  const normalizedPath = path.replace(/^\//, '');
  const requestUrl = new URL(normalizedPath, normalizedApiUrl);

  Object.entries(query).forEach(([parameterName, parameterValue]) => {
    if (parameterValue !== undefined && parameterValue !== '') {
      requestUrl.searchParams.set(parameterName, String(parameterValue));
    }
  });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY?.trim();
  if (apiKey) {
    requestUrl.searchParams.set('key', apiKey);
  }

  return requestUrl.toString();
}
