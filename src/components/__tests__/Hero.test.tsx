import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Hero from '../Hero';

describe('Hero', () => {
  it('renders headline', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("L'Femme")).toBeInTheDocument();
  });

  it('renders CTA button', () => {
    render(<Hero />);
    expect(screen.getByText('RESERVA TU CITA')).toBeInTheDocument();
  });

  it('has aria-hidden on scroll indicator', () => {
    const { container } = render(<Hero />);
    const scrollIndicator = container.querySelector('.animate-bounce');
    expect(scrollIndicator).toHaveAttribute('aria-hidden', 'true');
  });
});
