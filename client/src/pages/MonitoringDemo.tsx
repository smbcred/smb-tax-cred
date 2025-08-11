import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { MonitoringDashboard } from '@/components/admin/MonitoringDashboard';
import { 
  Activity, 
  AlertTriangle, 
  Server, 
  Database,
  CheckCircle,
  PlayCircle,
  Settings
} from 'lucide-react';

export default function MonitoringDemo() {
  const [testAlertType, setTestAlertType] = useState('latency');
  const [testAlertSeverity, setTestAlertSeverity] = useState('medium');
  const [testAlertMessage, setTestAlertMessage] = useState('Test monitoring alert');
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [alertResult, setAlertResult] = useState<string | null>(null);

  const createTestAlert = async () => {
    setIsCreatingAlert(true);
    setAlertResult(null);

    try {
      const response = await fetch('/api/monitoring/test-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: testAlertType,
          severity: testAlertSeverity,
          message: testAlertMessage
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setAlertResult(`✅ Test alert created successfully (ID: ${result.errorId})`);
      } else {
        setAlertResult(`❌ Failed to create test alert: ${result.error}`);
      }
    } catch (error) {
      setAlertResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingAlert(false);
    }
  };

  const performHealthCheck = async () => {
    try {
      const response = await fetch('/api/monitoring/health');
      const result = await response.json();
      
      setAlertResult(`🔍 Health check result: ${result.status} (${result.checks?.length || 0} services checked)`);
    } catch (error) {
      setAlertResult(`❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center">
            <Activity className="h-8 w-8 mr-3 text-primary" />
            Application Monitoring Demo
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Comprehensive monitoring system for uptime tracking, error monitoring, performance alerts, 
            and system health checks with real-time dashboards and incident response.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Uptime Monitoring
            </Badge>
            <Badge variant="secondary" className="flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Error Tracking
            </Badge>
            <Badge variant="secondary" className="flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              Performance Alerts
            </Badge>
            <Badge variant="secondary" className="flex items-center">
              <Database className="h-3 w-3 mr-1" />
              Database Monitoring
            </Badge>
            <Badge variant="secondary" className="flex items-center">
              <Server className="h-3 w-3 mr-1" />
              API Health Checks
            </Badge>
            <Badge variant="secondary" className="flex items-center">
              <Settings className="h-3 w-3 mr-1" />
              Incident Response
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
            <TabsTrigger value="testing">Testing Tools</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Real-Time Monitoring Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Live monitoring dashboard showing system health, performance metrics, active alerts, and recent errors.
                  Data refreshes automatically every 30 seconds.
                </p>
                <MonitoringDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Create Test Alert
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="alert-type">Alert Type</Label>
                    <Select value={testAlertType} onValueChange={setTestAlertType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latency">Latency</SelectItem>
                        <SelectItem value="error_rate">Error Rate</SelectItem>
                        <SelectItem value="throughput">Throughput</SelectItem>
                        <SelectItem value="resource">Resource</SelectItem>
                        <SelectItem value="uptime">Uptime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="alert-severity">Severity</Label>
                    <Select value={testAlertSeverity} onValueChange={setTestAlertSeverity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="alert-message">Alert Message</Label>
                    <Input
                      id="alert-message"
                      value={testAlertMessage}
                      onChange={(e) => setTestAlertMessage(e.target.value)}
                      placeholder="Enter test alert message"
                    />
                  </div>

                  <Button 
                    onClick={createTestAlert} 
                    disabled={isCreatingAlert}
                    className="w-full"
                  >
                    {isCreatingAlert ? 'Creating Alert...' : 'Create Test Alert'}
                  </Button>

                  {alertResult && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-mono">{alertResult}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Health Check Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Perform manual health checks on system components and services.
                  </p>

                  <Button onClick={performHealthCheck} variant="outline" className="w-full">
                    Run Health Check
                  </Button>

                  <div className="space-y-2">
                    <h4 className="font-medium">Available Endpoints:</h4>
                    <div className="text-sm space-y-1">
                      <Badge variant="outline">/api/monitoring/health</Badge>
                      <Badge variant="outline">/api/monitoring/dashboard</Badge>
                      <Badge variant="outline">/api/monitoring/alerts</Badge>
                      <Badge variant="outline">/api/monitoring/errors</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Activity className="h-5 w-5 mr-2" />
                    Uptime Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>• Continuous service availability tracking</li>
                    <li>• Automated health checks every 30 seconds</li>
                    <li>• Service status indicators (up/down/degraded)</li>
                    <li>• Response time monitoring</li>
                    <li>• Incident counting and tracking</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Error Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>• Real-time error event capture</li>
                    <li>• Error categorization by level and context</li>
                    <li>• Stack trace preservation</li>
                    <li>• Error resolution workflow</li>
                    <li>• Error rate analysis and trends</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Server className="h-5 w-5 mr-2" />
                    Performance Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>• Configurable performance thresholds</li>
                    <li>• Automatic alert generation</li>
                    <li>• Severity-based alert classification</li>
                    <li>• Alert escalation policies</li>
                    <li>• Performance trend analysis</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Database className="h-5 w-5 mr-2" />
                    Database Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>• Connection pool monitoring</li>
                    <li>• Query performance tracking</li>
                    <li>• Slow query detection</li>
                    <li>• Database storage metrics</li>
                    <li>• Connection health checks</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    API Health Checks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>• Endpoint availability monitoring</li>
                    <li>• Response time measurement</li>
                    <li>• Status code tracking</li>
                    <li>• API performance analytics</li>
                    <li>• Automated health check scheduling</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Settings className="h-5 w-5 mr-2" />
                    Incident Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>• Incident detection and classification</li>
                    <li>• Alert resolution workflows</li>
                    <li>• Error event management</li>
                    <li>• Timeline tracking</li>
                    <li>• Post-incident analysis</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Backend Components</h4>
                    <ul className="text-sm space-y-1">
                      <li>• <code>MonitoringService</code> - Core monitoring logic</li>
                      <li>• <code>requestMonitoring</code> - Request/response tracking middleware</li>
                      <li>• <code>errorMonitoring</code> - Error event capture middleware</li>
                      <li>• <code>healthCheckMonitoring</code> - Health endpoint middleware</li>
                      <li>• <code>/api/monitoring/*</code> - RESTful monitoring API</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Frontend Components</h4>
                    <ul className="text-sm space-y-1">
                      <li>• <code>MonitoringDashboard</code> - Real-time dashboard UI</li>
                      <li>• <code>MonitoringDemo</code> - Feature demonstration page</li>
                      <li>• Alert management interfaces</li>
                      <li>• Error resolution workflows</li>
                      <li>• System metrics visualization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}