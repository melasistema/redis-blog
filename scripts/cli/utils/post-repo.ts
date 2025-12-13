// scripts/cli/utils/post-repo.ts
import { getRedisClient } from './redis-client';
import { PostRepository } from '~/server/repositories/PostRepository';

export const PostRepoCLI = new PostRepository(getRedisClient);
