import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { furnitureApi } from '@/api/furnitureApi';
import { useCategories } from '@/hooks/useCategories';
import { useQueryClient } from '@tanstack/react-query';
import FurnitureForm from '@/components/furniture/FurnitureForm';
import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import { useForm } from '@/hooks/useForm';
import { validateEditFurniture } from '@/validation/furnitureValidation';
import { mapApiErrors } from '@/utils/mapApiErrors';
import toast from 'react-hot-toast';

export default function EditFurniturePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [loading, setLoading] = useState(true);
  const form = useForm({ fname: '', description: '', categoryId: '', pricePerMonth: '', imageUrl: '' }, validateEditFurniture);

  useEffect(() => {
    let active = true;
    furnitureApi.getFurnitureById(id)
      .then((item) => {
        if (!active) return;
        form.setFieldValue('fname', item.fname || '');
        form.setFieldValue('description', item.description || '');
        form.setFieldValue('categoryId', item.categoryId || '');
        form.setFieldValue('pricePerMonth', item.pricePerMonth || '');
        form.setFieldValue('imageUrl', item.imageUrl || '');
      })
      .catch(() => toast.error('Could not load listing'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (values) => {
    try {
      await furnitureApi.updateFurniture(id, {
        fname: values.fname,
        description: values.description,
        categoryId: Number(values.categoryId),
        pricePerMonth: Number(values.pricePerMonth),
        imageUrl: values.imageUrl || undefined,
      });
      toast.success('Listing updated');
      // Invalidate all furniture queries to ensure UI reflects latest data
      await queryClient.invalidateQueries({ queryKey: ['owner-furniture'] });
      await queryClient.invalidateQueries({ queryKey: ['furniture'] });
      await queryClient.invalidateQueries({ queryKey: ['furniture', id] });
      navigate('/lender/listings');
    } catch (err) {
      const { formErrors, general } = mapApiErrors(err);
      if (Object.keys(formErrors).length > 0) form.setErrors(formErrors);
      if (general) toast.error(general);
    }
  };

  if (loading || categoriesLoading) return <Loader />;

  return (
    <div className="container-page max-w-2xl py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-brand-900">Edit furniture</h1>
      <Card className="p-6">
        <FurnitureForm
          values={form.values}
          errors={form.errors}
          touched={form.touched}
          handleChange={form.handleChange}
          handleBlur={form.handleBlur}
          handleSubmit={form.handleSubmit(onSubmit)}
          isSubmitting={form.isSubmitting}
          categories={categories || []}
          submitLabel="Save changes"
        />
      </Card>
    </div>
  );
}
