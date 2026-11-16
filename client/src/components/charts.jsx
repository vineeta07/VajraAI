import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cx, formatDate, formatInt } from '@/lib/format';

/** One horizontal bar split into high / medium / low, with a legend that carries the numbers. */
export function RiskSplit({ high, medium, low }) {
  const total = high + medium + low || 1;
  const parts = [
    { key: 'High', n: high, bar: 'bg-high', note: 'Audit first' },
    { key: 'Medium', n: medium, bar: 'bg-medium', note: 'Worth a second look' },
    { key: 'Low', n: low, bar: 'bg-low', note: 'Looks routine' },
  ];
  return (
    <div>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`High ${high}, medium ${medium}, low ${low}`}>
        {parts.map((p) => p.n > 0 && <div key={p.key} className={p.bar} style={{ width: `${(p.n / total) * 100}%`, minWidth: 4 }} />)}
      </div>
      <dl className="mt-5 space-y-3.5">
        {parts.map((p) => (
          <div key={p.key} className="flex items-baseline gap-3">
            <span className={cx('size-2 shrink-0 translate-y-[-1px] rounded-sm', p.bar)} aria-hidden />
            <dt className="flex-1 text-sm text-ink">
              {p.key} <span className="text-ink-3">· {p.note}</span>
            </dt>
            <dd className="num text-sm font-medium text-ink">{formatInt(p.n)}</dd>
            <dd className="num w-11 text-right text-[13px] text-ink-3">{Math.round((p.n / total) * 100)}%</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Ranked horizontal bars. rows: [{ label, value, sub, to? }] */
export function BarList({ rows, format = formatInt, tone = 'bg-accent' }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ink">{r.label}</span>
            <span className="num shrink-0 text-ink-2">
              <span className="font-medium text-ink">{format(r.value)}</span>
              {r.sub && <span className="ml-2 text-[13px] text-ink-3">{r.sub}</span>}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
            <div className={cx('h-full rounded-full', tone)} style={{ width: `${Math.max((r.value / max) * 100, r.value > 0 ? 1.5 : 0)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function TimelineTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] shadow-pop">
      <div className="mb-1 font-medium text-ink">{formatDate(label)}</div>
      <div className="num text-ink-2">{formatInt(p.flagged)} flagged of {formatInt(p.count)}</div>
    </div>
  );
}

export function FlagTimeline({ data }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDate(d, { day: 'numeric', month: 'short' })}
            tick={{ fontSize: 12, fill: 'var(--ink-3)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--line-strong)' }}
            minTickGap={36}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--ink-3)' }} tickLine={false} axisLine={false} width={48} />
          <Tooltip content={<TimelineTip />} cursor={{ stroke: 'var(--line-strong)' }} />
          <Area type="monotone" dataKey="flagged" stroke="var(--high)" strokeWidth={1.75} fill="var(--high)" fillOpacity={0.1} dot={false} activeDot={{ r: 3.5, strokeWidth: 0 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
