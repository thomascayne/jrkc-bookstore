/**
 * hooks/useMediaQuery.ts
 * 
 * Returns a boolean indicating whether the media query matches the current state.
 *
 * @param {string} query - The media query string to be evaluated.
 * @return {boolean} A boolean indicating whether the media query matches the current state.
 */
'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);

    return matches;
}