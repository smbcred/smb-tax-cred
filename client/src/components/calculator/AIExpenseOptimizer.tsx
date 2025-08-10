import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, DollarSign, TrendingUp, Sparkles, X } from 'lucide-react';

interface ExpenseData {
  totalEmployees: number;
  technicalEmployees: number;
  averageTechnicalSalary: number;
  contractorCosts: number;
  softwareCosts: number;
  cloudCosts: number;
  rdAllocationPercentage: number;
}

interface OptimizationSuggestion {
  id: string;
  type: 'wage' | 'contractor' | 'software' | 'cloud' | 'allocation';
  title: string;
  description: string;
  potentialSavings: number;
  confidence: 'high' | 'medium' | 'low';
  icon: React.ComponentType<any>;
  action: string;
}

interface AIExpenseOptimizerProps {
  expenses: ExpenseData;
  businessType?: string;
  onSuggestionApply?: (suggestion: OptimizationSuggestion) => void;
  className?: string;
}

export const AIExpenseOptimizer: React.FC<AIExpenseOptimizerProps> = ({
  expenses,
  businessType = 'technology',
  onSuggestionApply,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  // Generate personalized suggestions based on expense data
  const generateSuggestions = (): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Calculate current metrics
    const totalWageCosts = expenses.technicalEmployees * expenses.averageTechnicalSalary;
    const totalExpenses = totalWageCosts + expenses.contractorCosts + expenses.softwareCosts + expenses.cloudCosts;
    const contractorRatio = expenses.contractorCosts / totalExpenses;
    const rdAllocation = expenses.rdAllocationPercentage / 100;

    // Wage optimization suggestions
    if (expenses.rdAllocationPercentage < 80 && expenses.technicalEmployees > 0) {
      suggestions.push({
        id: 'increase-rd-allocation',
        type: 'allocation',
        title: 'Boost R&D Time Allocation',
        description: `Increase R&D allocation from ${expenses.rdAllocationPercentage}% to 85%. Document more qualifying activities like AI experimentation and process automation.`,
        potentialSavings: totalWageCosts * (0.85 - rdAllocation) * 0.14,
        confidence: 'high',
        icon: TrendingUp,
        action: 'Set to 85%'
      });
    }

    // Contractor optimization
    if (contractorRatio > 0.4) {
      suggestions.push({
        id: 'optimize-contractors',
        type: 'contractor',
        title: 'Optimize Contractor Mix',
        description: 'High contractor ratio detected. Consider converting some contractors to employees for better R&D credit rates.',
        potentialSavings: expenses.contractorCosts * 0.1,
        confidence: 'medium',
        icon: DollarSign,
        action: 'Review mix'
      });
    }

    // Software cost optimization
    if (expenses.softwareCosts < totalWageCosts * 0.05) {
      const recommendedSoftware = totalWageCosts * 0.08;
      suggestions.push({
        id: 'increase-software-investment',
        type: 'software',
        title: 'Maximize Software & API Credits',
        description: `Consider documenting more AI tools, APIs, and development software. Recommended: $${recommendedSoftware.toLocaleString()}/year.`,
        potentialSavings: (recommendedSoftware - expenses.softwareCosts) * 0.14,
        confidence: 'medium',
        icon: Sparkles,
        action: 'Add tools'
      });
    }

    // Cloud optimization for tech companies
    if (businessType === 'technology' && expenses.cloudCosts < expenses.softwareCosts * 0.5) {
      suggestions.push({
        id: 'document-cloud-costs',
        type: 'cloud',
        title: 'Include More Cloud Infrastructure',
        description: 'AI training, model hosting, and experimental cloud resources often qualify. Include development and testing environments.',
        potentialSavings: expenses.softwareCosts * 0.3 * 0.14,
        confidence: 'high',
        icon: TrendingUp,
        action: 'Add cloud costs'
      });
    }

    // First-time filer opportunity
    if (expenses.technicalEmployees > 5 && totalExpenses > 100000) {
      suggestions.push({
        id: 'comprehensive-documentation',
        type: 'wage',
        title: 'Comprehensive Documentation Strategy',
        description: 'With your team size, consider documenting innovation meetings, training on new technologies, and process improvements.',
        potentialSavings: totalWageCosts * 0.15 * 0.14,
        confidence: 'high',
        icon: Lightbulb,
        action: 'Learn more'
      });
    }

    return suggestions.slice(0, 3); // Limit to top 3 suggestions
  };

  useEffect(() => {
    // Generate suggestions when expenses change
    const newSuggestions = generateSuggestions();
    setSuggestions(newSuggestions);
    
    // Show tooltip if there are valuable suggestions
    const hasHighValueSuggestions = newSuggestions.some(s => s.potentialSavings > 1000);
    setIsVisible(hasHighValueSuggestions);
    
    // Trigger animation refresh
    setAnimationKey(prev => prev + 1);
  }, [expenses, businessType]);

  // Cycle through suggestions
  useEffect(() => {
    if (suggestions.length > 1) {
      const interval = setInterval(() => {
        setCurrentSuggestionIndex(prev => (prev + 1) % suggestions.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [suggestions.length]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  const currentSuggestion = suggestions[currentSuggestionIndex];

  return (
    <AnimatePresence>
      <motion.div
        key={animationKey}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        className={`relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-lg ${className}`}
      >
        {/* Cute sparkle animation */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-2 shadow-md"
        >
          <Sparkles className="h-4 w-4 text-white" />
        </motion.div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="bg-blue-100 rounded-full p-2"
          >
            <currentSuggestion.icon className="h-5 w-5 text-blue-600" />
          </motion.div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">
              💡 AI Optimization Tip
            </h4>
            <p className="text-xs text-gray-600">
              Potential savings: <span className="font-bold text-green-600">
                ${Math.round(currentSuggestion.potentialSavings).toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* Suggestion content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSuggestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h5 className="font-medium text-gray-900 mb-2 text-sm">
              {currentSuggestion.title}
            </h5>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              {currentSuggestion.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {suggestions.length > 1 && (
              <div className="flex gap-1">
                {suggestions.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      index === currentSuggestionIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    animate={index === currentSuggestionIndex ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${
              currentSuggestion.confidence === 'high' 
                ? 'bg-green-100 text-green-700'
                : currentSuggestion.confidence === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {currentSuggestion.confidence} confidence
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSuggestionApply?.(currentSuggestion)}
            className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            {currentSuggestion.action}
          </motion.button>
        </div>

        {/* Cute bouncing animation for high-value suggestions */}
        {currentSuggestion.potentialSavings > 5000 && (
          <motion.div
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md">
              Big Opportunity! 🎯
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};