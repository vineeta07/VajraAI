import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export function RiskChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await (supabase as any).from('fraud_cases').select('risk_score');
      const cases = data as { risk_score: number }[] | null;

      if (cases) {
        const high = cases.filter(c => c.risk_score >= 80).length;
        const medium = cases.filter(c => c.risk_score >= 50 && c.risk_score < 80).length;
        const low = cases.filter(c => c.risk_score < 50).length;

        setData([
          { name: 'High Risk', value: high },
          { name: 'Medium Risk', value: medium },
          { name: 'Low Risk', value: low },
        ]);
      }
      setLoading(false);
      setLoading(false);
    };

    fetchData();
  }, []);

  const COLORS = ['hsl(0, 72%, 51%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 45%)'];

  if (loading) {
    return <div className="h-[200px] flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(222, 47%, 8%)',
            border: '1px solid hsl(222, 30%, 18%)',
            borderRadius: '8px',
          }}
        />
        <Legend
          formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
