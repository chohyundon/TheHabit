import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://thehabit.quest',
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: 'https://thehabit.quest/onboarding',
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: 'https://thehabit.quest/dashboard',
      lastModified: new Date(),
      priority: 0.5,
    },
    {
      url: 'https://thehabit.quest/follow',
      lastModified: new Date(),
      priority: 0.5,
    },
    {
      url: 'https://thehabit.quest/profile',
      lastModified: new Date(),
      priority: 0.5,
    },
    {
      url: 'https://thehabit.quest/feedback',
      lastModified: new Date(),
      priority: 0.5,
    },
  ];
}
