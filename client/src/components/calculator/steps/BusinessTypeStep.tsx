/**
 * @file BusinessTypeStep.tsx
 * @description Step 1: Business type selection
 */

import { motion } from 'framer-motion';
import { 
  FaLaptopCode, 
  FaIndustry, 
  FaFlask, 
  FaMicrochip,
  FaRobot,
  FaHeartbeat
} from 'react-icons/fa';

interface BusinessTypeStepProps {
  selectedType: string | null;
  onSelect: (type: string) => void;
}

const businessTypes = [
  {
    id: 'software',
    title: 'Software & Technology',
    description: 'Web/mobile apps, SaaS, AI/ML, data analytics',
    icon: <FaLaptopCode className="text-3xl" />,
    examples: ['Custom software development', 'Cloud applications', 'API integrations']
  },
  {
    id: 'manufacturing',
    title: 'Manufacturing',
    description: 'Product design, process improvements, automation',
    icon: <FaIndustry className="text-3xl" />,
    examples: ['New product development', 'Process optimization', 'Quality improvements']
  },
  {
    id: 'engineering',
    title: 'Engineering & Architecture',
    description: 'Design innovation, technical solutions, CAD/CAM',
    icon: <FaMicrochip className="text-3xl" />,
    examples: ['Engineering design', 'Technical consulting', 'System integration']
  },
  {
    id: 'biotech',
    title: 'Life Sciences & Biotech',
    description: 'Research, clinical trials, medical devices',
    icon: <FaFlask className="text-3xl" />,
    examples: ['Drug development', 'Medical research', 'Clinical studies']
  },
  {
    id: 'ai',
    title: 'AI & Machine Learning',
    description: 'Algorithm development, model training, automation',
    icon: <FaRobot className="text-3xl" />,
    examples: ['ML model development', 'Computer vision', 'Natural language processing']
  },
  {
    id: 'other',
    title: 'Other Industries',
    description: 'Any business developing new or improved products/processes',
    icon: <FaHeartbeat className="text-3xl" />,
    examples: ['Agriculture tech', 'Financial tech', 'Energy solutions']
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
          <strong>💡 Tip:</strong> Most businesses that develop new products, improve processes, 
          or use technology to solve problems qualify for the R&D tax credit.
        </p>
      </div>
    </div>
  );
};