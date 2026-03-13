import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  const siteUrl = context.site?.toString() ?? 'https://leeyc924.github.io';
  const base = '/leeyc-blog';

  return rss({
    title: 'leeyc blog',
    description: 'A personal blog about programming and technology',
    site: siteUrl,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `${base}/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: '<language>ko</language>',
  });
}
