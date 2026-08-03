import { Loader2 } from 'lucide-react';

export default function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-12 text-brand-500 ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
