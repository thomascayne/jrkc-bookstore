// utils/getRedirectUrl.ts

export const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
        // Check for a redirect URL in the query parameters
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get("redirect");

        if (redirectUrl) {
            // Validate the redirectUrl to ensure it's a relative URL
            try {
                const url = new URL(redirectUrl, window.location.origin);
                if (url.origin === window.location.origin) {
                    return redirectUrl;
                }
            } catch (e) {
                console.error("Invalid redirect URL:", redirectUrl);
            }
        }

        // If no valid redirect URL, check localStorage
        const lastVisitedPath = localStorage.getItem("lastVisitedPath");
        if (lastVisitedPath) {
            // Validate the lastVisitedPath
            try {
                const url = new URL(lastVisitedPath, window.location.origin);
                if (url.origin === window.location.origin) {
                    return lastVisitedPath;
                }
            } catch (e) {
                console.error("Invalid lastVisitedPath:", lastVisitedPath);
            }
        }
    }

    // Default to home page if no valid redirect URL or lastVisitedPath
    return "/";
};