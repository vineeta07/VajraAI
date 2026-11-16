import { Link, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Upload } from 'lucide-react';
import { Button, Card, CardHeader, PageHeader, RiskBadge, Skeleton, Stat } from '@/ui';
import Notice, { ErrorNotice } from '@/components/Notice';
import PipelineStatus, { StaleBanner } from '@/components/PipelineStatus';
import { BarList, FlagTimeline, RiskSplit } from '@/components/charts';
import {
  describeError,
  fetchByDate,
  fetchDepartmentStats,
  fetchOverview,
  fetchRecentAnomalies,
  fetchRiskDistribution,
  fetchTopVendors,
} from '@/lib/api';
import { formatINRShort, formatInt, plural, timeAgo } from '@/lib/format';

/** Card body that handles loading / failed / empty, and always says which. */
function Panel({ query, isEmpty, empty, height = 'h-56', children }) {
  if (query.isPending) return <div className="px-5 pb-5"><Skeleton className={`${height} w-full`} /></div>;
  if (query.isError) return <ErrorNotice compact error={describeError(query.error)} onRetry={query.refetch} />;
  if (isEmpty(query.data)) return <Notice compact title={empty.title}>{empty.body}</Notice>;
  return <div className="px-5 pb-5">{children(query.data)}</div>;
}

function StatsRow({ pipeline, enabled }) {
  const overview = useQuery({ queryKey: ['overview'], queryFn: fetchOverview, enabled });
  const o = overview.data;
  const loading = pipeline.checking || (enabled && overview.isPending);
  const why = !enabled && !pipeline.checking;
  const failed = overview.isError;
  const unavailable = why || failed || !o || !pipeline.ready;

  // Before analysis has run we still know how many transactions are stored.
  const stored = o?.total_transactions ?? pipeline.data?.transactions;
  const reason =
    failed ? 'Couldn’t be loaded' :
    pipeline.stage === 'api' ? 'Server unreachable' :
    pipeline.stage === 'database' ? 'Database unavailable' :
    pipeline.stage === 'upload' ? 'Nothing uploaded yet' :
    pipeline.stage === 'analysis' ? 'Needs analysis' : '';

  return (
    <Card className="mb-5 grid divide-line max-lg:divide-y sm:grid-cols-2 lg:grid-cols-4 lg:divide-x">
      <Stat
        label="Transactions"
        loading={loading}
        unavailable={stored == null}
        value={formatInt(stored)}
        note={stored == null ? reason : o ? `${plural(o.vendors, 'vendor')} · ${formatINRShort(o.total_amount)} total` : 'Stored'}
      />
      <Stat
        label="Flagged for review"
        loading={loading}
        unavailable={unavailable}
        value={formatInt(o?.flagged_transactions)}
        note={unavailable ? reason : `${o.flagged_percentage}% of all transactions`}
      />
      <Stat
        label="High risk"
        tone={o?.high_risk_transactions > 0 ? 'high' : undefined}
        loading={loading}
        unavailable={unavailable}
        value={formatInt(o?.high_risk_transactions)}
        note={unavailable ? reason : o.high_risk_transactions > 0 ? 'Recommended for immediate audit' : 'Nothing in the top band'}
      />
      <Stat
        label="Value under review"
        loading={loading}
        unavailable={unavailable}
        value={formatINRShort(o?.amount_at_risk)}
        note={unavailable ? reason : o.total_amount > 0 ? `${Math.round((o.amount_at_risk / o.total_amount) * 100)}% of total spend` : ''}
      />
    </Card>
  );
}

