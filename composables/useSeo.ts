// composables/useSeo.ts
import { useHead } from '#app';
import type { Post } from '~/server/repositories/PostRepository';
import { defaultBlogConfig } from '~/config/blog.config';

interface SeoProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string; // 'website' or 'article'
    article?: {
        publishedTime?: string;
        modifiedTime?: string;
        author?: string;
        tags?: string[];
    };
}

export function useSeo(props: SeoProps = {}) {
    const runtimeConfig = useRuntimeConfig();
    const baseUrl: string = (process.env.NUXT_PUBLIC_URL || runtimeConfig.public.NUXT_PUBLIC_URL || 'http://localhost:3000') as string;

    const siteName = defaultBlogConfig.siteName;
    const defaultDescription = `Welcome to ${siteName}, a blog built with Nuxt and Redis.`;
    const defaultImage = `${baseUrl}/default-og-image.jpg`;

    const title = props.title ? `${props.title} - ${siteName}` : siteName;
    const description = props.description || defaultDescription;
    const image = props.image || defaultImage;
    const url: string = props.url || baseUrl;
    const type = props.type || 'website';

    // JSON-LD schemas as strings
    const organizationSchema = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteName,
        url: baseUrl,
        logo: defaultImage,
    });

    const articleSchema = props.article && type === 'article'
        ? JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: props.title,
            description,
            image: { "@type": "ImageObject", url: image },
            author: { "@type": "Person", name: props.article.author || siteName },
            publisher: {
                "@type": "Organization",
                name: siteName,
                logo: { "@type": "ImageObject", url: defaultImage },
            },
            datePublished: props.article.publishedTime,
            dateModified: props.article.modifiedTime || props.article.publishedTime,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            keywords: props.article.tags?.join(', ') || '',
        })
        : null;

    // Build scripts array properly
    const scripts = [
        { type: 'application/ld+json', children: organizationSchema }
    ];

    if (articleSchema) {
        scripts.push({ type: 'application/ld+json', children: articleSchema });
    }

    useHead({
        title,
        meta: [
            { name: 'description', content: description },
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:type', content: type },
            { property: 'og:url', content: url },
            { property: 'og:image', content: image },
            { property: 'og:site_name', content: siteName },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: description },
            { name: 'twitter:image', content: image },
        ],
        link: [
            { rel: 'canonical', href: url },
        ],
        script: scripts,
    });
}

export function usePostSeo(post: Post) {
    const runtimeConfig = useRuntimeConfig();
    const baseUrl = process.env.NUXT_PUBLIC_URL || runtimeConfig.public.NUXT_PUBLIC_URL || 'http://localhost:3000';

    const postUrl = `${baseUrl}/posts/${post.slug}`;
    const publishedTime = new Date(post.createdAt).toISOString();
    const modifiedTime = publishedTime;

    useSeo({
        title: post.title,
        description: post.excerpt,
        image: post.image,
        url: postUrl,
        type: 'article',
        article: {
            publishedTime,
            modifiedTime,
            author: post.author,
            tags: post.tags,
        },
    });
}