import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSignIcon, 
  FileTextIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  InfoIcon,
  UploadIcon,
  StarIcon
} from 'lucide-react';

interface SupportingInfoData {
  hasPreviousClaims?: boolean;
  previousClaimsYears?: number[];
  previousClaimsAmount?: number;
  grossReceipts?: number;
  isQSB?: boolean;
  payrollTaxElection?: 'federal' | 'state' | 'both' | 'neither';
  documentationAvailable?: string[];
  additionalNotes?: string;
  reviewSummary?: {
    companyInfoComplete: boolean;
    rdActivitiesComplete: boolean;
    expenseBreakdownComplete: boolean;
    supportingInfoComplete: boolean;
    totalQualifiedExpenses?: number;
    estimatedCredit?: number;
  };
}

interface SupportingInfoSectionProps {
  data: SupportingInfoData;
  onDataChange: (field: string, value: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

const DOCUMENTATION_TYPES = [
  'Project timesheets and time tracking records',
  'Technical documentation and specifications',
  'Test results and experiment logs',
  'Meeting notes and progress reports',
  'Code repositories and version control history',
  'Financial records (payroll, contractor payments)',
  'Supply and equipment purchase records',
  'Software subscription and cloud service invoices',
  'Employee job descriptions and qualifications',
  'Contractor agreements and work descriptions'
];

const QSB_THRESHOLD = 5000000; // $5M gross receipts threshold for QSB

const SupportingInfoSection: React.FC<SupportingInfoSectionProps> = ({
  data,
  onDataChange,
  onValidationChange
}) => {
  const [selectedYears, setSelectedYears] = useState<number[]>(data.previousClaimsYears || []);
  const [selectedDocs, setSelectedDocs] = useState<string[]>(data.documentationAvailable || []);

  // Calculate QSB eligibility automatically
  useEffect(() => {
    if (data.grossReceipts !== undefined) {
      const isQSB = data.grossReceipts < QSB_THRESHOLD;
      onDataChange('isQSB', isQSB);
    }
  }, [data.grossReceipts, onDataChange]);

  // Validation
  useEffect(() => {
    const hasRequiredFields = data.grossReceipts !== undefined && data.grossReceipts >= 0;
    const hasPreviousClaimsData = !data.hasPreviousClaims || (
      data.hasPreviousClaims && 
      selectedYears.length > 0 && 
      data.previousClaimsAmount !== undefined
    );
    
    const isValid = hasRequiredFields && hasPreviousClaimsData;
    onValidationChange(isValid);
  }, [data, selectedYears, onValidationChange]);

  const handleInputChange = (field: string, value: any) => {
    onDataChange(field, value);
  };

  const handleYearToggle = (year: number) => {
    const newYears = selectedYears.includes(year)
      ? selectedYears.filter(y => y !== year)
      : [...selectedYears, year].sort((a, b) => b - a);
    
    setSelectedYears(newYears);
    onDataChange('previousClaimsYears', newYears);
  };

  const handleDocumentationToggle = (doc: string) => {
    const newDocs = selectedDocs.includes(doc)
      ? selectedDocs.filter(d => d !== doc)
      : [...selectedDocs, doc];
    
    setSelectedDocs(newDocs);
    onDataChange('documentationAvailable', newDocs);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i);

  return (
    <div className="space-y-6">
      {/* Previous R&D Credit Claims */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            Previous R&D Credit Claims
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPreviousClaims"
                checked={data.hasPreviousClaims || false}
                onCheckedChange={(checked) => handleInputChange('hasPreviousClaims', checked)}
              />
              <Label htmlFor="hasPreviousClaims" className="text-sm font-medium">
                Has your company claimed R&D tax credits in previous years?
              </Label>
            </div>

            {data.hasPreviousClaims && (
              <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label>Which years did you claim R&D credits? *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableYears.map((year) => (
                      <div key={year} className="flex items-center space-x-2">
                        <Checkbox
                          id={`year-${year}`}
                          checked={selectedYears.includes(year)}
                          onCheckedChange={() => handleYearToggle(year)}
                        />
                        <Label htmlFor={`year-${year}`} className="text-sm">
                          {year}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedYears.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="previousClaimsAmount">Total amount of previous R&D credits claimed *</Label>
                    <div className="relative">
                      <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="previousClaimsAmount"
                        type="number"
                        value={data.previousClaimsAmount || ''}
                        onChange={(e) => handleInputChange('previousClaimsAmount', parseFloat(e.target.value) || 0)}
                        placeholder="125000"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the total amount of R&D credits claimed across all selected years
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QSB Eligibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StarIcon className="h-5 w-5" />
            Qualified Small Business (QSB) Eligibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              QSB status allows you to offset R&D credits against payroll taxes, providing immediate cash benefits.
              You qualify if your gross receipts are under $5 million for the current tax year.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="grossReceipts">Gross receipts for current tax year *</Label>
            <div className="relative">
              <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="grossReceipts"
                type="number"
                value={data.grossReceipts || ''}
                onChange={(e) => handleInputChange('grossReceipts', parseFloat(e.target.value) || 0)}
                placeholder="2500000"
                className="pl-10"
                required
              />
            </div>
          </div>

          {data.grossReceipts !== undefined && (
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                {data.isQSB ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircleIcon className="h-5 w-5 text-amber-600" />
                )}
                <span className="font-medium">
                  QSB Status: {data.isQSB ? 'Qualified' : 'Not Qualified'}
                </span>
                <Badge variant={data.isQSB ? 'default' : 'secondary'}>
                  {data.isQSB ? 'QSB Eligible' : 'Standard Rules Apply'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {data.isQSB
                  ? `With gross receipts of ${formatCurrency(data.grossReceipts)}, you qualify for QSB benefits including payroll tax offset eligibility.`
                  : `With gross receipts of ${formatCurrency(data.grossReceipts)}, you exceed the $5M QSB threshold but can still claim standard R&D credits.`
                }
              </p>
            </div>
          )}

          {data.isQSB && (
            <div className="space-y-2">
              <Label htmlFor="payrollTaxElection">Payroll tax offset election (for QSB)</Label>
              <Select 
                value={data.payrollTaxElection || ''} 
                onValueChange={(value) => handleInputChange('payrollTaxElection', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payroll tax election option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="federal">Federal payroll taxes only</SelectItem>
                  <SelectItem value="state">State payroll taxes only</SelectItem>
                  <SelectItem value="both">Both federal and state payroll taxes</SelectItem>
                  <SelectItem value="neither">No payroll tax offset (traditional income tax credit)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose how you'd like to apply your R&D credits. Payroll tax offset provides immediate cash benefits.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            Supporting Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the types of documentation you have available to support your R&D tax credit claim:
          </p>

          <div className="space-y-3">
            {DOCUMENTATION_TYPES.map((doc) => (
              <div key={doc} className="flex items-start space-x-2">
                <Checkbox
                  id={doc}
                  checked={selectedDocs.includes(doc)}
                  onCheckedChange={() => handleDocumentationToggle(doc)}
                  className="mt-1"
                />
                <Label htmlFor={doc} className="text-sm leading-relaxed">
                  {doc}
                </Label>
              </div>
            ))}
          </div>

          {selectedDocs.length > 0 && (
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm font-medium mb-2">Selected Documentation ({selectedDocs.length} types):</p>
              <div className="flex flex-wrap gap-2">
                {selectedDocs.map((doc) => (
                  <Badge key={doc} variant="secondary" className="text-xs">
                    {doc.split(' ').slice(0, 3).join(' ')}...
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Document collection will be handled during the service engagement. 
              This checklist helps us prepare for your documentation review.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Any additional notes or special circumstances?</Label>
            <Textarea
              id="additionalNotes"
              value={data.additionalNotes || ''}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="Describe any unique aspects of your R&D activities, special circumstances, or questions you have about the process..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Final Review Summary */}
      <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircleIcon className="h-5 w-5" />
            Review Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review your intake form completion status before submitting:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Company Information</span>
                  <Badge variant={data.reviewSummary?.companyInfoComplete ? 'default' : 'secondary'}>
                    {data.reviewSummary?.companyInfoComplete ? 'Complete' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">R&D Activities</span>
                  <Badge variant={data.reviewSummary?.rdActivitiesComplete ? 'default' : 'secondary'}>
                    {data.reviewSummary?.rdActivitiesComplete ? 'Complete' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expense Breakdown</span>
                  <Badge variant={data.reviewSummary?.expenseBreakdownComplete ? 'default' : 'secondary'}>
                    {data.reviewSummary?.expenseBreakdownComplete ? 'Complete' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Supporting Information</span>
                  <Badge variant={data.reviewSummary?.supportingInfoComplete ? 'default' : 'secondary'}>
                    {data.reviewSummary?.supportingInfoComplete ? 'Complete' : 'Pending'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {data.reviewSummary?.totalQualifiedExpenses && (
                  <div className="text-center p-4 rounded-lg border bg-muted/50">
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(data.reviewSummary.totalQualifiedExpenses)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Qualified Expenses</div>
                  </div>
                )}

                {data.reviewSummary?.estimatedCredit && (
                  <div className="text-center p-4 rounded-lg border bg-primary/10">
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(data.reviewSummary.estimatedCredit)}
                    </div>
                    <div className="text-sm text-muted-foreground">Estimated R&D Credit</div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Once you submit this intake form, our team will review your information and contact you within 1-2 business days 
                to discuss next steps and begin the R&D tax credit documentation process.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportingInfoSection;