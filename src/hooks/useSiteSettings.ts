import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ───────────────────────────────────────────────────

export interface SiteSettingsBrand {
  name: string;
  accent: string;
  tagline: string;
  subtitle: string;
  motto: string;
}

export interface SiteSettingsAboutParagraph {
  text: string;
  highlight: string | null;
}

export interface SiteSettingsAbout {
  paragraphs: SiteSettingsAboutParagraph[];
}

export interface SiteSettingsContact {
  phone: string;
  whatsapp: string;
  email: string;
  address_line1: string;
  address_line2: string;
  business_hours: string;
}

export interface SiteSettingsSocial {
  handle: string;
  instagram: string;
  facebook: string;
  tiktok: string;
}

export interface SiteSettingsFooter {
  copyright: string;
}

export interface SiteSettingsBank {
  bank_name: string;
  account_type: string;
  account_number: string;
  account_holder: string;
  notes: string;
}

export interface SiteSettings {
  brand: SiteSettingsBrand;
  about: SiteSettingsAbout;
  contact: SiteSettingsContact;
  social: SiteSettingsSocial;
  footer: SiteSettingsFooter;
  bank: SiteSettingsBank;
}

interface UseSiteSettingsResult {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  updateSetting: (key: keyof SiteSettings, value: Record<string, unknown>) => Promise<void>;
}

// ─── Hook ────────────────────────────────────────────────────

export function useSiteSettings(): UseSiteSettingsResult {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('site_settings')
      .select('key, value');

    if (fetchError) {
      setError(fetchError.message);
      setSettings(null);
    } else if (data) {
      // Transform array of { key, value } into a typed SiteSettings object
      const mapped: Record<string, unknown> = {};
      for (const row of data) {
        mapped[row.key] = row.value;
      }

      setSettings({
        brand: (mapped.brand as SiteSettingsBrand) ?? null,
        about: (mapped.about as SiteSettingsAbout) ?? null,
        contact: (mapped.contact as SiteSettingsContact) ?? null,
        social: (mapped.social as SiteSettingsSocial) ?? null,
        footer: (mapped.footer as SiteSettingsFooter) ?? null,
        bank: (mapped.bank as SiteSettingsBank) ?? null,
      } as SiteSettings);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(
    async (key: keyof SiteSettings, value: Record<string, unknown>) => {
      const { error: upsertError } = await supabase
        .from('site_settings')
        .upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: 'key' },
        );

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      // Update local state
      setSettings((prev) =>
        prev ? { ...prev, [key]: value } : prev,
      );
    },
    [],
  );

  return { settings, loading, error, updateSetting };
}
