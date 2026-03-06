import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workSampleService } from '@/lib/api/services';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const CodeWorkspace = lazy(() => import('@/components/CodeWorkspace').then(m => ({ default: m.CodeWorkspace })));

export default function WorkSamplePreviewPage() {
  const { screeningId, sampleId } = useParams();
  const navigate = useNavigate();
  const { data: sample, isLoading } = useQuery({
    queryKey: ['workSample', sampleId],
    queryFn: () => workSampleService.findOne(sampleId!),
    enabled: !!sampleId,
  });

  if (isLoading || !sample) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[80vh] rounded-xl" />
      </div>
    );
  }

  // Work sample link could be a zip URL for the project editor
  const zipUrl = sample.link;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/supervisor/screening/${screeningId}`)} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Screening Review
        </Button>
        <div>
          <h2 className="text-lg font-bold">{sample.title}</h2>
          <p className="text-xs text-muted-foreground">{sample.description}</p>
        </div>
      </div>

      {zipUrl ? (
        <div className="h-[80vh] border rounded-xl overflow-hidden">
          <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <CodeWorkspace zipUrl={zipUrl} submitUrl="" editable={false} />
          </Suspense>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
          <p>No project file available for this work sample.</p>
        </div>
      )}
    </div>
  );
}
