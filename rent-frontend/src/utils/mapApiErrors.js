// Maps a backend error response (shape: { timestamp, status, message, path, errors[] })
// into a form's errors object keyed by field name. Falls back to a general message.
export function mapApiErrors(error) {
  const result = { formErrors: {}, general: null };

  if (!error) return result;

  const data = error.response && error.response.data;
  if (!data) {
    result.general = error.message || 'Something went wrong. Please try again.';
    return result;
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    data.errors.forEach((err) => {
      if (err && err.field) {
        result.formErrors[err.field] = err.message;
      } else if (err && err.defaultMessage) {
        result.general = err.defaultMessage;
      }
    });
  }

  if (!result.general && data.message) {
    result.general = data.message;
  }

  return result;
}
