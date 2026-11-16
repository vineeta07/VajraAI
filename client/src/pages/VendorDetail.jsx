import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardHeader, RiskBadge, Skeleton, Stat, td, th } from '@/ui';
import Notice, { ErrorNotice } from '@/components/Notice';
import { describeError, fetchVendor } from '@/lib/api';
import { formatDate, formatINR, formatINRShort, formatInt } from '@/lib/format';

export default function VendorDetail() {
  const { id } = useParams();
  const query = useQuery({ queryKey: ['vendor', id], queryFn: () => fetchVendor(id), retry: false });
  const back = (
    <Link to="/vendors" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-ink">
      <ArrowLeft className="size-4" /> Vendors
    </Link>
  );

  if (query.isPending) return <>{back}<Skeleton className="h-10 w-80" /><Skeleton className="mt-6 h-72 w-full" /></>;
  if (query.isError) {
    const e = describeError(query.error);
    return (
      <>
        {back}
        <Card>
          {e.kind === 'not_found' ? (
            <Notice title={`No vendor with ID “${id}”`} actions={<Button size="sm" variant="secondary" to="/vendors">All vendors</Button>}>
              No uploaded transaction refers to this vendor ID. It may have been mistyped, or the data was replaced.
            </Notice>
          ) : (
            <ErrorNotice error={e} onRetry={query.refetch} />
          )}
        </Card>
      </>
    );
  }

  const { vendor, transactions } = query.data;
  const scored = transactions.filter((t) => t.risk_level);
  const flagged = scored.filter((t) => t.risk_level !== 'LOW').length;
  const high = Number(vendor.high_risk_count);
  const analysed = scored.length > 0;

  return (
    <>
      <title>{`${vendor.vendor_name} · VajraAI`}</title>
      {back}
      <div className="mb-6">
        <div className="mb-1.5 font-mono text-[13px] text-ink-3">{vendor.vendor_id}</div>
        <h1 className="font-serif text-[30px] leading-tight font-semibold text-ink">{vendor.vendor_name}</h1>
      </div>

      <Card className="mb-5 grid divide-line max-sm:divide-y sm:grid-cols-3 sm:divide-x">
        <Stat label="Transactions" value={formatInt(vendor.total_transactions)} note={`${formatINRShort(vendor.total_amount)} paid in total`} />
        <Stat label="Flagged" value={formatInt(flagged)} unavailable={!analysed} note={analysed ? 'Medium or high risk' : 'Needs analysis'} />
        <Stat label="High risk" tone={high > 0 ? 'high' : undefined} value={formatInt(high)} unavailable={!analysed} note={analysed ? (high > 0 ? 'Audit these first' : 'None') : 'Needs analysis'} />
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Transactions" hint={transactions.length >= 50 ? 'Most recent 50' : 'Most recent first'} />
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="border-b border-line bg-sunken/50">
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Date</th>
                <th className={th}>Department</th>
                <th className={th}>Location</th>
                <th className={`${th} text-right`}>Amount</th>
                <th className={th}>Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {transactions.map((t) => (
                <tr key={t.id} className="relative hover:bg-sunken/50">
                  <td className={`${td} num font-mono text-[13px] text-ink-3`}>
                    {t.risk_level ? <Link to={`/anomalies/${t.id}`} className="after:absolute after:inset-0">#{t.id}</Link> : `#${t.id}`}
                  </td>
                  <td className={`${td} num whitespace-nowrap`}>{formatDate(t.transaction_date)}</td>
                  <td className={`${td} text-ink-2`}>{t.department || '—'}</td>
                  <td className={`${td} text-ink-2`}>{t.location || '—'}</td>
                  <td className={`${td} num text-right whitespace-nowrap`}>{formatINR(t.amount)}</td>
                  <td className={td}><RiskBadge level={t.risk_level} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
