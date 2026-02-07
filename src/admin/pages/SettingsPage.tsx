import { useState, useEffect } from 'react';
import {
  HiOutlineTag,
  HiOutlineInformationCircle,
  HiOutlinePhone,
  HiOutlineGlobeAlt,
  HiOutlineDocumentText,
  HiOutlineCheck,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineLibrary,
} from 'react-icons/hi';
import { useSiteSettings, type SiteSettings } from '../../hooks/useSiteSettings';

// ─── Section wrapper ─────────────────────────────────────────

interface SettingsSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  onSave: () => Promise<void>;
  saving: boolean;
  saved: boolean;
  error: string | null;
}

function SettingsSection({
  icon: Icon,
  title,
  children,
  onSave,
  saving,
  saved,
  error,
}: SettingsSectionProps) {
  return (
    <div className="bg-primary-light border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-accent" />
          <h2 className="font-serif text-xl text-text-primary">{title}</h2>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-xs rounded-md border border-accent/30 text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
        >
          {saving ? (
            'Guardando...'
          ) : saved ? (
            <>
              <HiOutlineCheck className="w-3.5 h-3.5" />
              Guardado
            </>
          ) : (
            'Guardar'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {children}
    </div>
  );
}

// ─── Input helpers ───────────────────────────────────────────

const inputClass =
  'w-full px-3 py-2 bg-primary-dark border border-border rounded-md text-sm text-text-primary font-sans focus:outline-none focus:border-accent';

const labelClass = 'block text-xs text-text-muted uppercase tracking-wide mb-1';

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

function Field({ label, value, onChange, placeholder, multiline, rows = 3 }: FieldProps) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}

// ─── Hook for section save state ─────────────────────────────

function useSectionSave(
  updateSetting: (key: keyof SiteSettings, value: Record<string, unknown>) => Promise<void>,
  key: keyof SiteSettings,
) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (value: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await updateSetting(key, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return { saving, saved, error, save };
}

// ─── Main page ───────────────────────────────────────────────

export default function SettingsPage() {
  const { settings, loading, error: loadError, updateSetting } = useSiteSettings();

  // ── Brand state
  const [brandName, setBrandName] = useState('');
  const [brandAccent, setBrandAccent] = useState('');
  const [brandTagline, setBrandTagline] = useState('');
  const [brandSubtitle, setBrandSubtitle] = useState('');
  const [brandMotto, setBrandMotto] = useState('');
  const brandSave = useSectionSave(updateSetting, 'brand');

  // ── About state
  const [paragraphs, setParagraphs] = useState<{ text: string; highlight: string | null }[]>([]);
  const aboutSave = useSectionSave(updateSetting, 'about');

  // ── Contact state
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const contactSave = useSectionSave(updateSetting, 'contact');

  // ── Social state
  const [socialHandle, setSocialHandle] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const socialSave = useSectionSave(updateSetting, 'social');

  // ── Footer state
  const [copyright, setCopyright] = useState('');
  const footerSave = useSectionSave(updateSetting, 'footer');

  // ── Bank state
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankNotes, setBankNotes] = useState('');
  const bankSave = useSectionSave(updateSetting, 'bank');

  // ── Populate from settings
  useEffect(() => {
    if (!settings) return;

    setBrandName(settings.brand.name);
    setBrandAccent(settings.brand.accent);
    setBrandTagline(settings.brand.tagline);
    setBrandSubtitle(settings.brand.subtitle);
    setBrandMotto(settings.brand.motto);

    setParagraphs(settings.about.paragraphs);

    setPhone(settings.contact.phone);
    setWhatsapp(settings.contact.whatsapp);
    setEmail(settings.contact.email);
    setAddressLine1(settings.contact.address_line1);
    setAddressLine2(settings.contact.address_line2);
    setBusinessHours(settings.contact.business_hours);

    setSocialHandle(settings.social.handle);
    setInstagram(settings.social.instagram);
    setFacebook(settings.social.facebook);
    setTiktok(settings.social.tiktok);

    setCopyright(settings.footer.copyright);

    if (settings.bank) {
      setBankName(settings.bank.bank_name);
      setAccountType(settings.bank.account_type);
      setAccountNumber(settings.bank.account_number);
      setAccountHolder(settings.bank.account_holder);
      setBankNotes(settings.bank.notes);
    }
  }, [settings]);

  // ── Paragraph helpers
  const addParagraph = () => {
    setParagraphs((prev) => [...prev, { text: '', highlight: null }]);
  };

  const removeParagraph = (index: number) => {
    setParagraphs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateParagraphText = (index: number, text: string) => {
    setParagraphs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, text } : p)),
    );
  };

  const updateParagraphHighlight = (index: number, highlight: string) => {
    setParagraphs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, highlight: highlight || null } : p)),
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-text-secondary animate-pulse">Cargando configuracion...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8">
        <p className="text-red-400">Error: {loadError}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <h1 className="font-serif text-3xl text-text-primary mb-8">Configuracion</h1>

      <div className="space-y-6">
        {/* ─── Brand ─────────────────────────────────────── */}
        <SettingsSection
          icon={HiOutlineTag}
          title="Marca"
          onSave={() =>
            brandSave.save({
              name: brandName,
              accent: brandAccent,
              tagline: brandTagline,
              subtitle: brandSubtitle,
              motto: brandMotto,
            })
          }
          saving={brandSave.saving}
          saved={brandSave.saved}
          error={brandSave.error}
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre" value={brandName} onChange={setBrandName} placeholder="L'Femme" />
            <Field label="Acento" value={brandAccent} onChange={setBrandAccent} placeholder="Eleganza" />
          </div>
          <div className="mt-4 space-y-4">
            <Field label="Tagline" value={brandTagline} onChange={setBrandTagline} />
            <Field label="Subtitulo" value={brandSubtitle} onChange={setBrandSubtitle} />
            <Field label="Motto" value={brandMotto} onChange={setBrandMotto} multiline rows={2} />
          </div>
        </SettingsSection>

        {/* ─── About ─────────────────────────────────────── */}
        <SettingsSection
          icon={HiOutlineInformationCircle}
          title="Sobre Nosotros"
          onSave={() => aboutSave.save({ paragraphs })}
          saving={aboutSave.saving}
          saved={aboutSave.saved}
          error={aboutSave.error}
        >
          <div className="space-y-4">
            {paragraphs.map((p, index) => (
              <div key={index} className="bg-primary-dark border border-border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-muted uppercase tracking-wide">
                    Parrafo {index + 1}
                  </span>
                  {paragraphs.length > 1 && (
                    <button
                      onClick={() => removeParagraph(index)}
                      className="p-1 text-text-muted hover:text-red-400 transition-colors"
                      title="Eliminar parrafo"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <textarea
                  value={p.text}
                  onChange={(e) => updateParagraphText(index, e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none mb-3`}
                  placeholder="Texto del parrafo..."
                />
                <Field
                  label="Palabra resaltada (opcional)"
                  value={p.highlight ?? ''}
                  onChange={(val) => updateParagraphHighlight(index, val)}
                  placeholder="Ej: L'Femme Eleganza"
                />
              </div>
            ))}
            <button
              onClick={addParagraph}
              className="flex items-center gap-2 px-3 py-2 text-xs text-text-secondary border border-border rounded-md hover:border-accent/50 hover:text-accent transition-colors"
            >
              <HiOutlinePlus className="w-3.5 h-3.5" />
              Agregar parrafo
            </button>
          </div>
        </SettingsSection>

        {/* ─── Contact ───────────────────────────────────── */}
        <SettingsSection
          icon={HiOutlinePhone}
          title="Contacto"
          onSave={() =>
            contactSave.save({
              phone,
              whatsapp,
              email,
              address_line1: addressLine1,
              address_line2: addressLine2,
              business_hours: businessHours,
            })
          }
          saving={contactSave.saving}
          saved={contactSave.saved}
          error={contactSave.error}
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefono" value={phone} onChange={setPhone} placeholder="+502 2345-6789" />
            <Field
              label="WhatsApp (solo digitos)"
              value={whatsapp}
              onChange={setWhatsapp}
              placeholder="50223456789"
            />
          </div>
          <div className="mt-4 space-y-4">
            <Field label="Correo electronico" value={email} onChange={setEmail} placeholder="info@ejemplo.com" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Direccion linea 1" value={addressLine1} onChange={setAddressLine1} placeholder="Zona 10, Ciudad de Guatemala" />
              <Field label="Direccion linea 2" value={addressLine2} onChange={setAddressLine2} placeholder="Centro Comercial, Local 205" />
            </div>
            <Field
              label="Horario de atencion"
              value={businessHours}
              onChange={setBusinessHours}
              multiline
              rows={3}
              placeholder="Lunes a Sabado: 9:00 - 19:00&#10;Domingo: Cerrado"
            />
          </div>
        </SettingsSection>

        {/* ─── Social ────────────────────────────────────── */}
        <SettingsSection
          icon={HiOutlineGlobeAlt}
          title="Redes Sociales"
          onSave={() =>
            socialSave.save({
              handle: socialHandle,
              instagram,
              facebook,
              tiktok,
            })
          }
          saving={socialSave.saving}
          saved={socialSave.saved}
          error={socialSave.error}
        >
          <div className="space-y-4">
            <Field label="Handle" value={socialHandle} onChange={setSocialHandle} placeholder="@lfemme.eleganza" />
            <Field label="Instagram URL" value={instagram} onChange={setInstagram} placeholder="https://instagram.com/..." />
            <Field label="Facebook URL" value={facebook} onChange={setFacebook} placeholder="https://facebook.com/..." />
            <Field label="TikTok URL" value={tiktok} onChange={setTiktok} placeholder="https://tiktok.com/@..." />
          </div>
        </SettingsSection>

        {/* ─── Bank ──────────────────────────────────────── */}
        <SettingsSection
          icon={HiOutlineLibrary}
          title="Datos Bancarios"
          onSave={() =>
            bankSave.save({
              bank_name: bankName,
              account_type: accountType,
              account_number: accountNumber,
              account_holder: accountHolder,
              notes: bankNotes,
            })
          }
          saving={bankSave.saving}
          saved={bankSave.saved}
          error={bankSave.error}
        >
          <div className="space-y-4">
            <Field label="Nombre del banco" value={bankName} onChange={setBankName} placeholder="Banrural, BI, BAM..." />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo de cuenta" value={accountType} onChange={setAccountType} placeholder="Monetaria, Ahorro..." />
              <Field label="Numero de cuenta" value={accountNumber} onChange={setAccountNumber} placeholder="XXXX-XXXX-XX" />
            </div>
            <Field label="Titular de la cuenta" value={accountHolder} onChange={setAccountHolder} placeholder="Nombre completo del titular" />
            <Field label="Notas adicionales" value={bankNotes} onChange={setBankNotes} multiline rows={2} placeholder="Ej: Enviar comprobante por WhatsApp" />
          </div>
        </SettingsSection>

        {/* ─── Footer ────────────────────────────────────── */}
        <SettingsSection
          icon={HiOutlineDocumentText}
          title="Pie de Pagina"
          onSave={() => footerSave.save({ copyright })}
          saving={footerSave.saving}
          saved={footerSave.saved}
          error={footerSave.error}
        >
          <Field
            label="Texto de copyright"
            value={copyright}
            onChange={setCopyright}
            placeholder="(c) 2025 L'Femme Eleganza..."
          />
        </SettingsSection>
      </div>
    </div>
  );
}
