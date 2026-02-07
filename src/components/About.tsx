import SectionHeader from './SectionHeader';
import { useSiteContent } from '../context/SiteSettingsContext';

export default function About() {
  const { about } = useSiteContent();

  const highlightText = (text: string, highlight: string | null) => {
    if (!highlight) return text;

    const parts = text.split(highlight);
    return (
      <>
        {parts[0]}
        <span className="text-accent">{highlight}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <section id="nosotros" className="py-24 bg-primary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader label={about.label} heading={about.heading} showDivider={false} />

        <div className="space-y-6 text-center">
          {about.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={`font-sans leading-relaxed ${
                index === 0 ? 'text-text-primary text-lg' : 'text-text-secondary'
              }`}
            >
              {highlightText(paragraph.text, paragraph.highlight)}
            </p>
          ))}
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 mt-16">
          <span className="w-16 h-px bg-accent/50" />
          <span className="text-accent text-sm">&#9671;</span>
          <span className="w-16 h-px bg-accent/50" />
        </div>
      </div>
    </section>
  );
}
