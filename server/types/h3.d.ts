/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/types/h3.d.ts

import type { User } from '~/server/utils/auth/types';

declare module 'h3' {
  interface H3EventContext {
    user?: User; // Optional user object for authenticated requests
  }
}
