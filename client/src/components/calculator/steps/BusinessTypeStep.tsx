/**
 * @file BusinessTypeStep.tsx
 * @description Step 1: Business type selection for innovation tax credits
 */

import { motion } from 'framer-motion';
import { 
  FaPalette,
  FaShoppingCart,
  FaBriefcase,
  FaTools,
  FaRobot,
  FaBuilding
} from 'react-icons/fa';

interface BusinessTypeStepProps {
  selectedType: string | null;
  onSelect: (type: string) => void;
}

const businessTypes = [
  {
    id: 'professional-services',
    title: 'Professional Services',
    description: 'Innovating through custom methodologies',
    icon: <FaBriefcase className="text-3xl" />,
    examples: ['Custom analysis frameworks', 'Automated reporting', 'Integration platforms']
  },
  {
    id: 'ecommerce-retail',
    title: 'E-commerce & Retail',
    description: 'Creating personalized experiences',
    icon: <FaShoppingCart className="text-3xl" />,
    examples: ['Recommendation engines', 'Inventory optimization', 'Omnichannel integration']
  },
  {
    id: 'creative-agency',
    title: 'Creative Agency',
    description: 'Building proprietary creative tools',
    icon: <FaPalette className="text-3xl" />,
    examples: ['Campaign automation', 'Content workflows', 'Performance analytics']
  },
  {
    id: 'healthcare-wellness',
    title: 'Healthcare & Wellness',
    description: 'Modernizing patient care',
    icon: <FaTools className="text-3xl" />,
    examples: ['Patient communication', 'Scheduling optimization', 'Telehealth platforms']
  },
  {
    id: 'technology-services',
    title: 'Technology Services',
    description: 'Pushing innovation boundaries',
    icon: <FaRobot className="text-3xl" />,
    examples: ['Architecture implementations', 'Development frameworks', 'Automation systems']
  },
  {
    id: 'manufacturing-logistics',
    title: 'Manufacturing & Logistics',
    description: 'Optimizing through technology',
    icon: <FaBuilding className="text-3xl" />,
    examples: ['Predictive maintenance', 'Supply chain optimization', 'Quality control']
  }
];

export const BusinessTypeStep: React.FC<BusinessTypeStepProps> = ({
  selectedType,
  onSelect
}) => {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          What type of business are you?
        </h3>
        <p className="text-gray-600">
          Select the option that best describes your primary business activities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {businessTypes.map((type) => (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => onSelect(type.id)}
              className={`
                w-full p-4 rounded-lg border-2 transition-all text-left
                ${selectedType === type.id
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  p-3 rounded-lg
                  ${selectedType === type.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}
                `}>
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {type.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {type.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    Examples: {type.examples.join(', ')}
                  </div>
                </div>
                {selectedType === type.id && (
                  <div className="text-green-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> If you're using AI tools like ChatGPT, Claude, or custom GPTs to innovate 
          and improve your business processes, you likely qualify for the R&D tax credit.
        </p>
      </div>
    </div>
  );
};