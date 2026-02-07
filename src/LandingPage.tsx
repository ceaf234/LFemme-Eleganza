import { useState, useEffect, lazy, Suspense } from 'react';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

const About = lazy(() => import('./components/About'));
const Services = lazy(() => import('./components/Services'));
const Socials = lazy(() => import('./components/Socials'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const sections = ['inicio', 'nosotros', 'servicios', 'social', 'contacto'];

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <SiteSettingsProvider>
      <div className="min-h-screen bg-primary">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-primary focus:rounded-md focus:font-sans focus:text-sm focus:font-medium"
        >
          Ir al contenido principal
        </a>
        <Navbar activeSection={activeSection} />
        <main id="main-content">
          <Hero />
          <Suspense fallback={null}>
            <About />
            <Services />
            <Socials />
            <Contact />
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    </SiteSettingsProvider>
  );
}
