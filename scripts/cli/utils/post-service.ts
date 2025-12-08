// scripts/cli/utils/post-service.ts
import chalk from 'chalk';
import { slugify } from './slugify';
import { getRedisClient } from './redis-client'; // Only needed for deletePost (temporary)

// Import types and the CLI repository from the dedicated CLI repository file
import type { Post, NeighborPost } from './PostRepositoryCLI';
import { PostRepositoryCLI } from './PostRepositoryCLI'; // Import the actual repository object

// Re-export Post and NeighborPost for convenience if other CLI files need them
export type { Post, NeighborPost };

export type PostListItem = {
    key: string; // e.g., 'post:<slug>'
    title: string;
    slug: string;
    tags: string[];
    createdAt: number; // Use number for timestamp consistency
};


export class PostService {
    // PostService now delegates all data access to PostRepositoryCLI

    async listPosts(): Promise<PostListItem[]> {
        const posts = await PostRepositoryCLI.getLatest(1000); // Delegate
        return posts.map(post => ({
            key: `post:${post.slug}`,
            title: post.title,
            slug: post.slug,
            tags: post.tags || [],
            createdAt: post.createdAt,
        }));
    }

    async deletePost(post: PostListItem) {
        return PostRepositoryCLI.deletePost(post); // Delegate to PostRepositoryCLI
    }

    async createPost(postData: Pick<Post, 'title' | 'content' | 'excerpt' | 'image' | 'author' | 'tags' | 'createdAt'>): Promise<Post> {
        return PostRepositoryCLI.createPost(postData); // Delegate
    }

    async getPost(slug: string): Promise<Post | null> {
        return PostRepositoryCLI.getBySlug(slug); // Delegate
    }

    async updatePost(slug: string, updatedPost: Post): Promise<Post> {
        return PostRepositoryCLI.updatePost(slug, updatedPost); // Delegate
    }

    async searchPosts(query: string): Promise<PostListItem[]> {
        const { posts } = await PostRepositoryCLI.searchPosts(query); // Delegate
        return posts.map(post => ({
            key: `post:${post.slug}`,
            title: post.title,
            slug: post.slug,
            tags: post.tags || [],
            createdAt: post.createdAt,
        }));
    }

    async ensureSearchIndex(): Promise<void> {
        return PostRepositoryCLI.ensureSearchIndex(); // Delegate
    }
}