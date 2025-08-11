import { useState } from 'react';
import { MessageCircle, Clock, CheckCircle, AlertCircle, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { SupportWidget } from '@/components/support/SupportWidget';

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user's support tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['/api/support/tickets'],
    enabled: !!localStorage.getItem('auth_token')
  });

  // Fetch support metrics
  const { data: metrics } = useQuery({
    queryKey: ['/api/support/metrics']
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Support Center
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get help with your R&D tax credit documentation and platform questions
          </p>
        </div>

        {/* Support metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{metrics.totalTickets || 0}</div>
                    <div className="text-sm text-gray-600">Total Tickets</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">{metrics.avgResponseTime || 0}m</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{metrics.satisfactionScore || 0}/5</div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold">{metrics.openTickets || 0}</div>
                    <div className="text-sm text-gray-600">Open Tickets</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main content */}
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Get Support</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>

          {/* Create support ticket */}
          <TabsContent value="create">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>How can we help you?</CardTitle>
                  <CardDescription>
                    Choose the best way to get support for your needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SupportWidget trigger="inline" />
                </CardContent>
              </Card>

              {/* Quick help links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Help</CardTitle>
                  <CardDescription>
                    Common questions and helpful resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">Getting Started</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li><a href="/help#calculator" className="hover:text-blue-600">Using the Calculator</a></li>
                        <li><a href="/help#eligibility" className="hover:text-blue-600">R&D Credit Eligibility</a></li>
                        <li><a href="/help#documentation" className="hover:text-blue-600">Required Documentation</a></li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Account & Billing</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li><a href="/help#account" className="hover:text-blue-600">Account Management</a></li>
                        <li><a href="/help#payment" className="hover:text-blue-600">Payment & Pricing</a></li>
                        <li><a href="/help#documents" className="hover:text-blue-600">Document Delivery</a></li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My tickets */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Support Tickets</CardTitle>
                    <CardDescription>
                      Track the status of your support requests
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Ticket
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No support tickets yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Create your first ticket to get help from our team
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket: any) => (
                      <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{ticket.subject}</h3>
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {ticket.message.substring(0, 100)}...
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>#{ticket.id}</span>
                              <span>{formatDate(ticket.createdAt)}</span>
                              <span>Category: {ticket.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge base */}
          <TabsContent value="knowledge">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>
                  Search our help articles and documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search help articles..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Getting Started</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li><a href="/help#calculator" className="text-blue-600 hover:underline">How to use the R&D Calculator</a></li>
                          <li><a href="/help#eligibility" className="text-blue-600 hover:underline">Understanding R&D Credit Eligibility</a></li>
                          <li><a href="/help#signup" className="text-blue-600 hover:underline">Creating Your Account</a></li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Documentation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li><a href="/help#forms" className="text-blue-600 hover:underline">Required Forms & Documents</a></li>
                          <li><a href="/help#expenses" className="text-blue-600 hover:underline">Tracking Qualified Expenses</a></li>
                          <li><a href="/help#submission" className="text-blue-600 hover:underline">Submitting Your Information</a></li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Billing & Payment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li><a href="/help#pricing" className="text-blue-600 hover:underline">Understanding Our Pricing</a></li>
                          <li><a href="/help#payment" className="text-blue-600 hover:underline">Payment Methods</a></li>
                          <li><a href="/help#refunds" className="text-blue-600 hover:underline">Refund Policy</a></li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Technical Support</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li><a href="/help#troubleshooting" className="text-blue-600 hover:underline">Common Issues</a></li>
                          <li><a href="/help#browser" className="text-blue-600 hover:underline">Browser Requirements</a></li>
                          <li><a href="/help#security" className="text-blue-600 hover:underline">Account Security</a></li>
                        </ul>
                      </CardContent>
                    </Card>
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