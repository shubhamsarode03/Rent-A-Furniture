import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-600/30',
  secondary: 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 focus-visible:ring-brand-500/30',
  accent: 'bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-600/30',
  danger: 'bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-600/30',
  ghost: 'bg-transparent text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-500/30',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
