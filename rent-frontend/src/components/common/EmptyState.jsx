import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', message, icon: Icon = PackageOpen, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-full bg-brand-100 p-4 text-brand-400">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-brand-800">{title}</h3>
      {message && <p className="max-w-sm text-sm text-brand-500">{message}</p>}
      {action}
    </div>
  );
}
