/**
 * @file BusinessTypeStep.tsx
 * @description Business type selection step for calculator
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Calculator Service
 * @knowledgeBase Step 1 - Business type selection with industry-specific options
 */

import { businessTypes } from "@/services/calculator.service";

interface BusinessTypeStepProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
}

export default function BusinessTypeStep({ selectedType, onTypeSelect }: BusinessTypeStepProps) {
  return (
    <div className="calculator-step animate-fade-in">
      <h3 className="text-xl font-semibold text-slate-900 mb-6">
        What type of business are you?
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {businessTypes.map((type) => (
          <label 
            key={type.id}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:bg-white ${
              selectedType === type.id 
                ? 'border-blue-500 bg-white shadow-md' 
                : 'border-slate-200 hover:border-rd-primary-300'
            }`}
          >
            <input
              type="radio"
              name="businessType"
              value={type.id}
              checked={selectedType === type.id}
              onChange={(e) => onTypeSelect(e.target.value)}
              className="w-4 h-4 text-rd-primary-500 border-slate-300 focus:ring-blue-500"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <i className={`${type.icon} text-rd-primary-500 mr-2`}></i>
                <span className="font-medium text-slate-900">{type.name}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{type.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
