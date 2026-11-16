import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Button } from '@/ui';
import { LogoMark } from './Logo';

const STEPS = [
  {
    welcome: true,
    title: 'Welcome to VajraAI',
    body: 'VajraAI reads payment records, scores each one for irregularity, and tells you which deserve an auditor’s attention. This tour takes about a minute.',
  },
  {
    target: 'nav-upload',
    route: '/upload',
    title: 'Start by uploading payments',
    body: 'Bring in a CSV or JSON export from your finance system. You get a preview and a column check before anything is saved.',
  },
  {
    target: 'analyse',
    route: '/upload',
    title: 'Then run the analysis',
    body: 'This sends every stored transaction through the anomaly model and the rule engine. Nothing is scored until you press it.',
  },
  {
    target: 'nav-overview',
    route: '/dashboard',
    title: 'Overview shows where the risk is',
    body: 'Totals, the split of high / medium / low risk, the departments and vendors involved, and the most recent flags.',
  },
  {
    target: 'pill',
    route: '/dashboard',
    title: 'If a page is empty, it tells you why',
    body: 'This indicator tracks the server, the database, your data and the analysis. When a figure can’t be shown, the page names the step that is missing and how to fix it.',
  },
  {
    target: 'nav-anomalies',
    route: '/anomalies',
    title: 'Anomalies is your work queue',
    body: 'Every flagged transaction, most suspicious first. Open one to read the reasons it was flagged in plain language.',
  },
  {
    target: 'nav-vendors',
    route: '/vendors',
    title: 'Vendors groups flags by payee',
    body: 'See who has been paid, how much, and how many of their payments were flagged.',
  },
  {
    target: 'nav-map',
    route: '/risk-map',
    title: 'Risk map shows where flags cluster',
    body: 'Flagged payments plotted by the location recorded on each transaction.',
  },
  {
    target: 'help',
    title: 'That’s the tour',
    body: 'You can replay it any time from this button. A good first step now: upload a file.',
    last: true,
  },
];

const PAD = 6;
const CARD_W = 340;

function useTargetRect(step) {
  const [rect, setRect] = useState(null);
  const { pathname } = useLocation();

  const measure = useCallback(() => {
    if (!step?.target) return setRect(null);
    const nodes = document.querySelectorAll(`[data-tour="${step.target}"]`);
    const el = Array.from(nodes).find((n) => n.getClientRects().length > 0);
    if (!el) return setRect(null);
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useLayoutEffect(() => {
    // Reading layout after paint is the point of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    measure();
    // Routes are lazy; the target may mount a little later.
    const timers = [80, 250, 600].map((t) => setTimeout(measure, t));
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure, pathname]);

  return rect;
}

export default function Tour({ onClose }) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const cardRef = useRef(null);
  const step = STEPS[index];
  const rect = useTargetRect(step);

  useEffect(() => {
    if (step.route && pathname !== step.route) navigate(step.route);
  }, [step, pathname, navigate]);

  const finish = useCallback(
    (goUpload) => {
      onClose();
      if (goUpload) navigate('/upload');
    },
    [onClose, navigate]
  );
  const next = useCallback(() => setIndex((i) => Math.min(i + 1, STEPS.length - 1)), []);
  const back = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') finish(false);
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish, next, back]);

  useEffect(() => {
    cardRef.current?.focus();
  }, [index]);

  const centered = step.welcome || !rect;
  let cardStyle = {};
  if (!centered) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(CARD_W, vw - 24);
    const roomRight = vw - (rect.left + rect.width) - 20;
    if (roomRight >= w + 8) {
      cardStyle = { left: rect.left + rect.width + 16, top: Math.max(12, Math.min(rect.top - 8, vh - 260)) };
    } else {
      const below = rect.top + rect.height + 14;
      const fitsBelow = below + 230 < vh;
      cardStyle = {
        left: Math.max(12, Math.min(rect.left + rect.width / 2 - w / 2, vw - w - 12)),
        ...(fitsBelow ? { top: below } : { bottom: vh - rect.top + 14 }),
      };
    }
    cardStyle.width = w;
  }

  return createPortal(
    <div className="fixed inset-0 z-[2000]" role="dialog" aria-modal="true" aria-label="Product walkthrough">
      {centered ? (
        <div className="absolute inset-0 bg-black/55" onClick={() => finish(false)} />
      ) : (
        <>
          <div className="absolute inset-0" onClick={() => finish(false)} />
          <div
            className="pointer-events-none absolute rounded-lg transition-all duration-300 ease-out"
            style={{
              top: rect.top - PAD,
              left: rect.left - PAD,
              width: rect.width + PAD * 2,
              height: rect.height + PAD * 2,
              boxShadow: '0 0 0 9999px rgb(0 0 0 / 0.55), 0 0 0 2px var(--accent)',
            }}
          />
        </>
      )}

      <div
        ref={cardRef}
        tabIndex={-1}
        key={index}
        className={`animate-rise absolute rounded-xl border border-line bg-surface shadow-pop outline-none ${
          centered ? 'top-1/2 left-1/2 w-[min(440px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2' : ''
        }`}
        style={centered ? { animationName: 'none' } : cardStyle}
      >
        <button
          onClick={() => finish(false)}
          aria-label="Close walkthrough"
          className="absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink"
        >
          <X className="size-4" />
        </button>

        <div className={step.welcome ? 'px-7 pt-7 pb-6' : 'px-5 pt-5 pb-4'}>
          {step.welcome && <LogoMark className="mb-5 size-10" />}
          {!step.welcome && (
            <div className="eyebrow mb-1.5">
              Step {index} of {STEPS.length - 1}
            </div>
          )}
          <h2 className={`pr-6 font-serif font-semibold text-ink ${step.welcome ? 'text-2xl' : 'text-[18px] leading-snug'}`}>{step.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{step.body}</p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          {step.welcome ? (
            <button onClick={() => finish(false)} className="text-[13px] text-ink-3 hover:text-ink">
              Skip for now
            </button>
          ) : (
            <div className="flex gap-1" aria-hidden>
              {STEPS.slice(1).map((_, i) => (
                <span key={i} className={`h-1 rounded-full transition-all ${i + 1 === index ? 'w-4 bg-accent' : 'w-1 bg-line-strong'}`} />
              ))}
            </div>
          )}
          <div className="flex gap-2">
            {index > 0 && (
              <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={back}>
                Back
              </Button>
            )}
            {step.last ? (
              <Button size="sm" onClick={() => finish(true)}>
                Go to upload
              </Button>
            ) : (
              <Button size="sm" onClick={next}>
                {step.welcome ? 'Show me around' : 'Next'}
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
