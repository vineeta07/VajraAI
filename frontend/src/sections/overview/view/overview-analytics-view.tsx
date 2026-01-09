import { Suspense } from 'react'; 
import { MapIcon } from 'lucide-react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import RiskHeatmap  from './RiskHeatmap';
import { AnalyticsNews } from '../analytics-news';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

// Custom fraud detection timeline data
const fraudTimeline = [
  { id: '1', title: 'Ghost beneficiary detected in PM-KISAN', time: '2 hours ago', type: 'order1' },
  { id: '2', title: 'Procurement bid rigging flagged - Infra Dept', time: '5 hours ago', type: 'order2' },
  { id: '3', title: 'Duplicate scholarship payments blocked', time: '1 day ago', type: 'order3' },
  { id: '4', title: 'Shell company network identified', time: '2 days ago', type: 'order4' },
  { id: '5', title: 'Unusual spending spike in PWD', time: '3 days ago', type: 'order5' },
];

// Custom fraud news/alerts
const fraudAlerts = [
  { id: '1', title: '₹12.4 Cr saved by blocking ghost pensioners in Narela district', coverUrl: '/assets/images/cover/cover-1.webp', totalViews: 1420, postedAt: new Date(), author: { avatarUrl: '/assets/images/avatar/avatar-1.webp', name: 'AI System' }, description: '' },
  { id: '2', title: 'Cartel of 5 contractors flagged for bid rotation in road tenders', coverUrl: '/assets/images/cover/cover-2.webp', totalViews: 892, postedAt: new Date(), author: { avatarUrl: '/assets/images/avatar/avatar-2.webp', name: 'ML Engine' }, description: '' },
  { id: '3', title: 'After-hours payment anomaly detected in Education Ministry', coverUrl: '/assets/images/cover/cover-3.webp', totalViews: 654, postedAt: new Date(), author: { avatarUrl: '/assets/images/avatar/avatar-3.webp', name: 'Fraud Detector' }, description: '' },
  { id: '4', title: 'Same bank account linked to 47 welfare beneficiaries', coverUrl: '/assets/images/cover/cover-4.webp', totalViews: 1105, postedAt: new Date(), author: { avatarUrl: '/assets/images/avatar/avatar-4.webp', name: 'Pattern AI' }, description: '' },
  { id: '5', title: 'Contract price 340% above market rate flagged in Delhi Jal Board', coverUrl: '/assets/images/cover/cover-5.webp', totalViews: 2340, postedAt: new Date(), author: { avatarUrl: '/assets/images/avatar/avatar-5.webp', name: 'Price Monitor' }, description: '' },
];

// Custom investigation tasks
const investigationTasks = [
  { id: '1', name: 'Review flagged procurement bids in PWD' },
  { id: '2', name: 'Verify ghost beneficiaries in pension scheme' },
  { id: '3', name: 'Investigate shell company network' },
  { id: '4', name: 'Audit after-hours transactions' },
  { id: '5', name: 'Cross-verify contractor ownership patterns' },
];

// Fraud detection by source
const fraudSources = [
  { value: 'government', label: 'Gov Portals', total: 4523 },
  { value: 'banks', label: 'Bank APIs', total: 3245 },
  { value: 'aadhaar', label: 'Aadhaar DB', total: 2890 },
  { value: 'gepnic', label: 'GeM/GePNIC', total: 1876 },
];

