import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { furnitureApi } from '@/api/furnitureApi';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import { formatCurrency } from '@/utils/formatCurrency';
import { useOwnerFurniture } from '@/hooks/useOwnerFurniture';
import toast from 'react-hot-toast';

const statusMap = {
  PENDING_APPROVAL: { label: 'Pending', tone: 'warning' },
  AVAILABLE: { label: 'Available', tone: 'success' },
  RENTED: { label: 'Rented', tone: 'neutral' },
  REJECTED: { label: 'Rejected', tone: 'error' },
  INACTIVE: { label: 'Inactive', tone: 'neutral' },
};

export default function MyListingsPage() {
  const [page, setPage] = useState(0);
  const { data: items, loading, error, refetch } = useOwnerFurniture(null, '', page);

  // Filter out INACTIVE items from display
  const activeItems = items?.content?.filter(item => item.status !== 'INACTIVE') || items?.filter(item => item.status !== 'INACTIVE') || [];

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.fname}"?`)) return;
    try {
      await furnitureApi.deleteFurniture(item.id);
      toast.success('Listing deleted');
      await refetch();
    } catch (err) {
      const error = err.response?.data?.message || 'Could not delete listing';
      toast.error(error);
    }
  };

  // Handle paginated responses
  const itemsList = activeItems;
  const totalPages = items?.totalPages || 1;

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-900">My listings</h1>
          <p className="mt-1 text-brand-500">Manage the furniture you rent out.</p>
        </div>
        <Link to="/lender/add"><Button><Plus className="h-4 w-4" /> Add furniture</Button></Link>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <EmptyState title="Could not load listings" message="Please try again later." />
      ) : itemsList.length === 0 ? (
        <EmptyState title="No listings yet" message="Add your first piece of furniture to rent." action={<Link to="/lender/add"><Button>Add furniture</Button></Link>} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white shadow-card">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-brand-100 bg-brand-50 text-brand-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {itemsList.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-50/50">
                    <td className="px-4 py-3 font-medium text-brand-900">{item.fname}</td>
                    <td className="px-4 py-3 text-brand-700">{formatCurrency(item.pricePerMonth)}/mo</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusMap[item.status]?.tone || 'neutral'}>
                        {statusMap[item.status]?.label || item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link 
                        to={`/lender/edit/${item.id}`} 
                        className={`mr-2 inline-flex items-center gap-1 ${item.status === 'RENTED' ? 'text-brand-300 cursor-not-allowed' : 'text-brand-600 hover:text-brand-800'}`}
                        onClick={(e) => item.status === 'RENTED' && e.preventDefault()}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(item)} 
                        className={`inline-flex items-center gap-1 ${item.status === 'RENTED' ? 'text-brand-300 cursor-not-allowed' : 'text-error-600 hover:text-error-700'}`}
                        disabled={item.status === 'RENTED'}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
