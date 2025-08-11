import express from 'express';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Validation schemas
const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(10)
});

const feedbackSchema = z.object({
  helpful: z.boolean(),
  articleId: z.string(),
  comment: z.string().max(500).optional()
});

// In-memory help content cache
let helpContentCache: any = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  tags: string[];
  lastUpdated: string;
  helpful: number;
  notHelpful: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  popular: boolean;
  helpful: number;
  notHelpful: number;
}

// Load help content from markdown files
async function loadHelpContent(): Promise<{ articles: HelpArticle[]; faq: FAQItem[] }> {
  const now = Date.now();
  
  if (helpContentCache && (now - lastCacheUpdate) < CACHE_DURATION) {
    return helpContentCache;
  }

  try {
    const docsPath = path.join(__dirname, '../../docs/user');
    
    // Load articles from markdown files
    const articles: HelpArticle[] = [
      {
        id: 'getting-started',
        title: 'Getting Started with SMBTaxCredits.com',
        description: 'Complete guide to using our platform effectively',
        category: 'Getting Started',
        content: await fs.readFile(path.join(docsPath, 'getting-started.md'), 'utf8'),
        tags: ['basics', 'overview', 'first-time'],
        lastUpdated: '2024-01-15',
        helpful: 127,
        notHelpful: 8
      },
      {
        id: 'faq',
        title: 'Frequently Asked Questions',
        description: 'Quick answers to common questions',
        category: 'FAQ',
        content: await fs.readFile(path.join(docsPath, 'faq.md'), 'utf8'),
        tags: ['questions', 'answers', 'common'],
        lastUpdated: '2024-01-14',
        helpful: 95,
        notHelpful: 12
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting Guide',
        description: 'Solutions to common problems',
        category: 'Technical',
        content: await fs.readFile(path.join(docsPath, 'troubleshooting.md'), 'utf8'),
        tags: ['problems', 'solutions', 'technical'],
        lastUpdated: '2024-01-13',
        helpful: 73,
        notHelpful: 5
      },
      {
        id: 'api-documentation',
        title: 'API Documentation',
        description: 'Technical documentation for developers',
        category: 'API',
        content: await fs.readFile(path.join(docsPath, 'api-documentation.md'), 'utf8'),
        tags: ['api', 'developers', 'integration'],
        lastUpdated: '2024-01-12',
        helpful: 41,
        notHelpful: 3
      }
    ];

    // FAQ items extracted from content
    const faq: FAQItem[] = [
      {
        id: 'savings-amount',
        question: 'How much can I save with R&D tax credits?',
        answer: 'R&D tax credits can be worth 6-14% of your qualifying expenses, up to $250,000 per year for small businesses.',
        category: 'general',
        popular: true,
        helpful: 156,
        notHelpful: 7
      },
      {
        id: 'ai-qualification',
        question: 'Do I qualify if I just use AI tools like ChatGPT?',
        answer: 'Potentially yes! If you\'re experimenting with AI tools to improve business processes, you may qualify.',
        category: 'eligibility',
        popular: true,
        helpful: 134,
        notHelpful: 19
      },
      {
        id: 'process-timeline',
        question: 'How long does the documentation process take?',
        answer: 'About 1 week total: 30-60 minutes for intake, then 3-5 business days for document generation.',
        category: 'process',
        popular: true,
        helpful: 98,
        notHelpful: 4
      },
      {
        id: 'time-tracking',
        question: 'What if I don\'t have detailed time tracking?',
        answer: 'That\'s common! We help you estimate time spent based on project descriptions and scope.',
        category: 'documentation',
        popular: false,
        helpful: 67,
        notHelpful: 8
      },
      {
        id: 'previous-years',
        question: 'Can I claim credits for previous years?',
        answer: 'Yes, you can typically claim R&D credits for the past 3 years if you have qualifying activities.',
        category: 'eligibility',
        popular: false,
        helpful: 52,
        notHelpful: 6
      },
      {
        id: 'data-security',
        question: 'Is my data secure?',
        answer: 'Yes. We use enterprise-grade security including 256-bit SSL encryption and SOC 2 compliance.',
        category: 'technical',
        popular: false,
        helpful: 89,
        notHelpful: 2
      }
    ];

    helpContentCache = { articles, faq };
    lastCacheUpdate = now;
    
    return helpContentCache;
  } catch (error) {
    console.error('Error loading help content:', error);
    
    // Return fallback content if files can't be loaded
    return {
      articles: [],
      faq: [
        {
          id: 'contact-support',
          question: 'How can I get help?',
          answer: 'Contact our support team at help@smbtaxcredits.com for assistance.',
          category: 'support',
          popular: true,
          helpful: 1,
          notHelpful: 0
        }
      ]
    };
  }
}

