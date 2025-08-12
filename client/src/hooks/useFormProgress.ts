import { useState, useCallback, useEffect } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import type { FormProgress, FormSection } from '@shared/schema';

interface UseFormProgressOptions {
  intakeFormId?: string;
  onAutoSave?: (data: any, section: string) => Promise<void>;
  autoSaveDelay?: number;
}

export function useFormProgress({
  intakeFormId,
  onAutoSave,
  autoSaveDelay = 2000
}: UseFormProgressOptions = {}) {
  const [progress, setProgress] = useState<FormProgress>({
    currentSection: 'company-info',
    sections: [
      {
        id: 'company-info',
        title: 'Company Information',
        description: 'Basic company details and business structure',
        isCompleted: false,
        isValid: false,
        currentStep: 0,
        totalSteps: 8,
      },
      {
        id: 'rd-activities',
        title: 'R&D Activities',
        description: 'Document your research and development activities',
        isCompleted: false,
        isValid: false,
        currentStep: 0,
        totalSteps: 12,
      },
      {
        id: 'expense-breakdown',
        title: 'Expense Breakdown',
        description: 'Detailed breakdown of R&D related expenses',
        isCompleted: false,
        isValid: false,
        currentStep: 0,
        totalSteps: 10,
      },
      {
        id: 'supporting-info',
        title: 'Supporting Information',
        description: 'Additional documentation and evidence',
        isCompleted: false,
        isValid: false,
        currentStep: 0,
        totalSteps: 6,
      },
    ],
    overallProgress: 0,
    isAutoSaving: false,
    lastSavedAt: null,
  });

  const [formData, setFormData] = useState<Record<string, any>>({});

  // Enhanced auto-save integration
  const currentSectionData = formData[progress.currentSection] || {};
  const autoSave = useAutoSave({
    intakeFormId,
    data: currentSectionData,
    section: progress.currentSection || 'company-info',
    debounceMs: autoSaveDelay,
    intervalMs: 30000, // 30 seconds
    enabled: !!intakeFormId && !!progress.currentSection,
  });

  // Update progress state from auto-save (memoized to prevent loops)
  useEffect(() => {
    setProgress(prev => {
      if (prev.isAutoSaving === autoSave.isAutoSaving && 
          prev.lastSavedAt === autoSave.lastSavedAt) {
        return prev; // No change, prevent unnecessary re-render
      }
      return {
        ...prev,
        isAutoSaving: autoSave.isAutoSaving,
        lastSavedAt: autoSave.lastSavedAt,
      };
    });
  }, [autoSave.isAutoSaving, autoSave.lastSavedAt]);

  // Navigate to section
  const navigateToSection = useCallback((sectionId: string) => {
    const section = progress.sections.find(s => s.id === sectionId);
    if (section) {
      setProgress(prev => ({ ...prev, currentSection: sectionId }));
    }
  }, [progress.sections]);

  // Update section data
  const updateSectionData = useCallback((sectionId: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], ...data }
    }));
  }, []);

  // Update section completion
  const updateSectionProgress = useCallback((sectionId: string, updates: Partial<FormSection>) => {
    setProgress(prev => {
      const updatedSections = prev.sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      );
      
      // Calculate overall progress
      const totalSteps = updatedSections.reduce((sum, s) => sum + (s.totalSteps || 0), 0);
      const completedSteps = updatedSections.reduce((sum, s) => sum + (s.currentStep || 0), 0);
      const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      
      return {
        ...prev,
        sections: updatedSections,
        overallProgress
      };
    });
  }, []);

  // Navigate to next section
  const goToNextSection = useCallback(() => {
    const currentIndex = progress.sections.findIndex(s => s.id === progress.currentSection);
    if (currentIndex < progress.sections.length - 1) {
      const nextSection = progress.sections[currentIndex + 1];
      navigateToSection(nextSection.id);
    }
  }, [progress.sections, progress.currentSection, navigateToSection]);

  // Navigate to previous section
  const goToPreviousSection = useCallback(() => {
    const currentIndex = progress.sections.findIndex(s => s.id === progress.currentSection);
    if (currentIndex > 0) {
      const previousSection = progress.sections[currentIndex - 1];
      navigateToSection(previousSection.id);
    }
  }, [progress.sections, progress.currentSection, navigateToSection]);

  // Get current section data
  const getCurrentSection = useCallback(() => {
    return progress.sections.find(s => s.id === progress.currentSection);
  }, [progress.sections, progress.currentSection]);

  // Get current section form data
  const getCurrentSectionData = useCallback(() => {
    return formData[progress.currentSection] || {};
  }, [formData, progress.currentSection]);

  // Validate section
  const validateSection = useCallback((sectionId: string, validationFn: (data: any) => boolean) => {
    const sectionData = formData[sectionId] || {};
    const isValid = validationFn(sectionData);
    
    updateSectionProgress(sectionId, { isValid });
    return isValid;
  }, [formData, updateSectionProgress]);

  return {
    progress,
    formData,
    hasUnsavedChanges: autoSave.hasUnsavedChanges,
    navigateToSection,
    updateSectionData,
    updateSectionProgress,
    goToNextSection,
    goToPreviousSection,
    getCurrentSection,
    getCurrentSectionData,
    validateSection,
    setProgress,
    setFormData,
    // Auto-save state
    autoSave: {
      ...autoSave,
      manualSave: autoSave.manualSave,
    },
  };
}