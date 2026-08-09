import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { usePayment } from '@/hooks/usePayment';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useAddress } from '@/hooks/useAddress';
import { orderApi } from '@/api/orderApi';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Plus, MapPin, X, Calendar } from 'lucide-react';

export default function CheckoutPage() {
  const { data: cart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { create: createPayment, verify: verifyPayment, handleFailure } = usePayment();
  const { openCheckout } = useRazorpay();
  const { data: addresses, isLoading: addressesLoading, createAddress } = useAddress();
  const [submitting, setSubmitting] = useState(false);
  const [emptyError, setEmptyError] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(1);

  const durationOptions = [
    { value: 1, label: '1 month' },
    { value: 3, label: '3 months' },
    { value: 6, label: '6 months' },
    { value: 12, label: '12 months' },
  ];

  // Auto-select default address or first address when addresses load
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find(a => a.isDefault);
      if (!selectedAddressId) {
        setSelectedAddressId(defaultAddress ? defaultAddress.id : addresses[0].id);
      }
    }
  }, [addresses]);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  const items = Array.isArray(cart) ? cart : [];
  const monthlyTotal = items.reduce((sum, i) => {
    const price = i.pricePerMonth || (i.furniture && i.furniture.pricePerMonth) || 0;
    return sum + Number(price || 0);
  }, 0);
  const total = monthlyTotal * selectedDuration;
  const deliveryFee = 0;

  // Calculate rental dates
  const today = new Date();
  const returnDate = new Date();
  returnDate.setMonth(returnDate.getMonth() + selectedDuration);

  const handleCheckout = async () => {
    if (items.length === 0) {
      setEmptyError(true);
      return;
    }
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }
    setEmptyError(false);
    setSubmitting(true);
    let order = null;
    let paymentData = null;
    try {
      // Get selected address
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      if (!selectedAddress) {
        throw new Error('Selected address not found');
      }

      // 1. Create the order with address and rental period
      order = await orderApi.createOrder({
        addressId: selectedAddressId,
        deliveryFullName: selectedAddress.fullName,
        deliveryPhone: selectedAddress.phoneNumber,
        deliveryAddressLine1: selectedAddress.addressLine1,
        deliveryAddressLine2: selectedAddress.addressLine2,
        deliveryCity: selectedAddress.city,
        deliveryState: selectedAddress.state,
        deliveryPostalCode: selectedAddress.postalCode,
        deliveryCountry: selectedAddress.country,
        rentedOn: today.toISOString().split('T')[0],
        returnDate: returnDate.toISOString().split('T')[0],
        items: items.map((i) => ({
          furnitureId: i.furnitureId || i.furniture?.id || i.id,
          durationMonths: selectedDuration,
        })),
      });

      // 2. Create payment via backend
      paymentData = await createPayment({ orderId: order.id, amount: total });

      // 3. Open Razorpay checkout
      const rzpResponse = await openCheckout({
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: 'Rent-A-Furniture',
        order_id: paymentData.razorpayOrderId,
        prefill: { name: user ? `${user.firstName} ${user.lastName}` : '', email: user?.email || '' },
      });

      // 4. Verify payment
      await verifyPayment({
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpayPaymentId: rzpResponse.razorpay_payment_id,
        razorpaySignature: rzpResponse.razorpay_signature,
      });

      toast.success('Payment successful!');
      navigate('/payment/result', { state: { success: true, orderId: order.id } });
    } catch (err) {
      // Handle payment failure - call failure endpoint
      if (paymentData && paymentData.razorpayOrderId) {
        try {
          await handleFailure(paymentData.razorpayOrderId);
        } catch (failureErr) {
          console.error('Failed to record payment failure:', failureErr);
        }
      }

      const msg = err?.message === 'Payment cancelled' ? 'Payment cancelled' : 'Checkout failed';
      toast.error(msg);
      navigate('/payment/result', { state: { success: false, error: msg, orderId: order?.id } });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    // Validate required fields
    if (!newAddress.fullName || !newAddress.phoneNumber || !newAddress.addressLine1 ||
        !newAddress.city || !newAddress.state || !newAddress.postalCode || !newAddress.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    createAddress(newAddress, {
      onSuccess: (data) => {
        // Select the newly created address
        setSelectedAddressId(data.id);
        // Reset form and close after successful creation
        setNewAddress({
          fullName: '',
          phoneNumber: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          isDefault: false,
        });
        setShowAddressForm(false);
      }
    });
  };

  if (loading || addressesLoading) return <Loader />;

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-brand-900">Checkout</h1>
      {items.length === 0 ? (
        <EmptyState title="Your cart is empty" message="Add furniture before checking out." />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Rental Duration Selection */}
            <Card className="p-5">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-brand-900">
                <Calendar className="h-5 w-5" /> Rental Duration
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDuration(option.value)}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedDuration === option.value
                        ? 'border-brand-500 bg-brand-50 text-brand-900'
                        : 'border-brand-200 hover:border-brand-300 text-brand-600'
                    }`}
                  >
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm">{formatCurrency(monthlyTotal * option.value)}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Rental Period Display */}
            <Card className="p-5">
              <h2 className="mb-4 font-semibold text-brand-900">Rental Period</h2>
              <div className="rounded-lg bg-brand-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-brand-600">Start Date</span>
                  <span className="font-medium text-brand-900">{formatDate(today)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-brand-600">End Date</span>
                  <span className="font-medium text-brand-900">{formatDate(returnDate)}</span>
                </div>
                <div className="flex items-center justify-between mt-2 border-t border-brand-200 pt-2">
                  <span className="text-brand-600">Duration</span>
                  <span className="font-semibold text-brand-900">{selectedDuration} month(s)</span>
                </div>
              </div>
            </Card>

            {/* Address Selection */}
            <Card className="p-5">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-brand-900">
                <MapPin className="h-5 w-5" /> Delivery Address
              </h2>
              {addresses.length === 0 ? (
                <p className="text-sm text-brand-500">No saved addresses. Add one to continue.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        selectedAddressId === address.id
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-brand-200 hover:border-brand-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-brand-900">{address.fullName}</p>
                        <p className="text-sm text-brand-600">{address.phoneNumber}</p>
                        <p className="text-sm text-brand-500">
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                        </p>
                        <p className="text-sm text-brand-500">
                          {address.city}, {address.state} - {address.postalCode}
                        </p>
                        <p className="text-sm text-brand-500">{address.country}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Address Form Modal */}
              {showAddressForm && (
                <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-brand-900">Add New Address</h3>
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="text-brand-400 hover:text-brand-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleAddAddress} className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-brand-700">Full Name *</label>
                      <input
                        type="text"
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        className="w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-brand-700">Phone Number *</label>
                      <input
                        type="tel"
                        value={newAddress.phoneNumber}
                        onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                        className="w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-brand-700">Address Line 1 *</label>
                      <input
                        type="text"
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        className="w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-brand-700">Address Line 2</label>
                      <input
                        type="text"
                        value={newAddress.addressLine2}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                        className="w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-brand-700">City *</label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-brand-700">State *</label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-brand-700">Postal Code *</label>
                        <input
                          type="text"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          className="w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-brand-700">Country *</label>
                        <input
                          type="text"
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                          className="w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                      />
                      <label htmlFor="isDefault" className="text-sm text-brand-700">Set as default address</label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">Save Address</Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowAddressForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              <Button
                onClick={() => setShowAddressForm(true)}
                variant="secondary"
                className="mt-4 w-full"
              >
                <Plus className="h-4 w-4" /> Add New Address
              </Button>
            </Card>

            {/* Order Items */}
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
          </div>

          {/* Payment Summary */}
          <Card className="h-fit p-5">
            <h2 className="mb-4 font-semibold text-brand-900">Payment summary</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-brand-600">Monthly total ({items.length} items)</span>
                <span className="font-medium text-brand-800">{formatCurrency(monthlyTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-600">Duration</span>
                <span className="font-medium text-brand-800">{selectedDuration} month(s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-600">Delivery fee</span>
                <span className="font-medium text-success-600">FREE</span>
              </div>
              <div className="flex items-center justify-between border-t border-brand-100 pt-2">
                <span className="font-semibold text-brand-900">Total</span>
                <span className="text-xl font-bold text-brand-900">{formatCurrency(total)}</span>
              </div>
            </div>
            {emptyError && <p className="mb-3 text-sm text-error-600">Your cart is empty.</p>}
            <Button onClick={handleCheckout} loading={submitting} className="mt-4 w-full">
              Pay {formatCurrency(total)}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
