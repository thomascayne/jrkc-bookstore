// next.config.mjs
/** @type { version } */

import { version } from './version.mjs';

const nextConfig = {
    env: {
        APP_VERSION: version,
    },
    images: {
        remotePatterns: [
            {
                hostname: 'books.google.com',
                pathname: '**',
                protocol: 'https'
            },
            {
                hostname: 'via.placeholder.com',
                pathname: '**',
                protocol: 'https'
            }
        ],
    },
}

export default nextConfig;
