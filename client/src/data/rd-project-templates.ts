// R&D project templates and examples for guidance
export interface ProjectTemplate {
  name: string;
  description: string;
  technicalChallenges: string;
  businessPurpose: string;
  technicalUncertainty: string;
  processOfExperimentation: string;
  technologicalNature: string;
  successCriteria: string;
}

export const projectTemplates: ProjectTemplate[] = [
  {
    name: "AI-Powered Customer Service Automation",
    description: "Development of an intelligent customer service system using natural language processing to automatically handle customer inquiries, reduce response times, and improve customer satisfaction through machine learning-driven conversation understanding.",
    technicalChallenges: "Integrating multiple AI models for natural language understanding, handling complex customer queries with context awareness, maintaining conversation flow across multiple touchpoints, and ensuring accurate intent recognition across diverse customer communication styles.",
    businessPurpose: "Reduce customer service operational costs by 40% while improving response accuracy and customer satisfaction scores through automated, intelligent customer interaction management.",
    technicalUncertainty: "Uncertainty in achieving reliable natural language understanding across diverse customer communication patterns, maintaining conversation context across multiple channels, and integrating multiple AI models effectively.",
    processOfExperimentation: "Systematic testing of different NLP models, A/B testing conversation flows, iterative training on customer interaction data, performance benchmarking against human agents, and continuous model refinement based on feedback.",
    technologicalNature: "Integration of advanced natural language processing, machine learning algorithms, and conversational AI technologies to create automated customer service capabilities.",
    successCriteria: "Achieve 85% customer query resolution rate, reduce average response time to under 2 minutes, maintain customer satisfaction scores above 4.2/5, and demonstrate measurable cost reduction in customer service operations."
  },
  {
    name: "Predictive Analytics for Supply Chain Optimization",
    description: "Development of machine learning algorithms to predict supply chain disruptions, optimize inventory levels, and automate procurement decisions based on market trends, seasonal patterns, and external risk factors.",
    technicalChallenges: "Processing large datasets from multiple supply chain sources, creating accurate predictive models for market volatility, integrating real-time data feeds, and developing automated decision-making algorithms that balance cost and risk.",
    businessPurpose: "Reduce inventory costs by 25% while minimizing stockouts and improving supply chain resilience through predictive analytics and automated procurement optimization.",
    technicalUncertainty: "Uncertainty in predicting market disruptions accurately, integrating diverse data sources effectively, and creating reliable automated decision algorithms for complex supply chain scenarios.",
    processOfExperimentation: "Testing various machine learning algorithms, backtesting against historical supply chain data, validating predictions against actual market events, iterative model refinement, and controlled deployment phases.",
    technologicalNature: "Development of predictive analytics algorithms, machine learning models, and automated decision systems for supply chain management optimization.",
    successCriteria: "Achieve 80% accuracy in supply chain disruption predictions, reduce inventory carrying costs by 25%, maintain 99.5% product availability, and demonstrate ROI within 12 months of implementation."
  },
  {
    name: "Automated Code Quality and Security Analysis",
    description: "Creation of an AI-driven system that automatically analyzes source code for quality issues, security vulnerabilities, and performance optimization opportunities, providing developers with actionable recommendations and automated fixes.",
    technicalChallenges: "Analyzing complex code structures across multiple programming languages, identifying security vulnerabilities with low false-positive rates, creating contextually relevant recommendations, and integrating with existing development workflows.",
    businessPurpose: "Improve software quality and security posture while reducing code review time by 50% through automated analysis and intelligent recommendation systems.",
    technicalUncertainty: "Uncertainty in achieving accurate cross-language code analysis, minimizing false positives in security detection, and creating meaningful automated recommendations for diverse coding patterns.",
    processOfExperimentation: "Testing analysis algorithms against known codebases, validating security vulnerability detection accuracy, measuring developer adoption rates, and iterating based on user feedback and performance metrics.",
    technologicalNature: "Development of static code analysis algorithms, machine learning for pattern recognition, and automated recommendation systems for software development enhancement.",
    successCriteria: "Achieve 95% accuracy in vulnerability detection, reduce false positive rates below 5%, demonstrate 50% reduction in code review time, and achieve 80% developer adoption rate."
  },
  {
    name: "Intelligent Document Processing and Extraction",
    description: "Development of an AI system that automatically processes various document types, extracts relevant information, categorizes content, and integrates data into business systems with minimal human intervention.",
    technicalChallenges: "Handling diverse document formats and layouts, achieving accurate text extraction from poor-quality scans, understanding document context and relationships, and maintaining data accuracy across different document types.",
    businessPurpose: "Reduce document processing time by 70% and improve data accuracy through automated document analysis and intelligent information extraction for business process automation.",
    technicalUncertainty: "Uncertainty in achieving reliable extraction across diverse document formats, maintaining accuracy with varying document quality, and understanding complex document relationships and context.",
    processOfExperimentation: "Testing OCR and NLP algorithms on diverse document sets, validating extraction accuracy across document types, measuring processing speed improvements, and iterating based on accuracy feedback.",
    technologicalNature: "Integration of optical character recognition, natural language processing, and machine learning for automated document analysis and data extraction capabilities.",
    successCriteria: "Achieve 98% data extraction accuracy, process documents 70% faster than manual methods, handle 50+ document types automatically, and demonstrate measurable ROI within 6 months."
  },
  {
    name: "Real-time Fraud Detection System",
    description: "Creation of a machine learning-based fraud detection system that analyzes transaction patterns in real-time, identifies suspicious activities, and automatically takes preventive actions while minimizing false positives.",
    technicalChallenges: "Processing high-volume transaction data in real-time, creating accurate behavioral models, balancing fraud detection sensitivity with false positive rates, and adapting to evolving fraud patterns.",
    businessPurpose: "Reduce fraudulent transaction losses by 80% while maintaining customer experience through intelligent, real-time fraud detection and prevention systems.",
    technicalUncertainty: "Uncertainty in maintaining low false positive rates while detecting sophisticated fraud patterns, adapting to new fraud techniques, and processing transactions within millisecond latency requirements.",
    processOfExperimentation: "Testing machine learning models against historical fraud data, validating real-time performance under load, measuring false positive and negative rates, and continuous model updating based on new fraud patterns.",
    technologicalNature: "Development of real-time analytics, machine learning algorithms, and automated decision systems for financial transaction fraud detection and prevention.",
    successCriteria: "Achieve 99.5% fraud detection accuracy, maintain false positive rates below 0.1%, process transactions within 50ms, and demonstrate 80% reduction in fraud losses."
  }
];

