import { FaInstagram, FaFacebookF, FaWhatsapp, FaTiktok } from 'react-icons/fa';
import SectionHeader from './SectionHeader';
import { siteContent } from '../content/siteContent';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  whatsapp: FaWhatsapp,
  tiktok: FaTiktok,
};

export default function Socials() {
  const { socials } = siteContent;

  return (
    <section id="social" className="py-24 bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SectionHeader label={socials.label} heading={socials.heading} />

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-6 mt-12">
          {socials.links.map((social) => {
            const Icon = iconMap[social.platform];
            return (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="icon-circle hover:bg-accent hover:text-primary hover:border-accent transition-all duration-300"
              >
                <Icon className="w-6 h-6" />
              </a>
            );
          })}
        </div>

        {/* Handle */}
        <p className="text-text-secondary mt-8 font-sans">{socials.handle}</p>
      </div>
    </section>
  );
}
