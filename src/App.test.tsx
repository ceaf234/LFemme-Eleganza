import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByRole('navigation', { name: 'Sitio principal' })).toBeInTheDocument();
  });

  it('renders hero section', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('has a skip-to-content link', () => {
    render(<App />);
    const skipLink = screen.getByText('Ir al contenido principal');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('has a main element with id for skip link target', () => {
    render(<App />);
    expect(document.getElementById('main-content')).toBeInTheDocument();
    expect(document.getElementById('main-content')?.tagName).toBe('MAIN');
  });
});
