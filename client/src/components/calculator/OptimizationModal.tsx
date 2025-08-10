import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

interface OptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: {
    title: string;
    description: string;
    potentialSavings: number;
    type: string;
  };
  onApply: () => void;
}

export const OptimizationModal: React.FC<OptimizationModalProps> = ({
  isOpen,
  onClose,
  suggestion,
  onApply
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-xl shadow-2xl p-6 m-4 max-w-md w-full"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {suggestion.title}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {suggestion.description}
          </p>
          
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-lg font-bold text-green-600">
                ${Math.round(suggestion.potentialSavings).toLocaleString()} potential savings
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Apply Now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};