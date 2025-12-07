// scripts/cli/utils/post-service.ts
import { createClient } from 'redis';
import { getRedisClient } from './redis-client';
import { slugify } from './slugify';
import chalk from 'chalk';

// A Post is the canonical representation of a blog entry.
export type Post = {
    id: string;
    title: string;
    slug: string;
    content?: string;
    author: string;
    tags?: string[];
    createdAt: string;
    published: boolean;
};

// A PostListItem is a lightweight representation of a Post, suitable for
// summaries or lists where the full content is not required. It includes the
// Redis key for direct lookups.
export type PostListItem = {
    key: string; // e.g., 'post:1a2b3c'
    title: string;
    slug: string;
    tags: string[];
};

// PostService is the main interface for interacting with post-related data in
// Redis. It encapsulates all the commands and logic required to manage the
// different data structures that represent the blog's state.
export class PostService {
    private redis: ReturnType<typeof createClient>;

    constructor() {
        this.redis = getRedisClient();
    }

    async connect() {
        this.redis.on('error', (err) => console.error(chalk.red('Redis Client Error'), err));
        if (!this.redis.isOpen) {
            await this.redis.connect();
        }
    }

    async disconnect() {
        if (this.redis.isOpen) {
            await this.redis.disconnect();
        }
    }

    // listPosts retrieves all posts, ordered from newest to oldest.
    // It uses the `posts:by_date` sorted set as an index to find all post keys.
    // To avoid fetching each post one by one (N+1 problem), it then uses
    // JSON.MGET to bulk-fetch only the necessary fields for a list view.
    async listPosts(): Promise<PostListItem[]> {
        const keys = await this.redis.zRange('posts:by_date', 0, -1, { REV: true });
        if (!keys.length) {
            return [];
        }

        console.log(chalk.gray(`Found ${keys.length} post keys. Fetching details...`));
        const postsData = await this.redis.json.mGet(keys, '$');

        // The response from JSON.MGET is an array of arrays, where each inner
        // array contains the result for a given key. We need to unwrap this
        // structure and handle cases where a key might exist in the index but
        // its corresponding JSON document has been deleted.
        const postListItems = postsData
            .map((data, index) => {
                if (!data || !Array.isArray(data) || !data[0]) {
                    console.log(chalk.yellow(`Warning: No valid JSON data found for key ${keys[index]}. Skipping.`));
                    return null;
                }
                const post = data[0] as Post;

                return {
                    key: keys[index],
                    title: post?.title ?? 'Untitled Post',
                    slug: post?.slug ?? '',
                    tags: post?.tags ?? [],
                };
            })
            .filter((item): item is PostListItem => item !== null); 

        return postListItems;
    }

    // deletePost removes a post from all the data structures it's part of.
    // This is performed atomically using a MULTI/EXEC transaction to prevent
    // partial deletions, which could lead to orphaned data (e.g., a post
    // appearing in a tag list but not being readable).
    async deletePost(post: PostListItem) {
        const multi = this.redis.multi();

        // A single post is represented across multiple data structures:
        // 1. The main JSON document (`post:<id>`).
        // 2. The sorted set for chronological ordering (`posts:by_date`).
        // 3. The hash for slug-to-key lookups (`slugs`).
        // 4. A set for each tag (`tag:<tagname>`).
        // All must be cleaned up.
        multi.json.del(post.key, '$');
        multi.zRem('posts:by_date', post.key);
        multi.hDel('slugs', post.slug);

        if (post.tags?.length) {
            for (const tag of post.tags) {
                multi.sRem(`tag:${slugify(tag)}`, post.key);
            }
        }
        
        console.log(chalk.gray(`Preparing Redis transaction to delete post: "${post.title}" (Key: ${post.key})`));

        await multi.exec();
        await this.redis.save(); // Best-effort save, might not be needed with AOF.
    }

    // createPost adds a new post to the database. Like deletePost, it uses a
    // MULTI/EXEC transaction to ensure that all the different data
    // structures are updated atomically. This prevents a state where a post
    // is created but not indexed, making it undiscoverable.
    async createPost(postData: Pick<Post, 'title' | 'content' | 'author' | 'tags'>): Promise<Post> {
        const { title, content, author, tags } = postData;

        const id = Math.random().toString(36).substring(2, 12);
        const slug = slugify(title);
        const createdAt = new Date().toISOString();
        const postKey = `post:${id}`;
        const createdAtTimestamp = new Date(createdAt).getTime();

        const post: Post = {
            id,
            slug,
            title,
            content,
            author,
            tags,
            createdAt,
            published: true, // New posts are published by default.
        };

        const multi = this.redis.multi();
        multi.json.set(postKey, '$', post as any);
        multi.zAdd('posts:by_date', { score: createdAtTimestamp, value: postKey });
        multi.hSet('slugs', slug, postKey);

        if (tags?.length) {
            for (const tag of tags) {
                const cleanTag = tag.trim();
                if (cleanTag) {
                    multi.sAdd('tags:all', cleanTag);
                    multi.sAdd(`tag:${slugify(cleanTag)}`, postKey);
                }
            }
        }

        await multi.exec();
        console.log(chalk.gray(`Redis transaction executed for new post: "${post.title}"`));
        
        await this.redis.save(); // Best-effort save.
        return post;
    }
}
