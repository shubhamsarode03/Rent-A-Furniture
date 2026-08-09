import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, MapPin, RefreshCw, Calendar, X } from 'lucide-react';
import { useOrderDetail } from '@/hooks/useOrders';
import { usePayment } from '@/hooks/usePayment';
import { useRazorpay } from '@/hooks/useRazorpay';
import { orderApi } from '@/api/orderApi';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useAuth } from '@/hooks/useAuth';
import { ORDER_STATUS } from '@/utils/constants';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data: order, loading, error, refetch } = useOrderDetail(id);
  const { user } = useAuth();
  const { create: createPayment, verify: verifyPayment, handleFailure } = usePayment();
  const { openCheckout } = useRazorpay();
  const [retrying, setRetrying] = useState(false);

  const retryPayment = async () => {
    setRetrying(true);
    let paymentData = null;
    try {
      // First call retry endpoint to reset order status
      await orderApi.retryPayment(order.id);

      // Then create payment and open checkout
      paymentData = await createPayment({ orderId: order.id, amount: order.totalAmount });
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
      // Handle payment failure
      if (paymentData && paymentData.razorpayOrderId) {
        try {
          await handleFailure(paymentData.razorpayOrderId);
        } catch (failureErr) {
          console.error('Failed to record payment failure:', failureErr);
        }
      }
      toast.error(err?.message === 'Payment cancelled' ? 'Payment cancelled' : 'Payment failed');
      refetch();
    } finally {
      setRetrying(false);
    }
  };

  const downloadInvoice = async () => {
    try {
      const response = await orderApi.downloadInvoice(order.id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${order.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully');
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  const cancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    try {
      await orderApi.cancelOrder(order.id, { reason: 'User cancelled' });
      toast.success('Order cancelled successfully');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) return <Loader />;
  if (error || !order) return <EmptyState title="Order not found" message="This order may not exist." />;

  const isPaymentFailed = order.status === ORDER_STATUS.PAYMENT_FAILED;
  const canRetryPayment = isPaymentFailed;
  const canDownloadInvoice = order.status === ORDER_STATUS.CONFIRMED;
  const canCancel = order.status === ORDER_STATUS.PENDING ||
                    order.status === ORDER_STATUS.PAYMENT_FAILED ||
                    order.status === ORDER_STATUS.CONFIRMED;

  // Calculate rental duration in months
  const calculateDurationInMonths = (startDate, endDate) => {
    let months = 0;
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      // Add one month to current date
      currentDate.setMonth(currentDate.getMonth() + 1);
      months++;
    }

    return months;
  };

  const rentalDuration = order.rentedOn && order.returnDate
    ? calculateDurationInMonths(new Date(order.rentedOn), new Date(order.returnDate))
    : null;

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
        <div className="space-y-6">
          {/* Rental Period */}
          {order.rentedOn && order.returnDate && (
            <Card className="p-5">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-brand-900">
                <Calendar className="h-5 w-5" /> Rental Period
              </h2>
              <div className="rounded-lg bg-brand-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-brand-600">Start Date</span>
                  <span className="font-medium text-brand-900">{formatDate(order.rentedOn)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-brand-600">End Date</span>
                  <span className="font-medium text-brand-900">{formatDate(order.returnDate)}</span>
                </div>
                {rentalDuration && (
                  <div className="flex items-center justify-between mt-2 border-t border-brand-200 pt-2">
                    <span className="text-brand-600">Duration</span>
                    <span className="font-semibold text-brand-900">{rentalDuration} month(s)</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Delivery Address */}
          {order.deliveryFullName && (
            <Card className="p-5">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-brand-900">
                <MapPin className="h-5 w-5" /> Delivery Address
              </h2>
              <div className="text-sm">
                <p className="font-medium text-brand-900">{order.deliveryFullName}</p>
                <p className="text-brand-600">{order.deliveryPhone}</p>
                <p className="text-brand-500">
                  {order.deliveryAddressLine1}
                  {order.deliveryAddressLine2 && `, ${order.deliveryAddressLine2}`}
                </p>
                <p className="text-brand-500">
                  {order.deliveryCity}, {order.deliveryState} - {order.deliveryPostalCode}
                </p>
                <p className="text-brand-500">{order.deliveryCountry}</p>
              </div>
            </Card>
          )}

          {/* Order Items */}
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
        </div>

        {/* Summary */}
        <Card className="h-fit p-5">
          <h2 className="mb-4 font-semibold text-brand-900">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-brand-600">Status</span><OrderStatusBadge status={order.status} /></div>
            {order.deliveryFee !== undefined && (
              <div className="flex justify-between">
                <span className="text-brand-600">Delivery fee</span>
                <span className="font-medium text-success-600">FREE</span>
              </div>
            )}
            <div className="flex justify-between border-t border-brand-100 pt-2">
              <span className="font-semibold text-brand-800">Total</span>
              <span className="font-bold text-brand-800">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {canRetryPayment && (
              <Button onClick={retryPayment} loading={retrying} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" /> Retry Payment
              </Button>
            )}
            {canCancel && (
              <Button onClick={cancelOrder} variant="secondary" className="w-full">
                <X className="h-4 w-4 mr-2" /> Cancel Order
              </Button>
            )}
            {canDownloadInvoice && (
              <Button onClick={downloadInvoice} variant="secondary" className="w-full">
                <Download className="h-4 w-4 mr-2" /> Download Invoice
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
