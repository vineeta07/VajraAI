import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

const POINTS = [
  ['Scores every payment', 'A transformer autoencoder ranks each transaction by how far it departs from the rest.'],
  ['Explains each flag', 'Cost overruns, single-bidder awards and unusual amounts are written out in plain language.'],
  ['Tells you what’s missing', 'When a figure can’t be shown, the page says which step is incomplete and how to fix it.'],
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="VajraAI home"><Logo /></Link>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-10">
          <h1 className="font-serif text-[30px] leading-tight font-semibold text-ink">{title}</h1>
          <p className="mt-2 text-[15px] text-ink-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t border-line pt-5 text-sm text-ink-2">{footer}</div>}
        </div>
      </div>

      <aside className="hidden border-l border-line bg-surface lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div className="max-w-md">
          <div className="eyebrow mb-4">Public spending review</div>
          <p className="font-serif text-[26px] leading-[1.3] font-semibold text-ink">
            Find the payments that deserve an auditor’s time, and know why each one was picked.
          </p>
          <dl className="mt-10 space-y-6">
            {POINTS.map(([t, d], i) => (
              <div key={t} className="flex gap-4">
                <span className="num mt-0.5 font-mono text-[13px] text-ink-3">0{i + 1}</span>
                <div>
                  <dt className="text-[15px] font-medium text-ink">{t}</dt>
                  <dd className="mt-0.5 text-sm text-ink-2">{d}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}
