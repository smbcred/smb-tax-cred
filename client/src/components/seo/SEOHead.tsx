import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  canonical?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'R&D Tax Credit Calculator for Small Businesses Using AI | SMBTaxCredits.com',
  description = 'Turn everyday AI experiments into tax savings. Calculate your R&D tax credit in minutes. Free calculator for small businesses using ChatGPT, Claude, and other AI tools.',
  keywords = 'R&D tax credit calculator, small business tax credits, AI tax deductions, research and development credit, small business AI, tax savings calculator',
  image = 'https://smbtaxcredits.com/og-image.png',
  url = 'https://smbtaxcredits.com',
  type = 'website',
  noindex = false,
  canonical
}) => {
  // Ensure title is not too long (recommended 50-60 characters)
  const optimizedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  
  // Ensure description is optimal length (120-160 characters)
  const optimizedDescription = description.length > 160 ? description.substring(0, 157) + '...' : description;

  const siteUrl = 'https://smbtaxcredits.com';
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const canonicalUrl = canonical || fullUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{optimizedTitle}</title>
      <meta name="title" content={optimizedTitle} />
      <meta name="description" content={optimizedDescription} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={optimizedTitle} />
      <meta property="og:description" content={optimizedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="SMBTaxCredits.com" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={optimizedTitle} />
      <meta property="twitter:description" content={optimizedDescription} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:site" content="@smbtaxcredits" />
      <meta property="twitter:creator" content="@smbtaxcredits" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="author" content="SMBTaxCredits.com" />
      <meta name="publisher" content="SMBTaxCredits.com" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      
      {/* App-specific */}
      <meta name="application-name" content="SMBTaxCredits" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* Performance Hints */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

// Page-specific SEO components
export const HomePageSEO = () => (
  <SEOHead
    title="R&D Tax Credit Calculator for Small Businesses Using AI | SMBTaxCredits.com"
    description="Turn everyday AI experiments into tax savings. Calculate your R&D tax credit in minutes. Free calculator for small businesses using ChatGPT, Claude, and other AI tools."
    keywords="R&D tax credit calculator, small business tax credits, AI tax deductions, research and development credit, small business AI, tax savings calculator"
    url="/"
  />
);

export const CalculatorPageSEO = () => (
  <SEOHead
    title="Free R&D Tax Credit Calculator | Instant Qualification Assessment"
    description="Calculate your R&D tax credit instantly. See if your AI experiments qualify for federal tax credits. Free calculator with real-time results for small businesses."
    keywords="R&D tax credit calculator, free tax calculator, AI R&D qualification, small business tax credits, research development calculator"
    url="/calculator"
    type="product"
  />
);

export const PricingPageSEO = () => (
  <SEOHead
    title="R&D Tax Credit Documentation Pricing | SMBTaxCredits.com"
    description="Simple, transparent pricing for R&D tax credit documentation. Complete IRS-compliant reports starting at $297. No hidden fees, no surprises."
    keywords="R&D tax credit pricing, tax documentation cost, small business tax software pricing, R&D documentation fees"
    url="/pricing"
  />
);

export const BlogPostSEO = ({ 
  title, 
  description, 
  slug, 
  keywords,
  image,
  datePublished 
}: {
  title: string;
  description: string;
  slug: string;
  keywords?: string;
  image?: string;
  datePublished?: string;
}) => (
  <SEOHead
    title={`${title} | SMBTaxCredits.com Blog`}
    description={description}
    keywords={keywords || 'R&D tax credits, small business tax strategy, AI business tips'}
    url={`/blog/${slug}`}
    type="article"
    image={image}
  />
);

export const FAQPageSEO = () => (
  <SEOHead
    title="R&D Tax Credit FAQ | Common Questions Answered | SMBTaxCredits.com"
    description="Get answers to common questions about R&D tax credits for small businesses using AI. Learn about qualification, documentation, and claiming process."
    keywords="R&D tax credit FAQ, tax credit questions, small business tax help, AI tax deduction questions"
    url="/faq"
  />
);

export default SEOHead;