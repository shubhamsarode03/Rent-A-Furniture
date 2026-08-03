import { useState, useCallback } from 'react';

// Shared plain-state form helper. Not a validation library — just boilerplate
// wiring for values/errors/touched/isSubmitting around a caller-supplied validate fn.
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? value : value;
    setValues((prev) => ({ ...prev, [name]: val }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (validate) {
      setErrors(validate(values));
    }
  }, [validate, values]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

  const runValidation = useCallback(() => {
    if (!validate) return {};
    const nextErrors = validate(values);
    setErrors(nextErrors);
    return nextErrors;
  }, [validate, values]);

  const handleSubmit = useCallback((onValidSubmit) => async (e) => {
    if (e) e.preventDefault();
    const nextErrors = runValidation();
    setTouched(Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    if (Object.keys(nextErrors).length > 0) return;
    setIsSubmitting(true);
    try {
      await onValidSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [initialValues, runValidation]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setErrors,
    reset,
  };
}
