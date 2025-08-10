import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CompanyInfoSection from './sections/CompanyInfoSection';
import RDActivitiesSection from './sections/RDActivitiesSection';

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
        isValid = !!(data.totalWages || data.contractorCosts || data.supplies || data.cloudSoftware);
        break;
      case 'supporting-info':
        isValid = !!(data.documentation || data.additionalInfo);
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
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Labor Costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalWages">Total R&D Wages</Label>
              <Input
                id="totalWages"
                type="number"
                value={data.totalWages || ''}
                onChange={(e) => handleInputChange('totalWages', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractorCosts">Contractor Costs</Label>
              <Input
                id="contractorCosts"
                type="number"
                value={data.contractorCosts || ''}
                onChange={(e) => handleInputChange('contractorCosts', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supply & Technology Costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplies">Supplies & Materials</Label>
              <Input
                id="supplies"
                type="number"
                value={data.supplies || ''}
                onChange={(e) => handleInputChange('supplies', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cloudSoftware">Cloud & Software</Label>
              <Input
                id="cloudSoftware"
                type="number"
                value={data.cloudSoftware || ''}
                onChange={(e) => handleInputChange('cloudSoftware', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">R&D Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="rdAllocation">Percentage of time/costs devoted to R&D activities</Label>
            <Select
              value={data.rdAllocation?.toString() || '100'}
              onValueChange={(value) => handleInputChange('rdAllocation', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select R&D allocation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100% - Fully dedicated to R&D</SelectItem>
                <SelectItem value="75">75% - Mostly R&D work</SelectItem>
                <SelectItem value="50">50% - Half R&D, half other activities</SelectItem>
                <SelectItem value="25">25% - Some R&D work</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSupportingInfoSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documentation & Evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentation">Supporting documentation available *</Label>
            <Textarea
              id="documentation"
              value={data.documentation || ''}
              onChange={(e) => handleInputChange('documentation', e.target.value)}
              placeholder="Describe any documentation you have (project plans, technical specifications, etc.)"
              rows={4}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>What types of records do you maintain?</Label>
            {['Project timesheets', 'Technical documentation', 'Test results', 'Meeting notes', 'Code repositories'].map((record) => (
              <div key={record} className="flex items-center space-x-2">
                <Checkbox
                  id={record}
                  checked={data.recordTypes?.includes(record) || false}
                  onCheckedChange={(checked) => {
                    const currentRecords = data.recordTypes || [];
                    const newRecords = checked 
                      ? [...currentRecords, record]
                      : currentRecords.filter((r: string) => r !== record);
                    handleInputChange('recordTypes', newRecords);
                  }}
                />
                <Label htmlFor={record}>{record}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Any additional information relevant to your R&D activities *</Label>
            <Textarea
              id="additionalInfo"
              value={data.additionalInfo || ''}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Include any other details that support your R&D tax credit claim..."
              rows={4}
              required
            />
          </div>
        </CardContent>
      </Card>
    </div>
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