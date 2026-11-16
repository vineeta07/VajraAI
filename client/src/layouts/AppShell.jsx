import { Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CircleHelp, LayoutGrid, LogOut, MapPinned, Menu, Settings, TriangleAlert, Upload, Users, X } from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import Tour from '@/components/Tour';
import { PipelinePill } from '@/components/PipelineStatus';
import { Skeleton } from '@/ui';
import { useAuth } from '@/lib/auth';
import { usePipeline } from '@/lib/pipeline';
import { cx } from '@/lib/format';

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid, tour: 'nav-overview' },
  { to: '/anomalies', label: 'Anomalies', icon: TriangleAlert, tour: 'nav-anomalies' },
  { to: '/vendors', label: 'Vendors', icon: Users, tour: 'nav-vendors' },
  { to: '/risk-map', label: 'Risk map', icon: MapPinned, tour: 'nav-map' },
];
const NAV_DATA = [{ to: '/upload', label: 'Upload & analyse', icon: Upload, tour: 'nav-upload' }];

const tourKey = (user) => `vajraai-tour-done:${user?.email || user?.id || 'anon'}`;

function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      data-tour={item.tour}
      onClick={onNavigate}
      className={({ isActive }) =>
        cx(
          'group flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors',
          isActive ? 'bg-accent-soft font-medium text-accent' : 'text-ink-2 hover:bg-sunken hover:text-ink'
        )
      }
    >
      <item.icon className="size-[17px] shrink-0" strokeWidth={1.9} aria-hidden />
      <span className="flex-1 truncate">{item.label}</span>
    </NavLink>
  );
}

function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-15 items-center px-5">
        <NavLink to="/dashboard" onClick={onNavigate} aria-label="VajraAI overview">
          <Logo />
        </NavLink>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Main">
        <div className="space-y-0.5">
          {NAV.map((n) => (
            <NavItem key={n.to} item={n} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="eyebrow mt-6 mb-1.5 px-3">Data</div>
        <div className="space-y-0.5">
          {NAV_DATA.map((n) => (
            <NavItem key={n.to} item={n} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>
      <div className="border-t border-line px-3 py-3">
        <NavItem item={{ to: '/settings', label: 'Settings', icon: Settings }} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function AccountMenu() {
  const { user, logout, isPreview } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const name = user?.name || user?.email || 'Account';
  const initials = name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="inline-flex size-9 items-center justify-center rounded-full bg-ink text-[12.5px] font-semibold text-bg"
      >
        {initials || 'U'}
      </button>
      {open && (
        <div role="menu" className="animate-rise absolute right-0 z-50 mt-2 w-60 rounded-lg border border-line bg-surface py-1.5 shadow-pop">
          <div className="border-b border-line px-4 pt-2 pb-3">
            <div className="truncate text-sm font-medium text-ink">{name}</div>
            <div className="truncate text-[13px] text-ink-3">{isPreview ? 'Preview session — not signed in to a server' : user?.role || 'Auditor'}</div>
          </div>
          <button role="menuitem" onClick={() => { setOpen(false); navigate('/settings'); }} className="flex h-9 w-full items-center gap-2.5 px-4 text-sm text-ink-2 hover:bg-sunken hover:text-ink">
            <Settings className="size-4" /> Settings
          </button>
          <button role="menuitem" onClick={() => { logout(); navigate('/login'); }} className="flex h-9 w-full items-center gap-2.5 px-4 text-sm text-ink-2 hover:bg-sunken hover:text-ink">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function PageFallback() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading page">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="mt-6 h-64 w-full" />
    </div>
  );
}

export default function AppShell() {
  const pipeline = usePipeline();
  const { user } = useAuth();
  const [drawer, setDrawer] = useState(false);
  // First sign-in on this browser: run the walkthrough.
  const [tour, setTour] = useState(() => !localStorage.getItem(tourKey(user)));

  const closeTour = () => {
    localStorage.setItem(tourKey(user), '1');
    setTour(false);
  };

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-line bg-surface lg:block">
        <Sidebar />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-line bg-surface shadow-pop">
            <button onClick={() => setDrawer(false)} aria-label="Close menu" className="absolute top-3.5 right-3 inline-flex size-8 items-center justify-center rounded-md text-ink-2 hover:bg-sunken">
              <X className="size-4" />
            </button>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-15 items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur sm:px-8">
          <button onClick={() => setDrawer(true)} aria-label="Open menu" className="-ml-1.5 inline-flex size-9 items-center justify-center rounded-md text-ink-2 hover:bg-sunken lg:hidden">
            <Menu className="size-5" />
          </button>
          <PipelinePill pipeline={pipeline} />
          <div className="flex-1" />
          <button
            onClick={() => setTour(true)}
            data-tour="help"
            className="inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-[13px] font-medium text-ink-2 hover:bg-sunken hover:text-ink"
          >
            <CircleHelp className="size-[18px]" />
            <span className="hidden sm:inline">Take the tour</span>
          </button>
          <ThemeToggle />
          <AccountMenu />
        </header>

        <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-8 sm:px-8">
          <Suspense fallback={<PageFallback />}>
            <Outlet context={{ pipeline }} />
          </Suspense>
        </main>
      </div>

      {tour && <Tour onClose={closeTour} />}
    </div>
  );
}
