import { Routes, Route } from 'react-router-dom';
import { OverviewPanel } from './panels/OverviewPanel';
import { CasesPanel } from './panels/CasesPanel';
import { AnalyticsPanel } from './panels/AnalyticsPanel';
import { SettingsPanel } from './panels/SettingsPanel';

export function DashboardContent() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <Routes>
        <Route path="/" element={<OverviewPanel />} />
        <Route path="/cases" element={<CasesPanel />} />
        <Route path="/analytics" element={<AnalyticsPanel />} />
        <Route path="/settings" element={<SettingsPanel />} />
      </Routes>
    </div>
  );
}
