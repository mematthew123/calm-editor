import type {NextConfig} from 'next'
import {sanity} from 'next-sanity/live/cache-life'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Cache content for a long time; Sanity Live invalidates it the moment something is published.
  cacheLife: {default: sanity},
  // Workspace packages ship TypeScript and CSS source.
  transpilePackages: ['@calm/content', '@calm/tokens'],
  // Sanity's image CDN resizes and formats images itself, so Next doesn't optimise them twice.
  images: {loader: 'custom', loaderFile: './src/sanity/image-loader.ts'},
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
