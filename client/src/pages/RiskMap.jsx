import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, PageHeader, Skeleton } from '@/ui';
import Gate from '@/components/Gate';
import Notice, { ErrorNotice } from '@/components/Notice';
import { describeError, fetchByLocation } from '@/lib/api';
import { locate } from '@/lib/places';
import { useTheme } from '@/lib/theme';
import { formatINRShort, formatInt, plural } from '@/lib/format';

const UNKNOWN = new Set(['', 'unknown', 'unknown location', 'n/a', 'na', 'null']);

function Places() {
  const { isDark } = useTheme();
  const query = useQuery({ queryKey: ['by-location'], queryFn: () => fetchByLocation() });
  const [tilesFailed, setTilesFailed] = useState(false);

  const { rows, plotted, unplotted, missing, maxFlagged } = useMemo(() => {
    const all = (query.data || []).map((r) => ({
      name: r.location,
      total: Number(r.count),
      flagged: Number(r.flagged_count ?? r.count),
      high: Number(r.high_count ?? 0),
      amount: Number(r.risk_amount ?? 0),
    }));
    const named = all.filter((r) => !UNKNOWN.has(String(r.name || '').trim().toLowerCase()));
    const withFlags = named.filter((r) => r.flagged > 0).sort((a, b) => b.flagged - a.flagged);
    const located = withFlags.map((r) => ({ ...r, at: locate(r.name) }));
    return {
      rows: withFlags,
      plotted: located.filter((r) => r.at),
      unplotted: located.filter((r) => !r.at),
      missing: all.filter((r) => !named.includes(r)).reduce((n, r) => n + r.total, 0),
      maxFlagged: Math.max(...withFlags.map((r) => r.flagged), 1),
    };
  }, [query.data]);

  if (query.isPending) return <Skeleton className="h-[520px] w-full" />;
  if (query.isError) return <Card><ErrorNotice error={describeError(query.error)} onRetry={query.refetch} /></Card>;

  if (rows.length === 0) {
    return (
      <Card>
        {missing > 0 && (query.data || []).every((r) => UNKNOWN.has(String(r.location || '').trim().toLowerCase())) ? (
          <Notice title="The uploaded data has no locations">
            None of the {formatInt(missing)} analysed transactions has a usable value in the <code>location</code> column, so there is nothing to place on a map. Include a city or district name in that column when you upload.
          </Notice>
        ) : (
          <Notice title="No flagged transactions to map">
            The analysis didn’t flag any transaction as medium or high risk, so no location stands out.
          </Notice>
        )}
      </Card>
    );
  }

  const centre = plotted.length
    ? [plotted.reduce((s, p) => s + p.at[0], 0) / plotted.length, plotted.reduce((s, p) => s + p.at[1], 0) / plotted.length]
    : [22.6, 79.5];
  const bounds = plotted.length > 1 ? plotted.map((p) => p.at) : undefined;
  const high = isDark ? '#e08672' : '#a83c2b';
  const medium = isDark ? '#d9a54a' : '#9a6614';

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <Card className="overflow-hidden lg:col-span-3">
        {plotted.length === 0 ? (
          <Notice title="None of these locations could be placed on the map" className="h-full justify-center">
            The map recognises major Indian cities by name. The {plural(unplotted.length, 'location')} in this data ({unplotted.slice(0, 4).map((u) => u.name).join(', ')}{unplotted.length > 4 ? '…' : ''}) didn’t match any of them. The ranked list still includes every location.
          </Notice>
        ) : (
          <div className="relative h-full min-h-[520px]">
            <MapContainer key={isDark ? 'd' : 'l'} center={centre} zoom={5} bounds={bounds} boundsOptions={{ padding: [48, 48], maxZoom: 9 }} scrollWheelZoom={false} className="absolute inset-0">
              <TileLayer
                url={`https://{s}.basemaps.cartocdn.com/${isDark ? 'dark_nolabels' : 'light_nolabels'}/{z}/{x}/{y}{r}.png`}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                eventHandlers={{ tileerror: () => setTilesFailed(true), tileload: () => setTilesFailed(false) }}
              />
              {plotted.map((p) => {
                const color = p.high > 0 ? high : medium;
                return (
                  <CircleMarker key={p.name} center={p.at} radius={8 + 20 * Math.sqrt(p.flagged / maxFlagged)} pathOptions={{ color, weight: 1.5, fillColor: color, fillOpacity: 0.28 }}>
                    <Popup>
                      <strong className="text-sm">{p.name}</strong>
                      <div className="num mt-1 text-ink-2">
                        {plural(p.flagged, 'flag')} of {formatInt(p.total)} analysed
                        {p.high > 0 && <> · {formatInt(p.high)} high risk</>}
                        <br />
                        {formatINRShort(p.amount)} under review
                      </div>
                      <Link to={`/anomalies?location=${encodeURIComponent(p.name)}`} className="mt-2 inline-block font-medium text-accent hover:underline">View these transactions</Link>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
            {tilesFailed && (
              <div className="absolute top-3 right-3 left-14 z-[500] rounded-md border border-medium/30 bg-medium-soft px-3 py-2 text-[13px] text-medium" role="status">
                The background map couldn’t be downloaded from basemaps.cartocdn.com — the network may be offline or blocking it. The circles are still in the right positions.
              </div>
            )}
            <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex items-center gap-4 rounded-md border border-line bg-surface/95 px-3 py-2 text-xs text-ink-2">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-high" /> Has high-risk flags</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-medium" /> Medium only</span>
              <span>Larger circle = more flags</span>
            </div>
          </div>
        )}
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Flags by location" hint="Medium and high risk" />
        <ul className="divide-y divide-line border-t border-line">
          {rows.map((r) => (
            <li key={r.name}>
              <Link to={`/anomalies?location=${encodeURIComponent(r.name)}`} className="block px-5 py-3 hover:bg-sunken/60">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-ink">{r.name}</span>
                  <span className="num shrink-0 text-sm text-ink">
                    {formatInt(r.flagged)}
                    <span className="ml-2 text-[13px] text-ink-3">{formatINRShort(r.amount)}</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
                  <div className={`h-full rounded-full ${r.high > 0 ? 'bg-high' : 'bg-medium'}`} style={{ width: `${(r.flagged / maxFlagged) * 100}%` }} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {(unplotted.length > 0 || missing > 0) && plotted.length > 0 && (
          <div className="space-y-1.5 border-t border-line px-5 py-3 text-[13px] text-ink-3">
            {unplotted.length > 0 && (
              <p>Not drawn on the map because the place name isn’t recognised: {unplotted.map((u) => u.name).join(', ')}.</p>
            )}
            {missing > 0 && <p>{plural(missing, 'analysed transaction has', 'analysed transactions have')} no location recorded and {missing === 1 ? 'is' : 'are'} left out.</p>}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function RiskMap() {
  return (
    <>
      <title>Risk map · VajraAI</title>
      <PageHeader title="Risk map" description="Where flagged payments were recorded. Select a location to see its transactions." />
      <Gate><Places /></Gate>
    </>
  );
}
