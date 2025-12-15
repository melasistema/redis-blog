/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { defineEventHandler, getRouterParam, readMultipartFormData } from 'h3';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export default defineEventHandler(async (event) => {
    // 1. Authentication
    if (!event.context.user || !event.context.user.roles?.includes('admin')) {
        event.node.res.statusCode = 403;
        return { success: false, message: 'Forbidden. Only administrators can upload images.' };
    }

    // 2. Get post ID from URL
    const postId = getRouterParam(event, 'id');
    if (!postId) {
        event.node.res.statusCode = 400;
        return { success: false, message: 'Post ID is required.' };
    }

    // 3. Read multipart form data
    const formData = await readMultipartFormData(event);
    if (!formData) {
        event.node.res.statusCode = 400;
        return { success: false, message: 'No form data received. Please upload a file.' };
    }

    // Assuming a single file upload with the name 'image'
    const file = formData.find(part => part.name === 'image');
    if (!file || !file.filename || !file.data) {
        event.node.res.statusCode = 400;
        return { success: false, message: 'Invalid file upload. A single file with the field name "image" is expected.' };
    }
    
    try {
        // 4. Define paths and sanitize filename
        // A simple sanitization to prevent path traversal attacks.
        const sanitizedFilename = path.basename(file.filename).replace(/[^a-zA-Z0-9.\-_]/g, '');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'posts', postId);
        const filePath = path.join(uploadDir, sanitizedFilename);
        const publicUrl = `/uploads/posts/${postId}/${sanitizedFilename}`;

        // 5. Create directory and write file
        await mkdir(uploadDir, { recursive: true });
        await writeFile(filePath, file.data);

        // 6. Return public URL
        event.node.res.statusCode = 201; // Created
        return { success: true, url: publicUrl, message: 'Image uploaded successfully.' };

    } catch (error: any) {
        console.error('Failed to upload image:', error);
        event.node.res.statusCode = 500;
        return { success: false, message: `Failed to upload image: ${error.message}` };
    }
});
