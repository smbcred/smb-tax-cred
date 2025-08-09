/**
 * @file ResultsDisplayStep.tsx
 * @description Step 4: Results display with lead capture trigger
 */

import { ResultsDisplay } from '../ResultsDisplay';

interface ResultsDisplayStepProps {
  results: {
    totalQRE: number;
    federalCredit: number;
    stateCredit: number;
    totalBenefit: number;
    pricingTier: number;
    tierInfo: any;
    roi: number;
    breakdown?: {
      wages: number;
      contractors: number;
      supplies: number;
      cloud: number;
    };
  } | null;
  isBlurred: boolean;
  onCTAClick: () => void;
}

export const ResultsDisplayStep: React.FC<ResultsDisplayStepProps> = ({
  results,
  isBlurred,
  onCTAClick
}) => {
  return (
    <ResultsDisplay
      result={results}
      isBlurred={isBlurred}
      onGetStarted={onCTAClick}
      showFullDetails={!isBlurred}
    />
  );
};