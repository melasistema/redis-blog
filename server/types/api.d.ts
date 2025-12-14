/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/types/api.d.ts

import type { User } from '~/server/utils/auth/types';

// Generic success response for API calls that return a message
export interface ApiResponseSuccess {
  success: true;
  message?: string;
}

// Generic error response for API calls that return a message
export interface ApiResponseError {
  success: false;
  message: string;
}

// Specific success response for auth endpoints that return user data
export interface AuthApiResponseSuccess extends ApiResponseSuccess {
  user: Partial<User>;
}

// Union type for authentication API responses
export type AuthApiResponse = AuthApiResponseSuccess | ApiResponseError;

// Union type for any API response (can be extended)
export type ApiResponse = ApiResponseSuccess | ApiResponseError;
