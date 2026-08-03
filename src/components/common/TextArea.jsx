export default function TextArea({ label, error, touched, id, className = '', ...props }) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="label-base">{label}</label>}
      <textarea
        id={inputId}
        className={`input-base min-h-[100px] resize-y ${error && touched ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''} ${className}`}
        {...props}
      />
      {error && touched && <p className="error-text">{error}</p>}
    </div>
  );
}
