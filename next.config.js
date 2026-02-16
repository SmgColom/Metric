const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants')

module.exports = (phase) => {
  // Setting Phase
  const isDev = phase === PHASE_DEVELOPMENT_SERVER
  const isProd = phase === PHASE_PRODUCTION_BUILD
  console.log(`isDev:${isDev}  isProd:${isProd}`)

  const reactStrictMode = true;

  // UNCONFIGURED HOST + REMOTE PATTERNS: https://nextjs.org/docs/pages/api-reference/components/image#remotepatterns
  const images = {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.bbci.co.uk',
      },
      {
        protocol: 'http',
        hostname: '**.bbc.co.uk',
      },
      {
        protocol: 'https',
        hostname: '**.abc-cdn.net.au',
      },
      {
        protocol: 'https',
        hostname: '**.**',
      },
      {
        protocol: 'https',
        hostname: '**.**.**',
      },
    ]
  }

  const env = {
    SERVER_NAME: (() => {
      if (isDev) return 'http://localhost:3000/'
      if (isProd) return 'https://metric-omega.vercel.app/'
    })(),
    NEWS_API_KEY: process.env.NEWS_API_KEY,
  

    
  } 

  // Next.config returns an object
  return {
    reactStrictMode,
    images,
    env,
  }
}
