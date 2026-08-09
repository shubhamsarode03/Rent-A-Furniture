import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, RefreshCw, ShoppingCart } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function PaymentResultPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const success = location.state?.success;
  const orderId = location.state?.orderId;
  const error = location.state?.error;

  // Invalidate queries on successful payment to update UI state
  useEffect(() => {
    if (success && orderId) {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['furniture'] });
    }
  }, [success, orderId, queryClient]);

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <Card className="max-w-md p-8 text-center">
        {success ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-900">Payment successful!</h1>
            <p className="mt-2 text-brand-500">Your order has been confirmed.</p>
            {orderId && <p className="mt-1 text-sm text-brand-600">Order ID: #{orderId}</p>}
            <div className="mt-6 flex flex-col gap-3">
              <Link to={`/orders/${orderId}`}><Button>View Order</Button></Link>
              <Link to={`/orders/${orderId}`}><Button variant="secondary">Download Invoice</Button></Link>
              <Link to="/"><Button variant="secondary">Continue Browsing</Button></Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-100 text-error-600">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-900">Payment Failed</h1>
            <p className="mt-2 text-brand-500">{error || 'Your payment could not be processed.'}</p>
            <p className="mt-4 text-sm text-brand-600 bg-brand-50 p-3 rounded">
              Your items are still in your cart. You can retry payment or return to the cart.
            </p>
            {orderId && <p className="mt-2 text-sm text-brand-600">Order Status: PAYMENT_FAILED</p>}
            <div className="mt-6 flex flex-col gap-3">
              {orderId && (
                <Link to={`/orders/${orderId}`}>
                  <Button><RefreshCw className="h-4 w-4 mr-2" /> Retry Payment</Button>
                </Link>
              )}
              <Link to="/cart"><Button variant="secondary"><ShoppingCart className="h-4 w-4 mr-2" /> Return to Cart</Button></Link>
              <Link to="/orders"><Button variant="secondary">View Order</Button></Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
