import { useState } from 'react';
import { useFurnitureList } from '@/hooks/useFurnitureList';
import { useCategories } from '@/hooks/useCategories';
import FurnitureCard from '@/components/furniture/FurnitureCard';
import FurnitureFilters from '@/components/furniture/FurnitureFilters';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

export default function BrowseFurniturePage() {
  const { user, permissions } = useAuth();
  const canAdd = Boolean(user) && permissions.canUseCart;
  const { addItem } = useCart();
  const { data: categories } = useCategories();
  
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({});

  const { data, isLoading, error } = useFurnitureList(filters, page);

  const handleAddToCart = async (item) => {
    try {
      await addItem({ furnitureId: item.id });
      toast.success(`${item.fname} added to cart`);
    } catch {
      toast.error('Could not add to cart');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  if (isLoading) {
    return (
      <div className="container-page py-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-8">
        <EmptyState title="Could not load furniture" message="Please try again in a moment." />
      </div>
    );
  }

  const furnitureItems = data?.content || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-brand-900">Browse furniture</h1>
        <p className="mt-1 text-brand-500">Find quality pieces to rent for your space.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside>
          <FurnitureFilters filters={filters} setFilters={handleFilterChange} categories={categories} />
        </aside>

        <section>
          {furnitureItems.length === 0 ? (
            <EmptyState title="No furniture found" message="Try adjusting your filters." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {furnitureItems.map((item) => (
                  <FurnitureCard key={item.id} item={item} onAddToCart={handleAddToCart} canAdd={canAdd} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
