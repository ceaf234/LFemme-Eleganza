import { HiOutlineSparkles, HiOutlineHand, HiOutlineUser, HiOutlineEye } from 'react-icons/hi';
import { HiArrowRight } from 'react-icons/hi2';
import SectionHeader from './SectionHeader';
import { siteContent } from '../content/siteContent';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  facial: HiOutlineSparkles,
  massage: HiOutlineHand,
  body: HiOutlineUser,
  eye: HiOutlineEye,
};

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  cta: string;
}

function ServiceCard({ title, description, icon, cta }: ServiceCardProps) {
  const Icon = iconMap[icon] || HiOutlineSparkles;

  return (
    <div className="card text-center group">
      <div className="icon-circle mx-auto mb-6 group-hover:bg-accent/10 transition-colors">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-serif text-xl text-text-primary mb-4">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed mb-6">
        {description}
      </p>
      <button
        type="button"
        className="inline-flex items-center gap-2 text-accent text-sm font-medium tracking-wide hover:gap-3 transition-all bg-transparent border-none cursor-pointer"
      >
        {cta} <HiArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Services() {
  const { services } = siteContent;

  return (
    <section id="servicios" className="py-24 bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader label={services.label} heading={services.heading} showDivider={false} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {services.items.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              icon={service.icon}
              cta={services.cta}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
