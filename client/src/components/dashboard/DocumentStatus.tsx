import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  name: string;
  type: 'form' | 'memo' | 'report' | 'supporting';
  status: 'pending' | 'in_progress' | 'completed' | 'available';
  lastUpdated?: string;
  downloadUrl?: string;
}

interface DocumentStatusProps {
  documents?: Document[];
  hasDocuments: boolean;
}

export default function DocumentStatus({ documents = [], hasDocuments }: DocumentStatusProps) {
  // Mock documents for demonstration
  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'R&D Tax Credit Application Form',
      type: 'form',
      status: hasDocuments ? 'completed' : 'pending',
      lastUpdated: hasDocuments ? '2024-01-15' : undefined
    },
    {
      id: '2',
      name: 'Technical Compliance Memo',
      type: 'memo',
      status: hasDocuments ? 'available' : 'pending',
      lastUpdated: hasDocuments ? '2024-01-15' : undefined
    },
    {
      id: '3',
      name: 'Detailed Activity Report',
      type: 'report',
      status: hasDocuments ? 'available' : 'in_progress',
      lastUpdated: hasDocuments ? '2024-01-15' : undefined
    },
    {
      id: '4',
      name: 'Supporting Documentation',
      type: 'supporting',
      status: 'pending'
    }
  ];

  const displayDocuments = documents.length > 0 ? documents : mockDocuments;

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-rd-secondary-500">Completed</Badge>;
      case 'available':
        return <Badge variant="default" className="bg-green-500">Available</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'form':
        return 'fas fa-file-alt';
      case 'memo':
        return 'fas fa-file-contract';
      case 'report':
        return 'fas fa-chart-bar';
      case 'supporting':
        return 'fas fa-folder-open';
      default:
        return 'fas fa-file';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <i className="fas fa-file-alt text-rd-primary-500 mr-2"></i>
            Document Status
          </div>
          <Badge variant="outline">
            {displayDocuments.filter(doc => doc.status === 'completed' || doc.status === 'available').length} of {displayDocuments.length} ready
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayDocuments.map((document) => (
            <div key={document.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  document.status === 'completed' || document.status === 'available'
                    ? 'bg-rd-secondary-100 text-rd-secondary-600'
                    : document.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <i className={getTypeIcon(document.type)}></i>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    {document.name}
                  </h4>
                  {document.lastUpdated && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Updated {new Date(document.lastUpdated).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(document.status)}
                {(document.status === 'completed' || document.status === 'available') && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement document download
                      console.log('Download document:', document.id);
                    }}
                  >
                    <i className="fas fa-download mr-1"></i>
                    Download
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Document Generation Status
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {hasDocuments ? 'All documents ready' : 'Awaiting completion of prior steps'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}