// GET /api/help/articles - Get all help articles
router.get('/articles', async (req, res) => {
  try {
    const { articles } = await loadHelpContent();
    
    res.json({
      success: true,
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        description: article.description,
        category: article.category,
        tags: article.tags,
        lastUpdated: article.lastUpdated,
        helpful: article.helpful,
        notHelpful: article.notHelpful
      }))
    });
  } catch (error) {
    console.error('Error fetching help articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load help articles'
    });
  }
});

// GET /api/help/articles/:id - Get specific help article
router.get('/articles/:id', async (req, res) => {
  try {
    const { articles } = await loadHelpContent();
    const article = articles.find(a => a.id === req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }
    
    res.json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Error fetching help article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load help article'
    });
  }
});

// GET /api/help/faq - Get FAQ items
router.get('/faq', async (req, res) => {
  try {
    const { faq } = await loadHelpContent();
    
    res.json({
      success: true,
      faq
    });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load FAQ'
    });
  }
});

// GET /api/help/search - Search help content
router.get('/search', async (req, res) => {
  try {
    const validation = searchQuerySchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search parameters',
        details: validation.error.errors
      });
    }
    
    const { q, category, limit } = validation.data;
    const { articles, faq } = await loadHelpContent();
    
    const searchLower = q.toLowerCase();
    
    // Search articles
    const matchingArticles = articles
      .filter(article => {
        const matchesQuery = 
          article.title.toLowerCase().includes(searchLower) ||
          article.description.toLowerCase().includes(searchLower) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          article.content.toLowerCase().includes(searchLower);
        
        const matchesCategory = !category || article.category.toLowerCase() === category.toLowerCase();
        
        return matchesQuery && matchesCategory;
      })
      .slice(0, limit)
      .map(article => ({
        type: 'article',
        id: article.id,
        title: article.title,
        description: article.description,
        category: article.category,
        relevanceScore: calculateRelevance(article, searchLower)
      }));
    
    // Search FAQ
    const matchingFAQ = faq
      .filter(item => {
        const matchesQuery = 
          item.question.toLowerCase().includes(searchLower) ||
          item.answer.toLowerCase().includes(searchLower);
        
        const matchesCategory = !category || item.category.toLowerCase() === category.toLowerCase();
        
        return matchesQuery && matchesCategory;
      })
      .slice(0, limit)
      .map(item => ({
        type: 'faq',
        id: item.id,
        title: item.question,
        description: item.answer.substring(0, 100) + '...',
        category: item.category,
        relevanceScore: calculateRelevance(item, searchLower)
      }));
    
    // Combine and sort by relevance
    const results = [...matchingArticles, ...matchingFAQ]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
    
    res.json({
      success: true,
      query: q,
      category,
      results,
      total: results.length
    });
  } catch (error) {
    console.error('Error searching help content:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

// POST /api/help/feedback - Submit feedback on help content
router.post('/feedback', async (req, res) => {
  try {
    const validation = feedbackSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feedback data',
        details: validation.error.errors
      });
    }
    
    const { helpful, articleId, comment } = validation.data;
    
    // In a real implementation, you would save this to a database
    console.log('Help feedback received:', {
      articleId,
      helpful,
      comment,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });
    
    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    console.error('Error recording help feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record feedback'
    });
  }
});

// GET /api/help/categories - Get available categories
router.get('/categories', async (req, res) => {
  try {
    const { articles, faq } = await loadHelpContent();
    
    const articleCategories = Array.from(new Set(articles.map(a => a.category)));
    const faqCategories = Array.from(new Set(faq.map(f => f.category)));
    const allCategories = Array.from(new Set([...articleCategories, ...faqCategories]));
    
    res.json({
      success: true,
      categories: allCategories.sort()
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load categories'
    });
  }
});

// Calculate relevance score for search results
function calculateRelevance(item: any, searchTerm: string): number {
  let score = 0;
  const lower = searchTerm.toLowerCase();
  
  // Title match (highest weight)
  if (item.title?.toLowerCase().includes(lower)) {
    score += 10;
  }
  
  // Question match (for FAQ)
  if (item.question?.toLowerCase().includes(lower)) {
    score += 10;
  }
  
  // Description/answer match
  if (item.description?.toLowerCase().includes(lower) || item.answer?.toLowerCase().includes(lower)) {
    score += 5;
  }
  
  // Tag match
  if (item.tags?.some((tag: string) => tag.toLowerCase().includes(lower))) {
    score += 3;
  }
  
  // Popularity boost
  if (item.popular) {
    score += 2;
  }
  
  // Helpfulness boost
  if (item.helpful > item.notHelpful) {
    score += 1;
  }
  
  return score;
}

export default router;