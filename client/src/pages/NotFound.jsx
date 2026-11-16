import Logo from '@/components/Logo';
import { Button } from '@/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-1 flex-col px-6 py-6">
      <title>Page not found · VajraAI</title>
      <Logo />
      <div className="mx-auto flex max-w-md flex-1 flex-col justify-center">
        <div className="font-mono text-[13px] text-ink-3">404</div>
        <h1 className="mt-2 font-serif text-[32px] leading-tight font-semibold text-ink">This page doesn’t exist</h1>
        <p className="mt-3 text-[15px] text-ink-2">The address may be mistyped, or the page may have been moved.</p>
        <div className="mt-7 flex gap-2">
          <Button to="/dashboard">Go to overview</Button>
          <Button variant="secondary" to="/">Home</Button>
        </div>
      </div>
    </div>
  );
}
