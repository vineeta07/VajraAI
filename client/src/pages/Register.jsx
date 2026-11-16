import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import { Button, Field, Input, Segmented } from '@/ui';
import { describeError, loginRequest, registerRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { lowerFirst } from '@/lib/format';
import { AuthError, usePreviewLogin } from './Login';

export default function Register() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const preview = usePreviewLogin();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'AUDITOR' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const weak = form.password.length > 0 && form.password.length < 8;

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (weak) return;
    setBusy(true);
    setError(null);
    const email = form.email.trim();
    try {
      await registerRequest({ name: form.name.trim(), email, password: form.password, role: form.role });
      const data = await loginRequest({ email, password: form.password });
      login({ token: data.token, user: { ...data.user, email } });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const d = describeError(err);
      setError(
        d.kind === 'bad_request'
          ? { ...d, title: 'This account couldn’t be created', detail: 'An account with this email probably exists already. Try signing in instead.' }
          : { ...d, title: `Can’t create the account: ${lowerFirst(d.title)}` }
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Set up access for yourself. It takes under a minute."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-accent hover:underline">Sign in</Link></>}
    >
      <title>Create an account · VajraAI</title>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" htmlFor="name">
          <Input id="name" autoComplete="name" required maxLength={50} autoFocus value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Work email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" required maxLength={100} value={form.email} onChange={set('email')} placeholder="you@department.gov.in" />
        </Field>
        <Field label="Password" htmlFor="password" error={weak ? 'Use at least 8 characters.' : null} hint="At least 8 characters.">
          <Input id="password" type="password" autoComplete="new-password" required value={form.password} onChange={set('password')} />
        </Field>
        <Field label="Role">
          <Segmented
            label="Role"
            value={form.role}
            onChange={(role) => setForm((f) => ({ ...f, role }))}
            options={[{ value: 'AUDITOR', label: 'Auditor' }, { value: 'ADMIN', label: 'Administrator' }]}
          />
        </Field>
        <AuthError error={error} onPreview={preview} />
        <Button type="submit" size="lg" loading={busy} className="w-full">{busy ? 'Creating account…' : 'Create account'}</Button>
      </form>
    </AuthLayout>
  );
}
