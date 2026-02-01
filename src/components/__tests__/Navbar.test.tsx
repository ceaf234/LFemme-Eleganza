import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '../../test/renderWithRouter';
import Navbar from '../Navbar';

describe('Navbar', () => {
  it('renders brand name', () => {
    renderWithRouter(<Navbar activeSection="inicio" />);
    expect(screen.getByText("L'Femme")).toBeInTheDocument();
    expect(screen.getByText('Eleganza')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithRouter(<Navbar activeSection="inicio" />);
    expect(screen.getAllByText('Nuestros Servicios').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dónde Ubicarnos').length).toBeGreaterThan(0);
  });

  it('toggles mobile menu on button click', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Navbar activeSection="inicio" />);

    const toggleButton = screen.getByLabelText('Abrir menú');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggleButton);
    expect(screen.getByLabelText('Cerrar menú')).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes mobile menu on Escape key', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Navbar activeSection="inicio" />);

    await user.click(screen.getByLabelText('Abrir menú'));
    expect(screen.getByLabelText('Cerrar menú')).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(screen.getByLabelText('Abrir menú')).toHaveAttribute('aria-expanded', 'false');
  });

  it('has aria-label on nav element', () => {
    renderWithRouter(<Navbar activeSection="inicio" />);
    expect(screen.getByRole('navigation', { name: 'Sitio principal' })).toBeInTheDocument();
  });

  it('has aria-controls linking to mobile menu', () => {
    renderWithRouter(<Navbar activeSection="inicio" />);
    const toggleButton = screen.getByLabelText('Abrir menú');
    expect(toggleButton).toHaveAttribute('aria-controls', 'mobile-menu');
    expect(document.getElementById('mobile-menu')).toBeInTheDocument();
  });
});
