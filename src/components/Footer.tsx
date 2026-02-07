import { useSiteContent } from '../context/SiteSettingsContext';

export default function Footer() {
  const { brand, footer } = useSiteContent();

  return (
    <footer className="py-8 bg-primary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="font-serif text-lg text-text-primary">
            {brand.name} <span className="italic text-accent">{brand.accent}</span>
          </div>

          {/* Copyright */}
          <p className="text-text-secondary text-sm">{footer.copyright}</p>

          {/* Decorative Element */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-accent/50" />
            <span className="text-accent text-xs">&#9671;</span>
            <span className="w-8 h-px bg-accent/50" />
          </div>
        </div>

        {/* Powered by */}
        <div className="text-center mt-4">
          <p className="text-text-muted text-xs">
            Powered by{' '}
            <a
              href="https://gravitylabs.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-accent transition-colors"
            >
              GravityLabs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
