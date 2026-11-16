import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button, Field, Input } from '@/ui';
import { describeError, loginRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { lowerFirst } from '@/lib/format';

export function AuthError({ error, onPreview }) {
  if (!error) return null;
  const unreachable = error.kind === 'offline' || error.kind === 'timeout' || error.kind === 'server';
  return (
    <div className="rounded-md border border-high/30 bg-high-soft px-4 py-3 text-sm text-high" role="alert">
      <strong className="font-semibold">{error.title}.</strong> {error.detail}
      {error.tech && unreachable && <code className="mt-1 block text-xs opacity-80">{error.tech}</code>}
      {unreachable && onPreview && (
        <button type="button" onClick={onPreview} className="mt-2 block font-semibold underline underline-offset-2">
          Open the app without signing in
        </button>
      )}
    </div>
  );
}

export function usePreviewLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  return () => {
    login({ token: 'local-preview', user: { name: 'Guest', email: 'guest@preview', role: 'Preview' } });
    navigate('/dashboard', { replace: true });
  };
}

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/dashboard';
  const preview = usePreviewLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await loginRequest({ email: email.trim(), password });
      login({ token: data.token, user: { ...data.user, email: email.trim() } });
      navigate(from, { replace: true });
    } catch (err) {
      const d = describeError(err);
      setError(d.kind === 'unauthorized' ? { ...d, title: 'Wrong email or password', detail: 'Check both and try again.' } : { ...d, title: `Can’t sign in: ${lowerFirst(d.title)}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Use the email and password for your VajraAI account."
      footer={<>New here? <Link to="/register" className="font-medium text-accent hover:underline">Create an account</Link></>}
    >
      <title>Sign in · VajraAI</title>
      <form onSubmit={submit} className="space-y-4" noValidate={false}>
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@department.gov.in" />
        </Field>
        <Field label="Password" htmlFor="password">
          <div className="relative">
            <Input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute top-1/2 right-1.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded text-ink-3 hover:text-ink">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
        <AuthError error={error} onPreview={preview} />
        <Button type="submit" size="lg" loading={busy} className="w-full">{busy ? 'Signing in…' : 'Sign in'}</Button>
      </form>
      <button type="button" onClick={preview} className="mt-4 w-full text-center text-[13px] text-ink-3 hover:text-ink">
        Just looking? <span className="underline underline-offset-2">Continue as a guest</span>
      </button>
    </AuthLayout>
  );
}
