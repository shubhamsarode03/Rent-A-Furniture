import { Sofa } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-white">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-brand-700">
          <Sofa className="h-5 w-5 text-brand-500" />
          <span className="font-display text-lg font-semibold">Rent-A-Furniture</span>
        </div>
        <p className="text-sm text-brand-500">Rent quality furniture for your space, on your terms.</p>
        <Link to="/" className="text-sm text-brand-600 hover:text-brand-800">Back to browse</Link>
      </div>
    </footer>
  );
}
