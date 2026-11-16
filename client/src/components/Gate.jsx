import { useOutletContext } from 'react-router-dom';
import { Skeleton } from '@/ui';
import PipelineStatus, { StaleBanner } from './PipelineStatus';

/**
 * Wraps a data page. If the pipeline can't produce data yet, the page body is
 * replaced by the explanation of what is missing.
 * `needs`: 'analysis' (default) or 'upload' for pages that work on raw transactions.
 */
export default function Gate({ needs = 'analysis', children }) {
  const { pipeline } = useOutletContext();
  if (pipeline.checking) return <Skeleton className="h-72 w-full" />;
  const ok = pipeline.ready || (needs === 'upload' && pipeline.stage === 'analysis');
  if (!ok) return <PipelineStatus pipeline={pipeline} />;
  return (
    <>
      <StaleBanner pipeline={pipeline} />
      {children}
    </>
  );
}
