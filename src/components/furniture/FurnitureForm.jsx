import Input from '@/components/common/Input';
import TextArea from '@/components/common/TextArea';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';

export default function FurnitureForm({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, categories, submitLabel = 'Save' }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Name"
        name="fname"
        value={values.fname}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.fname}
        touched={touched.fname}
        placeholder="e.g. Mid-century lounge chair"
      />
      <TextArea
        label="Description"
        name="description"
        value={values.description}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.description}
        touched={touched.description}
        placeholder="Describe condition, dimensions, material…"
      />
      <Select
        label="Category"
        name="categoryId"
        value={values.categoryId}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.categoryId}
        touched={touched.categoryId}
      >
        <option value="">Select a category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </Select>
      <Input
        label="Monthly rent (₹)"
        name="pricePerMonth"
        type="number"
        min="0"
        step="1"
        value={values.pricePerMonth}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.pricePerMonth}
        touched={touched.pricePerMonth}
        placeholder="e.g. 1500"
      />
      <Input
        label="Image URL (optional)"
        name="imageUrl"
        value={values.imageUrl || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="https://…"
      />
      <Button type="submit" loading={isSubmitting} className="w-full">{submitLabel}</Button>
    </form>
  );
}
