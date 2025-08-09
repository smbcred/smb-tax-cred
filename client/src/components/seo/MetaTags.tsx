/**
 * @file MetaTags.tsx
 * @description SEO meta tags for SMBTaxCredits.com
 * @knowledgeBase Copywriting & Positioning Guide.md - SEO section
 */

import { useEffect } from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export const MetaTags: React.FC<MetaTagsProps> = ({
  title = "Federal R&D Tax Credit for SMBs | Flat-Fee, Self-Serve, IRS-Compliant",
  description = "Claim the federal R&D credit without consultants. Flat-fee, self-serve platform that generates Form 6765 data, Section G summaries, and amended-return exhibits.",
  keywords = "R&D tax credit for small business, Form 6765 Section G, QRE examples, AI activities that qualify, payroll tax offset R&D credit"
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = description;
      document.head.appendChild(newMetaDescription);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      const newMetaKeywords = document.createElement('meta');
      newMetaKeywords.name = 'keywords';
      newMetaKeywords.content = keywords;
      document.head.appendChild(newMetaKeywords);
    }
    
    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', "Claim your federal R&D tax credit—without the runaround");
    } else {
      const newOgTitle = document.createElement('meta');
      newOgTitle.setAttribute('property', 'og:title');
      newOgTitle.content = "Claim your federal R&D tax credit—without the runaround";
      document.head.appendChild(newOgTitle);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', "Flat-fee, self-serve documentation for amended 2022–2024 and current 2025 filings");
    } else {
      const newOgDescription = document.createElement('meta');
      newOgDescription.setAttribute('property', 'og:description');
      newOgDescription.content = "Flat-fee, self-serve documentation for amended 2022–2024 and current 2025 filings";
      document.head.appendChild(newOgDescription);
    }
    
    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) {
      ogType.setAttribute('content', 'website');
    } else {
      const newOgType = document.createElement('meta');
      newOgType.setAttribute('property', 'og:type');
      newOgType.content = 'website';
      document.head.appendChild(newOgType);
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://smbtaxcredits.com');
    } else {
      const newOgUrl = document.createElement('meta');
      newOgUrl.setAttribute('property', 'og:url');
      newOgUrl.content = 'https://smbtaxcredits.com';
      document.head.appendChild(newOgUrl);
    }
    
    // Structured data for Local Business
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "SMBTaxCredits.com",
      "description": "R&D Tax Credit Documentation Platform",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "500",
        "highPrice": "1750",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    };
    
    const scriptElement = document.querySelector('script[type="application/ld+json"]');
    if (scriptElement) {
      scriptElement.textContent = JSON.stringify(structuredData);
    } else {
      const newScript = document.createElement('script');
      newScript.type = 'application/ld+json';
      newScript.textContent = JSON.stringify(structuredData);
      document.head.appendChild(newScript);
    }
    
  }, [title, description, keywords]);
  
  return null;
};