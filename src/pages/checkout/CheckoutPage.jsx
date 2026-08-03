import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { usePayment } from '@/hooks/usePayment';
import { useRazorpay } from '@/hooks/useRazorpay';
import { orderApi } from '@/api/orderApi';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { formatCurrency } from '@/utils/formatCurrency';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { data: cart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { create: createPayment, verify: verifyPayment } = usePayment();
  const { openCheckout } = useRazorpay();
  const [submitting, setSubmitting] = useState(false);
  const [emptyError, setEmptyError] = useState(false);

  const items = Array.isArray(cart) ? cart : [];
  const total = items.reduce((sum, i) => {
    const price = i.pricePerMonth || (i.furniture && i.furniture.pricePerMonth) || 0;
    return sum + Number(price || 0);
  }, 0);

  const handleCheckout = async () => {
    if (items.length === 0) {
      setEmptyError(true);
      return;
    }
    setEmptyError(false);
    setSubmitting(true);
    try {
      // 1. Create the order — backend expects rentedOn, returnDate, items[{ furnitureId, durationMonths }]
      const today = new Date();
      const returnDate = new Date();
      returnDate.setMonth(returnDate.getMonth() + 1);

      const order = await orderApi.createOrder({
        rentedOn: today.toISOString().split('T')[0],
        returnDate: returnDate.toISOString().split('T')[0],
        items: items.map((i) => ({
          furnitureId: i.furnitureId || i.furniture?.id || i.id,
          durationMonths: 1,
        })),
      });

      // 2. Create payment via backend
      const paymentData = await createPayment({ orderId: order.id, amount: order.totalAmount || total });

      // 3. Open Razorpay checkout
      const rzpResponse = await openCheckout({
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: 'Rent-A-Furniture',
        order_id: paymentData.razorpayOrderId,
        prefill: { name: user ? `${user.firstName} ${user.lastName}` : '', email: user?.email || '' },
      });

      // 4. Verify payment — backend expects camelCase fields, no orderId
      await verifyPayment({
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpayPaymentId: rzpResponse.razorpay_payment_id,
        razorpaySignature: rzpResponse.razorpay_signature,
      });

      toast.success('Payment successful!');
      navigate('/payment/result', { state: { success: true, orderId: order.id } });
    } catch (err) {
      const msg = err?.message === 'Payment cancelled' ? 'Payment cancelled' : 'Checkout failed';
      toast.error(msg);
      navigate('/payment/result', { state: { success: false, error: msg } });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-brand-900">Checkout</h1>
      {items.length === 0 ? (
        <EmptyState title="Your cart is empty" message="Add furniture before checking out." />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="p-5">
            <h2 className="mb-4 font-semibold text-brand-900">Items</h2>
            <ul className="divide-y divide-brand-100">
              {items.map((item) => {
                const name = item.fname || item.furnitureName || (item.furniture && item.furniture.fname) || 'Furniture item';
                const price = item.pricePerMonth || (item.furniture && item.furniture.pricePerMonth) || 0;
                return (
                  <li key={item.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-brand-900">{name}</p>
                      <p className="text-sm text-brand-500">{item.categoryName || 'Furniture'}</p>
                    </div>
                    <span className="font-semibold text-brand-800">{formatCurrency(price)}/mo</span>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card className="h-fit p-5">
            <h2 className="mb-4 font-semibold text-brand-900">Payment summary</h2>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-brand-600">Total</span>
              <span className="text-xl font-bold text-brand-800">{formatCurrency(total)}</span>
            </div>
            {emptyError && <p className="mb-3 text-sm text-error-600">Your cart is empty.</p>}
            <Button onClick={handleCheckout} loading={submitting} className="w-full">Pay & confirm order</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
