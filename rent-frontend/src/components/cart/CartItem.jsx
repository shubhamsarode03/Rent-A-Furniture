import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import Badge from '@/components/common/Badge';

export default function CartItem({ item, onRemove }) {
  const name = item.furnitureName || item.fname || (item.furniture && item.furniture.fname) || 'Furniture item';
  const price = item.pricePerMonth || (item.furniture && item.furniture.pricePerMonth) || 0;
  const imageUrl = item.imageUrl || (item.furniture && item.furniture.imageUrl);
  const categoryName = item.categoryName || (item.furniture && item.furniture.categoryName) || 'Furniture';
  const status = item.status || (item.furniture && item.furniture.status) || 'AVAILABLE';
  const isRented = status === 'RENTED';

  return (
    <div className={`flex items-center gap-4 border-b border-brand-100 py-4 last:border-0 ${isRented ? 'opacity-60' : ''}`}>
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-brand-100">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-brand-400">No img</div>
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-brand-900">{name}</h4>
        <p className="text-sm text-brand-500">{categoryName}</p>
        {isRented && (
          <Badge tone="neutral" className="mt-1">RENTED</Badge>
        )}
      </div>
      <div className="text-right">
        <p className="font-semibold text-brand-800">{formatCurrency(price)}<span className="text-xs font-normal text-brand-400">/mo</span></p>
        <button onClick={() => onRemove(item)} className="mt-1 inline-flex items-center gap-1 text-xs text-error-600 hover:text-error-700">
          <Trash2 className="h-3.5 w-3.5" /> Remove
        </button>
      </div>
    </div>
  );
}
