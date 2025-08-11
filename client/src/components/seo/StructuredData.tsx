import React from 'react';

interface StructuredDataProps {
  type: 'Organization' | 'WebApplication' | 'SoftwareApplication' | 'Article' | 'FAQPage';
  data: Record<string, any>;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const generateStructuredData = () => {
    const baseContext = {
      '@context': 'https://schema.org',
      '@type': type,
    };

    switch (type) {
      case 'Organization':
        return {
          ...baseContext,
          name: 'SMBTaxCredits.com',
          description: 'Turn everyday AI experiments into tax savings. R&D tax credit documentation platform for small businesses using AI tools.',
          url: 'https://smbtaxcredits.com',
          logo: 'https://smbtaxcredits.com/logo.png',
          sameAs: [
            'https://linkedin.com/company/smbtaxcredits',
            'https://twitter.com/smbtaxcredits'
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-800-SMBTAX',
            contactType: 'customer service',
            email: 'support@smbtaxcredits.com'
          },
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'US'
          },
          ...data
        };

      case 'WebApplication':
      case 'SoftwareApplication':
        return {
          ...baseContext,
          name: 'SMBTaxCredits R&D Tax Credit Calculator',
          description: 'Interactive calculator to estimate R&D tax credits for small businesses using AI tools. Get instant qualification assessment and savings estimation.',
          url: 'https://smbtaxcredits.com/calculator',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '297',
            priceCurrency: 'USD',
            category: 'Tax Software'
          },
          featureList: [
            'R&D Tax Credit Calculator',
            'AI Experiment Documentation',
            'IRS-Compliant Reporting',
            'CPA Integration'
          ],
          screenshot: 'https://smbtaxcredits.com/screenshot.png',
          ...data
        };

      case 'Article':
        return {
          ...baseContext,
          headline: data.title,
          description: data.description,
          image: data.image || 'https://smbtaxcredits.com/article-image.png',
          author: {
            '@type': 'Organization',
            name: 'SMBTaxCredits.com',
            url: 'https://smbtaxcredits.com'
          },
          publisher: {
            '@type': 'Organization',
            name: 'SMBTaxCredits.com',
            logo: {
              '@type': 'ImageObject',
              url: 'https://smbtaxcredits.com/logo.png'
            }
          },
          datePublished: data.datePublished,
          dateModified: data.dateModified || data.datePublished,
          ...data
        };

      case 'FAQPage':
        return {
          ...baseContext,
          mainEntity: data.questions?.map((q: any) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: q.answer
            }
          })) || [],
          ...data
        };

      default:
        return { ...baseContext, ...data };
    }
  };

  const structuredData = generateStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};

// Common structured data configurations
export const OrganizationStructuredData = () => (
  <StructuredData type="Organization" data={{}} />
);

export const CalculatorStructuredData = () => (
  <StructuredData type="WebApplication" data={{}} />
);

export const ArticleStructuredData = ({ 
  title, 
  description, 
  image, 
  datePublished, 
  dateModified 
}: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
}) => (
  <StructuredData 
    type="Article" 
    data={{ 
      title, 
      description, 
      image, 
      datePublished, 
      dateModified 
    }} 
  />
);

export const FAQStructuredData = ({ questions }: { questions: Array<{ question: string; answer: string }> }) => (
  <StructuredData type="FAQPage" data={{ questions }} />
);

export default StructuredData;