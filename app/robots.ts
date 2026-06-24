import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // 공개 페이지 예외 허용
        allow: [
          '/onboarding',
          '/dashboard/*',
          '/feedback/*',
          '/search/*',
          '/profile/*',
        ],
        disallow: [
          '/api',
          '/login',
          '/signup',
          '/dashboard',
          '/profile',
          '/notifications',
          '/follow',
          '/feedback',
          '/search',
        ],
      },
    ],
    sitemap: 'https://thehabit.quest',
  };
}
