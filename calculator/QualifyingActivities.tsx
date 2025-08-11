/**
 * @file QualifyingActivities.tsx
 * @description Qualifying activities selection step
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Calculator Service
 * @knowledgeBase Step 2 - Qualifying R&D activities selection with smart suggestions
 */

import { qualifyingActivities } from "@/services/calculator.service";

interface QualifyingActivitiesProps {
  selectedActivities: string[];
  onActivitiesChange: (activities: string[]) => void;
  businessType: string;
}

export default function QualifyingActivities({ 
  selectedActivities, 
  onActivitiesChange,
  businessType 
}: QualifyingActivitiesProps) {
  
  const handleActivityToggle = (activityId: string) => {
    const newSelection = selectedActivities.includes(activityId)
      ? selectedActivities.filter(id => id !== activityId)
      : [...selectedActivities, activityId];
    
    onActivitiesChange(newSelection);
  };

  // Filter activities based on business type for better relevance
  const getRelevantActivities = () => {
    if (businessType === "software") {
      return qualifyingActivities.filter(activity => 
        ["new_software", "algorithm_development", "integration_work", "performance_optimization", "security_implementation"].includes(activity.id)
      ).concat(
        qualifyingActivities.filter(activity => 
          !["new_software", "algorithm_development", "integration_work", "performance_optimization", "security_implementation"].includes(activity.id)
        )
      );
    }
    
    return qualifyingActivities;
  };

  return (
    <div className="calculator-step animate-fade-in">
      <h3 className="text-xl font-semibold text-slate-900 mb-6">
        Which activities did your business perform?
      </h3>
      <p className="text-slate-600 mb-6">
        Select all activities that apply to your business operations:
      </p>
      
      <div className="space-y-3">
        {getRelevantActivities().map((activity) => (
          <label 
            key={activity.id}
            className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all hover:bg-white ${
              selectedActivities.includes(activity.id)
                ? 'border-blue-500 bg-white shadow-md' 
                : 'border-slate-200 hover:border-rd-primary-300'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedActivities.includes(activity.id)}
              onChange={() => handleActivityToggle(activity.id)}
              className="w-4 h-4 text-rd-primary-500 border-slate-300 rounded focus:ring-blue-500 mt-1"
            />
            <div className="ml-3">
              <span className="font-medium text-slate-900">{activity.title}</span>
              <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
              <span className="inline-block text-xs text-rd-primary-500 bg-blue-50 px-2 py-1 rounded mt-2 capitalize">
                {activity.category.replace('-', ' ')}
              </span>
            </div>
          </label>
        ))}
      </div>
      
      {selectedActivities.length > 0 && (
        <div className="mt-6 p-4 bg-rd-secondary-50 rounded-lg border border-rd-secondary-200">
          <div className="flex items-center">
            <i className="fas fa-check-circle text-rd-secondary-500 mr-2"></i>
            <span className="text-sm font-medium text-rd-secondary-700">
              {selectedActivities.length} qualifying {selectedActivities.length === 1 ? 'activity' : 'activities'} selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
