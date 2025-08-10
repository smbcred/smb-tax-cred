/**
 * @file QualifyingActivitiesStep.tsx
 * @description Step 2: Qualifying innovation activities selection
 */

import { motion } from 'framer-motion';

interface QualifyingActivitiesStepProps {
  selectedActivities: string[];
  onUpdate: (activities: string[]) => void;
  businessType: string | null;
}

const allActivities = {
  'professional-services': [
    { id: 'automation-development', label: 'Creating automated workflows to eliminate manual processes' },
    { id: 'custom-solution-development', label: 'Building tailored solutions for your specific business needs' },
    { id: 'integration-engineering', label: 'Connecting different platforms to work seamlessly together' },
    { id: 'process-optimization', label: 'Redesigning workflows for maximum efficiency' },
    { id: 'proprietary-tool-creation', label: 'Developing unique tools that give you competitive advantage' },
    { id: 'digital-transformation', label: 'Modernizing operations with digital technologies' }
  ],
  'ecommerce-retail': [
    { id: 'integration-engineering', label: 'Creating sophisticated connections between sales channels' },
    { id: 'automation-development', label: 'Building automated inventory and order management' },
    { id: 'experimental-implementation', label: 'Testing new approaches to customer experience' },
    { id: 'custom-solution-development', label: 'Creating personalized recommendation engines' },
    { id: 'process-optimization', label: 'Streamlining fulfillment and logistics processes' },
    { id: 'digital-transformation', label: 'Implementing omnichannel retail strategies' }
  ],
  'creative-agency': [
    { id: 'proprietary-tool-creation', label: 'Building custom creative production tools' },
    { id: 'automation-development', label: 'Automating campaign management workflows' },
    { id: 'custom-solution-development', label: 'Creating client-specific analytics platforms' },
    { id: 'integration-engineering', label: 'Connecting creative tools with client systems' },
    { id: 'experimental-implementation', label: 'Testing innovative creative approaches' },
    { id: 'process-optimization', label: 'Optimizing project delivery workflows' }
  ],
  'healthcare-wellness': [
    { id: 'digital-transformation', label: 'Modernizing patient care with technology' },
    { id: 'process-optimization', label: 'Streamlining clinical workflows' },
    { id: 'integration-engineering', label: 'Connecting healthcare systems and devices' },
    { id: 'automation-development', label: 'Automating administrative tasks' },
    { id: 'custom-solution-development', label: 'Building patient engagement platforms' },
    { id: 'experimental-implementation', label: 'Testing new care delivery models' }
  ],
  'technology-services': [
    { id: 'breakthrough-process-design', label: 'Creating revolutionary new approaches' },
    { id: 'novel-integration-development', label: 'Building unprecedented system integrations' },
    { id: 'proprietary-tool-creation', label: 'Developing cutting-edge development tools' },
    { id: 'custom-solution-development', label: 'Building advanced technical solutions' },
    { id: 'automation-development', label: 'Creating sophisticated automation systems' },
    { id: 'experimental-implementation', label: 'Pushing boundaries with new technologies' }
  ],
  'manufacturing-logistics': [
    { id: 'process-optimization', label: 'Optimizing production and supply chain' },
    { id: 'integration-engineering', label: 'Connecting manufacturing systems' },
    { id: 'breakthrough-process-design', label: 'Reimagining production processes' },
    { id: 'automation-development', label: 'Implementing predictive maintenance' },
    { id: 'custom-solution-development', label: 'Building quality control systems' },
    { id: 'digital-transformation', label: 'Digitizing factory operations' }
  ]
};

export const QualifyingActivitiesStep: React.FC<QualifyingActivitiesStepProps> = ({
  selectedActivities,
  onUpdate,
  businessType
}) => {
  const activities = businessType ? allActivities[businessType as keyof typeof allActivities] || allActivities['professional-services'] : allActivities['professional-services'];

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
          Which innovation activities does your business do?
        </h3>
        <p className="text-gray-600">
          Select all that apply - these technology innovation activities may qualify for R&D credits
        </p>
      </div>

      {/* Four-Part Test Display - Critical Compliance */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">IRS Four-Part Test for R&D Credits</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">1.</span>
            <div>
              <strong className="text-blue-900">Technological in Nature</strong>
              <p className="text-blue-700">Relies on computer science, engineering, or physical sciences</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">2.</span>
            <div>
              <strong className="text-blue-900">Elimination of Uncertainty</strong>
              <p className="text-blue-700">Addresses technical capability or methodology challenges</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">3.</span>
            <div>
              <strong className="text-blue-900">Process of Experimentation</strong>
              <p className="text-blue-700">Involves testing, trial and error, or iterative development</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">4.</span>
            <div>
              <strong className="text-blue-900">Business Component</strong>
              <p className="text-blue-700">Creates new or improved functionality, performance, or quality</p>
            </div>
          </div>
        </div>
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