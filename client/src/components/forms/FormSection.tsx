import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CompanyInfoSection from './sections/CompanyInfoSection';

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
        isValid = !!(data.primaryActivities && data.technicalChallenges && data.systematicProcess);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Primary R&D Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryActivities">Describe your primary research and development activities *</Label>
            <Textarea
              id="primaryActivities"
              value={data.primaryActivities || ''}
              onChange={(e) => handleInputChange('primaryActivities', e.target.value)}
              placeholder="Describe the main R&D activities your company engages in..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technicalChallenges">Technical challenges addressed *</Label>
            <Textarea
              id="technicalChallenges"
              value={data.technicalChallenges || ''}
              onChange={(e) => handleInputChange('technicalChallenges', e.target.value)}
              placeholder="What technical challenges are you trying to solve?"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systematicProcess">Systematic process of experimentation *</Label>
            <Textarea
              id="systematicProcess"
              value={data.systematicProcess || ''}
              onChange={(e) => handleInputChange('systematicProcess', e.target.value)}
              placeholder="Describe your systematic approach to R&D..."
              rows={3}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI & Technology Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Which AI tools does your company use for R&D activities?</Label>
            {['ChatGPT', 'Claude', 'GitHub Copilot', 'Custom AI Models', 'Machine Learning Frameworks'].map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={tool}
                  checked={data.aiTools?.includes(tool) || false}
                  onCheckedChange={(checked) => {
                    const currentTools = data.aiTools || [];
                    const newTools = checked 
                      ? [...currentTools, tool]
                      : currentTools.filter((t: string) => t !== tool);
                    handleInputChange('aiTools', newTools);
                  }}
                />
                <Label htmlFor={tool}>{tool}</Label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="aiUsageDescription">How do you use AI in your R&D process?</Label>
            <Textarea
              id="aiUsageDescription"
              value={data.aiUsageDescription || ''}
              onChange={(e) => handleInputChange('aiUsageDescription', e.target.value)}
              placeholder="Describe how AI tools support your R&D activities..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
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