import { Link } from 'react-router-dom';
import { ShoppingCart, BadgeCheck } from 'lucide-react';
import Badge from '@/components/common/Badge';
import { formatCurrency } from '@/utils/formatCurrency';

const statusMap = {
  PENDING_APPROVAL: { label: 'Pending', tone: 'warning', available: false },
  AVAILABLE: { label: 'Available', tone: 'success', available: true },
  RENTED: { label: 'Rented', tone: 'neutral', available: false },
  REJECTED: { label: 'Rejected', tone: 'error', available: false },
  INACTIVE: { label: 'Inactive', tone: 'neutral', available: false },
};

export default function FurnitureCard({ item, onAddToCart, canAdd = false }) {
  const statusInfo = statusMap[item.status] || { label: item.status, tone: 'neutral', available: false };
  const isAvailable = statusInfo.available;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-brand-100 bg-white shadow-card transition hover:shadow-card-hover">
      <Link to={`/furniture/${item.id}`} className="relative block aspect-[4/3] overflow-hidden bg-brand-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.fname} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-brand-100 text-brand-300">
            <span className="text-sm">No image</span>
          </div>
        )}
        {item.status === 'AVAILABLE' && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-accent-700">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-brand-400">{item.categoryName || 'Furniture'}</span>
          <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
        </div>
        <Link to={`/furniture/${item.id}`} className="mb-2 line-clamp-1 font-semibold text-brand-900 hover:text-brand-600">
          {item.fname}
        </Link>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-brand-500">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-brand-800">{formatCurrency(item.pricePerMonth)}<span className="text-xs font-normal text-brand-400">/mo</span></span>
          {canAdd && isAvailable && (
            <button
              onClick={() => onAddToCart(item)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              <ShoppingCart className="h-4 w-4" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
