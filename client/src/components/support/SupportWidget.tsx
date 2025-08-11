import { useState } from 'react';
import { MessageCircle, X, Send, Phone, Mail, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

interface SupportWidgetProps {
  defaultOpen?: boolean;
  trigger?: 'float' | 'inline' | 'button';
  position?: 'bottom-right' | 'bottom-left';
}

export function SupportWidget({ 
  defaultOpen = false, 
  trigger = 'float',
  position = 'bottom-right' 
}: SupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mode, setMode] = useState<'menu' | 'ticket' | 'chat' | 'knowledge'>('menu');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: ''
  });
  const { toast } = useToast();

  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });
      if (!response.ok) throw new Error('Failed to create ticket');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Support ticket created",
        description: `Ticket #${data.ticket.id} has been created. We'll respond within 24 hours.`
      });
      setIsOpen(false);
      setFormData({ name: '', email: '', subject: '', message: '', category: '' });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmitTicket = () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    createTicketMutation.mutate(formData);
  };

  const supportOptions = [
    {
      id: 'ticket',
      title: 'Create Support Ticket',
      description: 'Get help with technical issues or questions',
      icon: <Mail className="h-5 w-5" />,
      action: () => setMode('ticket')
    },
    {
      id: 'knowledge',
      title: 'Browse Help Center',
      description: 'Find answers in our knowledge base',
      icon: <HelpCircle className="h-5 w-5" />,
      action: () => window.open('/help', '_blank')
    },
    {
      id: 'phone',
      title: 'Schedule a Call',
      description: 'Book a consultation with our team',
      icon: <Phone className="h-5 w-5" />,
      action: () => window.open('mailto:support@smbtaxcredits.com?subject=Schedule Call Request', '_blank')
    }
  ];

  if (trigger === 'inline') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Need Help?
          </CardTitle>
          <CardDescription>
            Choose how you'd like to get support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {supportOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                onClick={option.action}
              >
                {option.icon}
                <div>
                  <div className="font-medium">{option.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      {/* Widget toggle button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Widget panel */}
      {isOpen && (
        <Card className="w-96 h-[500px] shadow-2xl border-2 flex flex-col">
          <CardHeader className="flex-shrink-0 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <CardTitle className="text-lg">
                  {mode === 'menu' && 'Support'}
                  {mode === 'ticket' && 'Create Ticket'}
                  {mode === 'chat' && 'Live Chat'}
                  {mode === 'knowledge' && 'Help Center'}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {mode !== 'menu' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setMode('menu')}
                  >
                    Back
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Online
              </Badge>
              <span className="text-xs text-muted-foreground">
                Avg response: 2 hours
              </span>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto">
            {mode === 'menu' && (
              <div className="space-y-3">
                {supportOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="w-full h-auto p-3 flex items-start gap-3 text-left"
                    onClick={option.action}
                  >
                    {option.icon}
                    <div>
                      <div className="font-medium">{option.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {mode === 'ticket' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="calculator">Calculator Help</SelectItem>
                      <SelectItem value="account">Account Support</SelectItem>
                      <SelectItem value="general">General Question</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                  <Textarea
                    placeholder="Describe your issue or question..."
                    className="min-h-[100px]"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <Button 
                  onClick={handleSubmitTicket} 
                  className="w-full"
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? (
                    "Creating..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Create Ticket
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}