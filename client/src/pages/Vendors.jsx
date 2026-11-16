import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Search } from 'lucide-react';
import { Card, Input, PageHeader, Segmented, TableSkeleton, Tag, td, th } from '@/ui';
import Gate from '@/components/Gate';
import Notice, { ErrorNotice } from '@/components/Notice';
import { describeError, fetchVendors } from '@/lib/api';
import { formatINRShort, formatInt } from '@/lib/format';

export function VendorStanding({ flagged, high, analysed = true }) {
  if (!analysed) return <Tag>Not analysed</Tag>;
  if (Number(high) > 0) return <Tag tone="high">{formatInt(high)} high risk</Tag>;
  if (Number(flagged) > 0) return <Tag tone="medium">{formatInt(flagged)} flagged</Tag>;
  return <Tag tone="low">No flags</Tag>;
}

function List() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const query = useQuery({ queryKey: ['vendors'], queryFn: fetchVendors });

  const vendors = useMemo(
    () =>
      (query.data || []).map((v) => ({
        ...v,
        // The API counts every analysed transaction; "flagged" here means medium or high.
        flagged: Number(v.medium_high_count ?? v.flagged_count),
        high: Number(v.high_risk_count),
      })).sort((a, b) => b.high - a.high || b.flagged - a.flagged || Number(b.total_amount) - Number(a.total_amount)),
    [query.data]
  );

  const rows = vendors.filter((v) => {
    const q = search.trim().toLowerCase();
    const textOk = !q || v.vendor_name?.toLowerCase().includes(q) || v.vendor_id?.toLowerCase().includes(q);
    const fOk = filter === 'ALL' || (filter === 'HIGH' ? v.high > 0 : filter === 'FLAGGED' ? v.flagged > 0 : v.flagged === 0);
    return textOk && fOk;
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          label="Filter vendors"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'ALL', label: 'All', count: query.data ? vendors.length : null },
            { value: 'HIGH', label: 'High risk', count: query.data ? vendors.filter((v) => v.high > 0).length : null },
            { value: 'FLAGGED', label: 'Any flag' },
            { value: 'CLEAR', label: 'No flags' },
          ]}
        />
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID" className="h-9 pl-9" aria-label="Search vendors" />
        </div>
      </div>

      <Card className="overflow-hidden">
        {query.isPending ? (
          <TableSkeleton />
        ) : query.isError ? (
          <ErrorNotice error={describeError(query.error)} onRetry={query.refetch} />
        ) : rows.length === 0 ? (
          search.trim() ? (
            <Notice title={`No vendor matches “${search.trim()}”`}>The search covers vendor names and vendor IDs.</Notice>
          ) : (
            <Notice title="No vendors in this group">
              {filter === 'HIGH' ? 'No vendor has a high-risk transaction in the latest analysis.' : filter === 'FLAGGED' ? 'No vendor has a flagged transaction in the latest analysis.' : 'Every vendor has at least one flagged transaction.'}
            </Notice>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead className="border-b border-line bg-sunken/50">
                <tr>
                  <th className={th}>Vendor</th>
                  <th className={`${th} text-right`}>Transactions</th>
                  <th className={`${th} text-right`}>Total paid</th>
                  <th className={th}>Standing</th>
                  <th className={th}><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((v) => (
                  <tr key={v.vendor_id} className="group relative hover:bg-sunken/50">
                    <td className={td}>
                      <Link to={`/vendors/${encodeURIComponent(v.vendor_id)}`} className="font-medium text-ink after:absolute after:inset-0">{v.vendor_name}</Link>
                      <div className="font-mono text-[12.5px] text-ink-3">{v.vendor_id}</div>
                    </td>
                    <td className={`${td} num text-right`}>{formatInt(v.total_transactions)}</td>
                    <td className={`${td} num text-right`}>{formatINRShort(v.total_amount)}</td>
                    <td className={td}><VendorStanding flagged={v.flagged} high={v.high} /></td>
                    <td className={`${td} w-8 text-ink-3`}><ChevronRight className="size-4 opacity-0 group-hover:opacity-100" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

export default function Vendors() {
  return (
    <>
      <title>Vendors · VajraAI</title>
      <PageHeader title="Vendors" description="Everyone who has been paid, ordered by how much of their activity was flagged." />
      <Gate needs="upload"><List /></Gate>
    </>
  );
}
