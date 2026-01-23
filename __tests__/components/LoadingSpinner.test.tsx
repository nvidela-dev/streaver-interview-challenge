/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render the spinner', () => {
    render(<LoadingSpinner />);

    const spinner = document.querySelector('svg');
    expect(spinner).toBeInTheDocument();
  });

  it('should have animate-spin class', () => {
    render(<LoadingSpinner />);

    const spinner = document.querySelector('svg');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should render with default medium size', () => {
    render(<LoadingSpinner />);

    const spinner = document.querySelector('svg');
    expect(spinner).toHaveAttribute('width', '40');
    expect(spinner).toHaveAttribute('height', '40');
  });

  it('should render with small size', () => {
    render(<LoadingSpinner size="sm" />);

    const spinner = document.querySelector('svg');
    expect(spinner).toHaveAttribute('width', '24');
    expect(spinner).toHaveAttribute('height', '24');
  });

  it('should render with large size', () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = document.querySelector('svg');
    expect(spinner).toHaveAttribute('width', '56');
    expect(spinner).toHaveAttribute('height', '56');
  });

  it('should have gradient colors matching brand palette', () => {
    render(<LoadingSpinner />);

    const gradient = document.querySelector('linearGradient');
    expect(gradient).toBeInTheDocument();

    const stops = gradient?.querySelectorAll('stop');
    expect(stops?.[0]).toHaveAttribute('stop-color', '#2563EB'); // Royal blue
    expect(stops?.[1]).toHaveAttribute('stop-color', '#F97316'); // Tangerine
  });
});
