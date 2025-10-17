/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  outputFileTracingExcludes: {
    '*': ['../backend/**/*'],
  },
};

module.exports = nextConfig;