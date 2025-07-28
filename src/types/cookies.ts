export interface CookieSettings {
  essential: boolean;
  performance: boolean;
  functional: boolean;
  marketing: boolean;
  social: boolean;
}

declare global {
  interface Window {
    googleAnalyticsLoaded: boolean;
  }
}
