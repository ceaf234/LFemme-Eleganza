import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Services from '../Services';

describe('Services', () => {
  it('renders section heading', () => {
    render(<Services />);
    expect(screen.getByText('Nuestros Servicios')).toBeInTheDocument();
  });

  it('renders all 4 service cards', () => {
    render(<Services />);
    expect(screen.getByText('Faciales')).toBeInTheDocument();
    expect(screen.getByText('Masajes')).toBeInTheDocument();
    expect(screen.getByText('Tratamientos Corporales')).toBeInTheDocument();
    expect(screen.getByText('Cejas y Pestañas')).toBeInTheDocument();
  });

  it('uses button elements instead of anchor links for CTAs', () => {
    render(<Services />);
    const ctaButtons = screen.getAllByRole('button', { name: /VER MÁS/i });
    expect(ctaButtons).toHaveLength(4);
  });
});
