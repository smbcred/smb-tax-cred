import { useEffect } from 'react';
import CompanyInfoSection from './sections/CompanyInfoSection';
import RDActivitiesSection from './sections/RDActivitiesSection';
import ExpenseBreakdownSection from './sections/ExpenseBreakdownSection';
import SupportingInfoSection from './sections/SupportingInfoSection';

interface FormSectionProps {
  sectionId: string;
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function FormSection({ 
  sectionId, 
  data = {}, 
  onDataChange, 
  onValidationChange 
}: FormSectionProps) {

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    onDataChange(newData);
  };

  // Note: Validation is now handled by individual section components
  // CompanyInfoSection handles its own validation
  useEffect(() => {
    if (sectionId === 'company-info') {
      // Validation handled by CompanyInfoSection component
      return;
    }
    
    let isValid = false;
    
    switch (sectionId) {
      case 'rd-activities':
        // Validation handled by RDActivitiesSection component
        return;
        break;
      case 'expense-breakdown':
        // Validation handled by ExpenseBreakdownSection component
        return;
        break;
      case 'supporting-info':
        // Validation handled by SupportingInfoSection component
        return;
        break;
      default:
        isValid = Object.keys(data).length > 0;
    }
    
    onValidationChange(isValid);
  }, [data, sectionId, onValidationChange]);

  const renderCompanyInfoSection = () => (
    <CompanyInfoSection 
      data={data} 
      onDataChange={onDataChange} 
      onValidationChange={onValidationChange}
    />
  );

  const renderRDActivitiesSection = () => (
    <RDActivitiesSection 
      data={data} 
      onDataChange={onDataChange} 
      onValidationChange={onValidationChange}
    />
  );

  const renderExpenseBreakdownSection = () => (
    <ExpenseBreakdownSection 
      data={data} 
      onDataChange={onDataChange} 
      onValidationChange={onValidationChange}
    />
  );

  const renderSupportingInfoSection = () => (
    <SupportingInfoSection 
      data={data} 
      onDataChange={onDataChange} 
      onValidationChange={onValidationChange}
    />
  );

  const renderSection = () => {
    switch (sectionId) {
      case 'company-info':
        return renderCompanyInfoSection();
      case 'rd-activities':
        return renderRDActivitiesSection();
      case 'expense-breakdown':
        return renderExpenseBreakdownSection();
      case 'supporting-info':
        return renderSupportingInfoSection();
      default:
        return (
          <div className="text-center py-8">
            <p className="text-slate-600">Section not found: {sectionId}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderSection()}
    </div>
  );
}