import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Package, ClipboardList, ShieldCheck } from 'lucide-react';
import { furnitureApi } from '@/api/furnitureApi';
import { orderApi } from '@/api/orderApi';
import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { formatCurrency } from '@/utils/formatCurrency';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminDashboardPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: furnitureData, isLoading: furnitureLoading } = useQuery({
    queryKey: ['furniture'],
    queryFn: furnitureApi.getFurniture,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: false,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', true],
    queryFn: () => orderApi.getAllOrders({ page: 0, size: 100 }),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  if (furnitureLoading || ordersLoading) return <Loader />;

  // Handle paginated responses
  const furnitureList = furnitureData?.content || furnitureData || [];
  const ordersList = ordersData?.content || ordersData || [];

  const stats = {
    furniture: furnitureList.length,
    pending: furnitureList.filter((f) => f.status === 'PENDING_APPROVAL').length,
    orders: ordersList.length,
    revenue: ordersList.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
  };

  const cards = [
    { label: 'Total furniture', value: stats.furniture, icon: Package, tone: 'bg-brand-100 text-brand-700' },
    { label: 'Pending verifications', value: stats.pending, icon: ShieldCheck, tone: 'bg-warning-100 text-warning-700', to: '/admin/verify' },
    { label: 'Total orders', value: stats.orders, icon: ClipboardList, tone: 'bg-accent-100 text-accent-700', to: '/admin/orders' },
    { label: 'Revenue', value: formatCurrency(stats.revenue), icon: Users, tone: 'bg-success-100 text-success-700' },
  ];

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-brand-900">Admin dashboard</h1>

      {stats.pending > 0 && (
        <Link to="/admin/verify" className="mb-6 block">
          <Card className="flex flex-col sm:flex-row items-center justify-between gap-3 border-warning-200 bg-warning-50 p-5 transition hover:shadow-card-hover">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-warning-500 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-brand-900">{stats.pending} listing(s) awaiting verification</p>
                <p className="text-sm text-brand-600">Click to review now</p>
              </div>
            </div>
            <span className="text-sm font-medium text-warning-700 whitespace-nowrap">Review →</span>
          </Card>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          const content = (
            <Card className="p-5 transition hover:shadow-card-hover">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-brand-900 truncate">{c.value}</p>
              <p className="text-sm text-brand-500">{c.label}</p>
            </Card>
          );
          return c.to ? <Link key={c.label} to={c.to}>{content}</Link> : <div key={c.label}>{content}</div>;
        })}
      </div>
    </div>
  );
}
