import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import CartItem from '@/components/cart/CartItem';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { formatCurrency } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { data: cart, isLoading, removeItem, clear } = useCart();
  const navigate = useNavigate();
  const items = Array.isArray(cart) ? cart : [];
  
  // Check if any items are RENTED
  const hasRentedItems = items.some(item => 
    item.status === 'RENTED' || (item.furniture && item.furniture.status === 'RENTED')
  );
  
  const availableItems = items.filter(item => 
    !(item.status === 'RENTED' || (item.furniture && item.furniture.status === 'RENTED'))
  );
  
  const total = availableItems.reduce((sum, i) => {
    const price = i.pricePerMonth || (i.furniture && i.furniture.pricePerMonth) || 0;
    return sum + Number(price || 0);
  }, 0);

  const handleRemove = (item) => {
    removeItem(item.id);
  };

  const handleClear = () => {
    clear();
  };

  const handleCheckout = () => {
    if (hasRentedItems) {
      toast.error('Cannot checkout. Some items in your cart are already rented. Please remove them first.');
      return;
    }
    navigate('/checkout');
  };

  if (isLoading) return <Loader />;

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-brand-900">Your cart</h1>
      {items.length === 0 ? (
        <EmptyState title="Your cart is empty" message="Browse furniture and add items to rent." action={<Button onClick={() => navigate('/')}>Browse furniture</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="p-5">
            {items.map((item) => (
              <CartItem key={item.id} item={item} onRemove={handleRemove} />
            ))}
            <button onClick={handleClear} className="mt-4 text-sm text-error-600 hover:text-error-700">Clear cart</button>
          </Card>
          <Card className="h-fit p-5">
            <h2 className="mb-4 font-semibold text-brand-900">Order summary</h2>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-brand-600">Subtotal ({availableItems.length} items)</span>
              <span className="font-semibold text-brand-800">{formatCurrency(total)}</span>
            </div>
            {hasRentedItems && (
              <div className="mb-4 rounded-lg bg-brand-50 p-3 text-sm text-brand-600">
                Some items are already rented and cannot be checked out.
              </div>
            )}
            <Button 
              onClick={handleCheckout} 
              className="w-full"
              disabled={availableItems.length === 0}
            >
              Proceed to checkout
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
