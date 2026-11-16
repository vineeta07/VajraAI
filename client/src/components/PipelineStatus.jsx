import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Check, CircleDashed, Minus, Play, RefreshCw, Upload, X } from 'lucide-react';
import { Button, Card } from '@/ui';
import { API_LABEL, describeError, runAnalysis } from '@/lib/api';
import { STAGE_ORDER } from '@/lib/pipeline';
import { cx, formatInt, plural, timeAgo } from '@/lib/format';

export function useRunAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: runAnalysis,
    onSuccess: (data) => {
      toast.success(`Analysis finished — ${plural(data.analyzed ?? 0, 'transaction')} scored`);
      qc.invalidateQueries();
    },
  });
}

/** Explains an analysis failure in terms of what the analysis needs. */
export function analysisFailure(error, pipeline) {
  const e = describeError(error);
  if (!e) return null;
  if (e.kind === 'bad_request') {
    return { ...e, title: 'There is nothing to analyse', detail: 'No transactions are stored yet. Upload a file first.' };
  }
  if (e.kind === 'server') {
    const mlDown = pipeline?.data?.ml === false;
    return {
      ...e,
      title: 'The analysis could not be completed',
      detail: mlDown
        ? 'The scoring model didn’t answer. The server passes every transaction to the Python ML service, and that service is not reachable right now.'
        : 'The server failed while scoring. This almost always means the Python ML service isn’t running or ML_SERVICE_URL in server/.env points to the wrong place.',
    };
  }
  return e;
}

function StepIcon({ state }) {
  const map = {
    done: ['bg-low-soft text-low', Check],
    fail: ['bg-high-soft text-high', X],
    todo: ['bg-medium-soft text-medium', CircleDashed],
    blocked: ['bg-sunken text-ink-3', Minus],
  };
  const [cls, Icon] = map[state];
  return (
    <span className={cx('mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full', cls)}>
      <Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
    </span>
  );
}

/**
 * The full explanation shown in place of the dashboard when numbers can't be
 * displayed: a four-step checklist with the failing step called out.
 */
