/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['books.google.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'books.google.com',
                pathname: '**',
            },
        ],
    },
    reactStrictMode: true,
    swcMinify: true,
    trailingSlash: false, // Keep as needed for your routing
}

export default nextConfig;
