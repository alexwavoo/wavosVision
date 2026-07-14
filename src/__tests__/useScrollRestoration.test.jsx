import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { useScrollRestoration } from '../hooks/useScrollRestoration';

function ScrollPage() {
  useScrollRestoration();

  return <Link to="/collection/b/projects">View collection B</Link>;
}

describe('useScrollRestoration', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.stubGlobal('requestAnimationFrame', (callback) => {
      callback();
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('restores the saved position when the pathname changes', () => {
    sessionStorage.setItem('scroll_/collection/a/projects', '400');
    sessionStorage.setItem('scroll_/collection/b/projects', '800');

    render(
      <MemoryRouter initialEntries={['/collection/a/projects']}>
        <Routes>
          <Route path="/collection/:collectionId/projects" element={<ScrollPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(window.scrollTo).toHaveBeenCalledWith(0, 400);

    fireEvent.click(screen.getByRole('link', { name: 'View collection B' }));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 800);
  });
});
