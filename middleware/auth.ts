import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuth } from '~/composables/useAuth';
import { watch } from 'vue';

export default defineNuxtRouteMiddleware(async (to, from) => {
    const { isLoggedIn, loading, user } = useAuth(); // Also destructure user for logging

    console.log(`[Auth Middleware] Navigating to: ${to.path}`);
    console.log(`[Auth Middleware] Initial isLoggedIn: ${isLoggedIn.value}, User: ${user.value ? user.value.username : 'null'}`);
    console.log(`[Auth Middleware] Initial loading: ${loading.value}`);

    // If auth state is currently loading, wait for it to complete
    if (loading.value) {
        console.log('[Auth Middleware] Waiting for loading to complete...');
        await new Promise<void>((resolve) => {
            const unwatch = watch(loading, (newLoading) => {
                if (!newLoading) {
                    unwatch();
                    resolve();
                }
            });
        });
        console.log(`[Auth Middleware] Loading complete. Final isLoggedIn: ${isLoggedIn.value}, User: ${user.value ? user.value.username : 'null'}`);
    }

    // If logged in and trying to access the login page, redirect to admin dashboard
    if (to.path === '/admin/login' && isLoggedIn.value) {
        console.log('[Auth Middleware] Logged in, attempting redirect from login page to /admin');
        return navigateTo('/admin');
    }

    // If attempting to access an admin path other than login
    if (to.path.startsWith('/admin')) { // Simplified to catch all admin paths first
        console.log(`[Auth Middleware] Admin path detected: ${to.path}`);
        if (to.path !== '/admin/login') { // Further check if it's not the login page
            console.log(`[Auth Middleware] Not login page: ${to.path}`);
            if (!isLoggedIn.value) {
                console.log('[Auth Middleware] Not logged in, redirecting from admin path to /admin/login');
                // User is not logged in, redirect to login page
                return navigateTo('/admin/login');
            } else {
                console.log('[Auth Middleware] Logged in, proceeding to admin route.');
            }
        } else {
            console.log('[Auth Middleware] Is login page, and not logged in (handled by first if) or logged in (handled by first if).');
        }
    } else {
        console.log('[Auth Middleware] Not an admin route, proceeding.');
    }
});
