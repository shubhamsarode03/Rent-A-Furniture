import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import OrderCard from '@/components/orders/OrderCard';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import Select from '@/components/common/Select';
import { ORDER_STATUS_LIST } from '@/utils/constants';

export default function MyOrdersPage() {
  const [page, setPage] = useState(0);
  const { data, loading, error } = useOrders(false, page);
  const [statusFilter, setStatusFilter] = useState('');

  // Handle paginated responses
  const ordersList = data?.content || data || [];
  const totalPages = data?.totalPages || 1;
  const filtered = statusFilter ? ordersList.filter((o) => o.status === statusFilter) : ordersList;

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-brand-900">My orders</h1>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {ORDER_STATUS_LIST.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <EmptyState title="Could not load orders" message="Please try again later." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No orders yet" message="When you rent furniture, your orders will appear here." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          {totalPages > 1 && !statusFilter && (
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
