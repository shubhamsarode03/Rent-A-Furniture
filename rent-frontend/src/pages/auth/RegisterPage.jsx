import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sofa } from 'lucide-react';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { validateRegister } from '@/validation/authValidation';
import { mapApiErrors } from '@/utils/mapApiErrors';
import { getLandingRouteForRole, ROLES } from '@/utils/constants';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (user) {
      navigate(getLandingRouteForRole(user.role), { replace: true });
    }
  }, [user, navigate]);

  const form = useForm(
    { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', dob: '', mobile: '', role: '' },
    validateRegister
  );

  const onSubmit = async (values) => {
    setSubmitError(null);
    try {
      const { confirmPassword, ...payload } = values;
      void confirmPassword;
      await register(payload);
      toast.success('Account created!');
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
          <h1 className="font-display text-2xl font-bold text-brand-900">Create your account</h1>
          <p className="mt-1 text-sm text-brand-500">Start renting or listing furniture</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-brand-100 bg-white p-6 shadow-card">
          {submitError && (
            <div className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700">{submitError}</div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" name="firstName" value={form.values.firstName} onChange={form.handleChange} onBlur={form.handleBlur} error={form.errors.firstName} touched={form.touched.firstName} />
            <Input label="Last name" name="lastName" value={form.values.lastName} onChange={form.handleChange} onBlur={form.handleBlur} error={form.errors.lastName} touched={form.touched.lastName} />
          </div>
          <Input label="Email" name="email" type="email" value={form.values.email} onChange={form.handleChange} onBlur={form.handleBlur} error={form.errors.email} touched={form.touched.email} placeholder="you@example.com" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Password" name="password" type="password" value={form.values.password} onChange={form.handleChange} onBlur={form.handleBlur} error={form.errors.password} touched={form.touched.password} />
            <Input label="Confirm" name="confirmPassword" type="password" value={form.values.confirmPassword} onChange={form.handleChange} onBlur={form.handleBlur} error={form.errors.confirmPassword} touched={form.touched.confirmPassword} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Date of birth" name="dob" type="date" value={form.values.dob} onChange={form.handleChange} onBlur={form.handleBlur} error={form.errors.dob} touched={form.touched.dob} />
            <Input label="Mobile" name="mobile" type="tel" value={form.values.mobile} onChange={form.handleChange} onBlur={form.handleBlur} error={form.errors.mobile} touched={form.touched.mobile} placeholder="10-digit" />
          </div>
          <Select label="Role" name="role" value={form.values.role} onChange={form.handleChange} onBlur={form.handleBlur} error={form.errors.role} touched={form.touched.role}>
            <option value="">Select a role</option>
            <option value={ROLES.RENTER}>Renter</option>
            <option value={ROLES.LENDER}>Lender</option>
          </Select>
          <Button type="submit" loading={form.isSubmitting} className="w-full">Create account</Button>
          <p className="text-center text-sm text-brand-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-800">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
