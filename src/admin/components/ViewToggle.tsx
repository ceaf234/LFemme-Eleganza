export type ViewType = 'day' | '3day' | 'week';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const VIEW_OPTIONS: { value: ViewType; label: string }[] = [
  { value: 'day', label: 'Dia' },
  { value: '3day', label: '3 Dias' },
  { value: 'week', label: 'Semana' },
];

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1">
      {VIEW_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onViewChange(opt.value)}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            currentView === opt.value
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border text-text-secondary hover:border-accent/50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
