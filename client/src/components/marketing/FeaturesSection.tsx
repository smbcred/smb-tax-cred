/**
 * @file FeaturesSection.tsx
 * @description Features section showcasing key platform capabilities
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Tailwind CSS
 * @knowledgeBase Features section with service capabilities and benefits
 */

const features = [
  {
    icon: "fas fa-calculator",
    title: "Accurate Calculations",
    description: "Our algorithm uses the simplified ASC method to calculate your exact federal R&D tax credit based on qualifying research expenses.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    iconClass: "feature-icon-primary"
  },
  {
    icon: "fas fa-file-contract",
    title: "IRS-Compliant Forms",
    description: "AI-generated documentation and Form 6765 preparation that meets all IRS requirements for R&D tax credit claims.",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    iconClass: "feature-icon-secondary"
  },
  {
    icon: "fas fa-users",
    title: "Expert Support",
    description: "Dedicated support team to guide you through the process and ensure maximum credit capture for your business.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    iconClass: "feature-icon-accent"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Complete R&D Tax Credit Solution
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to maximize your R&D tax credits with professional, 
            IRS-compliant documentation.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="dashboard-card card-hover animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`feature-icon ${feature.iconClass}`}>
                <i className={`${feature.icon} text-xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-600 mb-6">
                {feature.description}
              </p>
              <img 
                src={feature.image} 
                alt={`${feature.title} illustration`}
                className="rounded-lg w-full h-32 object-cover" 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
