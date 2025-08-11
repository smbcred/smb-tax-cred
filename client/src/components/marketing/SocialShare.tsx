import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Twitter, Linkedin, Facebook, Link2, Mail } from 'lucide-react';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  variant?: 'default' | 'compact' | 'floating';
  className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  url = window.location.href,
  title = 'Check out this R&D Tax Credit Calculator for Small Businesses',
  description = 'I just discovered I might qualify for thousands in R&D tax credits for using AI tools. This free calculator shows your potential savings instantly.',
  hashtags = ['RDTaxCredit', 'SmallBusiness', 'AITools', 'TaxSavings'],
  variant = 'default',
  className = ''
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags.join(',')}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${url}`
  };

  const handleShare = async (platform: string) => {
    // Track social share event
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'social_share',
          properties: {
            platform,
            url,
            title,
            shareType: 'manual'
          },
          sessionId: sessionStorage.getItem('sessionId') || 'anonymous',
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }

    // Open share window
    if (platform === 'email') {
      window.location.href = shareLinks.email;
    } else {
      window.open(
        shareLinks[platform as keyof typeof shareLinks],
        '_blank',
        'width=600,height=400'
      );
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      
      // Track copy link event
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'social_share',
          properties: {
            platform: 'copy_link',
            url,
            shareType: 'copy'
          },
          sessionId: sessionStorage.getItem('sessionId') || 'anonymous'
        })
      });

      // Show feedback (could enhance with toast notification)
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link. Please copy manually: ' + url);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });

        // Track native share
        await fetch('/api/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'social_share',
            properties: {
              platform: 'native',
              url,
              shareType: 'native'
            },
            sessionId: sessionStorage.getItem('sessionId') || 'anonymous'
          })
        });
      } catch (error) {
        console.log('Native share cancelled or failed:', error);
      }
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {navigator.share && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            className="flex items-center space-x-1"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="text-blue-500 hover:text-blue-600"
        >
          <Twitter className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin')}
          className="text-blue-700 hover:text-blue-800"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="bg-blue-500 text-white hover:bg-blue-600"
          title="Share on Twitter"
        >
          <Twitter className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin')}
          className="bg-blue-700 text-white hover:bg-blue-800"
          title="Share on LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          className="bg-blue-600 text-white hover:bg-blue-700"
          title="Share on Facebook"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="bg-gray-600 text-white hover:bg-gray-700"
          title="Copy Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Share2 className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Share this calculator</h3>
      </div>
      
      <p className="text-sm text-gray-600">
        Help other small business owners discover their R&D tax credit potential
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant="outline"
          onClick={() => handleShare('twitter')}
          className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
        >
          <Twitter className="h-4 w-4" />
          <span>Twitter</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => handleShare('linkedin')}
          className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
        >
          <Linkedin className="h-4 w-4" />
          <span>LinkedIn</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => handleShare('facebook')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Facebook className="h-4 w-4" />
          <span>Facebook</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => handleShare('email')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
        >
          <Mail className="h-4 w-4" />
          <span>Email</span>
        </Button>
      </div>

      <div className="flex items-center space-x-2 pt-2 border-t">
        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
        >
          <Link2 className="h-4 w-4" />
          <span>Copy Link</span>
        </Button>

        {navigator.share && (
          <Button
            variant="outline"
            onClick={handleNativeShare}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
          >
            <Share2 className="h-4 w-4" />
            <span>More Options</span>
          </Button>
        )}
      </div>

      <div className="text-xs text-gray-500">
        Share with hashtags: {hashtagString}
      </div>
    </div>
  );
};

// Pre-configured share components for specific pages
export const CalculatorShare = () => (
  <SocialShare
    title="Free R&D Tax Credit Calculator - See Your Potential Savings"
    description="I just found out my small business could qualify for thousands in R&D tax credits for using AI tools. Check your eligibility with this free calculator!"
    hashtags={['RDTaxCredit', 'SmallBusiness', 'AITaxCredit', 'TaxSavings']}
    url={`${window.location.origin}/calculator`}
  />
);

export const ResultsShare = ({ estimatedCredit }: { estimatedCredit: number }) => (
  <SocialShare
    variant="compact"
    title={`I could save $${estimatedCredit.toLocaleString()} with R&D tax credits!`}
    description={`Just discovered my business might qualify for $${estimatedCredit.toLocaleString()} in R&D tax credits for using AI tools. Check your potential savings!`}
    hashtags={['RDTaxCredit', 'TaxSavings', 'SmallBusiness']}
  />
);

export const BlogShare = ({ title, slug }: { title: string; slug: string }) => (
  <SocialShare
    variant="default"
    title={title}
    description="Great insights on R&D tax credits for small businesses using AI tools."
    hashtags={['RDTaxCredit', 'SmallBusiness', 'TaxStrategy']}
    url={`${window.location.origin}/blog/${slug}`}
  />
);

export default SocialShare;