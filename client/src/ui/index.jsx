import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cx } from '@/lib/format';

/* ---------- Button ---------- */
const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors disabled:opacity-50 select-none';
const buttonSizes = { sm: 'h-8 px-3 text-[13px]', md: 'h-9.5 px-4 text-sm', lg: 'h-11 px-5 text-[15px]' };
const buttonVariants = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-sunken',
  ghost: 'text-ink-2 hover:bg-sunken hover:text-ink',
  danger: 'bg-surface text-high border border-line-strong hover:bg-high-soft',
};

export function Button({ variant = 'primary', size = 'md', loading, icon: Icon, to, className, children, ...rest }) {
  const cls = cx(buttonBase, buttonSizes[size], buttonVariants[variant], className);
  const inner = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : Icon ? <Icon className="size-4" aria-hidden /> : null}
      {children}
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>;
  return <button type="button" className={cls} disabled={loading || rest.disabled} {...rest}>{inner}</button>;
}

/* ---------- Card ---------- */
export function Card({ className, children, ...rest }) {
  return <section className={cx('rounded-lg border border-line bg-surface', className)} {...rest}>{children}</section>;
}

export function CardHeader({ title, hint, action, className }) {
  return (
    <header className={cx('flex items-start justify-between gap-4 px-5 pt-4 pb-3', className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {hint && <p className="mt-0.5 text-[13px] text-ink-3">{hint}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

/* ---------- Page header ---------- */
export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 max-w-2xl">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="font-serif text-[28px] leading-tight font-semibold tracking-[-0.01em] text-ink sm:text-[32px]">{title}</h1>
        {description && <p className="mt-2 text-[15px] text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Risk ---------- */
const riskStyles = {
  HIGH: { cls: 'bg-high-soft text-high', dot: 'bg-high', label: 'High' },
  MEDIUM: { cls: 'bg-medium-soft text-medium', dot: 'bg-medium', label: 'Medium' },
  LOW: { cls: 'bg-low-soft text-low', dot: 'bg-low', label: 'Low' },
};

export function RiskBadge({ level }) {
  const s = riskStyles[level];
  if (!s) return <span className="rounded px-2 py-0.5 text-xs font-medium bg-sunken text-ink-3">Not analysed</span>;
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold', s.cls)}>
      <span className={cx('size-1.5 rounded-full', s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}

export function Tag({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'bg-sunken text-ink-2',
    accent: 'bg-accent-soft text-accent',
    high: 'bg-high-soft text-high',
    medium: 'bg-medium-soft text-medium',
    low: 'bg-low-soft text-low',
    info: 'bg-info-soft text-info',
  };
  return <span className={cx('inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>;
}

/* ---------- Stat ---------- */
export function Stat({ label, value, note, tone, loading, unavailable }) {
  const toneCls = { high: 'text-high', medium: 'text-medium', low: 'text-low' }[tone] || 'text-ink';
  return (
    <div className="px-5 py-4">
      <div className="text-[13px] text-ink-2">{label}</div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-24" />
      ) : (
        <div className={cx('num mt-1 font-serif text-[30px] leading-none font-semibold tracking-[-0.01em]', unavailable ? 'text-ink-3' : toneCls)}>
          {unavailable ? '—' : value}
        </div>
      )}
      <div className="mt-2 min-h-[18px] text-[12.5px] text-ink-3">{loading ? '' : note}</div>
    </div>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className }) {
  return <div className={cx('animate-shimmer rounded bg-sunken', className)} aria-hidden />;
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="divide-y divide-line" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="ml-auto h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

/* ---------- Form ---------- */
export function Field({ label, hint, error, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-ink">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-[13px] text-high">{error}</p> : hint ? <p className="mt-1.5 text-[13px] text-ink-3">{hint}</p> : null}
    </div>
  );
}

export const inputClass =
  'block h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-3 transition-colors hover:border-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

export function Input({ className, ...rest }) {
  return <input className={cx(inputClass, className)} {...rest} />;
}

/* ---------- Segmented control ---------- */
export function Segmented({ value, onChange, options, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border border-line-strong bg-surface p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cx(
              'h-8 rounded-[5px] px-3 text-[13px] font-medium transition-colors',
              active ? 'bg-ink text-bg' : 'text-ink-2 hover:text-ink'
            )}
          >
            {o.label}
            {o.count != null && <span className={cx('num ml-1.5', active ? 'opacity-70' : 'text-ink-3')}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Table ---------- */
export const th = 'px-5 py-2.5 text-left text-[12px] font-medium text-ink-3 whitespace-nowrap';
export const td = 'px-5 py-3 text-sm text-ink align-middle';
