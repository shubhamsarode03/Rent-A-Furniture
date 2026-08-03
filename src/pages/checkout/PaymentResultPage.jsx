import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export default function PaymentResultPage() {
  const location = useLocation();
  const success = location.state?.success;
  const orderId = location.state?.orderId;

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <Card className="max-w-md p-8 text-center">
        {success ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-900">Payment successful</h1>
            <p className="mt-2 text-brand-500">Your order has been confirmed.</p>
            {orderId && <p className="mt-1 text-sm text-brand-600">Order #{orderId}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <Link to={`/orders/${orderId}`}><Button>View order</Button></Link>
              <Link to="/orders"><Button variant="secondary">My orders</Button></Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-100 text-error-600">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-900">Payment failed</h1>
            <p className="mt-2 text-brand-500">{location.state?.error || 'Your payment could not be processed.'}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/cart"><Button>Back to cart</Button></Link>
              <Link to="/orders"><Button variant="secondary">My orders</Button></Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
