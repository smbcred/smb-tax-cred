/**
 * @file IntakeForm.tsx
 * @description Multi-section smart intake form with auto-save
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React Hook Form, Auto-save, Company Info Component
 * @knowledgeBase Comprehensive intake form with progress persistence and validation
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { intakeFormService, companyService } from "@/services/api.service";
import { useToast } from "@/hooks/use-toast";
import CompanyInfo from "./CompanyInfo";
import { companyInfoSchema, type CompanyInfoData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FORM_SECTIONS = [
  { id: "company_info", title: "Company Information", icon: "fas fa-building" },
  { id: "rd_activities", title: "R&D Activities", icon: "fas fa-flask" },
  { id: "expense_details", title: "Expense Details", icon: "fas fa-calculator" },
  { id: "supporting_info", title: "Supporting Information", icon: "fas fa-file-alt" },
];

interface IntakeFormProps {
  onComplete?: (formData: any) => void;
  companyId?: string;
}

export default function IntakeForm({ onComplete, companyId }: IntakeFormProps) {
  const [currentSection, setCurrentSection] = useState("company_info");
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saving" | "saved" | "error" | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get existing intake form data
  const { data: intakeForms } = useQuery({
    queryKey: ["/api/intake-forms"],
  });

  const currentForm = intakeForms && Array.isArray(intakeForms) 
    ? intakeForms.find((form: any) => form.companyId === companyId)
    : null;

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (currentForm?.id) {
        return intakeFormService.updateIntakeForm(currentForm.id, {
          formData,
          currentSection,
        });
      } else if (companyId) {
        return intakeFormService.createIntakeForm({
          companyId,
          formData,
          currentSection,
        });
      }
      throw new Error("No form or company ID available");
    },
    onMutate: () => {
      setAutoSaveStatus("saving");
    },
    onSuccess: () => {
      setAutoSaveStatus("saved");
      setLastSaved(new Date());
      setTimeout(() => setAutoSaveStatus(null), 2000);
    },
    onError: () => {
      setAutoSaveStatus("error");
      setTimeout(() => setAutoSaveStatus(null), 3000);
    },
  });

  // Form validation schema based on current section
  const getValidationSchema = () => {
    switch (currentSection) {
      case "company_info":
        return companyInfoSchema;
      default:
        return companyInfoSchema.partial(); // For other sections, make fields optional for now
    }
  };

  const form = useForm<CompanyInfoData>({
    resolver: zodResolver(getValidationSchema()),
    defaultValues: currentForm?.formData || {},
  });

  // Auto-save functionality
  const formData = form.watch();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        autoSaveMutation.mutate(formData);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timer);
  }, [formData]);

  const handleSectionChange = (sectionId: string) => {
    // Save current section before switching
    if (Object.keys(formData).length > 0) {
      autoSaveMutation.mutate(formData);
    }
    setCurrentSection(sectionId);
  };

  const handleManualSave = () => {
    autoSaveMutation.mutate(formData);
  };

  const handleComplete = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before completing the form.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentForm?.id) {
        await intakeFormService.updateIntakeForm(currentForm.id, {
          formData,
          status: "completed",
          completedAt: new Date().toISOString(),
        });
      }

      toast({
        title: "Form Completed",
        description: "Your intake form has been successfully submitted.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/intake-forms"] });
      onComplete?.(formData);
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to complete the form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Form Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Smart Intake Form</h2>
        <p className="text-lg text-slate-600">
          Comprehensive data collection with auto-save and intelligent validation
        </p>
      </div>

      {/* Auto-save Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">
          {FORM_SECTIONS.find(s => s.id === currentSection)?.title}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          {autoSaveStatus === "saving" && (
            <>
              <i className="fas fa-spinner fa-spin text-blue-500"></i>
              <span>Saving...</span>
            </>
          )}
          {autoSaveStatus === "saved" && (
            <>
              <i className="fas fa-check text-rd-secondary-500"></i>
              <span>Saved</span>
            </>
          )}
          {autoSaveStatus === "error" && (
            <>
              <i className="fas fa-exclamation-triangle text-red-500"></i>
              <span>Save failed</span>
            </>
          )}
          {!autoSaveStatus && lastSaved && (
            <>
              <i className="fas fa-save text-rd-secondary-500"></i>
              <span>Auto-saved {lastSaved.toLocaleTimeString()}</span>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Section Navigation */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              {FORM_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                    currentSection === section.id
                      ? "border-blue-500 text-rd-primary-500"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <i className={section.icon}></i>
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {currentSection === "company_info" && (
              <CompanyInfo form={form} />
            )}

            {currentSection === "rd_activities" && (
              <div className="space-y-6">
                <h4 className="font-semibold text-slate-900">R&D Activities Section</h4>
                <p className="text-slate-600">
                  This section will collect detailed information about your research and development activities.
                </p>
                <div className="p-8 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <i className="fas fa-flask text-4xl text-slate-400 mb-4"></i>
                  <p className="text-slate-600">R&D Activities form coming soon</p>
                </div>
              </div>
            )}

            {currentSection === "expense_details" && (
              <div className="space-y-6">
                <h4 className="font-semibold text-slate-900">Expense Details Section</h4>
                <p className="text-slate-600">
                  Detailed breakdown of your R&D expenses by category and time period.
                </p>
                <div className="p-8 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <i className="fas fa-calculator text-4xl text-slate-400 mb-4"></i>
                  <p className="text-slate-600">Expense Details form coming soon</p>
                </div>
              </div>
            )}

            {currentSection === "supporting_info" && (
              <div className="space-y-6">
                <h4 className="font-semibold text-slate-900">Supporting Information Section</h4>
                <p className="text-slate-600">
                  Additional documentation and supporting materials for your R&D tax credit claim.
                </p>
                <div className="p-8 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <i className="fas fa-file-alt text-4xl text-slate-400 mb-4"></i>
                  <p className="text-slate-600">Supporting Information form coming soon</p>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <div className="w-2 h-2 bg-rd-secondary-500 rounded-full animate-pulse"></div>
              <span>Auto-saving changes every 30 seconds</span>
            </div>
            <div className="space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleManualSave}
                disabled={autoSaveMutation.isPending}
              >
                {autoSaveMutation.isPending ? "Saving..." : "Save Draft"}
              </Button>
              {currentSection === "supporting_info" ? (
                <Button onClick={handleComplete} className="btn-primary">
                  Complete Form
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    const currentIndex = FORM_SECTIONS.findIndex(s => s.id === currentSection);
                    const nextSection = FORM_SECTIONS[currentIndex + 1];
                    if (nextSection) {
                      handleSectionChange(nextSection.id);
                    }
                  }}
                  className="btn-primary"
                >
                  Next Section
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
