import { useState, useEffect } from 'react';
import { userApi } from '@/api/userApi';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Loader from '@/components/common/Loader';
import { mapApiErrors } from '@/utils/mapApiErrors';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '', mobile: '', dob: '', role: '', roles: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    userApi.getUser(user.id)
      .then((u) => {
        if (!active) return;
        setValues({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          mobile: u.mobile || '',
          dob: u.dob || '',
          role: u.role || '',
          roles: u.roles || [],
        });
      })
      .catch(() => toast.error('Could not load profile'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user, token]);

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateUser(user.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        mobile: values.mobile,
        dob: values.dob,
      });
      toast.success('Profile updated');
    } catch (err) {
      const { general } = mapApiErrors(err);
      toast.error(general || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container-page max-w-2xl py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-brand-900">Your profile</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" name="firstName" value={values.firstName} onChange={handleChange} />
            <Input label="Last name" name="lastName" value={values.lastName} onChange={handleChange} />
          </div>
          <Input label="Email" name="email" type="email" value={values.email} onChange={handleChange} disabled />
          <div className="mb-4">
            <label className="label-base">Roles</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {values.roles && values.roles.length > 0 ? (
                values.roles.map((role) => (
                  <Badge key={role} tone="success">{role}</Badge>
                ))
              ) : (
                <Badge tone="neutral">{values.role || 'No roles assigned'}</Badge>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Mobile" name="mobile" type="tel" value={values.mobile} onChange={handleChange} />
            <Input label="Date of birth" name="dob" type="date" value={values.dob} onChange={handleChange} />
          </div>
          <Button type="submit" loading={saving}>Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
