// config/blog.config.ts
export interface BlogConfig {
  siteName: string;
  contactEmail: string;
  useGoogleFonts: boolean;
  googleFontToUse: string;
  // Add any other blog-specific configurations here
}

export const defaultBlogConfig: BlogConfig = {
  siteName: 'Melasistema',
  contactEmail: 'info@melasistema.com',
  useGoogleFonts: true,
  googleFontToUse: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap', // Example: 'Roboto:wght@400;700&display=swap'
};
