import { useState, useEffect, useRef, useCallback } from 'react';
import { HiOutlineSparkles, HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { siteContent } from '../content/siteContent';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: HiOutlineSparkles,
  location: HiOutlineLocationMarker,
  whatsapp: FaWhatsapp,
};

interface NavbarProps {
  activeSection: string;
}

export default function Navbar({ activeSection }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    menuToggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, closeMobileMenu]);

  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      const firstLink = mobileMenuRef.current.querySelector('a');
      firstLink?.focus();
    }
  }, [isMobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const { nav, brand } = siteContent;

  return (
    <nav
      aria-label="Sitio principal"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-primary/95 backdrop-blur-sm py-3 shadow-lg shadow-black/20'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <a
            href="#inicio"
            onClick={(e) => handleNavClick(e, '#inicio')}
            className="font-serif text-xl text-text-primary hover:text-accent transition-colors"
          >
            {brand.name} <span className="italic text-accent">{brand.accent}</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {nav.links.map((link) => {
              const Icon = iconMap[link.icon];
              const isActive = activeSection === link.href.replace('#', '');
              const isWhatsApp = 'isWhatsApp' in link && link.isWhatsApp;
              const isExternal = link.href.startsWith('http');

              if (isWhatsApp) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.label} (abre en nueva ventana)`}
                    className="flex items-center gap-2 text-sm font-sans px-4 py-2 rounded-md bg-[#25D366] text-white hover:bg-[#128C7E] transition-colors"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {link.label}
                  </a>
                );
              }

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={isExternal ? undefined : (e) => handleNavClick(e, link.href)}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 text-sm font-sans transition-colors ${
                    isActive
                      ? 'text-accent'
                      : 'text-text-primary hover:text-accent'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <a
              href={nav.cta.href}
              onClick={(e) => handleNavClick(e, nav.cta.href)}
              className="btn-cta text-xs py-2 px-4"
            >
              <HiOutlineCalendar className="w-4 h-4" />
              {nav.cta.label}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuToggleRef}
            className="lg:hidden text-text-primary hover:text-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <HiOutlineX className="w-6 h-6" />
            ) : (
              <HiOutlineMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          role="navigation"
          aria-label="Menú principal"
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-96 mt-4' : 'max-h-0'
          }`}
        >
          <div className="py-4 space-y-4 border-t border-border">
            {nav.links.map((link) => {
              const Icon = iconMap[link.icon];
              const isActive = activeSection === link.href.replace('#', '');
              const isWhatsApp = 'isWhatsApp' in link && link.isWhatsApp;
              const isExternal = link.href.startsWith('http');

              if (isWhatsApp) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.label} (abre en nueva ventana)`}
                    className="flex items-center justify-center gap-2 text-sm font-sans px-4 py-2 rounded-md bg-[#25D366] text-white hover:bg-[#128C7E] transition-colors"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {link.label}
                  </a>
                );
              }

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={isExternal ? undefined : (e) => handleNavClick(e, link.href)}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 text-sm font-sans transition-colors ${
                    isActive
                      ? 'text-accent'
                      : 'text-text-primary hover:text-accent'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </a>
              );
            })}
            <a
              href={nav.cta.href}
              onClick={(e) => handleNavClick(e, nav.cta.href)}
              className="btn-cta text-xs py-2 px-4 w-full"
            >
              <HiOutlineCalendar className="w-4 h-4" />
              {nav.cta.label}
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
