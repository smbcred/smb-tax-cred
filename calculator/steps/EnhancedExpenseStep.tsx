/**
 * @file EnhancedExpenseStep.tsx
 * @description Enhanced expense input step with QSB eligibility and legislative benefits
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Users, 
  Calendar,
  AlertTriangle,
  Info,
  Building,
  TrendingUp,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

interface EnhancedExpenseData {
  // Company info
  businessType: string;
  industryCode: string;
  
  // QSB eligibility fields
  currentYearRevenue: number;
  yearOfFirstRevenue: number;
  hasIncomeTaxLiability: boolean;
  quarterlyPayrollTax: number;
  
  // R&D team
  technicalEmployees: number;
  averageTechnicalSalary: number;
  rdAllocationPercentage: number;
  
  // Expenses
  contractorCosts: number;
  suppliesCosts: number;
  softwareCosts: number;
  cloudCosts: number;
  
  // Prior years
  priorYearQREs: number[];
  isFirstTimeFiler: boolean;
  
  // Options
  section280CElection: 'full' | 'reduced';
  taxYear: number;
}

interface EnhancedExpenseStepProps {
  data: Partial<EnhancedExpenseData>;
  onChange: (data: Partial<EnhancedExpenseData>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

export function EnhancedExpenseStep({ data, onChange, onNext, onBack, isValid }: EnhancedExpenseStepProps) {
  const [activeTab, setActiveTab] = useState<'company' | 'team' | 'expenses' | 'options'>('company');
  
  // Calculate QSB eligibility preview
  const currentYear = new Date().getFullYear();
  const yearsInBusiness = data.yearOfFirstRevenue ? Math.max(0, currentYear - data.yearOfFirstRevenue) : 0;
  const isQSBEligible = (data.currentYearRevenue ?? 0) < 5000000 && yearsInBusiness <= 5;
  
  const updateData = (updates: Partial<EnhancedExpenseData>) => {
    onChange({ ...data, ...updates });
  };

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'team', label: 'R&D Team', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'options', label: 'Elections', icon: CreditCard }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* QSB Eligibility Preview */}
      {data.currentYearRevenue !== undefined && data.yearOfFirstRevenue && (
        <Alert className={isQSBEligible ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-amber-200 bg-amber-50 dark:bg-amber-950'}>
          <TrendingUp className={`h-4 w-4 ${isQSBEligible ? 'text-green-600' : 'text-amber-600'}`} />
          <AlertDescription className={isQSBEligible ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'}>
            {isQSBEligible 
              ? `✅ QSB Eligible: Qualifies for up to $500k payroll tax offset (${yearsInBusiness} years in business, ${(data.currentYearRevenue / 1000000).toFixed(1)}M revenue)`
              : `❌ QSB Ineligible: ${data.currentYearRevenue >= 5000000 ? 'Revenue exceeds $5M' : 'Over 5 years in business'}`
            }
          </AlertDescription>
        </Alert>
      )}

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'company' && (
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Company Information</h3>
                <Badge variant="secondary">QSB Eligibility</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={data.businessType} onValueChange={(value) => updateData({ businessType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software">Software / SaaS</SelectItem>
                      <SelectItem value="E-commerce">E-commerce / Retail</SelectItem>
                      <SelectItem value="Agency">Marketing / Agency</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Healthcare">Healthcare / Biotech</SelectItem>
                      <SelectItem value="Fintech">Financial Services</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="industryCode">Industry Code (NAICS)</Label>
                  <Input
                    id="industryCode"
                    placeholder="e.g., 541511"
                    value={data.industryCode ?? ''}
                    onChange={(e) => updateData({ industryCode: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="currentYearRevenue">Current Year Revenue</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="currentYearRevenue"
                      type="number"
                      placeholder="1200000"
                      className="pl-10"
                      value={data.currentYearRevenue ?? ''}
                      onChange={(e) => updateData({ currentYearRevenue: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Must be under $5M for QSB eligibility</p>
                </div>

                <div>
                  <Label htmlFor="yearOfFirstRevenue">Year of First Revenue</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="yearOfFirstRevenue"
                      type="number"
                      placeholder="2022"
                      className="pl-10"
                      min="2000"
                      max={currentYear}
                      value={data.yearOfFirstRevenue ?? ''}
                      onChange={(e) => updateData({ yearOfFirstRevenue: parseInt(e.target.value) || currentYear })}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Must be within 5 years for QSB</p>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasIncomeTaxLiability"
                      checked={data.hasIncomeTaxLiability ?? false}
                      onCheckedChange={(checked) => updateData({ hasIncomeTaxLiability: checked })}
                    />
                    <Label htmlFor="hasIncomeTaxLiability">Company has income tax liability</Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    If unchecked, enables payroll tax offset option for qualified small businesses
                  </p>
                </div>

                <div>
                  <Label htmlFor="quarterlyPayrollTax">Quarterly Payroll Tax</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="quarterlyPayrollTax"
                      type="number"
                      placeholder="15000"
                      className="pl-10"
                      value={data.quarterlyPayrollTax ?? ''}
                      onChange={(e) => updateData({ quarterlyPayrollTax: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Social Security + Medicare tax liability</p>
                </div>

                <div>
                  <Label htmlFor="taxYear">Tax Year</Label>
                  <Select value={data.taxYear?.toString()} onValueChange={(value) => updateData({ taxYear: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'team' && (
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">R&D Team & Allocation</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="technicalEmployees">Technical Employees</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="technicalEmployees"
                      type="number"
                      placeholder="4"
                      className="pl-10"
                      min="0"
                      value={data.technicalEmployees ?? ''}
                      onChange={(e) => updateData({ technicalEmployees: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Developers, engineers, data scientists</p>
                </div>

                <div>
                  <Label htmlFor="averageTechnicalSalary">Average Technical Salary</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="averageTechnicalSalary"
                      type="number"
                      placeholder="95000"
                      className="pl-10"
                      value={data.averageTechnicalSalary ?? ''}
                      onChange={(e) => updateData({ averageTechnicalSalary: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Annual salary including benefits</p>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="rdAllocationPercentage">R&D Time Allocation (%)</Label>
                  <div className="space-y-2">
                    <Input
                      id="rdAllocationPercentage"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={data.rdAllocationPercentage ?? 50}
                      onChange={(e) => updateData({ rdAllocationPercentage: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>0%</span>
                      <span className="font-medium text-blue-600">{data.rdAllocationPercentage ?? 50}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Percentage of time spent on qualifying R&D activities (experimentation, AI development, etc.)
                  </p>
                </div>

                {/* Wage Calculation Preview */}
                {data.technicalEmployees && data.averageTechnicalSalary && data.rdAllocationPercentage && (
                  <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Qualified Wage Preview</h4>
                    <p className="text-blue-800 dark:text-blue-200">
                      {data.technicalEmployees} employees × ${data.averageTechnicalSalary.toLocaleString()} × {data.rdAllocationPercentage}% = 
                      <span className="font-bold"> ${Math.round((data.technicalEmployees * data.averageTechnicalSalary * data.rdAllocationPercentage) / 100).toLocaleString()}</span> qualified wages
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'expenses' && (
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">R&D Expenses</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractorCosts">Contractor Costs</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="contractorCosts"
                      type="number"
                      placeholder="85000"
                      className="pl-10"
                      value={data.contractorCosts ?? ''}
                      onChange={(e) => updateData({ contractorCosts: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">External consultants, contractors (limited to 65%)</p>
                </div>

                <div>
                  <Label htmlFor="suppliesCosts">Supplies & Materials</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="suppliesCosts"
                      type="number"
                      placeholder="12000"
                      className="pl-10"
                      value={data.suppliesCosts ?? ''}
                      onChange={(e) => updateData({ suppliesCosts: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Hardware, equipment, materials</p>
                </div>

                <div>
                  <Label htmlFor="softwareCosts">Software & Tools</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="softwareCosts"
                      type="number"
                      placeholder="25000"
                      className="pl-10"
                      value={data.softwareCosts ?? ''}
                      onChange={(e) => updateData({ softwareCosts: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">AI APIs, development tools, licenses</p>
                </div>

                <div>
                  <Label htmlFor="cloudCosts">Cloud & Infrastructure</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="cloudCosts"
                      type="number"
                      placeholder="18000"
                      className="pl-10"
                      value={data.cloudCosts ?? ''}
                      onChange={(e) => updateData({ cloudCosts: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">AWS, Azure, compute costs</p>
                </div>

                {/* Total Expenses Preview */}
                <div className="md:col-span-2 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Total QRE Estimate</h4>
                  <div className="text-green-800 dark:text-green-200 space-y-1">
                    <p>Qualified Wages: ${Math.round(((data.technicalEmployees || 0) * (data.averageTechnicalSalary || 0) * (data.rdAllocationPercentage || 0)) / 100).toLocaleString()}</p>
                    <p>Contractor Costs (65%): ${Math.round(((data.contractorCosts || 0) * 0.65)).toLocaleString()}</p>
                    <p>Supplies & Other: ${((data.suppliesCosts || 0) + (data.softwareCosts || 0) + (data.cloudCosts || 0)).toLocaleString()}</p>
                    <div className="border-t border-green-300 dark:border-green-700 pt-1 mt-2">
                      <p className="font-bold">
                        Total QRE: ${(
                          Math.round(((data.technicalEmployees || 0) * (data.averageTechnicalSalary || 0) * (data.rdAllocationPercentage || 0)) / 100) +
                          Math.round(((data.contractorCosts || 0) * 0.65)) +
                          (data.suppliesCosts || 0) + (data.softwareCosts || 0) + (data.cloudCosts || 0)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'options' && (
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Tax Elections & History</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFirstTimeFiler"
                      checked={data.isFirstTimeFiler ?? true}
                      onCheckedChange={(checked) => updateData({ isFirstTimeFiler: checked })}
                    />
                    <Label htmlFor="isFirstTimeFiler">First-time R&D credit filer</Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    First-time filers use 6% rate, repeat filers use 14% rate
                  </p>
                </div>

                <div>
                  <Label htmlFor="section280CElection">Section 280C Election</Label>
                  <Select value={data.section280CElection} onValueChange={(value: 'full' | 'reduced') => updateData({ section280CElection: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select election" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Credit (reduce deduction)</SelectItem>
                      <SelectItem value="reduced">Reduced Credit (keep deduction)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">Trade-off between credit amount and deduction</p>
                </div>

                {!data.isFirstTimeFiler && (
                  <div className="md:col-span-2">
                    <Label>Prior Year QREs (for ASC calculation)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[0, 1, 2].map((index) => (
                        <div key={index}>
                          <Label className="text-xs">Year {index + 1} ago</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={data.priorYearQREs?.[index] ?? ''}
                            onChange={(e) => {
                              const newPriorYears = [...(data.priorYearQREs || [0, 0, 0])];
                              newPriorYears[index] = parseInt(e.target.value) || 0;
                              updateData({ priorYearQREs: newPriorYears });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Used to calculate base amount for 14% rate</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="flex items-center gap-2">
          Calculate Results
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}