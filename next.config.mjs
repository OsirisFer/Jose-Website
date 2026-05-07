/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'jose-website-beige.vercel.app' }],
        destination: 'https://www.psicologajosefina.page/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'psicologajosefina.page' }],
        destination: 'https://www.psicologajosefina.page/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
