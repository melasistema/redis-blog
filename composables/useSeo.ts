// composables/useSeo.ts
import { useHead } from '#app';
import type { Post } from '~/server/repositories/PostRepository';
import { defaultBlogConfig } from '~/config/blog.config';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string; // e.g., 'website', 'article'
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
}

export function useSeo(props: SeoProps = {}) {
  const runtimeConfig = useRuntimeConfig();
  const baseUrl: string = (process.env.NUXT_PUBLIC_URL || runtimeConfig.public.NUXT_PUBLIC_URL || 'http://localhost:3000') as string; // Fallback to localhost

  const siteName = defaultBlogConfig.siteName;
  const defaultDescription = `Welcome to ${siteName}, a blog built with Nuxt and Redis.`;
  const defaultImage = `${baseUrl}/default-og-image.jpg`; // Using default-og-image.jpg as default Open Graph image

  const title = props.title ? `${props.title} - ${siteName}` : siteName;
  const description = props.description || defaultDescription;
  const image = props.image || defaultImage;
  const url = props.url || baseUrl;
  const type = props.type || 'website';

  // Basic structured data for organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": baseUrl,
    "logo": defaultImage,
  };

  let articleSchema: any = {};
  if (type === 'article' && props.article) {
    articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": props.title,
      "description": description,
      "image": {
        "@type": "ImageObject",
        "url": image
      },
      "author": {
        "@type": "Person",
        "name": props.article.author || defaultBlogConfig.siteName // Fallback to siteName if author not provided
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "logo": {
            "@type": "ImageObject",
            "url": defaultImage
        }
      },
      "datePublished": props.article.publishedTime,
      "dateModified": props.article.modifiedTime || props.article.publishedTime,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      },
      "keywords": props.article.tags ? props.article.tags.join(', ') : '',
    };
  }

  useHead({
    title: title,
    meta: [
      { name: 'description', content: description },

      // Open Graph Tags
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:site_name', content: siteName },

      // Twitter Card Tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      // Consider adding twitter:creator for author's Twitter handle if available
    ],
    link: [
      { rel: 'canonical', href: url },
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(organizationSchema),
      },
      ...(type === 'article' ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify(articleSchema),
      }] : []),
    ],
  });
}

// Helper to use for posts specifically
export function usePostSeo(post: Post) {
  const runtimeConfig = useRuntimeConfig();
  const baseUrl = process.env.NUXT_PUBLIC_URL || runtimeConfig.public.NUXT_PUBLIC_URL || 'http://localhost:3000';

  const postUrl = `${baseUrl}/posts/${post.slug}`;
  const publishedTime = new Date(post.createdAt).toISOString();
  // Assuming no modified time for now, can be added later if post editing includes it
  const modifiedTime = publishedTime; 

  useSeo({
    title: post.title,
    description: post.excerpt,
    image: post.image,
    url: postUrl,
    type: 'article',
    article: {
      publishedTime: publishedTime,
      modifiedTime: modifiedTime,
      author: post.author,
      tags: post.tags,
    },
  });
}
