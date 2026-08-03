import Badge from '@/components/common/Badge';
import { ORDER_STATUS } from '@/utils/constants';

const TONES = {
  PENDING: 'warning',
  CONFIRMED: 'accent',
  RENTED: 'neutral',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

export default function OrderStatusBadge({ status }) {
  const tone = TONES[status] || 'neutral';
  return <Badge tone={tone}>{ORDER_STATUS[status] || status}</Badge>;
}