export function OverviewAnalyticsView() {
  const isDarkMode = false;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        VajraAI - Fraud & Anomaly Detection Dashboard 
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards - Fraud Detection Stats */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Anomalies Detected"
            percent={12.5}
            total={2847}
            icon={<img alt="Anomalies" src="/assets/icons/glass/ic-glass-message.svg" 
            style={{ filter: 'invert(40%) sepia(74%) saturate(5619%) hue-rotate(215deg) brightness(101%) contrast(98%)' }}
            />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [180, 220, 310, 420, 380, 490, 520, 327],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Savings Blocked (₹ Cr)"
            percent={18.2}
            total={47.2}
            color="success"
            icon={<img alt="Savings" src="/assets/icons/glass/ic-glass-bag.svg" 
            style={{ filter: 'invert(60%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(98%) contrast(102%)' }}
            />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [2.1, 3.4, 5.2, 6.8, 7.1, 8.9, 6.5, 7.2],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Ghost Beneficiaries Found"
            percent={-8.4}
            total={1247}
            color="warning"
            icon={<img alt="Ghost" src="/assets/icons/glass/ic-glass-users.svg"
              style={{ filter: 'invert(67%) sepia(89%) saturate(1029%) hue-rotate(1deg) brightness(103%) contrast(103%)' }}
              />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [220, 180, 160, 140, 130, 110, 95, 87],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="FIRs Generated"
            percent={5.2}
            total={358}
            color="error"
            icon={<img alt="FIRs" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [28, 35, 42, 38, 45, 52, 58, 60],
            }}
          />
        </Grid>

        {/* Risk Heatmap Section - Full Width */}
        <Grid size={{ xs: 12 }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingLeft: '8px' }}>
              <MapIcon style={{ width: '20px', height: '20px', color: '#6366f1' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                District-wise Risk Distribution
              </h3>
            </div>
            <Suspense fallback={<div style={{ height: '500px', borderRadius: '24px', backgroundColor: '#f3f4f6' }} />}>
              <RiskHeatmap />
            </Suspense>
          </div>
        </Grid>

        {/* Anomaly Detection Trends - Monthly */}
        <Grid size={{ xs: 12, md: 7, lg: 7 }}>
          <AnalyticsWebsiteVisits
            title="Anomaly Detection Trends"
            subheader="(+23%) detection rate vs last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Procurement Fraud', data: [43, 55, 62, 78, 92, 105, 118, 124, 135] },
                { name: 'Welfare Fraud', data: [31, 40, 48, 52, 58, 62, 70, 75, 82] },
                { name: 'Spending Anomalies', data: [22, 28, 35, 42, 48, 55, 62, 68, 74] },
              ],
            }}
          />
        </Grid>

        {/* Fraud by Category - Pie Chart */}
        <Grid size={{ xs: 12, md: 6, lg: 5 }}>
          <AnalyticsCurrentVisits
            title="Fraud by Category"
            chart={{
              series: [
                { label: 'Procurement & Contracts', value: 4200 },
                { label: 'Welfare & Subsidies', value: 3100 },
                { label: 'Ghost Beneficiaries', value: 2400 },
                { label: 'Spending Anomalies', value: 1800 },
              ],
            }}
          />
        </Grid>

        {/* Top Fraud Types by Department */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsConversionRates
            title="Fraud Detection by Department"
            subheader="Top departments with flagged anomalies"
            chart={{
              categories: ['PWD', 'Education', 'Health', 'Agriculture', 'Urban Dev'],
              series: [
                { name: 'Procurement', data: [88, 55, 41, 64, 72] },
                { name: 'Welfare', data: [53, 82, 63, 72, 43] },
                { name: 'Spending', data: [32, 45, 38, 28, 35] },
              ],
            }}
          />
        </Grid>

        {/* Risk Indicators Radar */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentSubject
            title="Fraud Risk Indicators"
            chart={{
              categories: ['Bid Rigging', 'Ghost Entries', 'Price Inflation', 'Shell Companies', 'Duplicate Claims', 'After-hours Txn'],
              series: [
                { name: 'This Month', data: [85, 72, 68, 55, 78, 42] },
                { name: 'Last Month', data: [70, 65, 58, 48, 65, 38] },
                { name: 'Avg Baseline', data: [45, 40, 35, 30, 42, 25] },
              ],
            }}
          />
        </Grid>
        
        {/* Investigation Tasks - Full Width */}
        <Grid size={{xs: 12, md: 6, lg: 8}}>
          <AnalyticsTasks title="Pending Investigations" list={investigationTasks} />
        </Grid>
        
        {/* Detection Timeline */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsOrderTimeline title="Detection Timeline" list={fraudTimeline} />
        </Grid>

        
      </Grid>
    </DashboardContent>
  );
}
