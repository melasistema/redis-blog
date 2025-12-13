/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// scripts/cli/utils/post-service.ts

import type { Post, NeighborPost } from '~/server/repositories/PostRepository';
import { PostRepoCLI } from './post-repo';

export type PostListItem = {
    key: string;
    title: string;
    slug: string;
    tags: string[];
    createdAt: number;
};

export class PostService {
    async listPosts(): Promise<PostListItem[]> {
        const posts = await PostRepoCLI.getLatest(1000);
        return posts.map(post => ({
            key: `post:${post.slug}`,
            title: post.title,
            slug: post.slug,
            tags: post.tags || [],
            createdAt: post.createdAt,
        }));
    }

    async deletePost(post: PostListItem) {
        return PostRepoCLI.deletePost(post);
    }

    async createPost(postData: Pick<Post, 'title' | 'content' | 'excerpt' | 'image' | 'author' | 'tags' | 'createdAt'>): Promise<Post> {
        return PostRepoCLI.createPost(postData);
    }

    async getPost(slug: string): Promise<Post | null> {
        return PostRepoCLI.getBySlug(slug);
    }

    async updatePost(slug: string, updatedPost: Post): Promise<Post> {
        return PostRepoCLI.updatePost(slug, updatedPost);
    }

    async searchPosts(query: string): Promise<PostListItem[]> {
        const { posts } = await PostRepoCLI.searchPosts(query);
        return posts.map(post => ({
            key: `post:${post.slug}`,
            title: post.title,
            slug: post.slug,
            tags: post.tags || [],
            createdAt: post.createdAt,
        }));
    }

    async ensureSearchIndex(): Promise<void> {
        return PostRepoCLI.ensureSearchIndex();
    }
}
