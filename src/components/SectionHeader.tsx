interface SectionHeaderProps {
  label: string;
  heading: string;
  showDivider?: boolean;
  centered?: boolean;
}

export default function SectionHeader({
  label,
  heading,
  showDivider = true,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      <span className="section-label">{label}</span>
      <h2 className="section-heading">{heading}</h2>
      {showDivider && (
        <div className={`flex items-center gap-3 mt-6 ${centered ? 'justify-center' : ''}`}>
          <span className="w-16 h-px bg-accent/50" />
          <span className="text-accent text-sm">&#9671;</span>
          <span className="w-16 h-px bg-accent/50" />
        </div>
      )}
    </div>
  );
}
