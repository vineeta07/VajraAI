import { useNavigate, useOutletContext } from 'react-router-dom';
import { Check, Minus, X } from 'lucide-react';
import { Button, Card, CardHeader, PageHeader, Segmented } from '@/ui';
import { API_LABEL } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { formatDateTime, formatInt } from '@/lib/format';

function Row({ label, hint, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3.5">
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink">{label}</div>
        {hint && <div className="text-[13px] text-ink-3">{hint}</div>}
      </div>
      <div className="text-sm text-ink">{children}</div>
    </div>
  );
}

function Health({ ok, yes, no, unknown = 'Unknown' }) {
  const [Icon, cls, text] = ok === true ? [Check, 'text-low', yes] : ok === false ? [X, 'text-high', no] : [Minus, 'text-ink-3', unknown];
  return <span className={`inline-flex items-center gap-1.5 font-medium ${cls}`}><Icon className="size-4" strokeWidth={2.5} />{text}</span>;
}

export default function Settings() {
  const { pipeline } = useOutletContext();
  const { user, isPreview, logout } = useAuth();
  const { choice, setTheme } = useTheme();
  const navigate = useNavigate();
  const d = pipeline.data;
  const apiOk = pipeline.checking ? null : pipeline.stage !== 'api';
  const dbOk = pipeline.checking || pipeline.stage === 'api' ? null : pipeline.stage !== 'database';

  return (
    <>
      <title>Settings · VajraAI</title>
      <PageHeader title="Settings" />
      <div className="max-w-3xl space-y-5">
        <Card>
          <CardHeader title="Account" />
          <div className="divide-y divide-line border-t border-line">
            <Row label="Name">{user?.name || '—'}</Row>
            <Row label="Email">{isPreview ? <span className="text-ink-3">Guest session — not signed in</span> : user?.email || '—'}</Row>
            <Row label="Role">{user?.role || '—'}</Row>
            <Row label={isPreview ? 'Leave guest session' : 'Sign out'} hint="You’ll return to the sign-in page.">
              <Button variant="secondary" size="sm" onClick={() => { logout(); navigate('/login'); }}>{isPreview ? 'Leave' : 'Sign out'}</Button>
            </Row>
          </div>
        </Card>

        <Card>
          <CardHeader title="Appearance" />
          <div className="border-t border-line">
            <Row label="Theme" hint="“System” follows your device setting.">
              <Segmented label="Theme" value={choice} onChange={setTheme} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }]} />
            </Row>
          </div>
        </Card>

        <Card>
          <CardHeader title="System" hint="What the app depends on, and whether each part is working." action={<Button variant="secondary" size="sm" loading={pipeline.isFetching} onClick={() => pipeline.refetch()}>Check now</Button>} />
          <div className="divide-y divide-line border-t border-line">
            <Row label="API server" hint={API_LABEL}><Health ok={apiOk} yes="Reachable" no="Not reachable" unknown="Checking…" /></Row>
            <Row label="Database" hint="PostgreSQL, via the API server"><Health ok={dbOk} yes="Connected" no="Query failed" unknown={apiOk === false ? 'Can’t tell — server is down' : 'Checking…'} /></Row>
            <Row label="ML service" hint={d?.mlUrl || 'Scores transactions during analysis'}><Health ok={d?.ml ?? null} yes="Reachable" no="Not reachable" unknown={d ? 'Not reported by this server' : 'Can’t tell'} /></Row>
            <Row label="Stored transactions"><span className="num">{d ? formatInt(d.transactions) : '—'}</span></Row>
            <Row label="Analysed transactions"><span className="num">{d ? formatInt(d.analyzed) : '—'}</span></Row>
            <Row label="Last analysis">{d?.lastAnalysis ? formatDateTime(d.lastAnalysis) : d ? 'Never run' : '—'}</Row>
          </div>
        </Card>
      </div>
    </>
  );
}
