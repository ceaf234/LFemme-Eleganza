import { useState, useRef, useEffect } from 'react';
import type { StaffMember } from '../types';

interface StaffDropdownProps {
  staff: StaffMember[];
  selectedStaffId: number | null;
  placeholder: string;
  onSelect: (id: number) => void;
}

export default function StaffDropdown({
  staff,
  selectedStaffId,
  placeholder,
  onSelect,
}: StaffDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = staff.find((s) => s.id === selectedStaffId);
  const displayText = selected
    ? `${selected.first_name} ${selected.last_name}`
    : placeholder;

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between bg-[#0D4F4F] border border-[#C9A84C] rounded-md py-2.5 px-4 text-sm font-sans transition-colors focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
      >
        <span className={selected ? 'text-text-primary' : 'text-text-muted'}>
          {displayText}
        </span>
        <svg
          className={`w-4 h-4 text-[#C9A84C] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown list */}
      <div
        className={`absolute z-20 left-0 right-0 mt-1 bg-[#0D4F4F] border border-[#C9A84C] rounded-md overflow-hidden shadow-lg transition-all duration-200 origin-top ${
          open
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        {staff.map((s) => {
          const isActive = s.id === selectedStaffId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onSelect(s.id);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-sans text-text-primary transition-colors ${
                isActive
                  ? 'bg-[#C9A84C]/15 border-l-2 border-l-[#C9A84C]'
                  : 'border-l-2 border-l-transparent hover:bg-white/5'
              }`}
            >
              {s.first_name} {s.last_name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
