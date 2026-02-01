import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Contact from '../Contact';

describe('Contact', () => {
  it('renders section heading', () => {
    render(<Contact />);
    expect(screen.getByText('Contáctanos')).toBeInTheDocument();
  });

  it('renders all contact items', () => {
    render(<Contact />);
    expect(screen.getByText('Ubicación')).toBeInTheDocument();
    expect(screen.getByText('Teléfono')).toBeInTheDocument();
    expect(screen.getByText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByText('Horario de Atención')).toBeInTheDocument();
  });

  it('uses a button element for the CTA', () => {
    render(<Contact />);
    expect(screen.getByRole('button', { name: 'AGENDA TU CITA' })).toBeInTheDocument();
  });
});
