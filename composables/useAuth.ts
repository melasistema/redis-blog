/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// composables/useAuth.ts

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { User, UserRole } from '~/server/utils/auth/types';
import type { AuthApiResponse } from '~/server/types/api.d'; // Import AuthApiResponse

const user = ref<User | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

export function useAuth() {
    const router = useRouter();

    const isLoggedIn = computed(() => !!user.value);
    const isAdmin = computed(() => user.value?.roles.includes('admin') || false);

    async function fetchUser() {
        if (user.value || loading.value) return; // Already fetched or fetching

        loading.value = true;
        error.value = null;
        try {
            const headers: HeadersInit = {};
            if (process.server) {
                const event = useRequestEvent();
                const cookieHeader = event?.node.req.headers.cookie;
                if (cookieHeader) {
                    headers.cookie = cookieHeader;
                }
            }

            const response = await $fetch<AuthApiResponse>('/api/auth/me', {
                method: 'GET',
                headers: headers, // Pass headers here
            });
            if (response.success) { // response.user is guaranteed to exist if success is true due to AuthApiResponse type
                user.value = response.user as User;
            } else {
                user.value = null;
            }
        } catch (e: any) {
            user.value = null;
            error.value = e.data?.message || e.message || 'Failed to fetch user.';
        } finally {
            loading.value = false;
        }
    }

    async function login(usernameInput: string, passwordInput: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await $fetch<AuthApiResponse>('/api/auth/login', {
                method: 'POST',
                body: { username: usernameInput, password: passwordInput },
            });

            if (response.success) { // response.user is guaranteed to exist if success is true due to AuthApiResponse type
                user.value = response.user as User;
                router.push('/admin'); // Redirect to admin dashboard
                return { success: true, message: response.message };
            } else {
                error.value = response.message || 'Login failed.';
                return { success: false, message: response.message };
            }
        } catch (e: any) {
            error.value = e.data?.message || e.message || 'An unexpected error occurred during login.';
            return { success: false, message: error.value };
        } finally {
            loading.value = false;
        }
    }

    async function logout() {
        loading.value = true;
        error.value = null;
        try {
            await $fetch('/api/auth/logout', { method: 'POST' });
            user.value = null;
            router.push('/admin/login'); // Redirect to login page
        } catch (e: any) {
            error.value = e.data?.message || e.message || 'An unexpected error occurred during logout.';
        } finally {
            loading.value = false;
        }
    }





    return {
        user,
        isLoggedIn,
        isAdmin,
        loading,
        error,
        login,
        logout,
        fetchUser,
    };
}
