import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import { getLandingRouteForRole } from '@/utils/constants';

export default function NotFoundPage() {
  const { isAuthenticated, role } = useAuth();
  const home = isAuthenticated ? getLandingRouteForRole(role) : '/';

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-bold text-brand-300">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-brand-900">Page not found</h1>
      <p className="mt-2 text-brand-500">The page you're looking for doesn't exist.</p>
      <Link to={home} className="mt-6"><Button>Back home</Button></Link>
    </div>
  );
}
