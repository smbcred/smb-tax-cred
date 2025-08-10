import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Calendar, Clock, ArrowRight, Search, TrendingUp, DollarSign, FileText, Users, Lightbulb, Shield } from "lucide-react";
import { useState } from "react";
import ResponsiveNav from "@/components/navigation/ResponsiveNav";
import { Footer } from "@/components/layout/Footer";

const blogPosts = [
  {
    id: 1,
    title: "How AI Development Qualifies for R&D Tax Credits in 2025",
    excerpt: "Learn how companies developing AI solutions, custom GPTs, and automation tools can claim substantial R&D tax credits.",
    category: "AI & Innovation",
    author: "Sarah Chen",
    date: "January 8, 2025",
    readTime: "5 min read",
    featured: true,
    icon: Lightbulb,
    tags: ["AI", "Tax Credits", "Innovation"]
  },
  {
    id: 2,
    title: "Small Business Guide: Claiming Your First R&D Tax Credit",
    excerpt: "A step-by-step guide for small businesses to navigate the R&D tax credit process and maximize their benefits.",
    category: "Getting Started",
    author: "Michael Rodriguez",
    date: "January 5, 2025",
    readTime: "8 min read",
    featured: true,
    icon: TrendingUp,
    tags: ["Small Business", "Guide", "First-Time"]
  },
  {
    id: 3,
    title: "Common R&D Tax Credit Mistakes and How to Avoid Them",
    excerpt: "Avoid these 7 common pitfalls that could reduce your R&D tax credit or trigger an IRS audit.",
    category: "Best Practices",
    author: "Jennifer Park",
    date: "January 3, 2025",
    readTime: "6 min read",
    featured: false,
    icon: Shield,
    tags: ["Compliance", "Mistakes", "IRS"]
  },
  {
    id: 4,
    title: "SaaS Companies: Your Development Costs Are Tax Credits",
    excerpt: "How SaaS companies can turn their product development expenses into valuable federal tax credits.",
    category: "Industry Focus",
    author: "David Kim",
    date: "December 28, 2024",
    readTime: "7 min read",
    featured: false,
    icon: DollarSign,
    tags: ["SaaS", "Software", "Development"]
  },
  {
    id: 5,
    title: "Documentation Best Practices for R&D Tax Credits",
    excerpt: "What to document, how to organize it, and why proper documentation is crucial for IRS compliance.",
    category: "Documentation",
    author: "Emily Watson",
    date: "December 22, 2024",
    readTime: "10 min read",
    featured: false,
    icon: FileText,
    tags: ["Documentation", "Compliance", "IRS"]
  },
  {
    id: 6,
    title: "R&D Tax Credits for Healthcare Innovation",
    excerpt: "How healthcare companies developing telehealth, AI diagnostics, and patient systems qualify for credits.",
    category: "Industry Focus",
    author: "Dr. James Liu",
    date: "December 18, 2024",
    readTime: "9 min read",
    featured: false,
    icon: Shield,
    tags: ["Healthcare", "Medical", "Innovation"]
  },
  {
    id: 7,
    title: "Payroll Tax Credits: Perfect for Pre-Revenue Startups",
    excerpt: "How startups with little to no revenue can still benefit from R&D tax credits through payroll tax offsets.",
    category: "Startups",
    author: "Alex Thompson",
    date: "December 15, 2024",
    readTime: "5 min read",
    featured: false,
    icon: Users,
    tags: ["Startups", "Payroll", "Pre-Revenue"]
  },
  {
    id: 8,
    title: "Cloud Computing Costs and R&D Tax Credits",
    excerpt: "AWS, Azure, and GCP expenses can qualify for R&D tax credits. Here's what you need to know.",
    category: "Technology",
    author: "Rachel Green",
    date: "December 10, 2024",
    readTime: "6 min read",
    featured: false,
    icon: TrendingUp,
    tags: ["Cloud", "AWS", "Technology"]
  }
];

const categories = ["All", "AI & Innovation", "Getting Started", "Industry Focus", "Documentation", "Best Practices", "Startups", "Technology"];

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cloud-50 to-white">
      {/* Global Navigation */}
      <ResponsiveNav />
      
      {/* Hero Section with padding for fixed nav */}
      <section className="bg-gradient-to-r from-ink-900 to-ink-800 text-white py-16 pt-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-500 text-white">Innovation Insights</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              R&D Tax Credit Blog
            </h1>
            <p className="text-xl text-ash-200 mb-8">
              Expert insights on maximizing your innovation tax credits
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-6 text-ink-900 bg-white"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ash-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-ash-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-ink-900 text-white" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-bold mb-8">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map(post => {
                const Icon = post.icon;
                return (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow border-2 border-emerald-100">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <Badge className="bg-emerald-100 text-emerald-700">{post.category}</Badge>
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-emerald-600" />
                        </div>
                      </div>
                      <CardTitle className="text-xl hover:text-emerald-600 transition-colors cursor-pointer">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="mt-2">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-ash-500 mb-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full group">
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Regular Posts */}
      {regularPosts.length > 0 && (
        <section className="py-16 bg-cloud-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-bold mb-8">Recent Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map(post => {
                const Icon = post.icon;
                return (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">{post.category}</Badge>
                        <div className="h-8 w-8 rounded-lg bg-ash-100 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-ink-600" />
                        </div>
                      </div>
                      <CardTitle className="text-lg hover:text-emerald-600 transition-colors cursor-pointer">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-ash-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <Button variant="outline" className="w-full group" size="sm">
                        Read More
                        <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* No Results */}
      {filteredPosts.length === 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-ash-600 text-lg">No articles found matching your search criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-ink-900 to-ink-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Stay Updated on R&D Tax Credits</h2>
          <p className="text-xl text-ash-200 mb-8 max-w-2xl mx-auto">
            Get weekly insights on innovation tax credits, compliance updates, and optimization strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email"
              className="bg-white text-ink-900"
            />
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Subscribe
            </Button>
          </div>
          <p className="text-sm text-ash-300 mt-4">
            Join 5,000+ innovators maximizing their tax credits
          </p>
        </div>
      </section>

      {/* Related Actions */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">Ready to Claim Your Credit?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Calculate Your Credit
              </Button>
            </Link>
            <Link href="/qualifying-activities">
              <Button size="lg" variant="outline">
                Check Qualifying Activities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}