import { Component } from 'react';
import { Button } from '@/ui';

/** Last line of defence: a rendering bug shows a message instead of a blank page. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Render error:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <h1 className="font-serif text-[28px] leading-tight font-semibold text-ink">Something went wrong on this page</h1>
        <p className="mt-3 text-[15px] text-ink-2">
          The app hit an unexpected error while drawing this screen. Your data hasn’t been changed. Reloading usually clears it.
        </p>
        <code className="mt-4 overflow-x-auto rounded bg-sunken px-3 py-2 text-xs text-ink-2">{String(error?.message || error)}</code>
        <div className="mt-6 flex gap-2">
          <Button onClick={() => window.location.reload()}>Reload</Button>
          <Button variant="secondary" onClick={() => window.location.assign('/dashboard')}>Go to overview</Button>
        </div>
      </div>
    );
  }
}
