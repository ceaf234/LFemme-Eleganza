import { Link } from 'react-router-dom';
import { siteContent } from '../content/siteContent';

export default function Hero() {
  const { brand, hero } = siteContent;

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-dark via-primary to-primary-dark">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(201, 162, 39, 0.15) 0%, transparent 50%),
                               radial-gradient(circle at 80% 50%, rgba(201, 162, 39, 0.1) 0%, transparent 50%)`,
            }}
          />
        </div>
        {/* Top gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />
        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Label with decorative lines */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="w-12 h-px bg-accent/50" />
          <span className="text-accent text-xs font-sans tracking-ultra uppercase">
            {brand.tagline}
          </span>
          <span className="w-12 h-px bg-accent/50" />
        </div>

        {/* Main Headline */}
        <h1 className="font-serif mb-6">
          <span className="block text-6xl md:text-7xl lg:text-8xl text-text-primary font-medium tracking-wide">
            {hero.headline.line1}
          </span>
          <span className="block text-6xl md:text-7xl lg:text-8xl text-accent italic font-medium">
            {hero.headline.line2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-text-secondary font-serif italic text-xl md:text-2xl mb-12">
          {hero.subheadline}
        </p>

        {/* CTA Button */}
        <Link to="/book" className="btn-cta text-sm">
          {hero.cta}
        </Link>

        {/* Scroll indicator - positioned below button */}
        <div className="mt-10 md:mt-12 animate-bounce" aria-hidden="true">
          <div className="w-6 h-10 border-2 border-accent/50 rounded-full flex items-start justify-center p-1 mx-auto">
            <div className="w-1 h-2 bg-accent rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