export const aiToolOptions = [
  { value: "chatgpt", label: "ChatGPT", description: "OpenAI's conversational AI for research and development" },
  { value: "claude", label: "Claude", description: "Anthropic's AI assistant for analysis and coding" },
  { value: "github-copilot", label: "GitHub Copilot", description: "AI-powered code completion and suggestions" },
  { value: "cursor", label: "Cursor", description: "AI-powered code editor and development environment" },
  { value: "v0", label: "v0 by Vercel", description: "AI-powered UI component generation" },
  { value: "midjourney", label: "Midjourney", description: "AI image generation for prototyping" },
  { value: "runwayml", label: "RunwayML", description: "AI tools for creative and video content" },
  { value: "tensorflow", label: "TensorFlow", description: "Machine learning framework for custom models" },
  { value: "pytorch", label: "PyTorch", description: "Deep learning framework for research" },
  { value: "hugging-face", label: "Hugging Face", description: "Pre-trained AI models and transformers" },
  { value: "openai-api", label: "OpenAI API", description: "Direct integration with OpenAI models" },
  { value: "anthropic-api", label: "Anthropic API", description: "Direct integration with Claude models" },
  { value: "custom-models", label: "Custom AI Models", description: "Internally developed or fine-tuned models" },
  { value: "other", label: "Other AI Tools", description: "Other AI tools not listed" }
];

export const rdMethodologyExamples = [
  "Agile development with continuous integration and testing cycles",
  "Systematic experimentation with controlled variables and measurable outcomes",
  "Iterative prototyping with user feedback integration",
  "Hypothesis-driven development with statistical validation",
  "Design thinking methodology with user-centered experimentation",
  "Lean startup methodology with build-measure-learn cycles",
  "Scientific method with controlled experiments and peer review",
  "Data-driven development with analytics and performance metrics"
];

export function getProjectTemplate(templateName: string): ProjectTemplate | undefined {
  return projectTemplates.find(template => template.name === templateName);
}

export function generateProjectId(): string {
  return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}