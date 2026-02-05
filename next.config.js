/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  // Capacitorのローカル配信と相性が良いことが多い
  trailingSlash: true,
}
module.exports = nextConfig;
