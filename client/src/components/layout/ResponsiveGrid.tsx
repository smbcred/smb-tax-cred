/**
 * @file ResponsiveGrid.tsx
 * @description Reusable responsive grid layouts for various sections
 * @author SMBTaxCredits.com Team
 */

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { IconType } from 'react-icons';

interface GridItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

interface ResponsiveGridProps {
  items: GridItemProps[];
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
  animateOnScroll?: boolean;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  items,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'gap-6',
  animateOnScroll = true
}) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const getGridCols = () => {
    const cols = [];
    if (columns.mobile) cols.push(`grid-cols-${columns.mobile}`);
    if (columns.tablet) cols.push(`sm:grid-cols-${columns.tablet}`);
    if (columns.desktop) cols.push(`lg:grid-cols-${columns.desktop}`);
    return cols.join(' ');
  };

  return (
    <div ref={ref} className={`grid ${getGridCols()} ${gap}`}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={animateOnScroll ? { opacity: 0, y: 20 } : {}}
          animate={animateOnScroll && inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: item.delay || index * 0.1 }}
          className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300
                   p-6 transform hover:-translate-y-1"
        >
          <div className="mb-4 text-green-600">
            {item.icon}
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
            {item.title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {item.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

// Specific grid for benefits section
export const BenefitsGrid: React.FC<{ benefits: GridItemProps[] }> = ({ benefits }) => {
  return (
    <ResponsiveGrid
      items={benefits}
      columns={{ mobile: 1, tablet: 2, desktop: 3 }}
      gap="gap-6 lg:gap-8"
      animateOnScroll={true}
    />
  );
};

// Specific grid for pricing tiers
interface PricingTier {
  tier: string;
  range: string;
  price: string;
  example: string;
  highlighted?: boolean;
}

export const PricingGrid: React.FC<{ tiers: PricingTier[] }> = ({ tiers }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {tiers.map((tier, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`
            relative bg-white rounded-lg p-6 
            ${tier.highlighted 
              ? 'shadow-xl border-2 border-green-500 transform scale-105' 
              : 'shadow-md hover:shadow-lg border border-gray-200'
            }
            transition-all duration-300
          `}
        >
          {tier.highlighted && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {tier.tier}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{tier.range}</p>
          <p className="text-3xl font-bold text-green-600 mb-3">{tier.price}</p>
          <p className="text-xs sm:text-sm text-gray-500">{tier.example}</p>
        </motion.div>
      ))}
    </div>
  );
};

// Process steps grid
interface ProcessStep {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const ProcessStepsGrid: React.FC<{ steps: ProcessStep[] }> = ({ steps }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="relative">
      {/* Mobile: Vertical layout */}
      <div className="lg:hidden space-y-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="flex gap-4"
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center 
                            justify-center text-white font-bold text-lg">
                {step.number}
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="text-green-600 mb-2">{step.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop: Horizontal layout with connectors */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative z-10"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center 
                              justify-center mx-auto mb-4 text-white font-bold text-2xl relative z-20">
                  {step.number}
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-green-600 text-3xl mb-4 flex justify-center">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {/* Connector lines positioned absolutely behind the circles */}
          <div className="absolute top-10 left-0 right-0 flex items-center justify-between px-20 pointer-events-none">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-green-600 to-green-400 mx-8"></div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-green-400 to-green-600 mx-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
};