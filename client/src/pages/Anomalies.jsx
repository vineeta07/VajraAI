import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Search } from 'lucide-react';
import { Button, Card, Input, PageHeader, RiskBadge, Segmented, TableSkeleton, td, th } from '@/ui';
import Gate from '@/components/Gate';
import Notice, { ErrorNotice } from '@/components/Notice';
import { describeError, fetchAnomalies } from '@/lib/api';
import { formatDate, formatINR, formatInt } from '@/lib/format';

const PAGE = 25;

function Queue() {
  const [params, setParams] = useSearchParams();
  const risk = params.get('risk') || 'FLAGGED';
  const location = params.get('location') || '';
  const [search, setSearch] = useState('');
  const [shown, setShown] = useState(PAGE);

  const query = useQuery({ queryKey: ['anomalies', location], queryFn: () => fetchAnomalies(location ? { location } : undefined) });

  const all = useMemo(
    () => [...(query.data || [])].sort((a, b) => Number(b.anomaly_score) - Number(a.anomaly_score)),
    [query.data]
  );
  const counts = useMemo(() => {
    const c = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    all.forEach((a) => (c[a.risk_level] += 1));
    return c;
  }, [all]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((a) => {
      const riskOk = risk === 'ALL' || (risk === 'FLAGGED' ? a.risk_level !== 'LOW' : a.risk_level === risk);
      const textOk = !q || [a.vendor_name, a.vendor_id, a.department, a.location, String(a.transaction_id)].some((v) => v?.toLowerCase().includes(q));
      return riskOk && textOk;
    });
  }, [all, risk, search]);

  const setRisk = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'FLAGGED') next.delete('risk');
    else next.set('risk', value);
    setParams(next, { replace: true });
    setShown(PAGE);
  };
  const clearLocation = () => {
    const next = new URLSearchParams(params);
    next.delete('location');
    setParams(next, { replace: true });
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          label="Filter by risk"
          value={risk}
          onChange={setRisk}
          options={[
            { value: 'FLAGGED', label: 'Flagged', count: query.data ? counts.HIGH + counts.MEDIUM : null },
            { value: 'HIGH', label: 'High', count: query.data ? counts.HIGH : null },
            { value: 'MEDIUM', label: 'Medium', count: query.data ? counts.MEDIUM : null },
            { value: 'LOW', label: 'Low', count: query.data ? counts.LOW : null },
            { value: 'ALL', label: 'All' },
          ]}
        />
        {location && (
          <span className="inline-flex h-8 items-center gap-2 rounded-md bg-accent-soft pr-1 pl-3 text-[13px] font-medium text-accent">
            Location: {location}
            <button onClick={clearLocation} className="rounded px-1.5 py-0.5 hover:bg-surface" aria-label="Remove location filter">×</button>
          </span>
        )}
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setShown(PAGE); }} placeholder="Search vendor, department, ID" className="h-9 pl-9" aria-label="Search anomalies" />
        </div>
      </div>

      <Card className="overflow-hidden">
        {query.isPending ? (
          <TableSkeleton rows={8} />
        ) : query.isError ? (
          <ErrorNotice error={describeError(query.error)} onRetry={query.refetch} />
        ) : rows.length === 0 ? (
          <EmptyQueue risk={risk} search={search} counts={counts} location={location} onShowAll={() => { setSearch(''); setRisk('ALL'); }} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead className="border-b border-line bg-sunken/50">
                  <tr>
                    <th className={th}>ID</th>
                    <th className={th}>Vendor</th>
                    <th className={th}>Department</th>
                    <th className={th}>Date</th>
                    <th className={`${th} text-right`}>Amount</th>
                    <th className={`${th} text-right`}>Score</th>
                    <th className={th}>Risk</th>
                    <th className={th}><span className="sr-only">Open</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.slice(0, shown).map((a) => (
                    <tr key={a.transaction_id} className="group relative hover:bg-sunken/50">
                      <td className={`${td} num font-mono text-[13px] text-ink-3`}>#{a.transaction_id}</td>
                      <td className={td}>
                        <Link to={`/anomalies/${a.transaction_id}`} className="font-medium text-ink after:absolute after:inset-0">{a.vendor_name}</Link>
                        <div className="text-[13px] text-ink-3">{a.location || 'No location'}</div>
                      </td>
                      <td className={`${td} text-ink-2`}>{a.department || '—'}</td>
                      <td className={`${td} num whitespace-nowrap text-ink-2`}>{formatDate(a.transaction_date)}</td>
                      <td className={`${td} num text-right whitespace-nowrap`}>{formatINR(a.amount)}</td>
                      <td className={`${td} num text-right font-mono text-[13px] text-ink-2`}>{Number(a.anomaly_score).toFixed(3)}</td>
                      <td className={td}><RiskBadge level={a.risk_level} /></td>
                      <td className={`${td} w-8 text-ink-3`}><ChevronRight className="size-4 opacity-0 group-hover:opacity-100" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 text-[13px] text-ink-3">
              <span className="num">Showing {formatInt(Math.min(shown, rows.length))} of {formatInt(rows.length)}</span>
              {shown < rows.length && <Button size="sm" variant="secondary" onClick={() => setShown((s) => s + PAGE)}>Show {Math.min(PAGE, rows.length - shown)} more</Button>}
            </footer>
          </>
        )}
      </Card>
    </>
  );
}

function EmptyQueue({ risk, search, counts, location, onShowAll }) {
  const total = counts.HIGH + counts.MEDIUM + counts.LOW;
  const action = total > 0 && <Button size="sm" variant="secondary" onClick={onShowAll}>Show all {formatInt(total)} transactions</Button>;

  if (search.trim()) {
    return <Notice title={`Nothing matches “${search.trim()}”`} actions={action}>The search looks at vendor name, vendor ID, department, location and transaction ID within the current risk filter.</Notice>;
  }
  if (total === 0 && location) {
    return <Notice title={`No analysed transactions in ${location}`}>No scored transaction has this location recorded. Remove the location filter to see everything.</Notice>;
  }
  if (risk === 'FLAGGED' || risk === 'HIGH' || risk === 'MEDIUM') {
    const label = risk === 'FLAGGED' ? 'high or medium' : risk.toLowerCase();
    return (
      <Notice title={`No ${label} risk transactions`} actions={action}>
        The analysis scored {formatInt(total)} transactions and none landed in this band. The model ranks transactions against each other, so very small or very uniform datasets can produce few flags.
      </Notice>
    );
  }
  return <Notice title="No transactions in this view" actions={action}>Nothing falls under the current filter.</Notice>;
}

export default function Anomalies() {
  return (
    <>
      <title>Anomalies · VajraAI</title>
      <PageHeader title="Anomalies" description="Every scored transaction, most unusual first. Open one to see why it was flagged." />
      <Gate><Queue /></Gate>
    </>
  );
}
