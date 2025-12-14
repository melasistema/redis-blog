/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// plugins/auth.ts
import { useAuth } from '~/composables/useAuth';

export default defineNuxtPlugin(async (nuxtApp) => {
    const { fetchUser, user } = useAuth(); // Destructure user to check its value

    // Only fetch user if not already populated by SSR
    // This ensures that on client-side navigation, if user is null, it fetches.
    // On initial SSR, if a user is logged in, `user.value` should be populated.
    if (!user.value) {
        await fetchUser();
    }
});
