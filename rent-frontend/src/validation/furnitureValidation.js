export function validateCreateFurniture(values) {
  const errors = {};
  if (!values.fname) errors.fname = 'Name is required';
  else if (values.fname.length > 100) errors.fname = 'Name must be 100 characters or fewer';
  if (!values.description) errors.description = 'Description is required';
  else if (values.description.length > 1000) errors.description = 'Description must be 1000 characters or fewer';
  if (!values.categoryId) errors.categoryId = 'Category is required';
  if (values.pricePerMonth === '' || values.pricePerMonth === null || values.pricePerMonth === undefined) {
    errors.pricePerMonth = 'Price is required';
  } else if (Number(values.pricePerMonth) <= 0) {
    errors.pricePerMonth = 'Price must be a positive number';
  }
  return errors;
}

export const validateEditFurniture = validateCreateFurniture;
