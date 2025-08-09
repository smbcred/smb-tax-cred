/**
 * @file QualifyingActivitiesStep.tsx
 * @description Step 2: Qualifying AI R&D activities selection
 */

import { motion } from 'framer-motion';

interface QualifyingActivitiesStepProps {
  selectedActivities: string[];
  onUpdate: (activities: string[]) => void;
  businessType: string | null;
}

const allActivities = {
  agency: [
    { id: 'custom-gpts', label: 'Build custom GPTs or AI assistants for specific use cases' },
    { id: 'content-systems', label: 'Create AI content generation systems and workflows' },
    { id: 'client-chatbots', label: 'Develop chatbots for client websites or services' },
    { id: 'ai-campaigns', label: 'Design AI-powered marketing campaigns' },
    { id: 'prompt-engineering', label: 'Design and test prompts for consistent results' },
    { id: 'automation-workflows', label: 'Build AI automation workflows for repetitive tasks' },
    { id: 'ai-analytics', label: 'Implement AI-driven analytics and reporting' }
  ],
  ecommerce: [
    { id: 'customer-service-ai', label: 'Build AI customer service tools and chatbots' },
    { id: 'personalization', label: 'Create AI personalization and recommendation systems' },
    { id: 'inventory-ai', label: 'Develop AI inventory management systems' },
    { id: 'pricing-models', label: 'Build dynamic AI pricing models' },
    { id: 'review-analysis', label: 'Implement AI review analysis and sentiment tracking' },
    { id: 'product-descriptions', label: 'Create AI systems for product descriptions' },
    { id: 'email-automation', label: 'Design AI email response systems' }
  ],
  consultant: [
    { id: 'custom-analysis', label: 'Build custom AI analysis tools for clients' },
    { id: 'report-automation', label: 'Create AI-powered report generation systems' },
    { id: 'gpt-assistants', label: 'Develop specialized GPT assistants for consulting' },
    { id: 'data-processing', label: 'Build AI data processing and insight tools' },
    { id: 'client-portals', label: 'Create AI-enhanced client portals' },
    { id: 'knowledge-bases', label: 'Develop AI knowledge base systems' }
  ],
  service: [
    { id: 'scheduling-ai', label: 'Build AI scheduling and booking systems' },
    { id: 'quote-generation', label: 'Create AI quoting and estimation tools' },
    { id: 'service-chatbots', label: 'Develop service-specific chatbots' },
    { id: 'workflow-automation', label: 'Implement AI workflow automation' },
    { id: 'customer-comm', label: 'Build AI customer communication systems' },
    { id: 'predictive-maintenance', label: 'Create predictive AI maintenance tools' }
  ],
  saas: [
    { id: 'ai-features', label: 'Develop new AI-powered features' },
    { id: 'llm-integration', label: 'Integrate LLMs (GPT, Claude, etc.) into products' },
    { id: 'custom-models', label: 'Train custom AI models for specific use cases' },
    { id: 'api-development', label: 'Build AI API endpoints and services' },
    { id: 'ml-pipelines', label: 'Create machine learning data pipelines' },
    { id: 'ai-infrastructure', label: 'Build AI infrastructure and scaling systems' },
    { id: 'rag-systems', label: 'Implement RAG (Retrieval Augmented Generation) systems' }
  ],
  other: [
    { id: 'ai-automation', label: 'Develop AI-powered automation systems' },
    { id: 'custom-ai-tools', label: 'Build custom AI tools for business processes' },
    { id: 'prompt-libraries', label: 'Create and test prompt libraries' },
    { id: 'ai-integration', label: 'Integrate AI into existing systems' },
    { id: 'process-optimization', label: 'Use AI to optimize business processes' },
    { id: 'ai-experimentation', label: 'Experiment with new AI technologies' }
  ]
};

export const QualifyingActivitiesStep: React.FC<QualifyingActivitiesStepProps> = ({
  selectedActivities,
  onUpdate,
  businessType
}) => {
  const activities = businessType ? allActivities[businessType as keyof typeof allActivities] || allActivities.other : allActivities.other;

  const toggleActivity = (activityId: string) => {
    if (selectedActivities.includes(activityId)) {
      onUpdate(selectedActivities.filter(id => id !== activityId));
    } else {
      onUpdate([...selectedActivities, activityId]);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Which AI activities does your business do?
        </h3>
        <p className="text-gray-600">
          Select all that apply - these AI development activities qualify for R&D credits
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all bg-white">
              <input
                type="checkbox"
                checked={selectedActivities.includes(activity.id)}
                onChange={() => toggleActivity(activity.id)}
                className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className={`flex-1 ${selectedActivities.includes(activity.id) ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                {activity.label}
              </span>
            </label>
          </motion.div>
        ))}
      </div>

      {selectedActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <p className="text-sm text-green-800">
            <strong>Great!</strong> You've selected {selectedActivities.length} qualifying activities. 
            These activities typically qualify for the R&D tax credit.
          </p>
        </motion.div>
      )}

      {selectedActivities.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please select at least one activity to continue
          </p>
        </div>
      )}
    </div>
  );
};