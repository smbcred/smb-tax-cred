import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, ThumbsUp, ThumbsDown, AlertTriangle, Bug } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface FeedbackData {
  type: 'survey' | 'widget' | 'interview' | 'bug_report';
  category: 'ux' | 'content' | 'technical' | 'business';
  severity: 'critical' | 'high' | 'medium' | 'low';
  page?: string;
  feature?: string;
  rating?: number;
  npsScore?: number;
  title: string;
  description: string;
  tags?: string[];
}

interface UserFeedbackWidgetProps {
  page?: string;
  feature?: string;
  trigger?: 'button' | 'float' | 'inline';
  showRating?: boolean;
  showNPS?: boolean;
}

export function UserFeedbackWidget({ 
  page, 
  feature, 
  trigger = 'float',
  showRating = true,
  showNPS = false 
}: UserFeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<FeedbackData>>({
    type: 'widget',
    category: 'ux',
    severity: 'medium',
    page: page || window.location.pathname,
    feature,
    title: '',
    description: '',
    tags: []
  });
  const [rating, setRating] = useState<number>(0);
  const [npsScore, setNpsScore] = useState<number>(0);

  const queryClient = useQueryClient();

  const submitFeedback = useMutation({
    mutationFn: async (data: FeedbackData) => {
      return apiRequest('/api/feedback', {
        method: 'POST',
        data: {
          ...data,
          rating: showRating ? rating : undefined,
          npsScore: showNPS ? npsScore : undefined,
          metadata: {
            userAgent: navigator.userAgent,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            testingPhase: 'unmoderated',
            referenceId: crypto.randomUUID()
          }
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it and make improvements."
      });
      setIsOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "We couldn't submit your feedback. Please try again.",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      type: 'widget',
      category: 'ux',
      severity: 'medium',
      page: page || window.location.pathname,
      feature,
      title: '',
      description: '',
      tags: []
    });
    setRating(0);
    setNpsScore(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and description for your feedback.",
        variant: "destructive"
      });
      return;
    }

    submitFeedback.mutate(formData as FeedbackData);
  };

  const QuickFeedback = () => (
    <div className="flex items-center gap-2 p-2 bg-card/50 backdrop-blur-sm rounded-lg border">
      <span className="text-sm text-muted-foreground">How's this page?</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setFormData({ ...formData, title: 'Positive feedback', rating: 8 });
          setRating(8);
          setIsOpen(true);
        }}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setFormData({ ...formData, title: 'Needs improvement', rating: 3 });
          setRating(3);
          setIsOpen(true);
        }}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setFormData({ ...formData, type: 'bug_report', category: 'technical', title: 'Bug report' });
          setIsOpen(true);
        }}
      >
        <Bug className="h-4 w-4" />
      </Button>
    </div>
  );

  const FeedbackDialog = () => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve your experience. Your feedback is valuable and will be reviewed by our team.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Feedback Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({ ...formData, type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="widget">General Feedback</SelectItem>
                <SelectItem value="bug_report">Bug Report</SelectItem>
                <SelectItem value="survey">Feature Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ux">User Experience</SelectItem>
                <SelectItem value="content">Content & Messaging</SelectItem>
                <SelectItem value="technical">Technical Issue</SelectItem>
                <SelectItem value="business">Business Process</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          {showRating && (
            <div className="space-y-2">
              <Label>Overall Rating (1-10)</Label>
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <Button
                    key={i}
                    type="button"
                    size="sm"
                    variant={rating > i ? "default" : "outline"}
                    onClick={() => setRating(i + 1)}
                    className="w-8 h-8 p-0"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* NPS Score */}
          {showNPS && (
            <div className="space-y-2">
              <Label>How likely are you to recommend us? (0-10)</Label>
              <div className="flex gap-1">
                {[...Array(11)].map((_, i) => (
                  <Button
                    key={i}
                    type="button"
                    size="sm"
                    variant={npsScore === i ? "default" : "outline"}
                    onClick={() => setNpsScore(i)}
                    className="w-8 h-8 p-0 text-xs"
                  >
                    {i}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of your feedback"
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide detailed feedback..."
              rows={4}
              required
            />
          </div>

          {/* Context Info */}
          {(page || feature) && (
            <div className="space-y-2">
              <Label>Context</Label>
              <div className="flex gap-2">
                {page && <Badge variant="outline">Page: {page}</Badge>}
                {feature && <Badge variant="outline">Feature: {feature}</Badge>}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitFeedback.isPending}>
              {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (trigger === 'inline') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Quick Feedback
          </CardTitle>
          <CardDescription>
            Help us improve this page
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <QuickFeedback />
          <FeedbackDialog />
        </CardContent>
      </Card>
    );
  }

  if (trigger === 'float') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <MessageSquare className="h-5 w-5 mr-2" />
              Feedback
            </Button>
          </DialogTrigger>
          <FeedbackDialog />
        </Dialog>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          Give Feedback
        </Button>
      </DialogTrigger>
      <FeedbackDialog />
    </Dialog>
  );
}