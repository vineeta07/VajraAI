import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RecentCasesTable } from '../RecentCasesTable';
import { RiskChart } from '../RiskChart';

interface CaseStats {
  total: number;
  open: number;
  underInvestigation: number;
  resolved: number;
}

export function OverviewPanel() {
  const [stats, setStats] = useState<CaseStats>({ total: 0, open: 0, underInvestigation: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await (supabase as any)
        .from('fraud_cases')
        .select('status');

      if (!error && data) {
        const cases = data as { status: string }[];
        setStats({
          total: cases.length,
          open: cases.filter(c => c.status === 'open').length,
          underInvestigation: cases.filter(c => c.status === 'under_investigation').length,
          resolved: cases.filter(c => c.status === 'resolved' || c.status === 'closed').length,
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Cases', value: stats.total, icon: TrendingUp, color: 'text-primary' },
    { title: 'Open Cases', value: stats.open, icon: AlertTriangle, color: 'text-warning' },
    { title: 'Under Investigation', value: stats.underInvestigation, icon: Clock, color: 'text-blue-400' },
    { title: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Monitor fraud detection metrics and recent activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {loading ? '...' : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskChart />
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentCasesTable limit={5} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
