/**
 * @file InteractiveCalculator.tsx
 * @description Main interactive R&D tax credit calculator component
 * @author SMBTaxCredits.com Team
 * @date 2024-01-15
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  DollarSign, 
  Users, 
  Cloud, 
  TrendingUp, 
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { calculateRDTaxCredit, businessTypes } from "@/services/calculator.service";
import type { CalculatorExpenses, CalculationResult } from "@shared/schema";
import { formatCurrency } from "@/utils/calculations";

interface CalculatorState extends CalculatorExpenses {
  businessType: string;
  hasQualifyingActivities: boolean;
}

export function InteractiveCalculator() {
  const [state, setState] = useState<CalculatorState>({
    wages: 0,
    contractors: 0,
    supplies: 0,
    cloud: 0,
    businessType: '',
    hasQualifyingActivities: false,
  });
  
  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);

  const updateState = (updates: Partial<CalculatorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const calculateResults = (): CalculationResult => {
    const expenses: CalculatorExpenses = {
      wages: state.wages,
      contractors: state.contractors,
      supplies: state.supplies,
      cloud: state.cloud
    };
    return calculateRDTaxCredit(expenses);
  };

  const handleCalculate = () => {
    setShowResults(true);
  };

  const resetCalculator = () => {
    setState({
      wages: 0,
      contractors: 0,
      supplies: 0,
      cloud: 0,
      businessType: '',
      hasQualifyingActivities: false,
    });
    setStep(1);
    setShowResults(false);
  };

  const results = showResults ? calculateResults() : null;

  if (showResults && results) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingUp className="h-6 w-6" />
              Your R&D Tax Credit Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Results Summary */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {formatCurrency(results.federalCredit)}
                  </div>
                  <p className="text-gray-600">Estimated Federal R&D Tax Credit</p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Qualified Research Expenses</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Employee Wages:</span>
                      <span className="font-medium">{formatCurrency(state.wages)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contractor Costs (65%):</span>
                      <span className="font-medium">{formatCurrency(state.contractors * 0.65)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Software & Supplies:</span>
                      <span className="font-medium">{formatCurrency(state.supplies)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cloud & Hosting:</span>
                      <span className="font-medium">{formatCurrency(state.cloud)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total QRE:</span>
                      <span>{formatCurrency(results.totalQRE)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Tier */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Recommended Service Tier</h3>
                  <div className="text-center">
                    <Badge variant="outline" className="text-lg px-3 py-1 mb-2">
                      Tier {results.pricingTier}
                    </Badge>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {formatCurrency(results.pricingAmount)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Professional documentation service
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>ROI: {Math.round((results.federalCredit / results.pricingAmount) * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">What's Included:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      IRS-compliant documentation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Form 6765 preparation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Detailed activity narratives
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Audit support materials
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
              <Button size="lg" className="flex-1" onClick={() => window.location.href = '/get-started'}>
                Get Professional Documentation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={resetCalculator}>
                Calculate Another Scenario
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              * This is a preliminary estimate. Final credit amount depends on detailed analysis of your specific activities and documentation.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            R&D Tax Credit Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Type Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4">What type of business are you?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businessTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        updateState({ businessType: type.id });
                        setStep(2);
                      }}
                      className={`p-4 border rounded-lg text-left hover:border-blue-500 transition-colors ${
                        state.businessType === type.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <h4 className="font-medium mb-1">{type.name}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Expense Inputs */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4">Enter your annual R&D expenses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="wages" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Technical Employee Wages
                    </Label>
                    <Input
                      id="wages"
                      type="number"
                      placeholder="0"
                      value={state.wages || ''}
                      onChange={(e) => updateState({ wages: Number(e.target.value) || 0 })}
                      className="text-lg"
                    />
                    <p className="text-sm text-gray-500">Annual salaries for developers, engineers, designers</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractors" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Contractor & Freelancer Costs
                    </Label>
                    <Input
                      id="contractors"
                      type="number"
                      placeholder="0"
                      value={state.contractors || ''}
                      onChange={(e) => updateState({ contractors: Number(e.target.value) || 0 })}
                      className="text-lg"
                    />
                    <p className="text-sm text-gray-500">External developers, consultants, agencies</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplies" className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Software & Tools
                    </Label>
                    <Input
                      id="supplies"
                      type="number"
                      placeholder="0"
                      value={state.supplies || ''}
                      onChange={(e) => updateState({ supplies: Number(e.target.value) || 0 })}
                      className="text-lg"
                    />
                    <p className="text-sm text-gray-500">Development tools, API costs, testing platforms</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cloud" className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      Cloud & Infrastructure
                    </Label>
                    <Input
                      id="cloud"
                      type="number"
                      placeholder="0"
                      value={state.cloud || ''}
                      onChange={(e) => updateState({ cloud: Number(e.target.value) || 0 })}
                      className="text-lg"
                    />
                    <p className="text-sm text-gray-500">AWS, servers, databases, hosting costs</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={handleCalculate}
                  disabled={state.wages + state.contractors + state.supplies + state.cloud === 0}
                  className="flex items-center gap-2"
                >
                  Calculate Credit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}