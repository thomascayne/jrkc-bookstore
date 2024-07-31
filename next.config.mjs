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
                hostname: '**.google.com',
                pathname: '**',
                protocol: 'https',
                port: ''
            },
            {
                hostname: '**.placeholder.com',
                pathname: '**',
                protocol: 'https',
                port: ''
            }
        ],
    },
}

export default nextConfig;
