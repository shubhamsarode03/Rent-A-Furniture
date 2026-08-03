import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import Card from '@/components/common/Card';
import Select from '@/components/common/Select';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { ORDER_STATUS_LIST } from '@/utils/constants';
import toast from 'react-hot-toast';

export default function AllOrdersPage() {
  const [page, setPage] = useState(0);
  const { data: orders, loading, error, updateStatus } = useOrders(true, page);
  const [statusFilter, setStatusFilter] = useState('');

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateStatus({ orderId, status });
      toast.success('Order status updated');
    } catch {
      toast.error('Could not update status');
    }
  };

  // Handle paginated responses
  const ordersList = orders?.content || orders || [];
  const totalPages = orders?.totalPages || 1;
  const filtered = statusFilter ? ordersList.filter((o) => o.status === statusFilter) : ordersList;

  if (loading) return <Loader />;
  if (error) return <EmptyState title="Could not load orders" message="Please try again later." />;

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-brand-900">All orders</h1>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {ORDER_STATUS_LIST.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No orders" message="Orders across all users will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white shadow-card">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-brand-100 bg-brand-50 text-brand-700">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-brand-50/50">
                  <td className="px-4 py-3 font-medium text-brand-900">#{order.id}</td>
                  <td className="px-4 py-3 text-brand-600">{formatDate(order.rentedOn || order.createdAt)}</td>
                  <td className="px-4 py-3 text-brand-700">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="w-36"
                    >
                      {ORDER_STATUS_LIST.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && !statusFilter && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}