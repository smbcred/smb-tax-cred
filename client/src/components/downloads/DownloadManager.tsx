import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useDownloadSystem } from '@/hooks/useDownloadSystem';
import { useS3Storage } from '@/hooks/useS3Storage';
import { Download, Package, Clock, BarChart3, Trash2, RefreshCw } from 'lucide-react';

interface DownloadManagerProps {
  userId?: string;
  className?: string;
}

export function DownloadManager({ userId, className }: DownloadManagerProps) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [downloadType, setDownloadType] = useState<'single' | 'zip'>('zip');
  const [activeDownloads, setActiveDownloads] = useState<string[]>([]);

  const {
    createZipDownload,
    createSingleDownload,
    formatFileSize,
    formatDuration,
    getDownloadStatusColor,
    getDownloadStatusIcon,
    isDownloading,
    downloadError,
    useDownloadStats,
  } = useDownloadSystem();

  const { useUserFiles } = useS3Storage();
  const userFiles = useUserFiles();
  const downloadStats = useDownloadStats(30);

  const handleFileSelection = (fileKey: string, selected: boolean) => {
    if (selected) {
      setSelectedFiles(prev => [...prev, fileKey]);
    } else {
      setSelectedFiles(prev => prev.filter(key => key !== fileKey));
    }
  };

  const handleSelectAll = () => {
    if (userFiles.data) {
      setSelectedFiles(userFiles.data.map(file => file.key));
    }
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
  };

  const handleDownload = () => {
    if (selectedFiles.length === 0) return;

    if (downloadType === 'single' && selectedFiles.length === 1) {
      createSingleDownload(selectedFiles[0]);
    } else {
      createZipDownload(selectedFiles, {
        compressionLevel: 6,
        expiresIn: 3600, // 1 hour
      });
    }
  };

  const getTotalSelectedSize = (): number => {
    if (!userFiles.data) return 0;
    return userFiles.data
      .filter(file => selectedFiles.includes(file.key))
      .reduce((total, file) => total + file.fileSize, 0);
  };

  const getDocumentTypeGroups = () => {
    if (!userFiles.data) return {};
    
    const groups: Record<string, typeof userFiles.data> = {};
    userFiles.data.forEach(file => {
      if (!groups[file.documentType]) {
        groups[file.documentType] = [];
      }
      groups[file.documentType].push(file);
    });
    
    return groups;
  };

  if (userFiles.isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading files...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (userFiles.error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Download className="h-5 w-5" />
            Download Manager - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load files: {userFiles.error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const documentGroups = getDocumentTypeGroups();
  const totalSelectedSize = getTotalSelectedSize();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Download Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Manager
          </CardTitle>
          <CardDescription>
            Select and download your R&D tax credit documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selection Summary */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedFiles.length} files selected
              </span>
              {totalSelectedSize > 0 && (
                <span className="text-sm text-muted-foreground">
                  Total size: {formatFileSize(totalSelectedSize)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={!userFiles.data || userFiles.data.length === 0}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                disabled={selectedFiles.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Download Options */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Download as:</label>
              <div className="flex items-center gap-2">
                <Button
                  variant={downloadType === 'zip' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDownloadType('zip')}
                  className="flex items-center gap-1"
                >
                  <Package className="h-3 w-3" />
                  ZIP Package
                </Button>
                <Button
                  variant={downloadType === 'single' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDownloadType('single')}
                  disabled={selectedFiles.length !== 1}
                  className="flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Individual
                </Button>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={selectedFiles.length === 0 || isDownloading}
            className="w-full"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
              </>
            )}
          </Button>

          {downloadError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">Download Failed</p>
              <p className="text-sm text-destructive/80">{downloadError.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File List by Document Type */}
      <div className="space-y-4">
        {Object.entries(documentGroups).map(([documentType, files]) => (
          <Card key={documentType}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">
                  {documentType.replace('_', ' ')} Documents
                </CardTitle>
                <Badge variant="secondary">
                  {files.length} {files.length === 1 ? 'file' : 'files'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.key}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.key)}
                        onChange={(e) => handleFileSelection(file.key, e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.fileName}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.fileSize)}</span>
                          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                          {file.expiresAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires: {new Date(file.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Download Statistics */}
      {downloadStats.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Download Statistics
            </CardTitle>
            <CardDescription>
              Your download activity in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {downloadStats.data.totalDownloads}
                </div>
                <div className="text-sm text-muted-foreground">Total Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatFileSize(downloadStats.data.totalSize)}
                </div>
                <div className="text-sm text-muted-foreground">Total Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {downloadStats.data.downloadsByType.zip || 0}
                </div>
                <div className="text-sm text-muted-foreground">ZIP Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {downloadStats.data.downloadsByType.single || 0}
                </div>
                <div className="text-sm text-muted-foreground">Individual Downloads</div>
              </div>
            </div>

            {downloadStats.data.downloadsByDay.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {downloadStats.data.downloadsByDay.slice(-7).map((day) => (
                    <div key={day.date} className="flex items-center justify-between text-sm">
                      <span>{new Date(day.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <span>{day.count} downloads</span>
                        <span className="text-muted-foreground">
                          ({formatFileSize(day.size)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}