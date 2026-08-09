import { Link } from 'react-router-dom';
import Card from '@/components/common/Card';
import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

export default function OrderCard({ order }) {
  const itemCount = order.items ? order.items.length : (order.orderDetails ? order.orderDetails.length : (order.itemCount || 0));
  return (
    <Link to={`/orders/${order.id}`} className="block">
      <Card className="p-5 transition hover:shadow-card-hover">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-brand-400">Order #{order.id}</p>
            <h3 className="font-semibold text-brand-900">{formatDate(order.rentedOn || order.createdAt)}</h3>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-brand-500">{itemCount} item(s)</span>
          <span className="font-bold text-brand-800">{formatCurrency(order.totalAmount)}</span>
        </div>
      </Card>
    </Link>
  );
}
