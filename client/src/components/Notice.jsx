import { AlertTriangle, CircleSlash, Info, ServerCrash } from 'lucide-react';
import { Button } from '@/ui';
import { cx } from '@/lib/format';

const icons = { empty: CircleSlash, error: ServerCrash, warning: AlertTriangle, info: Info };
const tones = {
  empty: 'bg-sunken text-ink-2',
  error: 'bg-high-soft text-high',
  warning: 'bg-medium-soft text-medium',
  info: 'bg-info-soft text-info',
};

/**
 * Used wherever data is missing. It always says *why* and, where possible,
 * what to do about it.
 */
export default function Notice({ kind = 'empty', title, children, tech, actions, compact, className }) {
  const Icon = icons[kind];
  return (
    <div className={cx('flex flex-col items-center text-center', compact ? 'px-5 py-8' : 'px-6 py-14', className)} role={kind === 'error' ? 'alert' : 'status'}>
      <span className={cx('mb-3 inline-flex size-10 items-center justify-center rounded-full', tones[kind])}>
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      {children && <div className="mt-1.5 max-w-md text-sm text-ink-2">{children}</div>}
      {tech && <code className="mt-3 max-w-full truncate rounded bg-sunken px-2 py-1 text-xs text-ink-2">{tech}</code>}
      {actions && <div className="mt-4 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}

/** Notice for a failed request, built from describeError(). */
export function ErrorNotice({ error, onRetry, compact }) {
  if (!error) return null;
  return (
    <Notice
      kind="error"
      compact={compact}
      title={error.title}
      tech={error.tech}
      actions={onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>}
    >
      {error.detail}
    </Notice>
  );
}
