import { useState, useEffect } from 'react';
import { HiOutlineSparkles, HiOutlineLocationMarker, HiOutlineChatAlt2, HiOutlineCalendar, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { siteContent } from '../content/siteContent';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: HiOutlineSparkles,
  location: HiOutlineLocationMarker,
  message: HiOutlineChatAlt2,
};

interface NavbarProps {
  activeSection: string;
}

export default function Navbar({ activeSection }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
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
              className="btn-outline text-xs py-2 px-4"
            >
              <HiOutlineCalendar className="w-4 h-4" />
              {nav.cta.label}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-text-primary hover:text-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
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
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-96 mt-4' : 'max-h-0'
          }`}
        >
          <div className="py-4 space-y-4 border-t border-border">
            {nav.links.map((link) => {
              const Icon = iconMap[link.icon];
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
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
              className="btn-primary text-xs py-2 px-4 w-full"
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
