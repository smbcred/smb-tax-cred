import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLawRegime } from '@/hooks/useLawRegime';
import { tierFor } from '@shared/config/pricing';
import { ChevronRight, ChevronLeft, Info, DollarSign, Calculator, FileText, CheckCircle } from 'lucide-react';

// Calculation functions
function qre({ wages = 0, contractors = 0, supplies = 0, cloud = 0, software = 0 }: {
  wages?: number;
  contractors?: number;
  supplies?: number;
  cloud?: number;
  software?: number;
}) {
  return wages + contractors * 0.65 + supplies + cloud + software;
}

function ascCredit(currentQRE: number, prior?: number[]) {
  if (!prior || prior.length !== 3) {
    return {
      method: "ASC_6_FIRST_TIME",
      credit: Math.round(currentQRE * 0.06)
    };
  }
  const avg = (prior[0] + prior[1] + prior[2]) / 3;
  const excess = Math.max(0, currentQRE - 0.5 * avg);
  return {
    method: "ASC_14_EXCESS",
    credit: Math.round(excess * 0.14)
  };
}

// Form schema
const calculatorSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  wages: z.number().min(0, 'Must be 0 or greater').default(0),
  contractors: z.number().min(0, 'Must be 0 or greater').default(0),
  supplies: z.number().min(0, 'Must be 0 or greater').default(0),
  cloud: z.number().min(0, 'Must be 0 or greater').default(0),
  software: z.number().min(0, 'Must be 0 or greater').default(0),
  hasPriorQREs: z.boolean().default(false),
  priorYear1: z.number().min(0).optional(),
  priorYear2: z.number().min(0).optional(),
  priorYear3: z.number().min(0).optional(),
});

type CalculatorForm = z.infer<typeof calculatorSchema>;

// Use centralized pricing configuration

const STORAGE_KEY = 'rd-calculator-data';

