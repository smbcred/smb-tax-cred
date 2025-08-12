// Custom analytics dashboard component for monitoring user behavior and performance

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Eye, AlertCircle, Clock, Target } from 'lucide-react';

interface DashboardMetrics {
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  pageViews: number;
  conversions: number;
  errors: number;
  averageSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  topEvents: Array<{ event: string; count: number }>;
  conversionRate: number;
  bounceRate: number;
}

interface PerformanceMetrics {
  [key: string]: {
    unit: string;
    count: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p90: number;
    p95: number;
  };
}

interface FunnelData {
  id: string;
  name: string;
  steps: Array<{
    id: string;
    name: string;
    event: string;
    description: string;
    order: number;
    required: boolean;
  }>;
  conversionRates: number[];
  totalUsers: number;
  completedUsers: number;
  dropoffRates: number[];
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [period, setPeriod] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch main dashboard metrics
      const dashboardResponse = await fetch(`/api/analytics/dashboard?period=${period}`);
      if (!dashboardResponse.ok) throw new Error('Failed to fetch dashboard metrics');
      const dashboardData = await dashboardResponse.json();
      setMetrics(dashboardData.metrics);

      // Fetch performance metrics
      const performanceResponse = await fetch(`/api/analytics/performance?period=${period}`);
      if (!performanceResponse.ok) throw new Error('Failed to fetch performance metrics');
      const performanceData = await performanceResponse.json();
      setPerformanceMetrics(performanceData.metrics);

      // Fetch funnel data
      const funnelResponse = await fetch('/api/analytics/funnel/lead_to_customer');
      if (!funnelResponse.ok) throw new Error('Failed to fetch funnel data');
      const funnelDataResponse = await funnelResponse.json();
      setFunnelData(funnelDataResponse);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      if (import.meta.env.DEV) console.debug('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Error Loading Analytics
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchDashboardData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor user behavior and application performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(value: 'hour' | 'day' | 'week' | 'month') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Last Hour</SelectItem>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchDashboardData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.uniqueUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.uniqueSessions} sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pageViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalEvents} total events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.conversions} conversions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(metrics.averageSessionDuration)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.bounceRate.toFixed(1)}% bounce rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages by view count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-mono text-sm">{page.page}</span>
                      </div>
                      <span className="font-medium">{page.views}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Events */}
            <Card>
              <CardHeader>
                <CardTitle>Top Events</CardTitle>
                <CardDescription>Most frequent user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.topEvents.map((event, index) => (
                    <div key={event.event} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="text-sm">{event.event.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="font-medium">{event.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Event Distribution</CardTitle>
              <CardDescription>Breakdown of user interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics?.topEvents.slice(0, 6)}
                    dataKey="count"
                    nameKey="event"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ event, percent }) => `${event.replace(/_/g, ' ')} ${(percent * 100).toFixed(0)}%`}
                  >
                    {metrics?.topEvents.slice(0, 6).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          {funnelData && (
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel: {funnelData.name}</CardTitle>
                <CardDescription>
                  Track user progression through key conversion steps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Funnel Visualization */}
                  <div className="space-y-4">
                    {funnelData.steps.map((step, index) => {
                      const users = Math.round(funnelData.totalUsers * (funnelData.conversionRates[index] / 100));
                      const dropoff = funnelData.dropoffRates[index] || 0;
                      
                      return (
                        <div key={step.id} className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Badge variant={index === 0 ? "default" : "secondary"}>
                                {index + 1}
                              </Badge>
                              <div>
                                <h4 className="font-medium">{step.name}</h4>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{users.toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">
                                {funnelData.conversionRates[index].toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          
                          <Progress value={funnelData.conversionRates[index]} className="h-3" />
                          
                          {dropoff > 0 && (
                            <div className="mt-1 text-sm text-destructive">
                              {dropoff.toFixed(1)}% drop-off to next step
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Funnel Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{funnelData.totalUsers}</div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{funnelData.completedUsers}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {((funnelData.completedUsers / funnelData.totalUsers) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Conversion</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {performanceMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(performanceMetrics).map(([metric, data]) => (
                <Card key={metric}>
                  <CardHeader>
                    <CardTitle className="capitalize">{metric.replace(/([A-Z])/g, ' $1')}</CardTitle>
                    <CardDescription>Performance metric in {data.unit}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Average</div>
                        <div className="text-2xl font-bold">{data.avg.toFixed(1)} {data.unit}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">90th Percentile</div>
                        <div className="text-2xl font-bold">{data.p90.toFixed(1)} {data.unit}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Min / Max</div>
                        <div className="text-lg">{data.min.toFixed(1)} / {data.max.toFixed(1)} {data.unit}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Samples</div>
                        <div className="text-lg">{data.count}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest user interactions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Event stream functionality would be implemented here with real-time updates
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}