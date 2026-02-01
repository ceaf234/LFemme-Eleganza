import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '../../test/renderWithRouter';
import Contact from '../Contact';

describe('Contact', () => {
  it('renders section heading', () => {
    renderWithRouter(<Contact />);
    expect(screen.getByText('Contáctanos')).toBeInTheDocument();
  });

  it('renders all contact items', () => {
    renderWithRouter(<Contact />);
    expect(screen.getByText('Ubicación')).toBeInTheDocument();
    expect(screen.getByText('Teléfono')).toBeInTheDocument();
    expect(screen.getByText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByText('Horario de Atención')).toBeInTheDocument();
  });

  it('has a booking CTA link', () => {
    renderWithRouter(<Contact />);
    const cta = screen.getByText('AGENDA TU CITA');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/book');
  });
});
