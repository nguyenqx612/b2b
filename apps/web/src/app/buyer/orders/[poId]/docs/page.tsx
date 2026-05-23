import Link from 'next/link';
import { getSessionToken } from '@/lib/session';
import { apiClient, ApiError } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/layout/EmptyState';

interface ExportDoc {
  id: string;
  docType: string;
  url: string | null;
  createdAt: string;
}

interface Props {
  params: Promise<{ poId: string }>;
}

export default async function BuyerDocsPage({ params }: Props) {
  const { poId } = await params;
  const token = await getSessionToken();

  let docs: ExportDoc[] = [];
  let error = '';

  try {
    docs = await apiClient.get<ExportDoc[]>(`/api/documents/${poId}`, token);
  } catch (err) {
    error = err instanceof ApiError ? err.message : 'Failed to load documents';
  }

  return (
    <div>
      <PageHeader
        title="Export Documents"
        action={
          <Link href={`/buyer/orders/${poId}`} className={cn(buttonVariants({ variant: 'outline' }))}>
            ← Back to order
          </Link>
        }
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {docs.length === 0 && !error ? (
        <EmptyState
          title="No documents yet"
          description="Your seller will generate export documents when the order is ready."
        />
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium capitalize">{doc.docType.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(doc.createdAt).toLocaleString()}
                  </div>
                </div>
                {doc.url ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ size: 'sm' }))}
                  >
                    Download PDF
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">Processing…</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
