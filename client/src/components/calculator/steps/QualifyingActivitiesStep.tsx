/**
 * @file QualifyingActivitiesStep.tsx
 * @description Step 2: Qualifying activities selection
 */

import { motion } from 'framer-motion';

interface QualifyingActivitiesStepProps {
  selectedActivities: string[];
  onUpdate: (activities: string[]) => void;
  businessType: string | null;
}

const allActivities = {
  software: [
    { id: 'new-features', label: 'Developing new features or capabilities' },
    { id: 'architecture', label: 'Designing system architecture' },
    { id: 'algorithms', label: 'Creating algorithms or data models' },
    { id: 'integration', label: 'Integrating third-party APIs or services' },
    { id: 'performance', label: 'Optimizing performance or scalability' },
    { id: 'security', label: 'Implementing security features' },
    { id: 'testing', label: 'Developing automated testing frameworks' },
    { id: 'cloud', label: 'Cloud infrastructure development' }
  ],
  manufacturing: [
    { id: 'product-design', label: 'New product design and development' },
    { id: 'process-improvement', label: 'Manufacturing process improvements' },
    { id: 'automation', label: 'Implementing automation systems' },
    { id: 'quality', label: 'Quality control innovations' },
    { id: 'materials', label: 'Testing new materials or compounds' },
    { id: 'prototyping', label: 'Creating and testing prototypes' },
    { id: 'tooling', label: 'Developing custom tooling or equipment' }
  ],
  engineering: [
    { id: 'design-innovation', label: 'Engineering design innovations' },
    { id: 'cad-cam', label: 'CAD/CAM development' },
    { id: 'simulation', label: 'Creating simulations or models' },
    { id: 'technical-solutions', label: 'Developing technical solutions' },
    { id: 'system-integration', label: 'Complex system integration' },
    { id: 'optimization', label: 'Process or system optimization' }
  ],
  biotech: [
    { id: 'research', label: 'Scientific research and experiments' },
    { id: 'clinical-trials', label: 'Clinical trials and studies' },
    { id: 'drug-development', label: 'Drug or treatment development' },
    { id: 'medical-devices', label: 'Medical device innovation' },
    { id: 'lab-testing', label: 'Laboratory testing and analysis' },
    { id: 'formulation', label: 'Product formulation' }
  ],
  ai: [
    { id: 'ml-models', label: 'Machine learning model development' },
    { id: 'training', label: 'Model training and optimization' },
    { id: 'nlp', label: 'Natural language processing' },
    { id: 'computer-vision', label: 'Computer vision applications' },
    { id: 'data-pipeline', label: 'Data pipeline development' },
    { id: 'algorithm-research', label: 'Algorithm research and testing' }
  ],
  other: [
    { id: 'innovation', label: 'Product or service innovation' },
    { id: 'technical-uncertainty', label: 'Solving technical uncertainties' },
    { id: 'experimentation', label: 'Systematic experimentation' },
    { id: 'process-development', label: 'New process development' },
    { id: 'technology-adaptation', label: 'Adapting new technologies' },
    { id: 'custom-solutions', label: 'Creating custom technical solutions' }
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
          Which activities does your team perform?
        </h3>
        <p className="text-gray-600">
          Select all that apply - these help determine your qualifying research expenses
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