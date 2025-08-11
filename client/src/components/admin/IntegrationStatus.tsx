import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { useIntegrationStatus } from '@/hooks/useIntegrationStatus';
import { IntegrationType, IntegrationStatus as Status } from '../../../shared/types/integrations';

interface IntegrationStatusCardProps {
  integration: IntegrationType;
}

function IntegrationStatusCard({ integration }: IntegrationStatusCardProps) {
  const { getIntegrationHealth, triggerRecovery, markForMaintenance } = useIntegrationStatus();
  const [isRecovering, setIsRecovering] = useState(false);
  
  const health = getIntegrationHealth(integration);
  
  if (!health) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-gray-400" />
            <span className="text-gray-500">No health data available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case Status.HEALTHY:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case Status.DEGRADED:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case Status.FAILED:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case Status.RECOVERING:
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case Status.MAINTENANCE:
        return <Settings className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.HEALTHY:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case Status.DEGRADED:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case Status.FAILED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case Status.RECOVERING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case Status.MAINTENANCE:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleRecovery = async () => {
    setIsRecovering(true);
    try {
      await triggerRecovery.mutateAsync(integration);
    } finally {
      setIsRecovering(false);
    }
  };

  const handleMaintenance = async () => {
    await markForMaintenance.mutateAsync({
      integration,
      reason: 'Manual maintenance requested',
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(health.status)}
            <div>
              <CardTitle className="text-lg capitalize">
                {integration.replace('_', ' ')}
              </CardTitle>
              <CardDescription>
                Last checked: {new Date(health.lastChecked).toLocaleString()}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(health.status)}>
            {health.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Response Time:</span>
            <span className="ml-2 font-medium">{health.responseTime}ms</span>
          </div>
          <div>
            <span className="text-gray-500">Error Count:</span>
            <span className="ml-2 font-medium">{health.errorCount}</span>
          </div>
        </div>

        {health.lastError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-sm text-red-800 dark:text-red-400">
              <strong>Last Error:</strong> {health.lastError}
            </div>
          </div>
        )}

        {health.metadata && Object.keys(health.metadata).length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Metadata:</strong>
              <pre className="mt-1 text-xs overflow-x-auto">
                {JSON.stringify(health.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          {(health.status === Status.FAILED || health.status === Status.DEGRADED) && (
            <Button
              size="sm"
              onClick={handleRecovery}
              disabled={isRecovering || triggerRecovery.isPending}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRecovering ? 'animate-spin' : ''}`} />
              <span>Trigger Recovery</span>
            </Button>
          )}
          
          {health.status === Status.HEALTHY && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMaintenance}
              disabled={markForMaintenance.isPending}
              className="flex items-center space-x-1"
            >
              <Settings className="h-4 w-4" />
              <span>Maintenance Mode</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function IntegrationStatusPage() {
  const {
    allIntegrationHealth,
    queueStats,
    pendingInterventions,
    resolveIntervention,
    isLoading,
  } = useIntegrationStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const healthyCount = allIntegrationHealth.filter(h => h.status === Status.HEALTHY).length;
  const failedCount = allIntegrationHealth.filter(h => h.status === Status.FAILED).length;
  const degradedCount = allIntegrationHealth.filter(h => h.status === Status.DEGRADED).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Status</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage third-party integration health
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{healthyCount}</div>
                <div className="text-sm text-gray-500">Healthy</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{degradedCount}</div>
                <div className="text-sm text-gray-500">Degraded</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{failedCount}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{pendingInterventions.length}</div>
                <div className="text-sm text-gray-500">Pending Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList>
          <TabsTrigger value="status">Integration Status</TabsTrigger>
          <TabsTrigger value="queue">Queue Management</TabsTrigger>
          <TabsTrigger value="interventions">Manual Interventions</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(IntegrationType).map((integration) => (
              <IntegrationStatusCard key={integration} integration={integration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Queue Statistics</CardTitle>
              <CardDescription>
                Current job processing status and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {queueStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{queueStats.totalJobs}</div>
                    <div className="text-sm text-gray-500">Total Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{queueStats.pendingJobs}</div>
                    <div className="text-sm text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{queueStats.processingJobs}</div>
                    <div className="text-sm text-gray-500">Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{queueStats.failedJobs}</div>
                    <div className="text-sm text-gray-500">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(queueStats.averageProcessingTime / 1000)}s</div>
                    <div className="text-sm text-gray-500">Avg. Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{queueStats.throughput}</div>
                    <div className="text-sm text-gray-500">Jobs/Hour</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{queueStats.retryingJobs}</div>
                    <div className="text-sm text-gray-500">Retrying</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{queueStats.manualInterventionJobs}</div>
                    <div className="text-sm text-gray-500">Manual Intervention</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No queue statistics available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Manual Interventions</CardTitle>
              <CardDescription>
                Jobs requiring manual review and action
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingInterventions.length > 0 ? (
                <div className="space-y-4">
                  {pendingInterventions.map((intervention) => (
                    <div key={intervention.jobId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Job ID: {intervention.jobId}</div>
                        <Badge variant="outline">{intervention.action}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div><strong>Reason:</strong> {intervention.reason}</div>
                        <div><strong>Requested by:</strong> {intervention.requestedBy}</div>
                        <div><strong>Requested at:</strong> {new Date(intervention.requestedAt).toLocaleString()}</div>
                        {intervention.notes && (
                          <div><strong>Notes:</strong> {intervention.notes}</div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => resolveIntervention.mutate({
                            interventionId: intervention.jobId,
                            action: 'retry',
                            notes: 'Manual retry approved',
                          })}
                          disabled={resolveIntervention.isPending}
                        >
                          Retry
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveIntervention.mutate({
                            interventionId: intervention.jobId,
                            action: 'skip',
                            notes: 'Manual skip approved',
                          })}
                          disabled={resolveIntervention.isPending}
                        >
                          Skip
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => resolveIntervention.mutate({
                            interventionId: intervention.jobId,
                            action: 'cancel',
                            notes: 'Manual cancellation approved',
                          })}
                          disabled={resolveIntervention.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No pending interventions</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}