import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface FraudCase {
  id: string;
  case_number: string;
  title: string;
  status: string;
  risk_score: number;
  created_at: string;
}

interface Props {
  limit?: number;
}

export function RecentCasesTable({ limit = 5 }: Props) {
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      const { data, error } = await (supabase as any)
        .from('fraud_cases')
        .select('id, case_number, title, status, risk_score, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        setCases(data as FraudCase[]);
      }
      setLoading(false);
    };

    fetchCases();
  }, [limit]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      open: 'destructive',
      under_investigation: 'default',
      resolved: 'secondary',
      closed: 'outline',
    };
    return <Badge variant={variants[status] || 'default'} className="text-xs">{status.replace('_', ' ')}</Badge>;
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-destructive';
    if (score >= 50) return 'text-warning';
    return 'text-success';
  };

  if (loading) {
    return <div className="text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-3">
      {cases.map((c) => (
        <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
          <div className="flex-1 min-w-0 mr-4">
            <p className="font-medium text-sm truncate">{c.title}</p>
            <p className="text-xs text-muted-foreground">{c.case_number} • {format(new Date(c.created_at), 'MMM d')}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${getRiskColor(c.risk_score)}`}>{c.risk_score}%</span>
            {getStatusBadge(c.status)}
          </div>
        </div>
      ))}
    </div>
  );
}
