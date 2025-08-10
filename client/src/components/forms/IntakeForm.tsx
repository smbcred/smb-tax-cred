import { useFormProgress } from '@/hooks/useFormProgress';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock, Save } from 'lucide-react';
import FormSection from '@/components/forms/FormSection';

interface IntakeFormProps {
  intakeFormId?: string;
}

export default function IntakeForm({ intakeFormId }: IntakeFormProps) {
  const { user } = useAuth();

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async ({ data, section }: { data: any; section: string }) => {
      return apiRequest('POST', `/api/intake-forms/${intakeFormId}/save`, {
        section,
        data,
      });
    },
  });

  // Form submission mutation
  const submitMutation = useMutation({
    mutationFn: async (submissionData: any) => {
      return apiRequest('POST', `/api/intake-forms/${intakeFormId}/submit`, submissionData);
    },
    onSuccess: (response) => {
      alert('Form submitted successfully!');
      console.log('Submission successful:', response);
    },
    onError: (error: any) => {
      alert(`Submission failed: ${error.message}`);
      console.error('Submission error:', error);
    },
  });

  // Form progress management
  const {
    progress,
    formData,
    hasUnsavedChanges,
    navigateToSection,
    updateSectionData,
    updateSectionProgress,
    goToNextSection,
    goToPreviousSection,
    getCurrentSection,
    getCurrentSectionData,
    validateSection,
  } = useFormProgress({
    intakeFormId,
    onAutoSave: async (data, section) => {
      if (intakeFormId) {
        await autoSaveMutation.mutateAsync({ data, section });
      }
    },
    autoSaveDelay: 2000,
  });

  const currentSection = getCurrentSection();
  const currentSectionData = getCurrentSectionData();

  const handleSectionClick = (sectionId: string) => {
    navigateToSection(sectionId);
  };

  const handleNext = () => {
    if (currentSection) {
      // Validate current section before moving
      const isValid = validateSection(currentSection.id, (data) => {
        // Basic validation - can be enhanced per section
        return Object.keys(data).length > 0;
      });
      
      if (isValid) {
        updateSectionProgress(currentSection.id, { 
          isCompleted: true,
          currentStep: currentSection.totalSteps 
        });
        goToNextSection();
      }
    }
  };

  const handleSubmit = () => {
    // Validate all sections are completed
    const allSectionsValid = progress.sections.every(section => section.isCompleted);
    
    if (!allSectionsValid) {
      alert('Please complete all sections before submitting.');
      return;
    }

    // Prepare submission data from form data
    const submissionData = {
      companyInfo: formData.companyInfo || {},
      rdProjects: formData.rdActivities?.projects || [],
      employeeExpenses: formData.expenseBreakdown?.employeeExpenses || [],
      contractorExpenses: formData.expenseBreakdown?.contractorExpenses || [],
      supplyExpenses: formData.expenseBreakdown?.supplyExpenses || [],
      softwareExpenses: formData.expenseBreakdown?.softwareExpenses || [],
      supportingInfo: formData.supportingInfo || {},
    };

    submitMutation.mutate(submissionData);
  };

  const handlePrevious = () => {
    goToPreviousSection();
  };

  const getSectionIcon = (section: any) => {
    if (section.isCompleted) {
      return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    } else if (section.id === progress.currentSection) {
      return <Circle className="w-5 h-5 text-blue-600 fill-current" />;
    } else {
      return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSectionStatus = (section: any) => {
    if (section.isCompleted) {
      return <Badge variant="default" className="bg-emerald-100 text-emerald-800">Completed</Badge>;
    } else if (section.id === progress.currentSection) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Current</Badge>;
    } else {
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
          <p className="text-slate-600">Please sign in to access the intake form.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">R&D Tax Credit Documentation</h1>
        <p className="text-lg text-slate-600 mb-4">
          Complete this comprehensive form to document your R&D activities for tax credit eligibility.
        </p>
        
        {/* Overall Progress */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Progress</span>
            <span className="text-sm text-slate-600">{progress.overallProgress}% Complete</span>
          </div>
          <Progress value={progress.overallProgress} className="h-2" />
          
          {/* Auto-save status */}
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <div className="flex items-center">
              {progress.isAutoSaving ? (
                <>
                  <Save className="w-3 h-3 mr-1 animate-pulse" />
                  <span>Auto-saving...</span>
                </>
              ) : progress.lastSavedAt ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                  <span>Last saved: {new Date(progress.lastSavedAt).toLocaleTimeString()}</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Clock className="w-3 h-3 mr-1 text-amber-600" />
                  <span>Unsaved changes</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Form Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {progress.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    section.id === progress.currentSection
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      {getSectionIcon(section)}
                      <span className="ml-2 font-medium text-sm">{section.title}</span>
                    </div>
                    {getSectionStatus(section)}
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{section.description}</p>
                  {section.totalSteps && (
                    <div className="text-xs text-slate-500">
                      {section.currentStep || 0} of {section.totalSteps} steps
                    </div>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{currentSection?.title}</CardTitle>
                  <p className="text-slate-600 mt-1">{currentSection?.description}</p>
                </div>
                {currentSection?.totalSteps && (
                  <Badge variant="outline">
                    Step {currentSection.currentStep || 0} of {currentSection.totalSteps}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Dynamic Form Section */}
              <FormSection
                sectionId={progress.currentSection}
                data={currentSectionData}
                onDataChange={(data: any) => updateSectionData(progress.currentSection, data)}
                onValidationChange={(isValid: boolean) => 
                  updateSectionProgress(progress.currentSection, { isValid })
                }
              />

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={progress.sections.findIndex(s => s.id === progress.currentSection) === 0}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-3">
                  {progress.sections.findIndex(s => s.id === progress.currentSection) === progress.sections.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={!currentSection?.isValid || submitMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {submitMutation.isPending ? 'Submitting...' : 'Submit Form'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!currentSection?.isValid}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}