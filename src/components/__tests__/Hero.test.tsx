import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '../../test/renderWithRouter';
import Hero from '../Hero';

describe('Hero', () => {
  it('renders headline', () => {
    renderWithRouter(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("L'Femme")).toBeInTheDocument();
  });

  it('renders CTA button', () => {
    renderWithRouter(<Hero />);
    expect(screen.getByText('RESERVA TU CITA')).toBeInTheDocument();
  });

  it('has aria-hidden on scroll indicator', () => {
    const { container } = renderWithRouter(<Hero />);
    const scrollIndicator = container.querySelector('.animate-bounce');
    expect(scrollIndicator).toHaveAttribute('aria-hidden', 'true');
  });
});
