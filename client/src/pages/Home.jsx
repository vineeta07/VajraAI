import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { Button, RiskBadge } from '@/ui';
import { useAuth } from '@/lib/auth';

const STEPS = [
  ['Upload', 'Bring in payment records as CSV or JSON. Columns are checked in your browser and bad rows are listed before anything is saved.'],
  ['Analyse', 'A transformer autoencoder scores each payment against the rest; a rule engine adds checks for cost overruns and single-bidder awards.'],
  ['Review', 'Work through a ranked queue. Every flag comes with the reasons behind it, the vendor’s history and where it happened.'],
];

// Illustrative rows for the product preview — not live data.
const PREVIEW = [
  ['#1042', 'TechNova Systems', 'IT · Mumbai', '₹98,00,000', 'HIGH', '133% over the sanctioned estimate; single bidder'],
  ['#0977', 'GreenBuild Contractors', 'Public Works · Noida', '₹23,50,000', 'MEDIUM', 'Well above this vendor’s usual payment'],
  ['#0871', 'Sunrise Medical Supplies', 'Health · Jaipur', '₹1,85,000', 'LOW', 'In line with past payments'],
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const cta = isAuthenticated ? '/dashboard' : '/login';

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <title>VajraAI — find the public payments worth auditing</title>
      <header className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-1.5">
          <ThemeToggle />
          {!isAuthenticated && <Button variant="ghost" to="/register" className="hidden sm:inline-flex">Create account</Button>}
          <Button variant="secondary" to={cta}>{isAuthenticated ? 'Open dashboard' : 'Sign in'}</Button>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6">
        <section className="grid items-center gap-12 pt-14 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
          <div>
            <div className="eyebrow mb-5">Public spending review</div>
            <h1 className="font-serif text-[42px] leading-[1.08] font-semibold tracking-[-0.02em] text-ink sm:text-[56px]">
              Find the payments worth auditing.
            </h1>
            <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-ink-2">
              VajraAI reads procurement and payment records, ranks each one by how irregular it looks, and explains every flag in plain language — so audit time goes where it matters.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button size="lg" to={cta}>
                {isAuthenticated ? 'Open dashboard' : 'Get started'}
                <ArrowRight className="size-4" />
              </Button>
              <a href="#how" className="inline-flex h-11 items-center px-3 text-[15px] font-medium text-ink-2 hover:text-ink">How it works</a>
            </div>
          </div>

          <figure className="rounded-xl border border-line bg-surface shadow-pop" aria-label="Example of a review queue">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <span className="text-sm font-semibold text-ink">Review queue</span>
              <span className="text-xs text-ink-3">Example</span>
            </div>
            <ul className="divide-y divide-line">
              {PREVIEW.map(([id, vendor, meta, amount, risk, why]) => (
                <li key={id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs text-ink-3">{id}</span>
                        <span className="truncate text-sm font-medium text-ink">{vendor}</span>
                      </div>
                      <div className="mt-0.5 text-[13px] text-ink-3">{meta}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="num text-sm font-medium text-ink">{amount}</div>
                      <div className="mt-1"><RiskBadge level={risk} /></div>
                    </div>
                  </div>
                  <p className="mt-2.5 border-l-2 border-line-strong pl-3 text-[13px] text-ink-2">{why}</p>
                </li>
              ))}
            </ul>
          </figure>
        </section>

        <section id="how" className="scroll-mt-8 border-t border-line py-16">
          <h2 className="font-serif text-[28px] font-semibold text-ink">Three steps, no setup wizard</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <li key={t}>
                <div className="num font-mono text-[13px] text-ink-3">0{i + 1}</div>
                <h3 className="mt-2 text-[17px] font-semibold text-ink">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-10 border-t border-line py-16 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-[28px] font-semibold text-ink">What it checks</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-2">
              The score is relative: a payment is flagged because it doesn’t resemble the others in your data, not because it matches a fixed blacklist.
            </p>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {[
              ['Unusual amounts', 'Payments far above a vendor’s own average'],
              ['Cost overruns', 'Amount paid against the sanctioned estimate'],
              ['Thin competition', 'Contracts awarded on a single bid'],
              ['Payment clustering', 'Many payments to one vendor in a short span'],
            ].map(([t, d]) => (
              <div key={t} className="flex items-baseline justify-between gap-6 py-3.5">
                <dt className="text-[15px] font-medium text-ink">{t}</dt>
                <dd className="text-right text-sm text-ink-2">{d}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-3 px-6 py-6 text-[13px] text-ink-3">
          <span>© {new Date().getFullYear()} VajraAI</span>
          <span>A flag is a reason to look, not a finding of wrongdoing.</span>
          <Link to={cta} className="text-ink-2 hover:text-ink">{isAuthenticated ? 'Dashboard' : 'Sign in'}</Link>
        </div>
      </footer>
    </div>
  );
}