function Insights() {
  const dist = useQuery({ queryKey: ['risk-distribution'], queryFn: fetchRiskDistribution });
  const timeline = useQuery({ queryKey: ['by-date'], queryFn: fetchByDate });
  const depts = useQuery({ queryKey: ['departments'], queryFn: fetchDepartmentStats });
  const vendors = useQuery({ queryKey: ['top-vendors'], queryFn: fetchTopVendors });
  const recent = useQuery({ queryKey: ['recent-anomalies'], queryFn: fetchRecentAnomalies });

  const noFlags = {
    title: 'Nothing was flagged',
    body: 'The analysis ran, but no transaction scored above the medium threshold, so there is nothing to list here.',
  };

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader title="Flagged transactions over time" hint="By transaction date" />
        <Panel
          query={timeline}
          isEmpty={(d) => d.filter((r) => r.date).length < 2}
          empty={{
            title: 'Not enough dates to draw a trend',
            body: 'A trend line needs transactions on at least two different dates. The uploaded data has one date or none.',
          }}
        >
          {(d) => (
            <FlagTimeline
              data={d.filter((r) => r.date).map((r) => ({ date: r.date, count: Number(r.count), flagged: Number(r.flagged_count ?? r.count) }))}
            />
          )}
        </Panel>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Risk levels" hint="All analysed transactions" />
        <Panel
          query={dist}
          isEmpty={(d) => d.HIGH + d.MEDIUM + d.LOW === 0}
          empty={{ title: 'No scores yet', body: 'Risk levels appear after the analysis has run.' }}
        >
          {(d) => <RiskSplit high={d.HIGH} medium={d.MEDIUM} low={d.LOW} />}
        </Panel>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader title="Flags by department" hint="High and medium risk" />
        <Panel query={depts} isEmpty={(d) => d.every((r) => Number(r.flagged_count) === 0)} empty={noFlags} height="h-48">
          {(d) => (
            <BarList
              rows={d
                .filter((r) => Number(r.flagged_count) > 0)
                .slice(0, 6)
                .map((r) => ({
                  label: r.department || 'No department recorded',
                  value: Number(r.flagged_count),
                  sub: formatINRShort(r.total_risk_amount),
                }))}
            />
          )}
        </Panel>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Vendors to look at first" action={<Link to="/vendors" className="text-[13px] font-medium text-accent hover:underline">All vendors</Link>} />
        <Panel query={vendors} isEmpty={(d) => d.length === 0} empty={noFlags} height="h-48">
          {(d) => (
            <ul className="-mx-2 -mt-1">
              {d.map((v) => {
                const row = (
                  <>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink">{v.vendor_name}</div>
                      <div className="num text-[13px] text-ink-3">
                        {plural(v.flagged_transactions, 'flag')} · {formatINRShort(v.total_amount)}
                      </div>
                    </div>
                    <RiskBadge level={v.risk_level} />
                  </>
                );
                const cls = 'flex items-center gap-3 rounded-md px-2 py-2';
                return (
                  <li key={v.vendor_id || v.vendor_name}>
                    {v.vendor_id ? <Link to={`/vendors/${encodeURIComponent(v.vendor_id)}`} className={`${cls} hover:bg-sunken`}>{row}</Link> : <div className={cls}>{row}</div>}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </Card>

      <Card className="lg:col-span-5">
        <CardHeader
          title="Latest flags"
          action={<Link to="/anomalies" className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">Open the queue <ArrowRight className="size-3.5" /></Link>}
        />
        <Panel query={recent} isEmpty={(d) => d.length === 0} empty={noFlags} height="h-40">
          {(d) => (
            <ul className="-mx-5 -mb-5 divide-y divide-line border-t border-line">
              {d.map((a) => (
                <li key={a.transaction_id}>
                  <Link to={`/anomalies/${a.transaction_id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-sunken/60">
                    <span className="num w-14 shrink-0 font-mono text-[13px] text-ink-3">#{a.transaction_id}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{a.vendor_name}</span>
                      {a.department && <span className="block truncate text-[13px] text-ink-3">{a.department}</span>}
                    </span>
                    <span className="num hidden text-sm text-ink sm:block">{formatINRShort(a.amount)}</span>
                    <span className="hidden w-24 text-right text-[13px] text-ink-3 md:block">{timeAgo(a.detected_at)}</span>
                    <RiskBadge level={a.risk_level} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { pipeline } = useOutletContext();
  const hasRows = pipeline.stage === 'analysis' || pipeline.ready;

  return (
    <>
      <title>Overview · VajraAI</title>
      <PageHeader
        title="Overview"
        description="Where irregular spending is concentrated, based on the most recent analysis."
        actions={pipeline.ready && <Button variant="secondary" icon={Upload} to="/upload">Add data</Button>}
      />

      <StaleBanner pipeline={pipeline} />
      <StatsRow pipeline={pipeline} enabled={hasRows} />

      {pipeline.checking ? (
        <Skeleton className="h-72 w-full" />
      ) : pipeline.ready ? (
        <Insights />
      ) : (
        <PipelineStatus pipeline={pipeline} />
      )}
    </>
  );
}
