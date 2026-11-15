/** @type {import('next').NextConfig} */
const nextConfig = {
  // The registry route reads component sources with fs. Trace them into the server bundle.
  outputFileTracingIncludes: {
    "/r/[name]": ["./src/components/agentic/**/*", "./src/app/tokens.css", "./src/app/globals.css"],
  },
};

export default nextConfig;
