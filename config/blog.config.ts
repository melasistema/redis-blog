// config/blog.config.ts

export interface FontConfig {
    fontFamily: string;
    weights: string; // e.g., '400', '400..700'
    italic?: boolean;
}

export interface TypographyConfig {
    body: FontConfig;
    h1: FontConfig;
    h2: FontConfig;
    h3: FontConfig;
    h4: FontConfig;
}

export interface ColorConfig {
    primary: string;
    'primary-dark': string;
    secondary: string;
    'secondary-dark': string;
    text: string;
    'text-dark': string;
    background: string;
    'background-dark': string;
    error: string;
    'error-dark': string;
}

export interface PaginationConfig {
    enabled: boolean;
    postsPerPage: number;
}

export interface PostNavigationConfig {
    enabled: boolean;
}

export interface PostExcerptConfig {
    enabled: boolean;
    maxLength: number;
}

export interface FaviconConfig {
    enabled: boolean;
    path: string; // Path within the public directory
}

export interface BlogConfig {
    siteName: string;
    contactEmail: string;
    copyrightNotice: string;
    copyrightUrl: string;
    headerTitle: string;
    headerTagline: string;
    useGoogleFonts: boolean;
    typography: TypographyConfig;
    colors: ColorConfig;
    pagination: PaginationConfig;
    postNavigation: PostNavigationConfig;
    postExcerpt: PostExcerptConfig;
    contentMaxWidth: string;
    favicon: FaviconConfig;
}

export const defaultBlogConfig: BlogConfig = {
    siteName: 'Melasistema',
    contactEmail: 'info@melasistema.com',
    copyrightNotice: '© {year} {siteName}. All rights reserved.',
    copyrightUrl: 'https://github.com/melasistema',
    headerTitle: 'This is your Blog build with Nuxt and Redis',
    headerTagline: 'A powerful and elegant blog architecture inspired by <a href="https://antirez.com/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">Salvatore Sanfilippo</a>',
    useGoogleFonts: true,
    typography: {
        body: {
            fontFamily: 'Englebert',
            weights: '100..900',
            italic: true,
        },
        h1: {
            fontFamily: 'Englebert',
            weights: '700',
        },
        h2: {
            fontFamily: 'Englebert',
            weights: '600',
        },
        h3: {
            fontFamily: 'Englebert',
            weights: '500',
        },
        h4: {
            fontFamily: 'Englebert',
            weights: '400',
        },
    },
    colors: {
        primary: '#DC2626',
        'primary-dark': '#B91C1C',
        secondary: '#6c757d',
        'secondary-dark': '#5c5d60',
        text: '#212529',
        'text-dark': '#000000',
        background: '#ffffff',
        'background-dark': '#121212',
        error: '#e53e3e',
        'error-dark': '#b91c1c',
    },
    pagination: {
        enabled: true,
        postsPerPage: 2,
    },
    postNavigation: {
        enabled: true,
    },
    postExcerpt: {
        enabled: true,
        maxLength: 250,
    },
    contentMaxWidth: '1000px',
    favicon: {
        enabled: true,
        path: '/',
    },
};
