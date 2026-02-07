import { createContext, useContext, useMemo } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { siteContent, buildSiteContent, type SiteContent } from '../content/siteContent';

// ─── Context ─────────────────────────────────────────────────

const SiteContentContext = createContext<SiteContent>(siteContent);

// ─── Provider ────────────────────────────────────────────────

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSiteSettings();

  const content = useMemo(
    () => buildSiteContent(settings),
    [settings],
  );

  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}

// ─── Consumer hook ───────────────────────────────────────────

/**
 * Returns the merged SiteContent (DB settings over hardcoded defaults).
 * Use this in landing page components instead of importing siteContent directly.
 */
export function useSiteContent(): SiteContent {
  return useContext(SiteContentContext);
}
