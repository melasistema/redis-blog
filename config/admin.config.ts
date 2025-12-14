/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// config/admin.config.ts

export interface AdminPaginationConfig {
    enabled: boolean;
    postsPerPage: number;
}

export interface AdminConfig {
    pagination: AdminPaginationConfig;
    // Add other admin-specific configurations here
}

export const defaultAdminConfig: AdminConfig = {
    pagination: {
        enabled: true,
        postsPerPage: 3, // Display 20 posts per page in the admin view
    },
};
