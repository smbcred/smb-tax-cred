import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ExternalLink, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AdminTab = 'leads' | 'customers' | 'documents' | 'payments' | 'webhooks';

interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  tab: AdminTab;
}

export function DetailDrawer({ open, onOpenChange, item, tab }: DetailDrawerProps) {
  const { toast } = useToast();

  if (!item) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    });
  };

  const getSignedUrl = async (documentId: string) => {
    try {
      const response = await fetch(`/api/docs/${documentId}/url`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get signed URL');
      }

      const data = await response.json();
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate download link',
        variant: 'destructive',
      });
    }
  };

  const renderContent = () => {
    switch (tab) {
      case 'leads':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.email, 'Email')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Company:</span>
                  <span className="font-medium">{item.companyName || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Phone:</span>
                  <span className="font-medium">{item.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Lead Details</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Captured:</span>
                  <span className="font-medium">
                    {format(new Date(item.createdAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estimated Credit:</span>
                  <span className="font-medium">
                    ${item.estimatedCredit ? Math.round(item.estimatedCredit).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => window.open(`mailto:${item.email}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Send Email
                </Button>
              </div>
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">User Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.email, 'Email')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Name:</span>
                  <span className="font-medium">
                    {[item.firstName, item.lastName].filter(Boolean).join(' ') || 'Not provided'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admin:</span>
                  <Badge variant={item.isAdmin ? 'default' : 'secondary'}>
                    {item.isAdmin ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Company Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Legal Name:</span>
                  <span className="font-medium">{item.legalName || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Entity Type:</span>
                  <span className="font-medium">{item.entityType || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">EIN:</span>
                  <span className="font-medium">{item.ein || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Industry:</span>
                  <span className="font-medium">{item.industry || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Account Details</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Joined:</span>
                  <span className="font-medium">
                    {format(new Date(item.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">User ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{item.id}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.id, 'User ID')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Document Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Type:</span>
                  <Badge variant="outline">{item.documentType}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={item.status === 'ready' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">File Name:</span>
                  <span className="font-medium">{item.fileName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Size:</span>
                  <span className="font-medium">
                    {item.fileSizeBytes ? `${Math.round(item.fileSizeBytes / 1024)} KB` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">User Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Email:</span>
                  <span className="font-medium">{item.userEmail || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Company:</span>
                  <span className="font-medium">{item.companyName || 'N/A'}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Document Metrics</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Created:</span>
                  <span className="font-medium">
                    {format(new Date(item.createdAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Downloads:</span>
                  <span className="font-medium">{item.downloadCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Accessed:</span>
                  <span className="font-medium">
                    {item.lastAccessedAt
                      ? format(new Date(item.lastAccessedAt), 'MMM d, yyyy HH:mm')
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {item.status === 'ready' && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => getSignedUrl(item.id)}
                    >
                      <Download className="h-4 w-4" />
                      Get Signed Download URL (15 min)
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Amount:</span>
                  <span className="font-bold text-lg">
                    ${(item.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={item.status === 'succeeded' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stripe Payment ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{item.stripePaymentIntentId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.stripePaymentIntentId, 'Payment ID')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Email:</span>
                  <span className="font-medium">{item.userEmail || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Company:</span>
                  <span className="font-medium">{item.companyName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Calculated Credit:</span>
                  <span className="font-medium">
                    ${item.calculatedCredit ? Math.round(item.calculatedCredit).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Transaction Details</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Created:</span>
                  <span className="font-medium">
                    {format(new Date(item.createdAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Updated:</span>
                  <span className="font-medium">
                    {format(new Date(item.updatedAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => window.open(`https://dashboard.stripe.com/payments/${item.stripePaymentIntentId}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  View in Stripe Dashboard
                </Button>
              </div>
            </div>
          </div>
        );

      case 'webhooks':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Webhook Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Source:</span>
                  <Badge variant="outline">{item.source}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Event:</span>
                  <span className="font-medium">{item.event || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={item.status === 'success' ? 'default' : 'destructive'}>
                    {item.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Code:</span>
                  <span className="font-medium">{item.responseCode || 'N/A'}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Processing Details</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Processing Time:</span>
                  <span className="font-medium">
                    {item.processingTimeMs ? `${item.processingTimeMs}ms` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">IP Address:</span>
                  <span className="font-mono text-xs">{item.ipAddress || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Timestamp:</span>
                  <span className="font-medium">
                    {format(new Date(item.createdAt), 'MMM d, yyyy HH:mm:ss')}
                  </span>
                </div>
              </div>
            </div>

            {item.errorMessage && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Error Details</h3>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    <p className="text-sm text-destructive font-mono">
                      {item.errorMessage}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (tab) {
      case 'leads':
        return `Lead: ${item.email}`;
      case 'customers':
        return `Customer: ${item.email}`;
      case 'documents':
        return `Document: ${item.documentType}`;
      case 'payments':
        return `Payment: $${(item.amount / 100).toFixed(2)}`;
      case 'webhooks':
        return `Webhook: ${item.source} - ${item.event}`;
      default:
        return 'Details';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-left">{getTitle()}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}