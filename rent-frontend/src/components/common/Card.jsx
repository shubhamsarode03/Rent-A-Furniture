export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`rounded-xl border border-brand-100 bg-white shadow-card ${className}`} {...props}>
      {children}
    </div>
  );
}
