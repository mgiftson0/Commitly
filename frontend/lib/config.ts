/**
 * Frontend Feature Configuration
 *
 * This file controls which features are enabled in your Commitly app.
 * Update these settings to enable/disable features without modifying code.
 */

export const config = {
  /**
   * Authentication Configuration
   */
  auth: {
    /**
     * Google OAuth
     *
     * Set to TRUE once you've configured Google OAuth in Supabase:
     * 1. Go to Supabase Dashboard → Authentication → Providers → Google
     * 2. Enable Google provider
     * 3. Add Client ID and Client Secret from Google Cloud Console
     * 4. Save settings
     * 5. Change this to true
     *
     * @default false
     */
    enableGoogleOAuth: false,

    /**
     * Email Confirmation Required
     *
     * When true, shows message about email confirmation requirement.
     * Reflects your Supabase email confirmation setting.
     *
     * @default true
     */
    requireEmailConfirmation: true,
  },

  /**
   * Feature Flags
   *
   * Control which features are visible/enabled in the app
   */
  features: {
    /**
     * Show achievements system
     * @default true
     */
    enableAchievements: true,

    /**
     * Show notifications
     * @default true
     */
    enableNotifications: true,

    /**
     * Show social features (partners, search)
     * @default true
     */
    enableSocial: true,

    /**
     * Show profile customization
     * @default true
     */
    enableProfileCustomization: true,
  },

  /**
   * App Configuration
   */
  app: {
    /**
     * App name (used in titles, headers)
     */
    name: 'Commitly',

    /**
     * Support email
     */
    supportEmail: 'support@commitly.com',

    /**
     * Enable analytics (Google Analytics, etc.)
     * @default false
     */
    enableAnalytics: false,

    /**
     * Enable error tracking (Sentry, etc.)
     * @default false
     */
    enableErrorTracking: false,
  },

  /**
   * Development Configuration
   */
  dev: {
    /**
     * Show debug information in console
     * @default false in production
     */
    enableDebugLogs: process.env.NODE_ENV === 'development',

    /**
     * Enable test features
     * @default false
     */
    enableTestFeatures: false,
  },
};

/**
 * Helper function to check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature];
};

/**
 * Helper function to check if Google OAuth is enabled
 */
export const isGoogleOAuthEnabled = (): boolean => {
  return config.auth.enableGoogleOAuth;
};

// Export individual configs for easier imports
export const authConfig = config.auth;
export const featureConfig = config.features;
export const appConfig = config.app;
export const devConfig = config.dev;

// Default export
export default config;
