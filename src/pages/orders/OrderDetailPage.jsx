import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useOrderDetail } from '@/hooks/useOrders';
import { usePayment } from '@/hooks/usePayment';
import { useRazorpay } from '@/hooks/useRazorpay';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data: order, loading, error, refetch } = useOrderDetail(id);
  const { user } = useAuth();
  const { create: createPayment, verify: verifyPayment } = usePayment();
  const { openCheckout } = useRazorpay();

  const retryPayment = async () => {
    try {
      const paymentData = await createPayment({ orderId: order.id, amount: order.totalAmount });
      const rzpResponse = await openCheckout({
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: 'Rent-A-Furniture',
        order_id: paymentData.razorpayOrderId,
        prefill: { name: user ? `${user.firstName} ${user.lastName}` : '', email: user?.email || '' },
      });
      await verifyPayment({
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpayPaymentId: rzpResponse.razorpay_payment_id,
        razorpaySignature: rzpResponse.razorpay_signature,
      });
      toast.success('Payment successful!');
      refetch();
    } catch (err) {
      toast.error(err?.message === 'Payment cancelled' ? 'Payment cancelled' : 'Payment failed');
    }
  };

  if (loading) return <Loader />;
  if (error || !order) return <EmptyState title="Order not found" message="This order may not exist." />;

  const needsPayment = order.paymentStatus === 'PENDING' || order.paymentStatus === 'FAILED';

  return (
    <div className="container-page py-8">
      <Link to="/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-brand-400">Order #{order.id}</p>
          <h1 className="font-display text-2xl font-bold text-brand-900">{formatDate(order.rentedOn || order.createdAt)}</h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-brand-900">Items</h2>
          <ul className="divide-y divide-brand-100">
            {(order.orderDetails || []).map((d) => {
              const name = d.fname || d.furnitureName || (d.furniture && d.furniture.fname) || `Item #${d.furnitureId}`;
              const price = d.pricePerMonth || (d.furniture && d.furniture.pricePerMonth) || 0;
              return (
                <li key={d.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-brand-900">{name}</p>
                    {d.durationMonths && <p className="text-sm text-brand-500">{d.durationMonths} month(s)</p>}
                  </div>
                  <span className="font-semibold text-brand-800">{formatCurrency(price)}/mo</span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="h-fit p-5">
          <h2 className="mb-4 font-semibold text-brand-900">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-brand-600">Status</span><OrderStatusBadge status={order.status} /></div>
            <div className="flex justify-between"><span className="text-brand-600">Payment</span><span className="font-medium text-brand-800">{order.paymentStatus || '—'}</span></div>
            <div className="flex justify-between border-t border-brand-100 pt-2"><span className="font-semibold text-brand-800">Total</span><span className="font-bold text-brand-800">{formatCurrency(order.totalAmount)}</span></div>
          </div>
          {needsPayment && (
            <Button onClick={retryPayment} className="mt-4 w-full">Retry payment</Button>
          )}
        </Card>
      </div>
    </div>
  );
}
