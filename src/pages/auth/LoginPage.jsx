import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sofa } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { validateLogin } from '@/validation/authValidation';
import { mapApiErrors } from '@/utils/mapApiErrors';
import { getLandingRouteForRole } from '@/utils/constants';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState(null);

  // Preferred fix: redirect is derived from auth state via useEffect, not inline
  // after submit. Fires both for a just-logged-in user and a logged-in user
  // visiting /login directly.
  useEffect(() => {
    if (user) {
      navigate(getLandingRouteForRole(user.role), { replace: true });
    }
  }, [user, navigate]);

  const form = useForm({ email: '', password: '' }, validateLogin);

  const onSubmit = async (values) => {
    setSubmitError(null);
    try {
      await login(values.email, values.password);
      toast.success('Welcome back!');
      // No navigate() here — the useEffect above handles redirect once `user` updates.
    } catch (err) {
      const { formErrors, general } = mapApiErrors(err);
      if (Object.keys(formErrors).length > 0) form.setErrors(formErrors);
      if (general) {
        setSubmitError(general);
        toast.error(general);
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <Sofa className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-900">Welcome back</h1>
          <p className="mt-1 text-sm text-brand-500">Sign in to manage your rentals</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-brand-100 bg-white p-6 shadow-card">
          {submitError && (
            <div className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700">{submitError}</div>
          )}
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.values.email}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.email}
            touched={form.touched.email}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.values.password}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.password}
            touched={form.touched.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <Button type="submit" loading={form.isSubmitting} className="w-full">Sign in</Button>
          <p className="text-center text-sm text-brand-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-800">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