export default function CreditCalculator() {
  const [step, setStep] = useState(1);
  const { isCapitalization } = useLawRegime();
  
  const form = useForm<CalculatorForm>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      email: '',
      wages: 0,
      contractors: 0,
      supplies: 0,
      cloud: 0,
      software: 0,
      hasPriorQREs: false,
      priorYear1: 0,
      priorYear2: 0,
      priorYear3: 0,
    }
  });

  const { watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([key, value]) => {
          setValue(key as keyof CalculatorForm, value as any);
        });
      } catch (e) {
        console.warn('Failed to load saved calculator data');
      }
    }
  }, [setValue]);

  // Autosave on form changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedValues));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedValues]);

  // Calculate results
  const currentQRE = qre({
    wages: watchedValues.wages,
    contractors: watchedValues.contractors,
    supplies: watchedValues.supplies,
    cloud: watchedValues.cloud,
    software: watchedValues.software,
  });

  const priorQREs = watchedValues.hasPriorQREs 
    ? [watchedValues.priorYear1 || 0, watchedValues.priorYear2 || 0, watchedValues.priorYear3 || 0]
    : undefined;

  const creditResult = ascCredit(currentQRE, priorQREs);
  const pricingTier = tierFor(creditResult.credit);

  const canProceedStep1 = watchedValues.email && !errors.email && currentQRE > 0;
  const canProceedStep2 = !watchedValues.hasPriorQREs || (
    watchedValues.priorYear1 !== undefined && 
    watchedValues.priorYear2 !== undefined && 
    watchedValues.priorYear3 !== undefined
  );

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="max-w-screen-lg mx-auto p-4 md:p-6">
      {/* OBBBA Law Banner */}
      {isCapitalization === false && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Good news!</strong> Under the OBBBA Act, your R&D expenses can be fully deducted in 2024 
            (Section 174A expensing). This calculator shows credits under current favorable tax treatment.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNum <= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum < step ? <CheckCircle className="w-4 h-4" /> : stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`w-full h-1 mx-2 ${
                  stepNum < step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 1 && "Enter Your Information"}
            {step === 2 && "Prior Year QREs (Optional)"}
            {step === 3 && "Your R&D Tax Credit Results"}
            {step === 4 && "Get Your Documentation"}
          </h2>
        </div>
      </div>

      <Card className="bg-white shadow-lg border-gray-200">
        <CardContent className="p-6">
          {/* Step 1: Email + Expenses */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="your@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Annual R&D Expenses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wages" className="text-sm font-medium text-gray-700">
                      Employee Wages & Benefits
                    </Label>
                    <Input
                      id="wages"
                      type="number"
                      {...form.register('wages', { valueAsNumber: true })}
                      className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="250000"
                    />
                    {errors.wages && (
                      <p className="mt-1 text-sm text-red-600">{errors.wages.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contractors" className="text-sm font-medium text-gray-700">
                      Contractor Costs
                    </Label>
                    <Input
                      id="contractors"
                      type="number"
                      {...form.register('contractors', { valueAsNumber: true })}
                      className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="100000"
                    />
                    <p className="mt-1 text-xs text-gray-500">Limited to 65% per IRS rules</p>
                    {errors.contractors && (
                      <p className="mt-1 text-sm text-red-600">{errors.contractors.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="supplies" className="text-sm font-medium text-gray-700">
                      R&D Supplies & Materials
                    </Label>
                    <Input
                      id="supplies"
                      type="number"
                      {...form.register('supplies', { valueAsNumber: true })}
                      className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="25000"
                    />
                    {errors.supplies && (
                      <p className="mt-1 text-sm text-red-600">{errors.supplies.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cloud" className="text-sm font-medium text-gray-700">
                      Cloud/Computing Costs
                    </Label>
                    <Input
                      id="cloud"
                      type="number"
                      {...form.register('cloud', { valueAsNumber: true })}
                      className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="15000"
                    />
                    {errors.cloud && (
                      <p className="mt-1 text-sm text-red-600">{errors.cloud.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="software" className="text-sm font-medium text-gray-700">
                      Software & Tools
                    </Label>
                    <Input
                      id="software"
                      type="number"
                      {...form.register('software', { valueAsNumber: true })}
                      className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="50000"
                    />
                    {errors.software && (
                      <p className="mt-1 text-sm text-red-600">{errors.software.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Current QRE:</strong> {formatCurrency(currentQRE)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Prior QREs */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="hasPriorQREs"
                    checked={watchedValues.hasPriorQREs}
                    onCheckedChange={(checked) => setValue('hasPriorQREs', !!checked)}
                    className="border-gray-300"
                  />
                  <Label htmlFor="hasPriorQREs" className="text-sm font-medium text-gray-700">
                    I have claimed R&D tax credits in the past 3 years
                  </Label>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  If you've claimed R&D credits before, we'll use the 14% excess method. 
                  Otherwise, you'll get the 6% first-time rate.
                </p>
              </div>

              {watchedValues.hasPriorQREs && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Prior Year Qualified Research Expenses
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="priorYear3" className="text-sm font-medium text-gray-700">
                        3 Years Ago (QRE)
                      </Label>
                      <Input
                        id="priorYear3"
                        type="number"
                        {...form.register('priorYear3', { valueAsNumber: true })}
                        className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="300000"
                      />
                      {errors.priorYear3 && (
                        <p className="mt-1 text-sm text-red-600">{errors.priorYear3.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="priorYear2" className="text-sm font-medium text-gray-700">
                        2 Years Ago (QRE)
                      </Label>
                      <Input
                        id="priorYear2"
                        type="number"
                        {...form.register('priorYear2', { valueAsNumber: true })}
                        className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="350000"
                      />
                      {errors.priorYear2 && (
                        <p className="mt-1 text-sm text-red-600">{errors.priorYear2.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="priorYear1" className="text-sm font-medium text-gray-700">
                        1 Year Ago (QRE)
                      </Label>
                      <Input
                        id="priorYear1"
                        type="number"
                        {...form.register('priorYear1', { valueAsNumber: true })}
                        className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="400000"
                      />
                      {errors.priorYear1 && (
                        <p className="mt-1 text-sm text-red-600">{errors.priorYear1.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Calculate Credit <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Calculator className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Estimated R&D Tax Credit
                </h3>
                <div className="text-4xl font-bold text-green-600 mb-4">
                  {formatCurrency(creditResult.credit)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Calculation Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Qualified Research Expenses:</span>
                        <span className="font-medium">{formatCurrency(currentQRE)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium">
                          {creditResult.method === 'ASC_6_FIRST_TIME' ? '6% First-Time Rate' : '14% Excess Method'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate:</span>
                        <span className="font-medium">
                          {creditResult.method === 'ASC_6_FIRST_TIME' ? '6%' : '14%'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Documentation Package</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Fee:</span>
                        <span className="font-medium">{formatCurrency(pricingTier.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Credit Range:</span>
                        <span className="font-medium">
                          {formatCurrency(pricingTier.min)} - {pricingTier.max === Infinity ? '200K+' : formatCurrency(pricingTier.max)}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium text-green-600">
                        <span>Net Benefit:</span>
                        <span>{formatCurrency(creditResult.credit - pricingTier.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> This is an estimate based on the information provided. 
                  Actual credits depend on IRS examination and your specific circumstances. 
                  SMBTaxCredits.com provides documentation services only.
                </p>
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Get Documentation <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Get Documentation */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Claim Your {formatCurrency(creditResult.credit)} Credit?
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Get professional IRS-compliant documentation for {formatCurrency(pricingTier.price)}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-left max-w-md mx-auto">
                <h4 className="font-medium text-gray-900 mb-3">What's Included:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    IRS Form 6765 preparation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Detailed expense documentation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Compliance review & validation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    CPA-ready filing package
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3"
                  onClick={() => window.location.href = '/checkout'}
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  Continue to Checkout
                </Button>
                
                <div className="flex justify-center">
                  <Button
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Results
                  </Button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                Secure payment • Money-back guarantee • CPA-approved documentation
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}