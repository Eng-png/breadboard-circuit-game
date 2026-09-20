import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../App.jsx';
import { resetIds } from '../shared/ids.js';

afterEach(cleanup);

const navButtons = () => screen.getByRole('navigation', { name: /levels/i }).querySelectorAll('button');
const current = () => document.querySelector('.level-nav__item[aria-current="page"]');

describe('Level navigation', () => {
  it('lists every level and marks the one being played', () => {
    resetIds();
    render(<App />);

    const buttons = navButtons();
    expect(buttons.length).toBe(3);
    expect(current().textContent).toBe('1');
    expect(screen.getByRole('button', { name: /level 3: reading light/i })).toBeTruthy();
  });

  it('jumps straight to level 3 and back to level 1, starting each fresh', () => {
    resetIds();
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /level 3/i }));
    expect(current().textContent).toBe('3');
    expect(screen.getByText(/found a book/i)).toBeTruthy();

    // Advance a little into level 3, then leave and come back — it restarts.
    fireEvent.click(document.querySelector('.dialogue__advance'));
    fireEvent.click(screen.getByRole('button', { name: /level 1/i }));
    expect(current().textContent).toBe('1');
    expect(screen.queryByText(/found a book/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /level 3/i }));
    expect(screen.getByText(/found a book/i)).toBeTruthy();
  });

  it('clicking the current level does nothing', () => {
    resetIds();
    render(<App />);
    fireEvent.click(document.querySelector('.dialogue__advance'));
    const before = document.querySelector('.dialogue').textContent;

    fireEvent.click(screen.getByRole('button', { name: /level 1/i }));
    expect(document.querySelector('.dialogue').textContent).toBe(before);
  });
});
