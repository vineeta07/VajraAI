import { useQuery } from '@tanstack/react-query';
import { describeError, fetchOverview, fetchRiskDistribution, fetchStatus } from './api';

/**
 * One place that answers "why is there nothing on screen?".
 *
 * Numbers only appear when four things are true, in order:
 *   1. the API server answers
 *   2. it can talk to its database
 *   3. transactions have been uploaded
 *   4. the analysis has been run on them
 *
 * `stage` is the first of those that is not satisfied, or 'ready'.
 */
async function loadPipeline() {
  try {
    const s = await fetchStatus();
    return {
      db: s.db?.ok !== false,
      dbError: s.db?.error || null,
      ml: s.ml?.ok ?? null,
      mlUrl: s.ml?.url || null,
      transactions: Number(s.transactions) || 0,
      analyzed: Number(s.analyzed) || 0,
      lastAnalysis: s.last_analysis || null,
    };
  } catch (err) {
    // Older servers have no /status route; work it out from the dashboard endpoints.
    if (err.response?.status !== 404) throw err;
    const [overview, dist] = await Promise.all([fetchOverview(), fetchRiskDistribution()]);
    const analyzed = Object.values(dist || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    return {
      db: true,
      dbError: null,
      ml: null,
      mlUrl: null,
      transactions: Number(overview.total_transactions) || 0,
      analyzed,
      lastAnalysis: null,
    };
  }
}

export function usePipeline() {
  const q = useQuery({ queryKey: ['pipeline'], queryFn: loadPipeline, refetchInterval: 30000 });

  const error = q.error ? describeError(q.error) : null;
  const d = q.data;

  let stage = 'ready';
  if (q.isPending) stage = 'checking';
  else if (error) stage = error.kind === 'server' ? 'database' : 'api';
  else if (!d.db) stage = 'database';
  else if (d.transactions === 0) stage = 'upload';
  else if (d.analyzed === 0) stage = 'analysis';

  return {
    stage,
    ready: stage === 'ready',
    checking: stage === 'checking',
    error,
    data: d || null,
    pendingAnalysis: d ? Math.max(0, d.transactions - d.analyzed) : 0,
    refetch: q.refetch,
    isFetching: q.isFetching,
  };
}

export const STAGE_ORDER = ['api', 'database', 'upload', 'analysis'];
