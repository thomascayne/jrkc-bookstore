// utils/redirectUtils.ts

const LAST_VISITED_PATH_KEY = 'lastVisitedPath';

export const getRedirectUrl = (): string => {
  if (typeof window === 'undefined') {
    return '/'; // Default to home page if not in browser environment
  }

  // Check for a redirect URL in the query parameters
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = params.get('redirect');

  if (redirectUrl && isValidRelativeUrl(redirectUrl)) {
    return redirectUrl;
  }

  // If no valid redirect URL in query params, check localStorage
  const lastVisitedPath = localStorage.getItem(LAST_VISITED_PATH_KEY);
  if (lastVisitedPath && isValidRelativeUrl(lastVisitedPath)) {
    return lastVisitedPath;
  }

  // Default to home page if no valid redirect URL or lastVisitedPath
  return '/';
};

export const setLastVisitedPath = (path: string): void => {
  if (typeof window !== 'undefined' && isValidRelativeUrl(path)) {
    localStorage.setItem(LAST_VISITED_PATH_KEY, path);
  }
};

export const clearLastVisitedPath = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LAST_VISITED_PATH_KEY);
  }
};

// Helper function to validate relative URLs
function isValidRelativeUrl(url: string): boolean {
  if (url.startsWith('/')) {
    try {
      new URL(url, window.location.origin);
      return true;
    } catch (e) {
      console.error('Invalid URL:', url, e);
      return false;
    }
  }
  return false;
}