import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Heatmap } from '../Heatmap';

export function AnalyticsPanel() {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data } = await (supabase as any).from('fraud_cases').select('*');
      const cases = data as { category: string; status: string }[] | null;

      if (cases) {
        // Category distribution
        const categories = cases.reduce((acc: Record<string, number>, c) => {
          acc[c.category] = (acc[c.category] || 0) + 1;
          return acc;
        }, {});
        setCategoryData(Object.entries(categories).map(([name, value]) => ({ name: name.replace('_', ' '), value })));

        // Status distribution
        const statuses = cases.reduce((acc: Record<string, number>, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {});
        setStatusData(Object.entries(statuses).map(([name, value]) => ({ name: name.replace('_', ' '), value })));

        // Monthly trend (mock)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        setTrendData(months.map((month, i) => ({
          month,
          cases: Math.floor(cases.length * (0.3 + Math.random() * 0.4) / 2) + i * 2,
          amount: Math.floor(Math.random() * 500000) + 100000,
        })));
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  const COLORS = ['hsl(173, 80%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(142, 76%, 45%)'];

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold mb-2">Analytics</h2>
        <p className="text-muted-foreground">Fraud detection insights and trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Cases by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis dataKey="name" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 8%)',
                    border: '1px solid hsl(222, 30%, 18%)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="hsl(173, 80%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 8%)',
                    border: '1px solid hsl(222, 30%, 18%)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                <YAxis yAxisId="left" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 8%)',
                    border: '1px solid hsl(222, 30%, 18%)',
                    borderRadius: '8px',
                  }}
                />
                <Line yAxisId="left" type="monotone" dataKey="cases" stroke="hsl(173, 80%, 45%)" strokeWidth={2} dot={{ fill: 'hsl(173, 80%, 45%)' }} />
                <Line yAxisId="right" type="monotone" dataKey="amount" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(38, 92%, 50%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Fraud Activity Heatmap</CardTitle>
            <p className="text-sm text-muted-foreground">Incident frequency by day and hour</p>
          </CardHeader>
          <CardContent>
            <Heatmap />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
