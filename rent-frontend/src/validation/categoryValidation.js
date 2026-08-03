export function validateCategory(values) {
  const errors = {};
  if (!values.name) errors.name = 'Category name is required';
  else if (values.name.length > 60) errors.name = 'Name must be 60 characters or fewer';
  return errors;
}
