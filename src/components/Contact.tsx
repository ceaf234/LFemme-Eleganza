import { HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail, HiOutlineClock } from 'react-icons/hi';
import SectionHeader from './SectionHeader';
import { siteContent } from '../content/siteContent';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  location: HiOutlineLocationMarker,
  phone: HiOutlinePhone,
  email: HiOutlineMail,
  clock: HiOutlineClock,
};

interface ContactItemProps {
  title: string;
  icon: string;
  lines: string[];
}

function ContactItem({ title, icon, lines }: ContactItemProps) {
  const Icon = iconMap[icon] || HiOutlineLocationMarker;

  return (
    <div className="text-center">
      <div className="icon-circle mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-lg text-accent italic mb-3">{title}</h3>
      {lines.map((line, index) => (
        <p
          key={index}
          className={`text-sm ${
            index === 0 ? 'text-text-primary' : 'text-text-secondary'
          }`}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

export default function Contact() {
  const { contact } = siteContent;

  return (
    <section id="contacto" className="py-24 bg-primary-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader label={contact.label} heading={contact.heading} />

        {/* Contact Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mt-16">
          {contact.items.map((item) => (
            <ContactItem
              key={item.id}
              title={item.title}
              icon={item.icon}
              lines={item.lines}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-16">
          <a href="#" className="btn-primary">
            {contact.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
