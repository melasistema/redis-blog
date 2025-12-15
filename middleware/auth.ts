/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuth } from '~/composables/useAuth';
import { watch } from 'vue';

export default defineNuxtRouteMiddleware(async (to) => {
    const { isLoggedIn, loading } = useAuth();

    // If auth state is currently loading, wait for it to complete
    if (loading.value) {
        await new Promise<void>((resolve) => {
            const unwatch = watch(loading, (newLoading) => {
                if (!newLoading) {
                    unwatch();
                    resolve();
                }
            });
        });
    }

    const isAuthenticated = isLoggedIn.value;
    const isLoginPage = to.path === '/admin/login';
    const isAdminRoute = to.path.startsWith('/admin');

    if (isAuthenticated && isLoginPage) {
        // Logged-in users should not see the login page, redirect to admin dashboard.
        return navigateTo('/admin');
    }

    if (isAdminRoute && !isLoginPage && !isAuthenticated) {
        // Unauthenticated users trying to access protected admin routes should be redirected to the login page.
        return navigateTo('/admin/login');
    }

    // Allow navigation for all other cases.
    // (e.g., public pages, or authenticated users accessing admin pages)
});