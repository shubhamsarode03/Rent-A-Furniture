import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/api/categoryApi';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { useForm } from '@/hooks/useForm';
import { validateCategory } from '@/validation/categoryValidation';
import { mapApiErrors } from '@/utils/mapApiErrors';
import toast from 'react-hot-toast';

export default function ManageCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
    staleTime: 30 * 60 * 1000,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const form = useForm({ name: '' }, validateCategory);

  const openCreate = () => {
    setEditing(null);
    form.reset();
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    form.setFieldValue('name', cat.name);
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await categoryApi.updateCategory(editing.id, values);
        toast.success('Category updated');
      } else {
        await categoryApi.createCategory(values);
        toast.success('Category created');
      }
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      const { formErrors, general } = mapApiErrors(err);
      if (Object.keys(formErrors).length > 0) form.setErrors(formErrors);
      if (general) toast.error(general);
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    try {
      await categoryApi.deleteCategory(cat.id);
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch {
      toast.error('Could not delete category');
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <EmptyState title="Error loading categories" message="Please try again later." />;

  const categoriesList = categories || [];

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-brand-900">Manage categories</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add category</Button>
      </div>

      {categoriesList.length === 0 ? (
        <EmptyState title="No categories" message="Create your first category." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white shadow-card">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead className="border-b border-brand-100 bg-brand-50 text-brand-700">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {categoriesList.map((cat) => (
                <tr key={cat.id} className="hover:bg-brand-50/50">
                  <td className="px-4 py-3 font-medium text-brand-900">{cat.name}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(cat)} className="mr-3 inline-flex items-center gap-1 text-brand-600 hover:text-brand-800">
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(cat)} className="inline-flex items-center gap-1 text-error-600 hover:text-error-700">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit category' : 'Add category'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Category name"
            name="name"
            value={form.values.name}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.name}
            touched={form.touched.name}
            placeholder="e.g. Sofas"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={form.isSubmitting}>{editing ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
