export default function Select({ label, error, touched, id, children, className = '', ...props }) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="label-base">{label}</label>}
      <select
        id={inputId}
        className={`input-base appearance-none bg-white ${error && touched ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && touched && <p className="error-text">{error}</p>}
    </div>
  );
}
