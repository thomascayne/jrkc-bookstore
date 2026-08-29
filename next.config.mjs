/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: process.env.NEXT_DIST_DIR ?? '.next',
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'books.google.com',
                pathname: '**',
            },
        ],
    },
}

export default nextConfig;
