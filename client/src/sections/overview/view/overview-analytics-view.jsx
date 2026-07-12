import { Suspense, useEffect, useState } from "react";
import { MapIcon } from "lucide-react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { DashboardContent } from "src/layouts/dashboard";
import RiskHeatmap from "./RiskHeatmap";
import { AnalyticsTasks } from "../analytics-tasks";
import { AnalyticsCurrentVisits } from "../analytics-current-visits";
import { AnalyticsOrderTimeline } from "../analytics-order-timeline";
import { AnalyticsWebsiteVisits } from "../analytics-website-visits";
import { AnalyticsWidgetSummary } from "../analytics-widget-summary";
import { AnalyticsCurrentSubject } from "../analytics-current-subject";
import { AnalyticsConversionRates } from "../analytics-conversion-rates";
import { useTheme } from "src/hooks/useTheme";
import { getDashboardStats, getHeatmapDepartments, getAnomalies } from "src/services/api";

export function OverviewAnalyticsView() {
  const { isDark: isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTransactions: 0, flaggedTransactions: 0, amountAtRisk: 0 });
  const [departmentHeatmap, setDepartmentHeatmap] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashStats, deptHeatmap, anomalyData] = await Promise.all([
          getDashboardStats().catch(() => ({ totalTransactions: 0, flaggedTransactions: 0, amountAtRisk: 0 })),
          getHeatmapDepartments().catch(() => []),
          getAnomalies().catch(() => [])
        ]);

        if (dashStats) {
          setStats({
            totalTransactions: dashStats.total_transactions || 0,
            flaggedTransactions: dashStats.flagged_transactions || 0,
            amountAtRisk: dashStats.amount_at_risk || 0
          });
        }
        if (deptHeatmap) setDepartmentHeatmap(deptHeatmap);
        if (anomalyData) setAnomalies(anomalyData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format data for charts
  const formatDepartmentChart = () => {
    if (departmentHeatmap.length > 0) {
      const categories = departmentHeatmap.map(d => d.department || "Unknown");
      const counts = departmentHeatmap.map(d => parseInt(d.flagged_count) || 0);
      return {
        categories,
        series: [{ name: "Anomalies", data: counts }]
      };
    }
    return {
      categories: ["IT", "HR", "Operations", "Marketing", "Infrastructure"],
      series: [{ name: "Anomalies", data: [12, 8, 15, 5, 20] }]
    };
  };

  const recentAnomaliesTimeline = anomalies.length > 0 ? anomalies.slice(0, 5).map((anomaly, index) => ({
    id: String(anomaly.transaction_id || index),
    title: `${anomaly.risk_level || 'Anomaly'} Risk - ${anomaly.vendor_name || 'Vendor'}`,
    time: anomaly.detected_at || anomaly.transaction_date || new Date().toISOString(),
    type: `order${(index % 5) + 1}`
  })) : [
    { id: '1', title: 'High value transaction out of hours - IT', time: '2 hours ago', type: 'order1' },
    { id: '2', title: 'Duplicate invoice detected - Operations', time: '5 hours ago', type: 'order2' },
    { id: '3', title: 'Unusual vendor location - HR', time: '1 day ago', type: 'order3' },
  ];

  const investigationTasks = anomalies.length > 0 ? anomalies.slice(0, 5).map((anomaly, index) => ({
    id: String(anomaly.transaction_id || index),
    name: `Investigate ${anomaly.vendor_name || 'Transaction'} - Amount: ₹${anomaly.amount || 'N/A'}`
  })) : [
    { id: '1', name: 'Review V003 TechNova Invoice (Score: 88%)' },
    { id: '2', name: 'Verify Apex Services contract (Score: 92%)' },
    { id: '3', name: 'Check Rapid Logistics duplication (Score: 75%)' },
  ];

  // Mocking some fallback data where API is missing
  const anomalyTrendsChart = {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    series: [
      { name: "Procurement Fraud", data: [43, 55, 62, 78, 92, 105, 118, 124, 135] },
      { name: "Welfare Fraud", data: [31, 40, 48, 52, 58, 62, 70, 75, 82] },
      { name: "Spending Anomalies", data: [22, 28, 35, 42, 48, 55, 62, 68, 74] }
    ]
  };

  if (loading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        VajraAI - Fraud & Anomaly Detection Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Transactions"
            percent={0}
            total={stats.totalTransactions}
            icon={<img alt="Transactions" src="/assets/icons/glass/ic-glass-message.svg" style={{ filter: "invert(40%) sepia(74%) saturate(5619%) hue-rotate(215deg) brightness(101%) contrast(98%)" }} />}
            chart={{ categories: ["Jan", "Feb", "Mar"], series: [0, 0, 0] }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Flagged Anomalies"
            percent={0}
            total={stats.flaggedTransactions}
            color="warning"
            icon={<img alt="Anomalies" src="/assets/icons/glass/ic-glass-users.svg" style={{ filter: "invert(67%) sepia(89%) saturate(1029%) hue-rotate(1deg) brightness(103%) contrast(103%)" }} />}
            chart={{ categories: ["Jan", "Feb", "Mar"], series: [0, 0, 0] }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Amount at Risk (₹)"
            percent={0}
            total={Number(stats.amountAtRisk) || 0}
            color="error"
            icon={<img alt="Risk" src="/assets/icons/glass/ic-glass-bag.svg" style={{ filter: "invert(60%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(98%) contrast(102%)" }} />}
            chart={{ categories: ["Jan", "Feb", "Mar"], series: [0, 0, 0] }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="FIRs Generated (Mock)"
            percent={5.2}
            total={358}
            color="success"
            icon={<img alt="FIRs" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{ categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"], series: [28, 35, 42, 38, 45, 52, 58, 60] }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", paddingLeft: "8px" }}>
              <MapIcon style={{ width: "20px", height: "20px", color: isDarkMode ? "#818cf8" : "#6366f1" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: isDarkMode ? "#f8fafc" : "#111827", margin: 0 }}>
                District-wise Risk Distribution
              </h3>
            </div>
            <Suspense fallback={<div style={{ height: "500px", borderRadius: "24px", backgroundColor: isDarkMode ? "#0f172a" : "#f3f4f6" }} />}>
              <RiskHeatmap />
            </Suspense>
          </div>
        </Grid>

        <Grid size={{ xs: 12, md: 7, lg: 7 }}>
          <AnalyticsWebsiteVisits
            title="Anomaly Detection Trends"
            subheader="(+23%) detection rate vs last year"
            chart={anomalyTrendsChart}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 5 }}>
          <AnalyticsCurrentVisits
            title="Fraud by Category"
            chart={{
              series: [
                { label: "Procurement & Contracts", value: 4200 },
                { label: "Welfare & Subsidies", value: 3100 },
                { label: "Ghost Beneficiaries", value: 2400 },
                { label: "Spending Anomalies", value: 1800 }
              ]
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsConversionRates
            title="Fraud Detection by Department"
            subheader="Departments with flagged anomalies"
            chart={formatDepartmentChart()}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentSubject
            title="Fraud Risk Indicators"
            chart={{
              categories: ["Bid Rigging", "Ghost Entries", "Price Inflation", "Shell Companies", "Duplicate Claims", "After-hours Txn"],
              series: [
                { name: "This Month", data: [85, 72, 68, 55, 78, 42] },
                { name: "Last Month", data: [70, 65, 58, 48, 65, 38] },
                { name: "Avg Baseline", data: [45, 40, 35, 30, 42, 25] }
              ]
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsTasks title="Pending Investigations" list={investigationTasks} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsOrderTimeline title="Detection Timeline" list={recentAnomaliesTimeline} />
        </Grid>

      </Grid>
    </DashboardContent>
  );
}
