import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, BadgeCheck } from 'lucide-react';
import { useFurnitureDetail } from '@/hooks/useFurnitureDetail';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { formatCurrency } from '@/utils/formatCurrency';

const statusMap = {
  PENDING_APPROVAL: { label: 'Pending Approval', tone: 'warning', available: false },
  AVAILABLE: { label: 'Available', tone: 'success', available: true },
  RENTED: { label: 'Currently Rented', tone: 'neutral', available: false },
  REJECTED: { label: 'Rejected', tone: 'error', available: false },
  INACTIVE: { label: 'Inactive', tone: 'neutral', available: false },
};

export default function FurnitureDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: item, loading, error } = useFurnitureDetail(id);
  const { isAuthenticated, permissions } = useAuth();
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/furniture/${id}` } });
      return;
    }
    addItem({ furnitureId: item.id });
  };

  if (loading) return <Loader />;
  if (error || !item) return <EmptyState title="Item not found" message="This listing may have been removed." />;

  const statusInfo = statusMap[item.status] || { label: item.status, tone: 'neutral', available: false };
  const isAvailable = statusInfo.available;

  return (
    <div className="container-page py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800">
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex items-center justify-center">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.fname} 
              className="max-w-full max-h-[420px] w-auto h-auto object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`flex items-center justify-center text-brand-400 ${item.imageUrl ? 'hidden' : ''}`} style={{ minHeight: '300px' }}>No image available</div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Badge tone="neutral">{item.categoryName || 'Furniture'}</Badge>
            <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
            {item.status === 'AVAILABLE' && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-accent-700">
                <BadgeCheck className="h-4 w-4" /> Verified
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold text-brand-900">{item.fname}</h1>
          <p className="mt-2 text-2xl font-bold text-brand-800">{formatCurrency(item.pricePerMonth)}<span className="text-sm font-normal text-brand-400">/month</span></p>
          <p className="mt-4 text-brand-600">{item.description}</p>

          {item.ownerName && (
            <div className="mt-6 rounded-lg border border-brand-100 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-brand-400">Listed by</p>
              <p className="font-medium text-brand-800">{item.ownerName}</p>
            </div>
          )}

          <div className="mt-6">
            <Button onClick={handleAddToCart} disabled={!isAvailable || !permissions.canUseCart} className="w-full sm:w-auto">
              <ShoppingCart className="h-4 w-4" /> Add to cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
