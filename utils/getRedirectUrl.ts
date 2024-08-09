// utils/getRedirectUrl

export const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get("redirect");
        const lastVisitedPage = localStorage.getItem("lastVisitedPage");
        return redirectUrl || lastVisitedPage || "/";
    }
    return "/";
};

