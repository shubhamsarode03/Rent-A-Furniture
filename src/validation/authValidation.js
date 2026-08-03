export function validateLogin(values) {
  const errors = {};
  if (!values.email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
}

export function validateRegister(values) {
  const errors = {};
  if (!values.firstName) errors.firstName = 'First name is required';
  if (!values.lastName) errors.lastName = 'Last name is required';
  if (!values.email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 6) errors.password = 'Password must be at least 6 characters';
  else if (!/\d/.test(values.password)) errors.password = 'Password must contain at least one number';
  if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!values.mobile) errors.mobile = 'Mobile number is required';
  else if (!/^\d{10}$/.test(values.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number';
  if (!values.dob) errors.dob = 'Date of birth is required';
  if (!values.role) errors.role = 'Please select a role';
  return errors;
}
