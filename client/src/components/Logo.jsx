import { cx } from '@/lib/format';

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cx('size-7', className)} aria-hidden>
      <rect width="32" height="32" rx="7" className="fill-accent" />
      <path d="M16 5.5 22.5 16 16 26.5 9.5 16Z" fill="none" className="stroke-on-accent" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.5 16h13" className="stroke-on-accent" strokeWidth="2" />
    </svg>
  );
}

export default function Logo({ className }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="font-serif text-[19px] font-semibold tracking-[-0.01em] text-ink">VajraAI</span>
    </span>
  );
}