export default function PipelineStatus({ pipeline }) {
  const navigate = useNavigate();
  const analyse = useRunAnalysis();
  const [showTech, setShowTech] = useState(false);
  const { stage, data, error } = pipeline;
  const failAt = STAGE_ORDER.indexOf(stage);
  const failure = analyse.error ? analysisFailure(analyse.error, pipeline) : null;

  const stateOf = (i) => {
    if (failAt === -1 || i < failAt) return 'done';
    if (i > failAt) return 'blocked';
    return i < 2 ? 'fail' : 'todo';
  };

  const headline = {
    api: 'There are no figures to show because the app can’t reach its server',
    database: 'There are no figures to show because the server can’t read its database',
    upload: 'There are no figures to show because no transactions have been uploaded',
    analysis: 'There are no figures to show because the analysis hasn’t been run',
  }[stage];

  const steps = [
    {
      title: 'API server is reachable',
      done: 'The server is answering requests.',
      problem: (
        <>
          {error?.detail || `Nothing answered at ${API_LABEL}.`}
          <Fix>
            In a terminal, run <code>npm run dev</code> inside the <code>server</code> folder. If the API is hosted elsewhere, set{' '}
            <code>VITE_API_URL</code> in <code>client/.env</code> and rebuild.
          </Fix>
        </>
      ),
    },
    {
      title: 'Database is connected',
      done: 'The server can query PostgreSQL.',
      problem: (
        <>
          The server is running, but its database query failed. The tables may not exist yet, or the connection string is wrong.
          <Fix>
            Check <code>DB_CONNECTION_STRING</code> in <code>server/.env</code>, then run <code>node db/dbSetup.js</code> once to create the tables.
          </Fix>
        </>
      ),
    },
    {
      title: 'Transactions are uploaded',
      done: data ? `${plural(data.transactions, 'transaction')} stored.` : '',
      problem: 'The database is empty. Upload a CSV or JSON file of payments and VajraAI will have something to examine.',
      action: <Button icon={Upload} onClick={() => navigate('/upload')}>Upload transactions</Button>,
    },
    {
      title: 'Analysis has been run',
      done: data?.lastAnalysis ? `Last run ${timeAgo(data.lastAnalysis)}.` : 'Every transaction has a risk score.',
      problem: data
        ? `${plural(data.transactions, 'transaction is', 'transactions are')} stored but none has a risk score yet. Scores, charts and the risk map are produced by the analysis step.`
        : '',
      action: (
        <Button icon={Play} loading={analyse.isPending} onClick={() => analyse.mutate()}>
          {analyse.isPending ? 'Analysing…' : 'Run analysis'}
        </Button>
      ),
    },
  ];

  const tech = error?.tech || data?.dbError;

  return (
    <Card className="animate-rise overflow-hidden" data-tour="status">
      <div className="border-b border-line px-6 py-5">
        <div className="eyebrow mb-1.5">Why this page is empty</div>
        <h2 className="max-w-2xl font-serif text-[21px] leading-snug font-semibold text-ink">{headline}</h2>
      </div>

      <ol className="divide-y divide-line">
        {steps.map((s, i) => {
          const state = stateOf(i);
          const active = i === failAt;
          return (
            <li key={s.title} className={cx('flex gap-4 px-6 py-4', active && 'bg-sunken/60')}>
              <StepIcon state={state} />
              <div className="min-w-0 flex-1">
                <div className={cx('text-[15px] font-medium', state === 'blocked' ? 'text-ink-3' : 'text-ink')}>{s.title}</div>
                {state === 'done' && <p className="mt-0.5 text-sm text-ink-3">{s.done}</p>}
                {state === 'blocked' && <p className="mt-0.5 text-sm text-ink-3">Can’t be checked until the step above is fixed.</p>}
                {active && (
                  <>
                    <div className="mt-1 max-w-2xl text-sm text-ink-2">{s.problem}</div>
                    {i === 3 && failure && (
                      <div className="mt-3 max-w-2xl rounded-md border border-high/30 bg-high-soft px-3.5 py-2.5 text-sm text-high" role="alert">
                        <strong className="font-semibold">{failure.title}.</strong> {failure.detail}
                        {failure.tech && <code className="mt-1 block text-xs opacity-80">{failure.tech}</code>}
                      </div>
                    )}
                    <div className="mt-3.5 flex flex-wrap items-center gap-2">
                      {s.action}
                      <Button variant="secondary" icon={RefreshCw} loading={pipeline.isFetching} onClick={() => pipeline.refetch()}>
                        Check again
                      </Button>
                      {tech && i < 2 && (
                        <button className="ml-1 text-[13px] text-ink-3 underline underline-offset-2 hover:text-ink" onClick={() => setShowTech((v) => !v)}>
                          {showTech ? 'Hide' : 'Show'} technical detail
                        </button>
                      )}
                    </div>
                    {showTech && tech && i < 2 && (
                      <pre className="mt-3 max-w-2xl overflow-x-auto rounded-md bg-sunken px-3 py-2 font-mono text-xs text-ink-2">{tech}</pre>
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function Fix({ children }) {
  return (
    <div className="mt-2.5 rounded-md border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink-2">
      <span className="font-semibold text-ink">How to fix it. </span>
      {children}
    </div>
  );
}

/** Thin banner shown on ready pages when newer uploads haven't been scored. */
export function StaleBanner({ pipeline }) {
  const analyse = useRunAnalysis();
  if (!pipeline.ready || pipeline.pendingAnalysis === 0) return null;
  const failure = analyse.error ? analysisFailure(analyse.error, pipeline) : null;
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-medium/30 bg-medium-soft px-4 py-3 text-sm text-medium">
      <span>
        <strong className="font-semibold">{formatInt(pipeline.pendingAnalysis)} uploaded {pipeline.pendingAnalysis === 1 ? 'transaction has' : 'transactions have'} no score yet.</strong>{' '}
        {failure ? `${failure.title}: ${failure.detail}` : 'The figures below leave them out until you run the analysis again.'}
      </span>
      <Button size="sm" variant="secondary" icon={Play} loading={analyse.isPending} onClick={() => analyse.mutate()}>
        Run analysis
      </Button>
    </div>
  );
}

/** Small pill for the top bar. */
export function PipelinePill({ pipeline }) {
  const map = {
    checking: ['bg-sunken text-ink-3', 'bg-ink-3', 'Checking…'],
    api: ['bg-high-soft text-high', 'bg-high', 'Server offline'],
    database: ['bg-high-soft text-high', 'bg-high', 'Database error'],
    upload: ['bg-medium-soft text-medium', 'bg-medium', 'No data yet'],
    analysis: ['bg-medium-soft text-medium', 'bg-medium', 'Analysis pending'],
    ready: ['bg-low-soft text-low', 'bg-low', 'Up to date'],
  };
  const stale = pipeline.ready && pipeline.pendingAnalysis > 0;
  const [cls, dot, text] = stale ? map.analysis : map[pipeline.stage];
  return (
    <span className={cx('inline-flex h-7 items-center gap-2 rounded-full px-3 text-[12.5px] font-medium', cls)} data-tour="pill">
      <span className={cx('size-1.5 rounded-full', dot)} aria-hidden />
      {stale ? 'New data not analysed' : text}
    </span>
  );
}
