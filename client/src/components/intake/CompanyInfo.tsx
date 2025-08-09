/**
 * @file CompanyInfo.tsx
 * @description Company information section of intake form
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React Hook Form, Form Validation
 * @knowledgeBase Company info collection with validation and entity type selection
 */

import { UseFormReturn } from "react-hook-form";
import { CompanyInfoData } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface CompanyInfoProps {
  form: UseFormReturn<CompanyInfoData>;
}

const ENTITY_TYPES = [
  { value: "llc", label: "LLC (Limited Liability Company)" },
  { value: "corp", label: "C-Corporation" },
  { value: "s-corp", label: "S-Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
];

const INDUSTRIES = [
  "Software Development",
  "Manufacturing",
  "Biotechnology",
  "Financial Technology",
  "E-commerce",
  "Healthcare Technology",
  "Artificial Intelligence",
  "Cybersecurity",
  "Clean Technology",
  "Other",
];

export default function CompanyInfo({ form }: CompanyInfoProps) {
  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="legalName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Legal Business Name
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your legal business name"
                    {...field}
                    className="form-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ein"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Federal EIN
                  <span className="text-red-500 ml-1">*</span>
                  <i className="fas fa-info-circle text-slate-400 ml-2 cursor-help" 
                     title="Your Employer Identification Number (format: 12-3456789)"></i>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="12-3456789"
                    {...field}
                    className="form-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="entityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Business Entity Type
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ENTITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Industry</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Business Address
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your complete business address including city, state, and ZIP code"
                  className="form-input min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Additional Information */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">
            <i className="fas fa-info-circle mr-2"></i>
            Important Information
          </h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• Ensure all information matches your official business documents</p>
            <p>• EIN format should be XX-XXXXXXX (e.g., 12-3456789)</p>
            <p>• Use the legal name as registered with the IRS</p>
            <p>• Business address should match your tax filing address</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              1
            </div>
            <div className="ml-3">
              <div className="font-medium text-slate-900">Company Information</div>
              <div className="text-sm text-slate-600">Basic business details</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Section 1 of 4
          </div>
        </div>
      </div>
    </Form>
  );
}
