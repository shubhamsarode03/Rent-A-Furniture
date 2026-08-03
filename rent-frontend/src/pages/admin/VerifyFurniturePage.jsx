import { useState } from 'react';
import { ShieldCheck, XCircle } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import { formatCurrency } from '@/utils/formatCurrency';
import { useAdminFurniture } from '@/hooks/useAdminFurniture';
import { furnitureApi } from '@/api/furnitureApi';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function VerifyFurniturePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useAdminFurniture('PENDING_APPROVAL', '', page);

  // Handle paginated responses
  const items = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const handleApprove = async (item) => {
    try {
      await furnitureApi.approveFurniture(item.id);
      toast.success(`${item.fname} approved`);
      queryClient.invalidateQueries({ queryKey: ['admin-furniture'] });
    } catch {
      toast.error('Could not approve listing');
    }
  };

  const handleReject = async (item) => {
    if (!confirm(`Reject "${item.fname}"?`)) return;
    try {
      await furnitureApi.rejectFurniture(item.id);
      toast.success(`${item.fname} rejected`);
      queryClient.invalidateQueries({ queryKey: ['admin-furniture'] });
    } catch {
      toast.error('Could not reject listing');
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <EmptyState title="Error loading listings" message="Please try again later." />;

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-brand-900">Verify furniture</h1>
      {items.length === 0 ? (
        <EmptyState title="All caught up" message="No listings are awaiting verification." icon={ShieldCheck} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="p-5">
                <h3 className="font-semibold text-brand-900">{item.fname}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-brand-500">{item.description}</p>
                <p className="mt-2 text-sm text-brand-600">{formatCurrency(item.pricePerMonth)}/mo</p>
                {item.ownerName && <p className="mt-1 text-xs text-brand-400">By {item.ownerName}</p>}
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => handleApprove(item)} className="flex-1">
                    <ShieldCheck className="h-4 w-4" /> Approve
                  </Button>
                  <Button onClick={() => handleReject(item)} className="flex-1" variant="outline">
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
