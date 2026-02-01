import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

// App already includes BrowserRouter, so we render it directly
// but we need to ensure we test the landing page route
function renderApp() {
  // App has its own BrowserRouter, render directly
  return render(<App />);
}

describe('App', () => {
  it('renders without crashing', () => {
    renderApp();
    expect(screen.getByRole('navigation', { name: 'Sitio principal' })).toBeInTheDocument();
  });

  it('renders hero section', () => {
    renderApp();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('has a skip-to-content link', () => {
    renderApp();
    const skipLink = screen.getByText('Ir al contenido principal');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('has a main element with id for skip link target', () => {
    renderApp();
    expect(document.getElementById('main-content')).toBeInTheDocument();
    expect(document.getElementById('main-content')?.tagName).toBe('MAIN');
  });
});
