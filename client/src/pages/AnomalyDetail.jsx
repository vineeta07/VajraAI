import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardHeader, RiskBadge, Skeleton } from '@/ui';
import Notice, { ErrorNotice } from '@/components/Notice';
import { describeError, fetchAnomaly } from '@/lib/api';
import { formatDate, formatDateTime, formatINR } from '@/lib/format';

function Row({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-6 px-5 py-3">
      <dt className="shrink-0 text-sm text-ink-3">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-ink">{children}</dd>
    </div>
  );
}

const lead = {
  HIGH: 'This transaction is among the most unusual in the dataset and should be audited first.',
  MEDIUM: 'This transaction is unusual enough to warrant a second look.',
  LOW: 'This transaction looks routine compared with the rest of the dataset.',
};

export default function AnomalyDetail() {
  const { id } = useParams();
  const query = useQuery({ queryKey: ['anomaly', id], queryFn: () => fetchAnomaly(id), retry: false });
  const a = query.data;
  const back = (
    <Link to="/anomalies" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-ink">
      <ArrowLeft className="size-4" /> Anomalies
    </Link>
  );

  if (query.isPending) {
    return <>{back}<Skeleton className="h-10 w-80" /><Skeleton className="mt-6 h-72 w-full" /></>;
  }
  if (query.isError) {
    const e = describeError(query.error);
    return (
      <>
        {back}
        <Card>
          {e.kind === 'not_found' ? (
            <Notice title={`Transaction #${id} has no analysis result`} actions={<Button size="sm" variant="secondary" to="/anomalies">Back to the queue</Button>}>
              Either this ID doesn’t exist, or it was uploaded after the last analysis and hasn’t been scored yet. Re-running the analysis replaces all previous results.
            </Notice>
          ) : (
            <ErrorNotice error={e} onRetry={query.refetch} />
          )}
        </Card>
      </>
    );
  }

  const reasons = Array.isArray(a.reason) ? a.reason : a.reason ? [a.reason] : [];
  const est = a.estimated_cost != null ? Number(a.estimated_cost) : null;
  const over = est && est > 0 ? (Number(a.amount) - est) / est : null;

  return (
    <>
      <title>{`#${a.id} ${a.vendor_name} · VajraAI`}</title>
      {back}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono text-[13px] text-ink-3">Transaction #{a.id}</span>
            <RiskBadge level={a.risk_level} />
          </div>
          <h1 className="font-serif text-[30px] leading-tight font-semibold text-ink">{formatINR(a.amount)}</h1>
          <p className="mt-1 text-[15px] text-ink-2">
            paid to <Link to={`/vendors/${encodeURIComponent(a.vendor_id)}`} className="font-medium text-accent hover:underline">{a.vendor_name}</Link> on {formatDate(a.transaction_date)}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Why it was flagged" hint={lead[a.risk_level]} />
          {reasons.length === 0 ? (
            <Notice compact title="No written reasons were recorded">The model produced a score for this transaction, but the rule engine didn’t attach an explanation.</Notice>
          ) : (
            <ol className="px-5 pb-5">
              {reasons.map((r, i) => (
                <li key={i} className="flex gap-3.5 border-t border-line py-3 first:border-t-0 first:pt-1">
                  <span className="num mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-sunken text-[11px] font-semibold text-ink-2">{i + 1}</span>
                  <span className="text-[15px] text-ink">{r}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Record" />
          <dl className="divide-y divide-line border-t border-line">
            <Row label="Vendor ID"><span className="font-mono text-[13px]">{a.vendor_id}</span></Row>
            <Row label="Department">{a.department || '—'}</Row>
            <Row label="Location">{a.location || '—'}</Row>
            <Row label="Estimated cost">
              {est != null ? (
                <>
                  <span className="num">{formatINR(est)}</span>
                  {over != null && Math.abs(over) >= 0.005 && (
                    <span className={`num ml-2 text-[13px] ${over > 0 ? 'text-high' : 'text-low'}`}>{over > 0 ? '+' : ''}{Math.round(over * 100)}% vs paid</span>
                  )}
                </>
              ) : <span className="text-ink-3">Not provided in upload</span>}
            </Row>
            <Row label="Bidders">{a.num_bidders != null ? <span className="num">{a.num_bidders}</span> : <span className="text-ink-3">Not provided in upload</span>}</Row>
            <Row label="Anomaly score"><span className="num font-mono text-[13px]">{Number(a.anomaly_score).toFixed(4)}</span></Row>
            <Row label="Analysed">{formatDateTime(a.detected_at)}</Row>
          </dl>
          <p className="border-t border-line px-5 py-3 text-[13px] text-ink-3">
            The score is the model’s reconstruction error: the higher it is, the less this payment resembles the others. It is relative to the uploaded dataset, not an absolute probability of fraud.
          </p>
        </Card>
      </div>
    </>
  );
}
