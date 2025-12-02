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
    secondary: string;
    text: string;
    background: string;
}

export interface PaginationConfig {
    enabled: boolean;
    postsPerPage: number;
}

export interface BlogConfig {
    siteName: string;
    contactEmail: string;
    copyrightNotice: string;
    copyrightUrl: string;
    useGoogleFonts: boolean;
    typography: TypographyConfig;
    colors: ColorConfig;
    pagination: PaginationConfig;
}

export const defaultBlogConfig: BlogConfig = {
    siteName: 'Melasistema',
    contactEmail: 'info@melasistema.com',
    copyrightNotice: '© 2025 Melasistema. All rights reserved.',
    copyrightUrl: 'https://github.com/melasistema',
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
        primary: '#007bff',
        secondary: '#6c757d',
        text: '#212529',
        background: '#ffffff',
    },
    pagination: {
        enabled: true,
        postsPerPage: 2,
    },
};
