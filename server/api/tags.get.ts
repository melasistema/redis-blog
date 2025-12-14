/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/api/tags.get.ts
import { defineEventHandler } from 'h3';
import { TagRepository } from '~/server/repositories/TagRepository';

export default defineEventHandler(async () => {
  const tags = await TagRepository.all();
  return { success: true, tags };
});
