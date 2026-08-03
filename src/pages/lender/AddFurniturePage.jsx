import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { furnitureApi } from '@/api/furnitureApi';
import FurnitureForm from '@/components/furniture/FurnitureForm';
import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import { useForm } from '@/hooks/useForm';
import { validateCreateFurniture } from '@/validation/furnitureValidation';
import { mapApiErrors } from '@/utils/mapApiErrors';
import toast from 'react-hot-toast';

export default function AddFurniturePage() {
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const form = useForm({ fname: '', description: '', categoryId: '', pricePerMonth: '', imageUrl: '' }, validateCreateFurniture);

  if (categoriesLoading) {
    return (
      <div className="container-page max-w-2xl py-8">
        <Loader />
      </div>
    );
  }

  const onSubmit = async (values) => {
    try {
      await furnitureApi.createFurniture({
        fname: values.fname,
        description: values.description,
        categoryId: Number(values.categoryId),
        pricePerMonth: Number(values.pricePerMonth),
        imageUrl: values.imageUrl || undefined,
      });
      toast.success('Furniture added');
      navigate('/lender/listings');
    } catch (err) {
      const { formErrors, general } = mapApiErrors(err);
      if (Object.keys(formErrors).length > 0) form.setErrors(formErrors);
      if (general) toast.error(general);
    }
  };

  return (
    <div className="container-page max-w-2xl py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-brand-900">Add furniture</h1>
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
          submitLabel="Add listing"
        />
      </Card>
    </div>
  );
}
