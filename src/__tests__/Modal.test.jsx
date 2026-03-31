import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from '../components/Modal';

const images = [
  'https://images.ctfassets.net/img1.jpg',
  'https://images.ctfassets.net/img2.jpg',
  'https://images.ctfassets.net/img3.jpg',
];

describe('Modal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <Modal isOpen={false} images={images} currentIndex={0} onClose={() => {}} calculatedHeight={800} />
    );
    expect(container.querySelector('.modal-wrapper')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(
      <Modal isOpen={true} images={images} currentIndex={0} onClose={() => {}} calculatedHeight={800} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows image counter with navigation', () => {
    const onNavigate = vi.fn();
    render(
      <Modal isOpen={true} images={images} currentIndex={1} onClose={() => {}} onNavigate={onNavigate} calculatedHeight={800} />
    );
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates with arrow buttons', () => {
    const onNavigate = vi.fn();
    render(
      <Modal isOpen={true} images={images} currentIndex={1} onClose={() => {}} onNavigate={onNavigate} calculatedHeight={800} />
    );
    fireEvent.click(screen.getByLabelText('Previous image'));
    expect(onNavigate).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getByLabelText('Next image'));
    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  it('closes on Escape key', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} images={images} currentIndex={0} onClose={onClose} calculatedHeight={800} />
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('navigates with arrow keys', () => {
    const onNavigate = vi.fn();
    render(
      <Modal isOpen={true} images={images} currentIndex={1} onClose={() => {}} onNavigate={onNavigate} calculatedHeight={800} />
    );
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    expect(onNavigate).toHaveBeenCalledWith(0);

    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(onNavigate).toHaveBeenCalledWith(2);
  });
});
