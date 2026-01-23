'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 24,
    md: 40,
    lg: 56,
  };

  const s = sizes[size];
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 50 50"
      className="animate-spin"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="rgba(37, 99, 235, 0.2)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="url(#spinner-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="60 126"
      />
      <defs>
        <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}
